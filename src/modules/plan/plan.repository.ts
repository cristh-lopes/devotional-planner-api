import chronological from "./data/chronological.json";
import john21 from "./data/john21.json";
import bible365 from "./data/bible365.json";
import { PlanEnum } from "./plan.enum";
import { Plan } from "./plan.types";

const planMap: Record<PlanEnum, Plan> = {
  chronological: chronological as Plan,
  john21: john21 as Plan,
  bible365: bible365 as Plan,
};

export class PlanRepository {
  static get(plan: PlanEnum): Plan {
    const p = planMap[plan];
    if (!p) throw new Error("Plano não suportado");
    return p;
  }
}
