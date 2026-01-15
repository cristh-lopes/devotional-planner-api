import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { UserService } from "../user/user.service";
import pino from "pino";
import { User } from "../../database/entities/User";

export class WhatsappService {
  private sock: ReturnType<typeof makeWASocket> | null = null;
  private ready = false;
  private initializing = false;

  constructor(private readonly userService: UserService) {}

  async init(onReady: () => void) {
    if (this.initializing) return;
    this.initializing = true;

    const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "warn" }),
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        qrcode.generate(qr, { small: true });
        console.log("📱 Escaneie o QR code acima para conectar.");
      }

      if (connection === "open") {
        console.log("✅ WhatsApp conectado");
        this.ready = true;
        this.initializing = false;
        onReady();
      }

      if (connection === "close") {
        this.ready = false;
        this.initializing = false;

        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log("❌ Conexão encerrada. Reconnect?", shouldReconnect);

        if (shouldReconnect) {
          console.log("🔄 Reconectando WhatsApp...");
          setTimeout(() => this.init(onReady), 2000);
        } else
          console.log(
            "🚪 WhatsApp deslogado. Apague 'baileys_auth' e escaneie novamente."
          );
      }
    });
  }

  async getGroupId(user: User): Promise<string> {
    if (!this.sock) throw new Error("WhatsApp não inicializado");

    if (user.groupId) return user.groupId;

    const groups = await this.sock.groupFetchAllParticipating();

    const group = Object.values(groups).find((g) =>
      g.subject.includes(user.groupName)
    );

    if (!group) throw new Error(`❌ Grupo '${user.groupName}' não encontrado`);

    await this.userService.saveGroupId(user, group.id);
    return group.id;
  }

  async sendMessages(groupId: string, messages: string[]) {
    if (!this.ready || !this.sock) throw new Error("WhatsApp não conectado");

    for (const msg of messages)
      await this.sock.sendMessage(groupId, { text: msg });
  }

  async sendImage(groupId: string, imageBuffer: Buffer, caption?: string) {
    if (!this.ready || !this.sock) throw new Error("WhatsApp não conectado");

    await this.sock.sendMessage(groupId, {
      image: imageBuffer,
      caption,
    });
  }
}
