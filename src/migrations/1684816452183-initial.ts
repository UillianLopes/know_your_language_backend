import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1684816452183 implements MigrationInterface {
  name = 'Initial1684816452183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "meaning" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "isFake" boolean NOT NULL DEFAULT true, "wordId" integer, CONSTRAINT "PK_333c33c0b378df42043fb0541dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "writing" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "wordId" integer, CONSTRAINT "PK_d29831aa609e46c9364b1dbe7e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "score" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_1770f42c61451103f5514134078" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."word_locale_enum" AS ENUM('pt-BR', 'en-US')`,
    );
    await queryRunner.query(
      `CREATE TABLE "word" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "locale" "public"."word_locale_enum" NOT NULL DEFAULT 'pt-BR', "cached" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_ffe87d9a2284e8b03b968fb24e8" UNIQUE ("value", "locale"), CONSTRAINT "PK_ad026d65e30f80b7056ca31f666" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "provider" character varying NOT NULL, "picture" character varying, "scoresId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_words" ("wordId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_4d95335902578b2d6706be8f928" PRIMARY KEY ("wordId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7f1412e64794db16bb12b6dff" ON "user_words" ("wordId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00b5d2a73200f7059d3b4576cf" ON "user_words" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "meaning" ADD CONSTRAINT "FK_d3aec81d9cc47cd34818da1d9b8" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing" ADD CONSTRAINT "FK_e5d096370176ffdd7a9a7a7b74f" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_e3c3764920ed7d8478c46d61619" FOREIGN KEY ("scoresId") REFERENCES "score"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_words" ADD CONSTRAINT "FK_f7f1412e64794db16bb12b6dff8" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_words" ADD CONSTRAINT "FK_00b5d2a73200f7059d3b4576cfc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_words" DROP CONSTRAINT "FK_00b5d2a73200f7059d3b4576cfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_words" DROP CONSTRAINT "FK_f7f1412e64794db16bb12b6dff8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_e3c3764920ed7d8478c46d61619"`,
    );
    await queryRunner.query(
      `ALTER TABLE "writing" DROP CONSTRAINT "FK_e5d096370176ffdd7a9a7a7b74f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meaning" DROP CONSTRAINT "FK_d3aec81d9cc47cd34818da1d9b8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00b5d2a73200f7059d3b4576cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7f1412e64794db16bb12b6dff"`,
    );
    await queryRunner.query(`DROP TABLE "user_words"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "word"`);
    await queryRunner.query(`DROP TYPE "public"."word_locale_enum"`);
    await queryRunner.query(`DROP TABLE "score"`);
    await queryRunner.query(`DROP TABLE "writing"`);
    await queryRunner.query(`DROP TABLE "meaning"`);
  }
}
