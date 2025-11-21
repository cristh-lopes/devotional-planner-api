import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGroupId1763754144244 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "groupId",
        type: "varchar",
        length: "50",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "groupId");
  }
}
