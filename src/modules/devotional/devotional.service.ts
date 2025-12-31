import { User } from "../../database/entities/User";
import cron from "node-cron";

import { PassageRenderer } from "./PassageRenderer";
import { PlanService } from "../plan/plan.service";
import { Repository } from "typeorm";
import { PlanExecution } from "../../database/entities/PlanExecution";
import { Day, Passage } from "../plan/plan.types";

export class DevotionalService {
  private renderer: PassageRenderer;

  constructor(
    private _planService: PlanService,
    private execRepo: Repository<PlanExecution>
  ) {}

  async generateDevotionalMessages(): Promise<{
    day: number;
    user: User;
    messages: string[];
  }> {
    const { day, user } = await this._planService.getNextPlanData();
    if (this.renderer === undefined) {
      this.renderer = new PassageRenderer(user.version);
    }
    const messages = this.renderer.renderPassages(
      Array.isArray(day._passage) ? day._passage : [day._passage]
    );

    return {
      user,
      day: Number(day._n),
      messages: [await this.getWelcomeMessage(user, day), ...messages],
    };
  }

  async getWelcomeMessage(user: User, day: Day): Promise<string> {
    const text = user.welcomeText + "\n\n*PASSAGENS DE HOJE:*\n";
    const format = (passage: Passage) => {
      if (passage._start._book === passage._end._book) {
        return passage._start._chapter === passage._end._chapter
          ? `- ${passage._start._book} ${passage._start._chapter}:${passage._start._verse}-${passage._end._verse}`
          : `- ${passage._start._book} ${passage._start._chapter}:${passage._start._verse} - ${passage._end._chapter}:${passage._end._verse}`;
      } else
        return `- ${passage._start._book} ${passage._start._chapter}:${passage._start._verse} - ${passage._end._book} ${passage._end._chapter}:${passage._end._verse}`;
    };
    return (
      text +
      (Array.isArray(day._passage)
        ? day._passage.map(format).join("\n")
        : format(day._passage))
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
