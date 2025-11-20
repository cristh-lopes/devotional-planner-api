import qrcode from "qrcode-terminal";
import { Client, LocalAuth, Chat } from "whatsapp-web.js";
import cron from "node-cron";
import { AppDataSource } from "./database/data-source";
import { UserModule } from "./modules/user/user.module";
import { PlanExecution } from "./database/entities/PlanExecution";
import { DevotionalService } from "./modules/devotional/devotional.service";
import dotenv from "dotenv";
import { PlanService } from "./modules/plan/plan.service";

dotenv.config();

const TEST_MODE = process.env.TEST_MODE === "true" || false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

async function initializeBot() {
  try {
    await AppDataSource.initialize();
    console.log("📦 Banco conectado.");

    const { service: userService } = UserModule.build();

    const planService = new PlanService(userService);

    const execRepo = AppDataSource.getRepository(PlanExecution);

    const config = await userService.load();

    console.log("⚙️ Configurações carregadas:", config);

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log("📱 Escaneie o QR code acima para conectar.");
    });

    client.on("ready", async () => {
      console.log("✅ WhatsApp conectado!");

      const devotionalService = new DevotionalService(planService, execRepo);

      // -----------------------------
      // Função para enviar devocional
      // -----------------------------
      const sendDevotional = async () => {
        try {
          console.log("📖 Gerando devocional do dia...");

          const messages = await devotionalService.generateDevotionalMessages();
          const chats = await client.getChats();

          const group = chats.find(
            (chat) =>
              chat.isGroup &&
              chat.name.toLowerCase() === config.groupName.toLowerCase()
          );

          if (!group) {
            console.error(`❌ Grupo '${config.groupName}' não encontrado.`);
            return;
          }

          console.log(`📤 Enviando devocional para '${group.name}'`);

          for (const msg of messages) {
            await client.sendMessage(group.id._serialized, msg);
          }

          console.log("✅ Devocional enviado.");
        } catch (error) {
          console.error("❌ Erro ao enviar devocional:", error);
        }
      };

      // ---------------------------------------
      // 🧪 MODO DE TESTE — envia imediatamente
      // ---------------------------------------
      if (TEST_MODE) {
        console.log("🧪 TEST_MODE ativado → Enviando mensagem imediatamente!");
        await sendDevotional();
        return;
      }

      // ---------------------------------------
      // ⏰ MODO NORMAL — agenda pelo horário
      // ---------------------------------------
      const [hour, minute] = config.scheduleTime.split(":");
      const cronExpression = `${minute} ${hour} * * *`;

      console.log(
        `⏰ Agendado para ${config.scheduleTime} | CRON: ${cronExpression}`
      );

      cron.schedule(cronExpression, sendDevotional, {
        timezone: "America/Sao_Paulo",
      });
    });

    client.initialize();
  } catch (err) {
    console.error("❌ Erro ao inicializar o bot:", err);
  }
}

initializeBot();
