import { AppDataSource } from "./database/data-source";
import { UserModule } from "./modules/user/user.module";
import { PlanExecution } from "./database/entities/PlanExecution";
import { DevotionalService } from "./modules/devotional/devotional.service";
import dotenv from "dotenv";
import { PlanService } from "./modules/plan/plan.service";
import { WhatsappService } from "./modules/whatsapp/whatsapp.service";
import { CanvasService } from "./modules/canvas/canvas.service";

dotenv.config();

async function initializeBot() {
  try {
    console.log("🚀 Iniciando o Devotional Planner Bot...");
    console.log("📦 Conectando ao banco de dados...");
    await AppDataSource.initialize();
    console.log("\t✅ Banco de dados conectado.");

    console.log("📱 Configurando o WhatsApp...");
    const { service: userService } = UserModule.build();

    const planService = new PlanService(userService);
    const canvasService = new CanvasService();

    const execRepo = AppDataSource.getRepository(PlanExecution);

    const config = await userService.load();

    const whatsappService = new WhatsappService(userService);

    const ready = async () => {
      const whatsService = whatsappService;
      console.log("\t✅ WhatsApp conectado!");

      const devotionalService = new DevotionalService(
        planService,
        canvasService,
        execRepo
      );

      const sendDevotional = async () => {
        try {
          console.log("📖 Gerando devocional do dia...");

          const devotional = await devotionalService.generateDevotional();
          console.log("📨 Enviando mensagens para o grupo...");

          await whatsService.sendImage(
            devotional.image,
            devotional.welcomeMessage
          );

          await whatsService.sendMessages(devotional.messages);
          await devotionalService.saveExecution(
            devotional.day,
            devotional.user
          );

          console.log("✅ Devocional enviado.");
        } catch (error) {
          console.error("❌ Erro ao enviar devocional:", error);
        }
      };

      await devotionalService.devotinalSchedule(
        sendDevotional,
        config.scheduleTime
      );
    };

    whatsappService.clientReady(ready);
  } catch (err) {
    console.error("❌ Erro ao inicializar o bot:", err);
  }
}

initializeBot();
