import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { PlanExecution } from "./PlanExecution";
import { PlanEnum } from "../enums/PlanEnum";
import { VersionEnum } from "../../modules/bible/bible.enum";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  groupName: string;

  @Column({ type: "varchar", length: 500 })
  welcomeText: string;

  @Column({ type: "text", enum: PlanEnum })
  plan!: PlanEnum;

  @Column({ type: "text", enum: VersionEnum })
  version!: VersionEnum;

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "time" })
  scheduleTime!: string;

  @OneToMany(() => PlanExecution, (upe) => upe.user, { cascade: true })
  executions?: PlanExecution[];
}
