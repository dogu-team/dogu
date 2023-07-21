import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689844632382 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE organization_api_token RENAME COLUMN organization_api_token_id TO organization_access_token_id;`);
    await queryRunner.query(`ALTER TABLE organization_api_token RENAME TO organization_access_token;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE organization_access_token RENAME COLUMN organization_access_token_id TO organization_api_token_id;`);
    await queryRunner.query(`ALTER TABLE organization_access_token RENAME TO organization_api_token;`);
  }
}
