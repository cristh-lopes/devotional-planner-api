import { UserRepository } from "./user.repository";
import { User } from "../../database/entities/User";

export interface UserConfig {
  timeScheduled: string;
  user: User[];
}

export class UserService {
  private cache: UserConfig[] | null = null;

  constructor(private repo: UserRepository) {}

  async loadConfigs(): Promise<UserConfig[]> {
    if (this.cache) return this.cache;

    const users = await this.repo.findAll();

    if (!users || users.length === 0)
      throw new Error("Nenhum usuário configurado.");

    const grouped = users.reduce<Record<string, User[]>>((acc, user) => {
      if (!user.scheduleTime) return acc;

      if (!acc[user.scheduleTime]) acc[user.scheduleTime] = [];

      acc[user.scheduleTime].push(user);
      return acc;
    }, {});

    const config: UserConfig[] = Object.entries(grouped).map(
      ([timeScheduled, user]) => ({
        timeScheduled,
        user,
      })
    );

    this.cache = config;
    return config;
  }

  clearCache() {
    this.cache = null;
  }

  async saveGroupId(user: User, groupId: string) {
    user.groupId = groupId;
    await this.repo.save(user);
    this.clearCache();
  }
}
