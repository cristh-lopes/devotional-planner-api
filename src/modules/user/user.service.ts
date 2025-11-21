import { UserRepository } from "./user.repository";
import { User } from "../../database/entities/User";

export class UserService {
  private cache: User | null = null;

  constructor(private repo: UserRepository) {}

  async load(): Promise<User> {
    if (this.cache) return this.cache;

    const user = await this.repo.findOne();

    if (!user) {
      throw new Error("Nenhum usuário configurado.");
    }

    this.cache = user;
    return user;
  }

  async createOrUpdate(data: Partial<User>): Promise<User> {
    const existing = await this.repo.findOne();

    if (!existing) {
      const created = await this.repo.save(data);
      this.cache = created;
      return created;
    }

    const updated = await this.repo.save({
      ...existing,
      ...data,
    });

    this.cache = updated;
    return updated;
  }

  async updateFields(data: Partial<User>): Promise<User> {
    const user = await this.load();

    const updated = await this.repo.save({
      ...user,
      ...data,
    });

    this.cache = updated;
    return updated;
  }

  clearCache() {
    this.cache = null;
  }

  async saveGroupId(groupId: string) {
    const user = await this.load();
    user.groupId = groupId;
    await this.repo.save(user);
  }
}
