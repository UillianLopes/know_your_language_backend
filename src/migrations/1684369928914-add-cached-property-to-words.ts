import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCachedPropertyToWords1684369928914
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      'ALTER TABLE word ADD COLUMN cached boolean default false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('ALTER TABLE word DROP COLUMN cached');
  }
}
