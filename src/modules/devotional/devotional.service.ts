import { Repository } from "typeorm";
import { User } from "../../database/entities/User";
import { PlanExecution } from "../../database/entities/PlanExecution";

import { PassageRenderer } from "../../devotional/PassageRenderer";
import { PlanService } from "../plan/plan.service";

export class DevotionalService {
  private renderer: PassageRenderer;

  constructor(
    private _planService: PlanService,
    private execRepo: Repository<PlanExecution>
  ) {}

  async generateDevotionalMessages(): Promise<string[]> {
    const { day, user } = await this._planService.getNextPlanData();
    if(this.renderer === undefined) {
      this.renderer = new PassageRenderer(user.version);
    }
    const messages = this.renderer.renderPassages(
      Array.isArray(day._passage) ? day._passage : [day._passage]
    );

    await this.saveExecution(Number(day._n), user);

    return [user.welcomeText, ...messages];
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
