import { Plan } from "./types/PlanTypes";
import chronological from "../database/plan/chronological.json";

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
