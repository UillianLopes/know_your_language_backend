import { MigrationInterface, QueryRunner } from 'typeorm';

export class Relationships1684212671561 implements MigrationInterface {
  name = 'Relationships1684212671561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_words_word" ("userId" integer NOT NULL, "wordId" integer NOT NULL, CONSTRAINT "PK_54ec4f3515004b2113cc051a6c1" PRIMARY KEY ("userId", "wordId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66d70c58b59b1aba106e17a613" ON "user_words_word" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02b98eafcba69247559b60ddc7" ON "user_words_word" ("wordId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_words_word" ADD CONSTRAINT "FK_66d70c58b59b1aba106e17a6135" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_words_word" ADD CONSTRAINT "FK_02b98eafcba69247559b60ddc7c" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_words_word" DROP CONSTRAINT "FK_02b98eafcba69247559b60ddc7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_words_word" DROP CONSTRAINT "FK_66d70c58b59b1aba106e17a6135"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02b98eafcba69247559b60ddc7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66d70c58b59b1aba106e17a613"`,
    );
    await queryRunner.query(`DROP TABLE "user_words_word"`);
  }
}
