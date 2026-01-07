import { User } from "../../database/entities/User";
import cron from "node-cron";

import { PassageRenderer } from "./PassageRenderer";
import { PlanService } from "../plan/plan.service";
import { Repository } from "typeorm";
import { PlanExecution } from "../../database/entities/PlanExecution";
import { Passage } from "../plan/plan.types";
import { CanvasService } from "../canvas/canvas.service";

export class DevotionalService {
  private renderer: PassageRenderer;

  constructor(
    private _planService: PlanService,
    private _canvasService: CanvasService,
    private execRepo: Repository<PlanExecution>
  ) {}

  async generateDevotional(): Promise<{
    day: number;
    user: User;
    messages: string[];
    welcomeMessage: string;
    image: Buffer;
  }> {
    const { day, user } = await this._planService.getNextPlanData();

    if (!this.renderer) {
      this.renderer = new PassageRenderer(user.version);
    }

    const formattedPassages = this.formatPassages(day._passage);

    const welcomeMessage =
      user.welcomeText +
      "\n\n*PASSAGENS DE HOJE:*\n" +
      formattedPassages.join("\n");

    const image = await this._canvasService.generateDailyImage({
      dayNumber: Number(day._n),
      passages: formattedPassages,
    });

    const messages = this.renderer.renderPassages(day._passage);

    return {
      user,
      day: Number(day._n),
      messages,
      welcomeMessage,
      image,
    };
  }

  formatPassages(passages: Passage[] | Passage): string[] {
    const passagesArray = Array.isArray(passages) ? passages : [passages];
    return passagesArray.map((passage) =>
      passage._start._book === passage._end._book
        ? passage._start._chapter === passage._end._chapter
          ? `${passage._start._book} ${passage._start._chapter}:${passage._start._verse}-${passage._end._verse}`
          : `${passage._start._book} ${passage._start._chapter}:${passage._start._verse} - ${passage._end._chapter}:${passage._end._verse}`
        : `${passage._start._book} ${passage._start._chapter}:${passage._start._verse} - ${passage._end._book} ${passage._end._chapter}:${passage._end._verse}`
    );
  }

  async devotinalSchedule(fn: () => Promise<void>, timeSchedule: string) {
    const TEST_MODE = process.env.TEST_MODE === "true" || false;

    // ---------------------------------------
    // 🧪 MODO DE TESTE — envia imediatamente
    // ---------------------------------------
    if (TEST_MODE) {
      console.log("🧪 TEST_MODE ativado → Enviando mensagem imediatamente!");
      await fn();
      return;
    }

    // ---------------------------------------
    // ⏰ MODO NORMAL — agenda pelo horário
    // ---------------------------------------
    const [hour, minute] = timeSchedule.split(":");
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`⏰ Agendado para ${timeSchedule} | CRON: ${cronExpression}`);

    cron.schedule(cronExpression, fn, {
      timezone: "America/Sao_Paulo",
    });
  }

  async saveExecution(day: number, user: User) {
    const exec = this.execRepo.create({
      user: user,
      version: user.version,
      plan: user.plan,
      planDay: day,
      currentTime: new Date().toISOString(),
    });

    await this.execRepo.save(exec);
  }
}
