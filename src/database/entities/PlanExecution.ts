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
import { VersionEnum } from "../../modules/bible/bible.enum";
import { PlanEnum } from "../../modules/plan/plan.enum";

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

  @Column({ type: "text", enum: VersionEnum })
  version!: VersionEnum;

  @Column({ type: "text", enum: PlanEnum })
  plan!: PlanEnum;

  @Column({ type: "int" })
  planDay: number;

  @CreateDateColumn({ type: "datetime" })
  currentTime!: string;
}
