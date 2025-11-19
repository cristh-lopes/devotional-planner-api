import { Repository } from "typeorm";
import { User } from "../database/entities/User";
import { PlanExecution } from "../database/entities/PlanExecution";

import { PlanRepository } from "../modules/plan/plan.repository";
import { BibleRepository } from "./BibleRepository";
import { PassageRenderer } from "./PassageRenderer";

export class DevotionalService {
  private user: User;
  private bible;
  private plan;
  private renderer: PassageRenderer;

  constructor(
    private userRepo: Repository<User>,
    private execRepo: Repository<PlanExecution>
  ) {}

  private async init() {
    this.user = await this.loadUser();
    this.bible = BibleRepository.get(this.user.version);
    this.plan = PlanRepository.get(this.user.plan);
    this.renderer = new PassageRenderer(this.bible);
  }

  private async loadUser(): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {},
      relations: { executions: true },
    });

    if (!user) throw new Error("Usuário não encontrado.");
    return user;
  }

  async generateDevotionalMessages(): Promise<string[]> {
    if (!this.user) await this.init();

    const nextDay = this.getNextPlanDay();
    const passages = this.getPlanPassages(nextDay);
    const messages = this.renderer.renderPassages(passages);

    await this.saveExecution(nextDay);

    return [this.user.welcomeText, ...messages];
  }

  private getNextPlanDay(): number {
    const ex = this.user.executions;
    if (!ex?.length) return 1;

    const last = ex.sort((a, b) => b.planDay - a.planDay)[0];
    return last.planDay + 1;
  }

  private getPlanPassages(day: number) {
    const entry = this.plan._days.find(d => Number(d._n) === day);
    if (!entry) throw new Error(`Dia ${day} não encontrado.`);

    return Array.isArray(entry._passage) ? entry._passage : [entry._passage];
  }

  private async saveExecution(day: number) {
    const exec = this.execRepo.create({
      user: this.user,
      version: this.user.version,
      plan: this.user.plan,
      planDay: day,
      currentTime: new Date().toISOString(),
    });

    await this.execRepo.save(exec);
  }
}
