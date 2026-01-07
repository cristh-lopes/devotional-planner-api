import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { UserService } from "../user/user.service";
import qrcode from "qrcode-terminal";

export class WhatsappService {
  private _client: Client;
  constructor(private _userService: UserService) {
    this.clientConfig();
  }

  private async clientConfig() {
    this._client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this._client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log("📱 Escaneie o QR code acima para conectar.");
    });
  }

  clientReady(fn: () => void) {
    this._client.on("ready", fn);
    this._client.initialize();
  }

  async getGroup() {
    const user = await this._userService.load();
    if (user.groupId) return this._client.getChatById(user.groupId);

    const chats = await this._client.getChats();

    const group = chats.find(
      (chat) =>
        chat.isGroup && chat.name.toLowerCase() === user.groupName.toLowerCase()
    );

    if (!group) throw `❌ Grupo '${user.groupName}' não encontrado.`;

    this._userService.saveGroupId(group.id._serialized);
    return group;
  }

  async sendMessages(messages: string[]) {
    const group = await this.getGroup();

    for (const msg of messages) {
      await this._client.sendMessage(group.id._serialized, msg);
    }
  }

  async sendImage(imageBuffer: Buffer, caption?: string) {
    const group = await this.getGroup();

    const media = new MessageMedia(
      "image/png",
      imageBuffer.toString("base64"),
      "devocional.png"
    );

    await this._client.sendMessage(group.id._serialized, media, { caption });
  }
}
