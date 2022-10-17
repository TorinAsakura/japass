import { MigrationInterface } from 'typeorm'
import { QueryRunner }        from 'typeorm'

export class CreateProduct1662729110661 implements MigrationInterface {
  name = 'CreateProduct1662729110661'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_entity" ("id" uuid NOT NULL, "name" character varying, "price" double precision, "remains" integer, "articleNumber" character varying NOT NULL, "code" character varying, "description" character varying, "brand" character varying, "UOM" character varying, "nds" double precision, "country" character varying, "imagePreview" character varying, "images" text array NOT NULL, "width" double precision, "height" double precision, "depth" double precision, "weight" double precision, "volume" double precision, "barcodes" text array NOT NULL, "category" character varying, CONSTRAINT "PK_6e8f75045ddcd1c389c765c896e" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_entity"`)
  }
}
