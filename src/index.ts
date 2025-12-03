import { AppDataSource } from "./database/data-source";
import { UserModule } from "./modules/user/user.module";
import { PlanExecution } from "./database/entities/PlanExecution";
import { DevotionalService } from "./modules/devotional/devotional.service";
import dotenv from "dotenv";
import { PlanService } from "./modules/plan/plan.service";
import { WhatsappService } from "./modules/whatsapp/whatsapp.service";

dotenv.config();

async function initializeBot() {
  try {
    await AppDataSource.initialize();
    console.log("📦 Banco conectado.");

    const { service: userService } = UserModule.build();

    const planService = new PlanService(userService);

    const execRepo = AppDataSource.getRepository(PlanExecution);

    const config = await userService.load();

    const whatsappService = new WhatsappService(userService);

    const ready = async () => {
      const whatsService = whatsappService;
      console.log("✅ WhatsApp conectado!");

      const devotionalService = new DevotionalService(planService, execRepo);

      const sendDevotional = async () => {
        try {
          console.log("📖 Gerando devocional do dia...");

          const { day, user, messages } =
            await devotionalService.generateDevotionalMessages();
          await whatsService.sendMessages(messages);
          await devotionalService.saveExecution(day, user);

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
