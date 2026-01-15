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

    const planService = new PlanService();
    const canvasService = new CanvasService();
    const whatsappService = new WhatsappService(userService);

    const execRepo = AppDataSource.getRepository(PlanExecution);

    const configs = await userService.loadConfigs();

    const ready = async () => {
      console.log("\t✅ WhatsApp conectado!");

      const devotionalService = new DevotionalService(
        planService,
        canvasService,
        execRepo
      );

      for (const config of configs) {
        const sendDevotionalForGroup = async () => {
          for (const user of config.user) {
            try {
              console.log(`📖 Gerando devocional | ${config.timeScheduled}`);

              const devotional = await devotionalService.generateDevotional(
                user
              );

              const group = await whatsappService.getGroupId(user);

              await whatsappService.sendImage(
                group,
                devotional.image,
                devotional.welcomeMessage
              );

              await whatsappService.sendMessages(group, devotional.messages);

              await devotionalService.saveExecution(devotional.dayNumber, user);

              console.log(`✅ Enviado para ${user.groupName}`);
            } catch (error) {
              console.error(`❌ Erro ao enviar para ${user.groupName}:`, error);
            }
          }
        };

        await devotionalService.devotinalSchedule(
          sendDevotionalForGroup,
          config.timeScheduled
        );
      }
    };

    await whatsappService.init(ready);
  } catch (err) {
    console.error("❌ Erro ao inicializar o bot:", err);
  }
}

initializeBot();
