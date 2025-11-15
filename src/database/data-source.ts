import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { PlanExecution } from "./entities/PlanExecution";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./src/database/database.sqlite",
  entities: [User, PlanExecution],
  migrations: [__dirname + "/migrations/*.{js,ts}"],
  synchronize: false,
  logging: false,
});
