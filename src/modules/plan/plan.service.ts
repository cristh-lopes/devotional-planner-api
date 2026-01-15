import { PlanExecution } from "../../database/entities/PlanExecution";
import { User } from "../../database/entities/User";
import { PlanEnum } from "./plan.enum";
import { PlanRepository } from "./plan.repository";
import { Day, Plan } from "./plan.types";

export class PlanService {
  private cache: Map<PlanEnum, Plan> = new Map();

  private load(plan: PlanEnum): Plan {
    if (this.cache.has(plan)) {
      return this.cache.get(plan)!;
    }

    const loaded = PlanRepository.get(plan);
    this.cache.set(plan, loaded);
    return loaded;
  }

  private getNextDay(executions: PlanExecution[]): number {
    if (!executions || executions.length === 0) return 1;

    const lastExecution = executions.reduce((latest, current) =>
      current.planDay > latest.planDay ? current : latest
    );

    return lastExecution.planDay + 1;
  }

  private getDay(plan: Plan, dayNumber: number): Day {
    const entry = plan._days.find((d) => Number(d._n) === dayNumber);
    if (!entry) throw new Error(`Dia ${dayNumber} não encontrado no plano.`);
    return entry;
  }

  async getNextPlanData(user: User): Promise<{ user: User; day: Day }> {
    if (!user) throw new Error("Usuário não informado para o plano.");

    const plan = this.load(user.plan as PlanEnum);
    const nextDay = this.getNextDay(user.executions ?? []);
    const day = this.getDay(plan, nextDay);

    return { user, day };
  }
}
