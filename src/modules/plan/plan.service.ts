import { PlanExecution } from "../../database/entities/PlanExecution";
import { User } from "../../database/entities/User";
import { UserService } from "../user/user.service";
import { PlanEnum } from "./plan.enum";
import { PlanRepository } from "./plan.repository";
import { Day, Plan } from "./plan.types";

export class PlanService {
  private cache: Map<PlanEnum, Plan> = new Map();

  constructor(private _userService: UserService) {}

  private load(plan: PlanEnum): Plan {
    if (this.cache.has(plan)) {
      return this.cache.get(plan)!;
    }

    const loaded = PlanRepository.get(plan);
    this.cache.set(plan, loaded);
    return loaded;
  }

  private getNextDay(userExecutions: PlanExecution[]): number {
    if (!userExecutions?.length) return 1;
    const last = userExecutions.sort((a, b) => b.planDay - a.planDay)[0];
    return last.planDay + 1;
  }

  private getDay(plan: Plan, dayNumber: number): Day {
    const entry = plan._days.find((d) => Number(d._n) === dayNumber);
    if (!entry) throw new Error(`Dia ${dayNumber} não encontrado no plano.`);
    return entry;
  }

  async getNextPlanData(): Promise<{ user: User; day: Day }> {
    const user = await this._userService.load();

    const plan = this.load(user.plan as PlanEnum);
    const nextDay = this.getNextDay(user.executions);
    const day = this.getDay(plan, nextDay);

    return { user, day };
  }
}
