import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1684976183068 implements MigrationInterface {
  name = 'Initial1684976183068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "meaning" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "isFake" boolean NOT NULL DEFAULT true, "wordId" integer, CONSTRAINT "PK_333c33c0b378df42043fb0541dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "provider" character varying NOT NULL, "picture" character varying, "scoresId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
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
      `CREATE TABLE "user_word" ("id" SERIAL NOT NULL, "incorrectAttempts" integer NOT NULL, "learned" boolean NOT NULL, "wordId" integer, "userId" integer, CONSTRAINT "PK_a48686e127cc64975c587776c5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "meaning" ADD CONSTRAINT "FK_d3aec81d9cc47cd34818da1d9b8" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_e3c3764920ed7d8478c46d61619" FOREIGN KEY ("scoresId") REFERENCES "score"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_word" ADD CONSTRAINT "FK_cc11d9d235ad028713e10e9192e" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_word" ADD CONSTRAINT "FK_2a726298786a7c5be83f4477712" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_word" DROP CONSTRAINT "FK_2a726298786a7c5be83f4477712"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_word" DROP CONSTRAINT "FK_cc11d9d235ad028713e10e9192e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_e3c3764920ed7d8478c46d61619"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meaning" DROP CONSTRAINT "FK_d3aec81d9cc47cd34818da1d9b8"`,
    );
    await queryRunner.query(`DROP TABLE "user_word"`);
    await queryRunner.query(`DROP TABLE "word"`);
    await queryRunner.query(`DROP TYPE "public"."word_locale_enum"`);
    await queryRunner.query(`DROP TABLE "score"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "meaning"`);
  }
}
