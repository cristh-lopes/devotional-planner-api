import chronological from "./data/chronological.json";
import { PlanEnum } from "./plan.enum";
import { Plan } from "./plan.types";

const planMap: Record<PlanEnum, Plan> = {
  chronological: chronological as Plan,
};

export class PlanRepository {
  static get(plan: PlanEnum): Plan {
    const p = planMap[plan];
    if (!p) throw new Error("Plano não suportado");
    return p;
  }
}
