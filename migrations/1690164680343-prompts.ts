import { MigrationInterface, QueryRunner } from 'typeorm';

export class Prompts1690164680343 implements MigrationInterface {
  name = 'Prompts1690164680343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."prompt_locale_enum" AS ENUM('pt-BR', 'en-US')`,
    );
    await queryRunner.query(
      `CREATE TABLE "prompt" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "locale" "public"."prompt_locale_enum" NOT NULL DEFAULT 'en-US', CONSTRAINT "UQ_4fbcec62b59c993621c22a9817a" UNIQUE ("locale"), CONSTRAINT "PK_d8e3aa07a95560a445ad50fb931" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prompt"`);
    await queryRunner.query(`DROP TYPE "public"."prompt_locale_enum"`);
  }
}
