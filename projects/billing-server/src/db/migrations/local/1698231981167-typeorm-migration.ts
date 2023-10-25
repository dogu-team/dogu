import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1698231981167 implements MigrationInterface {
  name = 'typeormMigration1698231981167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."cloud_subscription_item_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(
      `CREATE TABLE "cloud_subscription_item" ("cloud_subscription_item_id" uuid NOT NULL, "type" "public"."cloud_subscription_item_type_enum" NOT NULL, "cloud_license_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_27b456684dff4121ea48d053c09" PRIMARY KEY ("cloud_subscription_item_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_subscription_item" ADD CONSTRAINT "FK_eaed0f5f55dab2cd206eed4a266" FOREIGN KEY ("cloud_license_id") REFERENCES "cloud_license"("cloud_license_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_subscription_item" DROP CONSTRAINT "FK_eaed0f5f55dab2cd206eed4a266"`);
    await queryRunner.query(`DROP TABLE "cloud_subscription_item"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_subscription_item_type_enum"`);
  }
}
