import { AppDataSource } from "../../database/data-source";
import { User } from "../../database/entities/User";

import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

export class UserModule {
  static build() {
    const typeormRepo = AppDataSource.getRepository(User);

    const repository = new UserRepository(typeormRepo);

    const service = new UserService(repository);

    return {
      // repository,
      service,
    };
  }
}
