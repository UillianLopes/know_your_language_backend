import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeScoreRelationship1687023661029
  implements MigrationInterface
{
  name = 'ChangeScoreRelationship1687023661029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_e3c3764920ed7d8478c46d61619"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "scoresId"`);
    await queryRunner.query(`ALTER TABLE "score" ADD "userId" integer`);
    await queryRunner.query(`ALTER TABLE "score" ADD "wordId" integer`);
    await queryRunner.query(
      `ALTER TABLE "score" ADD CONSTRAINT "FK_327e5a5890df4462edf4ac9fa30" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "score" ADD CONSTRAINT "FK_cbb32b268bc58784f80ebbc22aa" FOREIGN KEY ("wordId") REFERENCES "word"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "score" DROP CONSTRAINT "FK_cbb32b268bc58784f80ebbc22aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "score" DROP CONSTRAINT "FK_327e5a5890df4462edf4ac9fa30"`,
    );
    await queryRunner.query(`ALTER TABLE "score" DROP COLUMN "wordId"`);
    await queryRunner.query(`ALTER TABLE "score" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "scoresId" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_e3c3764920ed7d8478c46d61619" FOREIGN KEY ("scoresId") REFERENCES "score"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
