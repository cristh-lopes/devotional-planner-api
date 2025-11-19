import chronological from "./data/chronological.json";
import { Plan } from "./plan.types";

const planMap: Record<string, Plan> = {
  chronological: chronological as Plan,
};

export class PlanRepository {
  static get(plan: string): Plan {
    const p = planMap[plan];
    if (!p) throw new Error("Plano não suportado");
    return p;
  }
}
