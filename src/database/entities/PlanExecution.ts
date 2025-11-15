import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { VersionEnum } from "../enums/VersionEnum";
import { PlanEnum } from "../enums/PlanEnum";

@Entity({ name: "user_plan_executions" })
export class PlanExecution {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (u) => u.executions, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @Index()
  user!: User;

  @Column({ type: "text", enum: PlanEnum })
  plan!: PlanEnum;

  @Column({ type: "text", enum: VersionEnum })
  version!: VersionEnum;

  @Column({ type: "date" })
  startDate!: string; // YYYY-MM-DD

  @Column({ type: "time" })
  scheduleTime!: string; // HH:mm

  @Column({ type: "boolean", default: true })
  autoSend!: boolean;

  @Column({ type: "int", default: 1 })
  currentDay!: number;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: string;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt!: string;
}
