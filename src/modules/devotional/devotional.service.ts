import { User } from "../../database/entities/User";
import cron from "node-cron";

import { PassageRenderer } from "./PassageRenderer";
import { PlanService } from "../plan/plan.service";
import { Repository } from "typeorm";
import { PlanExecution } from "../../database/entities/PlanExecution";
import { Passage } from "../plan/plan.types";
import { CanvasService } from "../canvas/canvas.service";
import { VersionEnum } from "../bible/bible.enum";

export class DevotionalService {
  private renderers = new Map<VersionEnum, PassageRenderer>();

  constructor(
    private _planService: PlanService,
    private _canvasService: CanvasService,
    private execRepo: Repository<PlanExecution>
  ) {}

  async generateDevotional(user: User): Promise<{
    dayNumber: number;
    user: User;
    messages: string[];
    welcomeMessage: string;
    image: Buffer;
  }> {
    const { day } = await this._planService.getNextPlanData(user);

    const dayNumber = Number(day._n);
    const renderer = this.getRenderer(user.version);

    const formattedPassages = this.formatPassages(day._passage);

    const welcomeMessage =
      user.welcomeText +
      "\n\n*PASSAGENS DE HOJE:*\n" +
      formattedPassages.join("\n");

    const image = await this._canvasService.generateDailyImage({
      dayNumber,
      passages: formattedPassages,
    });

    const messages = renderer.renderPassages(day._passage);

    return {
      user,
      dayNumber,
      messages,
      welcomeMessage,
      image,
    };
  }

  private getRenderer(version: VersionEnum): PassageRenderer {
    if (!this.renderers.has(version))
      this.renderers.set(version, new PassageRenderer(version));
    return this.renderers.get(version)!;
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

    if (TEST_MODE) {
      console.log(
        `🧪 TEST_MODE → Enviando para os usuários programados(${timeSchedule})`
      );
      await fn();
      return;
    }

    const [hour, minute] = timeSchedule.split(":");
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`⏰ Agendado ${timeSchedule}`);

    cron.schedule(cronExpression, fn, {
      timezone: "America/Sao_Paulo",
    });
  }

  async saveExecution(dayNumber: number, user: User) {
    const exec = this.execRepo.create({
      user,
      version: user.version,
      plan: user.plan,
      planDay: dayNumber,
      currentTime: new Date().toISOString(),
    });

    await this.execRepo.save(exec);
  }
}
