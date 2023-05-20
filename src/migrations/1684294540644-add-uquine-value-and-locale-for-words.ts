import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUquineValueAndLocaleForWords1684294540644
  implements MigrationInterface
{
  name = 'AddUquineValueAndLocaleForWords1684294540644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."word_locale_enum" AS ENUM('pt-BR', 'en-US')`,
    );
    await queryRunner.query(
      `ALTER TABLE "word" ADD "locale" "public"."word_locale_enum" NOT NULL DEFAULT 'pt-BR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "word" ADD CONSTRAINT "UQ_ffe87d9a2284e8b03b968fb24e8" UNIQUE ("value", "locale")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "word" DROP CONSTRAINT "UQ_ffe87d9a2284e8b03b968fb24e8"`,
    );
    await queryRunner.query(`ALTER TABLE "word" DROP COLUMN "locale"`);
    await queryRunner.query(`DROP TYPE "public"."word_locale_enum"`);
  }
}
