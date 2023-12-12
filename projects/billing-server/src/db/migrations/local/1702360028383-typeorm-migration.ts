import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1702360028383 implements MigrationInterface {
  name = 'TypeormMigration1702360028383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billing_method_paddle" ("billingMethodPaddleId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "customerId" text NOT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_13d7e7c128db2e0a46468788ae5" UNIQUE ("billingOrganizationId"), CONSTRAINT "REL_13d7e7c128db2e0a46468788ae" UNIQUE ("billingOrganizationId"), CONSTRAINT "PK_d96fec77beb3f4de53fffd0ed8a" PRIMARY KEY ("billingMethodPaddleId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_source_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_source_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_source_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_source_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "billing_plan_source" ("billingPlanSourceId" integer NOT NULL, "category" "public"."billing_plan_source_category_enum" NOT NULL, "type" "public"."billing_plan_source_type_enum" NOT NULL, "name" text NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_plan_source_currency_enum" NOT NULL, "period" "public"."billing_plan_source_period_enum" NOT NULL, "originPrice" double precision NOT NULL, "billingOrganizationId" uuid, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_aa31c21e74065b3e330dfaf0e92" PRIMARY KEY ("billingPlanSourceId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_previousperiod_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_history_historytype_enum" AS ENUM('immediate-purchase', 'periodic-purchase', 'full-refund', 'partial-refund')`);
    await queryRunner.query(
      `CREATE TABLE "billing_plan_history" ("billingPlanHistoryId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "billingHistoryId" uuid NOT NULL, "billingCouponId" uuid, "billingPlanSourceId" integer, "discountedAmount" double precision, "purchasedAmount" double precision, "startedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "expiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "elapsedDays" integer, "elapsedDiscountedAmount" double precision, "previousRemainingDays" integer, "previousRemainingDiscountedAmount" double precision, "previousOption" integer, "previousPeriod" "public"."billing_plan_history_previousperiod_enum", "category" "public"."billing_plan_history_category_enum" NOT NULL, "type" "public"."billing_plan_history_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_plan_history_currency_enum" NOT NULL, "period" "public"."billing_plan_history_period_enum" NOT NULL, "originPrice" double precision NOT NULL, "historyType" "public"."billing_plan_history_historytype_enum" NOT NULL, "purchasedBillingPlanHistoryId" uuid, "refundedAmount" double precision, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_307def234534fef14e384783ef4" PRIMARY KEY ("billingPlanHistoryId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_info_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_info_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_info_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_info_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_plan_info_changerequestedperiod_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_plan_info_state_enum" AS ENUM('subscribed', 'unsubscribed', 'unsubscribe-requested', 'change-option-or-period-requested')`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_plan_info" ("billingPlanInfoId" uuid NOT NULL, "category" "public"."billing_plan_info_category_enum" NOT NULL, "type" "public"."billing_plan_info_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_plan_info_currency_enum" NOT NULL, "period" "public"."billing_plan_info_period_enum" NOT NULL, "originPrice" double precision NOT NULL, "billingOrganizationId" uuid NOT NULL, "billingPlanSourceId" integer NOT NULL, "billingCouponId" uuid, "couponRemainingApplyCount" integer, "couponApplied" boolean NOT NULL DEFAULT false, "discountedAmount" double precision NOT NULL, "changeRequestedPeriod" "public"."billing_plan_info_changerequestedperiod_enum", "changeRequestedOption" integer, "changeRequestedOriginPrice" double precision, "changeRequestedDiscountedAmount" double precision, "state" "public"."billing_plan_info_state_enum" NOT NULL, "unsubscribedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "billingPlanHistoryId" uuid, "paddleMethodType" character varying, "cardCode" character varying, "cardName" character varying, "cardNumberLast4Digits" character varying, "cardExpirationYear" character varying, "cardExpirationMonth" character varying, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_bef9153bce91a80243899beb1a7" PRIMARY KEY ("billingPlanInfoId"))`,
    );
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "subscriptionPlanType"`);
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_subscriptionplantype_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "monthlyDiscountPercent"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "monthlyApplyCount"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "yearlyDiscountPercent"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "yearlyApplyCount"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_plantype_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "planType" "public"."billing_coupon_plantype_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "period" "public"."billing_coupon_period_enum" NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "discountPercent" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "applyCount" integer`);
    await queryRunner.query(`CREATE TYPE "public"."billing_organization_billingmethod_enum" AS ENUM('nice', 'paddle')`);
    await queryRunner.query(`ALTER TABLE "billing_organization" ADD "billingMethod" "public"."billing_organization_billingmethod_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_history" ADD "paddleMethodType" character varying`);
    await queryRunner.query(`ALTER TABLE "billing_history" ADD "paddleTransactionId" character varying`);
    await queryRunner.query(`ALTER TABLE "billing_history" ADD "paddleTransaction" jsonb`);
    await queryRunner.query(`ALTER TYPE "public"."billing_history_method_enum" RENAME TO "billing_history_method_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_history_method_enum" AS ENUM('nice', 'paddle')`);
    await queryRunner.query(
      `ALTER TABLE "billing_history" ALTER COLUMN "method" TYPE "public"."billing_history_method_enum" USING "method"::"text"::"public"."billing_history_method_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_history_method_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "billing_method_paddle" ADD CONSTRAINT "FK_13d7e7c128db2e0a46468788ae5" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_source" ADD CONSTRAINT "FK_3a7491d3228b364de02c59afe3f" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_history" ADD CONSTRAINT "FK_46102ab83168c58e42edd3a72c4" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_history" ADD CONSTRAINT "FK_00836dc9db795f2e1480c29c822" FOREIGN KEY ("billingCouponId") REFERENCES "billing_coupon"("billingCouponId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_history" ADD CONSTRAINT "FK_470a63a19e28949942b8cf10706" FOREIGN KEY ("billingPlanSourceId") REFERENCES "billing_plan_source"("billingPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_history" ADD CONSTRAINT "FK_4bc36f1379f2c16dfef03060c90" FOREIGN KEY ("billingHistoryId") REFERENCES "billing_history"("billingHistoryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_info" ADD CONSTRAINT "FK_1572c0160dab9c99d557bcc1a7e" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_info" ADD CONSTRAINT "FK_109650572adcef69a6be98a8ff6" FOREIGN KEY ("billingCouponId") REFERENCES "billing_coupon"("billingCouponId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_plan_info" ADD CONSTRAINT "FK_61bb1197766a72eef7b04ba9135" FOREIGN KEY ("billingPlanSourceId") REFERENCES "billing_plan_source"("billingPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_plan_info" DROP CONSTRAINT "FK_61bb1197766a72eef7b04ba9135"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_info" DROP CONSTRAINT "FK_109650572adcef69a6be98a8ff6"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_info" DROP CONSTRAINT "FK_1572c0160dab9c99d557bcc1a7e"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_history" DROP CONSTRAINT "FK_4bc36f1379f2c16dfef03060c90"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_history" DROP CONSTRAINT "FK_470a63a19e28949942b8cf10706"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_history" DROP CONSTRAINT "FK_00836dc9db795f2e1480c29c822"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_history" DROP CONSTRAINT "FK_46102ab83168c58e42edd3a72c4"`);
    await queryRunner.query(`ALTER TABLE "billing_plan_source" DROP CONSTRAINT "FK_3a7491d3228b364de02c59afe3f"`);
    await queryRunner.query(`ALTER TABLE "billing_method_paddle" DROP CONSTRAINT "FK_13d7e7c128db2e0a46468788ae5"`);
    await queryRunner.query(`CREATE TYPE "public"."billing_history_method_enum_old" AS ENUM('nice')`);
    await queryRunner.query(
      `ALTER TABLE "billing_history" ALTER COLUMN "method" TYPE "public"."billing_history_method_enum_old" USING "method"::"text"::"public"."billing_history_method_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."billing_history_method_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."billing_history_method_enum_old" RENAME TO "billing_history_method_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP COLUMN "paddleTransaction"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP COLUMN "paddleTransactionId"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP COLUMN "paddleMethodType"`);
    await queryRunner.query(`ALTER TABLE "billing_organization" DROP COLUMN "billingMethod"`);
    await queryRunner.query(`DROP TYPE "public"."billing_organization_billingmethod_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "applyCount"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "discountPercent"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "period"`);
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_period_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" DROP COLUMN "planType"`);
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_plantype_enum"`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "yearlyApplyCount" integer`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "yearlyDiscountPercent" integer`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "monthlyApplyCount" integer`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "monthlyDiscountPercent" integer`);
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_subscriptionplantype_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`ALTER TABLE "billing_coupon" ADD "subscriptionPlanType" "public"."billing_coupon_subscriptionplantype_enum"`);
    await queryRunner.query(`DROP TABLE "billing_plan_info"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_state_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_changerequestedperiod_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_info_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_plan_history"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_historytype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_history_previousperiod_enum"`);
    await queryRunner.query(`DROP TABLE "billing_plan_source"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_source_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_source_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_source_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_plan_source_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_method_paddle"`);
  }
}
