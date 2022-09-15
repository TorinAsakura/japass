import { MigrationInterface } from 'typeorm'
import { QueryRunner }        from 'typeorm'

export class CreateOperation1663175373528 implements MigrationInterface {
  name = 'CreateOperation1663175373528'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "operation_entity" ("id" uuid NOT NULL, "completedAtTs" bigint NOT NULL, "page" integer NOT NULL, CONSTRAINT "PK_926dbec3380e83643b464d67817" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "operation_entity"`)
  }
}
