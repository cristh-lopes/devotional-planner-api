import { Repository } from "typeorm";
import { User } from "../../database/entities/User";
import { PlanExecution } from "../../database/entities/PlanExecution";

import { BibleRepository } from "../bible/bible.repository";
import { PassageRenderer } from "../../devotional/PassageRenderer";
import { PlanService } from "../plan/plan.service";

export class DevotionalService {
  private user: User;
  private bible;
  private renderer: PassageRenderer;

  constructor(
    private _planService: PlanService,
    private execRepo: Repository<PlanExecution>
  ) {}

  private async init() {
    this.bible = BibleRepository.get(this.user.version);
    this.renderer = new PassageRenderer(this.bible);
  }

  async generateDevotionalMessages(): Promise<string[]> {
    const { day, user } = await this._planService.getNextPlanData();
    const messages = this.renderer.renderPassages(
      Array.isArray(day._passage) ? day._passage : [day._passage]
    );

    await this.saveExecution(Number(day._n), user);

    return [this.user.welcomeText, ...messages];
  }

  private async saveExecution(day: number, user: User) {
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
