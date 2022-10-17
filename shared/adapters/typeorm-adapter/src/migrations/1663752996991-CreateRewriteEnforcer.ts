import { MigrationInterface } from 'typeorm'
import { QueryRunner }        from 'typeorm'

export class CreateRewriteEnforcer1663752996991 implements MigrationInterface {
  name = 'CreateRewriteEnforcer1663752996991'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rewrite_enforcer_entity" ("id" uuid NOT NULL, "flag" boolean NOT NULL, CONSTRAINT "PK_0e9767bf6a952c42e9104c47f21" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rewrite_enforcer_entity"`)
  }
}
