import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1693200893980 implements MigrationInterface {
  name = 'typeormMigration1693200893980';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "device_serial"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_device_serial"`);

    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "device_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "device_info" json NOT NULL`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "platform" smallint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_device_id" uuid`);

    await queryRunner.query(
      `ALTER TABLE "record_test_step" ADD CONSTRAINT "FK_2105732ac6a94c435a7ff65a307" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "record_test_case" ADD CONSTRAINT "FK_4aeca9e866c3051e74f171cf3d9" FOREIGN KEY ("active_device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP CONSTRAINT "FK_4aeca9e866c3051e74f171cf3d9"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP CONSTRAINT "FK_2105732ac6a94c435a7ff65a307"`);

    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "active_device_id"`);
    await queryRunner.query(`ALTER TABLE "record_test_case" DROP COLUMN "platform"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "device_info"`);
    await queryRunner.query(`ALTER TABLE "record_test_step" DROP COLUMN "device_id"`);

    await queryRunner.query(`ALTER TABLE "record_test_case" ADD "active_device_serial" character varying`);
    await queryRunner.query(`ALTER TABLE "record_test_step" ADD "device_serial" character varying`);
  }
}
