import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1684212375158 implements MigrationInterface {
  name = 'Initial1684212375158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "provider" character varying NOT NULL, "picture" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "writing" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "wordId" integer, CONSTRAINT "PK_d29831aa609e46c9364b1dbe7e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "word" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_ad026d65e30f80b7056ca31f666" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meaning" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "isFake" boolean NOT NULL DEFAULT true, "wordId" integer, CONSTRAINT "PK_333c33c0b378df42043fb0541dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing" ADD CONSTRAINT "FK_e5d096370176ffdd7a9a7a7b74f" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meaning" ADD CONSTRAINT "FK_d3aec81d9cc47cd34818da1d9b8" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meaning" DROP CONSTRAINT "FK_d3aec81d9cc47cd34818da1d9b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing" DROP CONSTRAINT "FK_e5d096370176ffdd7a9a7a7b74f"`,
    );
    await queryRunner.query(`DROP TABLE "meaning"`);
    await queryRunner.query(`DROP TABLE "word"`);
    await queryRunner.query(`DROP TABLE "writing"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
