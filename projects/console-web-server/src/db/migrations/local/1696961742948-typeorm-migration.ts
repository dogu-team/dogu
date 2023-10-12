import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1696961742948 implements MigrationInterface {
  name = 'typeormMigration1696961742948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."live_session_live_session_state_enum" AS ENUM('CREATED', 'CLOSE_WAIT', 'CLOSED')`);
    await queryRunner.query(
      `CREATE TABLE "live_session" ("live_session_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "device_id" uuid NOT NULL, "live_session_state" "public"."live_session_live_session_state_enum" NOT NULL DEFAULT 'CREATED', "heartbeat" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "close_wait_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "closed_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_8f88eb22c28620fb9fab9466f3e" PRIMARY KEY ("live_session_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "usage_state"`);
    await queryRunner.query(`CREATE TYPE "public"."device_usage_state_enum" AS ENUM('AVAILABLE', 'PREPARING', 'IN_USE')`);
    await queryRunner.query(`ALTER TABLE "device" ADD "usage_state" "public"."device_usage_state_enum" NOT NULL DEFAULT 'AVAILABLE'`);
    await queryRunner.query(`ALTER TABLE "live_session" RENAME COLUMN "live_session_state" TO "state"`);
    await queryRunner.query(`ALTER TYPE "public"."live_session_live_session_state_enum" RENAME TO "live_session_state_enum"`);
    await queryRunner.query(
      `ALTER TABLE "live_session" ADD CONSTRAINT "FK_92e3692af2aef15cc82c686b45a" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "live_session" ADD CONSTRAINT "FK_c1de26f67b8b99d0b13d0a40634" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "live_session" DROP CONSTRAINT "FK_c1de26f67b8b99d0b13d0a40634"`);
    await queryRunner.query(`ALTER TABLE "live_session" DROP CONSTRAINT "FK_92e3692af2aef15cc82c686b45a"`);
    await queryRunner.query(`ALTER TYPE "public"."live_session_state_enum" RENAME TO "live_session_live_session_state_enum"`);
    await queryRunner.query(`ALTER TABLE "live_session" RENAME COLUMN "state" TO "live_session_state"`);
    await queryRunner.query(`ALTER TABLE "device" DROP COLUMN "usage_state"`);
    await queryRunner.query(`DROP TYPE "public"."device_usage_state_enum"`);
    await queryRunner.query(`ALTER TABLE "device" ADD "usage_state" character varying(32) NOT NULL DEFAULT 'available'`);
    await queryRunner.query(`DROP TABLE "live_session"`);
    await queryRunner.query(`DROP TYPE "public"."live_session_live_session_state_enum"`);
  }
}
