import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1763222627818 implements MigrationInterface {
    name = 'AutoMigration1763222627818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_plan_executions" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" varchar CHECK( "version" IN ('nvi','acf','aa') ) NOT NULL, "plan" varchar CHECK( "plan" IN ('chronological') ) NOT NULL, "planDay" integer NOT NULL, "currentTime" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_10333056cba1883a03baef673a" ON "user_plan_executions" ("userId") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "groupName" varchar(120) NOT NULL, "welcomeText" varchar(500) NOT NULL, "plan" varchar CHECK( "plan" IN ('chronological') ) NOT NULL, "version" varchar CHECK( "version" IN ('nvi','acf','aa') ) NOT NULL, "startDate" date NOT NULL, "scheduleTime" time NOT NULL)`);
        await queryRunner.query(`DROP INDEX "IDX_10333056cba1883a03baef673a"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_plan_executions" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" varchar CHECK( "version" IN ('nvi','acf','aa') ) NOT NULL, "plan" varchar CHECK( "plan" IN ('chronological') ) NOT NULL, "planDay" integer NOT NULL, "currentTime" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, CONSTRAINT "FK_10333056cba1883a03baef673ae" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_user_plan_executions"("id", "version", "plan", "planDay", "currentTime", "userId") SELECT "id", "version", "plan", "planDay", "currentTime", "userId" FROM "user_plan_executions"`);
        await queryRunner.query(`DROP TABLE "user_plan_executions"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_plan_executions" RENAME TO "user_plan_executions"`);
        await queryRunner.query(`CREATE INDEX "IDX_10333056cba1883a03baef673a" ON "user_plan_executions" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_10333056cba1883a03baef673a"`);
        await queryRunner.query(`ALTER TABLE "user_plan_executions" RENAME TO "temporary_user_plan_executions"`);
        await queryRunner.query(`CREATE TABLE "user_plan_executions" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" varchar CHECK( "version" IN ('nvi','acf','aa') ) NOT NULL, "plan" varchar CHECK( "plan" IN ('chronological') ) NOT NULL, "planDay" integer NOT NULL, "currentTime" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "user_plan_executions"("id", "version", "plan", "planDay", "currentTime", "userId") SELECT "id", "version", "plan", "planDay", "currentTime", "userId" FROM "temporary_user_plan_executions"`);
        await queryRunner.query(`DROP TABLE "temporary_user_plan_executions"`);
        await queryRunner.query(`CREATE INDEX "IDX_10333056cba1883a03baef673a" ON "user_plan_executions" ("userId") `);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "IDX_10333056cba1883a03baef673a"`);
        await queryRunner.query(`DROP TABLE "user_plan_executions"`);
    }

}
