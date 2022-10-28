import { MigrationInterface } from 'typeorm'
import { QueryRunner }        from 'typeorm'

export class UpdateProduct1666970113625 implements MigrationInterface {
  name = 'UpdateProduct1666970113625'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_entity" ADD "updatedAt" TIMESTAMP`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_entity" DROP COLUMN "updatedAt"`)
  }
}
