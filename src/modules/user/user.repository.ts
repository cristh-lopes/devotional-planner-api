import { Repository, FindOptionsWhere, DeepPartial } from "typeorm";

import { User } from "../../database/entities/User";

export class UserRepository {
  constructor(private orm: Repository<User>) {}

  findOne(where?: FindOptionsWhere<User>) {
    return this.orm.findOne({
      where: where ?? {},
      relations: { executions: true },
    });
  }

  findAll() {
    return this.orm.find({
      relations: { executions: true },
    });
  }

  create(data: DeepPartial<User>) {
    return this.orm.create(data);
  }

  save(data: DeepPartial<User>) {
    return this.orm.save(data);
  }

  delete(id: number) {
    return this.orm.delete(id);
  }

  remove(user: User) {
    return this.orm.remove(user);
  }

  exist(where: FindOptionsWhere<User>) {
    return this.orm.exist({ where });
  }
}
