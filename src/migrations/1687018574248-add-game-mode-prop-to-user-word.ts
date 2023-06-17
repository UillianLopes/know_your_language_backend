import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGameModePropToUserWord1687018574248
  implements MigrationInterface
{
  name = 'AddGameModePropToUserWord1687018574248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_word_gamemode_enum" AS ENUM('guessTheWord', 'guessTheMeaning')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_word" ADD "gameMode" "public"."user_word_gamemode_enum" NOT NULL DEFAULT 'guessTheMeaning'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_word" DROP COLUMN "gameMode"`);
    await queryRunner.query(`DROP TYPE "public"."user_word_gamemode_enum"`);
  }
}
