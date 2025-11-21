import cron from "node-cron";
import { AppDataSource } from "./database/data-source";
import { UserModule } from "./modules/user/user.module";
import { PlanExecution } from "./database/entities/PlanExecution";
import { DevotionalService } from "./modules/devotional/devotional.service";
import dotenv from "dotenv";
import { PlanService } from "./modules/plan/plan.service";
import { WhatsappService } from "./modules/whatsapp/whatsapp.service";

dotenv.config();

const TEST_MODE = process.env.TEST_MODE === "true" || false;

async function initializeBot() {
  try {
    await AppDataSource.initialize();
    console.log("📦 Banco conectado.");

    const { service: userService } = UserModule.build();

    const planService = new PlanService(userService);

    const execRepo = AppDataSource.getRepository(PlanExecution);

    const config = await userService.load();

    console.log("⚙️ Configurações carregadas:", config);

    const whatsappService = new WhatsappService(userService);

    const ready = async () => {
      const whatsService = whatsappService;
      console.log("✅ WhatsApp conectado!");

      const devotionalService = new DevotionalService(planService, execRepo);

      const sendDevotional = async () => {
        try {
          console.log("📖 Gerando devocional do dia...");

          const messages = await devotionalService.generateDevotionalMessages();
          whatsService.sendMessages(messages);

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
    };

    whatsappService.clientReady(ready);
  } catch (err) {
    console.error("❌ Erro ao inicializar o bot:", err);
  }
}

initializeBot();
