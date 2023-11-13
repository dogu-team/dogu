import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1699859245460 implements MigrationInterface {
  name = 'TypeormMigration1699859245460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billing_method_nice" ("billingMethodNiceId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "bid" character varying, "cardCode" character varying, "cardName" character varying, "cardNumberLast4Digits" character varying, "expirationYear" character varying, "expirationMonth" character varying, "subscribeRegistResponse" jsonb, "subscribeRegistAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_135501b1693ec3ab2bd1b110f45" UNIQUE ("billingOrganizationId"), CONSTRAINT "REL_135501b1693ec3ab2bd1b110f4" UNIQUE ("billingOrganizationId"), CONSTRAINT "PK_db7e958e096f15ba131d001a41c" PRIMARY KEY ("billingMethodNiceId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_type_enum" AS ENUM('basic', 'promotion')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_subscriptionplantype_enum" AS ENUM('live-testing')`);
    await queryRunner.query(
      `CREATE TABLE "billing_coupon" ("billingCouponId" uuid NOT NULL, "code" character varying NOT NULL, "type" "public"."billing_coupon_type_enum" NOT NULL DEFAULT 'basic', "subscriptionPlanType" "public"."billing_coupon_subscriptionplantype_enum", "monthlyDiscountPercent" integer, "monthlyApplyCount" integer, "yearlyDiscountPercent" integer, "yearlyApplyCount" integer, "remainingAvailableCount" integer, "expiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_00fad1b7bdccd28013dafc534dd" UNIQUE ("code"), CONSTRAINT "PK_13aa77b2165776ebc8fa6455625" PRIMARY KEY ("billingCouponId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan_source" ("billingSubscriptionPlanSourceId" uuid NOT NULL, "category" "public"."billing_subscription_plan_source_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_source_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_source_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_source_period_enum" NOT NULL, "originPrice" double precision NOT NULL, "billingOrganizationId" uuid NOT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_a702dc53dd82855daf54e7b2cc6" PRIMARY KEY ("billingSubscriptionPlanSourceId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_history_previousperiod_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_history_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_history_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_history_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_history_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_subscription_plan_history_historytype_enum" AS ENUM('immediate-purchase', 'periodic-purchase', 'full-refund', 'partial-refund')`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan_history" ("billingSubscriptionPlanHistoryId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "billingHistoryId" uuid NOT NULL, "billingCouponId" uuid, "billingSubscriptionPlanSourceId" uuid, "discountedAmount" double precision, "purchasedAmount" double precision, "startedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "expiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "elapsedDays" integer, "elapsedDiscountedAmount" double precision, "previousRemainingDays" integer, "previousRemainingDiscountedAmount" double precision, "previousOption" integer, "previousPeriod" "public"."billing_subscription_plan_history_previousperiod_enum", "category" "public"."billing_subscription_plan_history_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_history_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_history_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_history_period_enum" NOT NULL, "originPrice" double precision NOT NULL, "historyType" "public"."billing_subscription_plan_history_historytype_enum" NOT NULL, "purchasedBillingSubscriptionPlanHistoryId" uuid, "refundedAmount" double precision, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_1f9027be3c3819f6de6e500824f" PRIMARY KEY ("billingSubscriptionPlanHistoryId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_info_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_info_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_info_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_info_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_info_changerequestedperiod_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TYPE "public"."billing_subscription_plan_info_state_enum" AS ENUM('subscribed', 'unsubscribed', 'unsubscribe-requested', 'change-option-or-period-requested')`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan_info" ("billingSubscriptionPlanInfoId" uuid NOT NULL, "category" "public"."billing_subscription_plan_info_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_info_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_info_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_info_period_enum" NOT NULL, "originPrice" double precision NOT NULL, "billingOrganizationId" uuid NOT NULL, "billingSubscriptionPlanSourceId" uuid, "billingCouponId" uuid, "couponRemainingApplyCount" integer, "couponApplied" boolean NOT NULL DEFAULT false, "discountedAmount" double precision NOT NULL, "changeRequestedPeriod" "public"."billing_subscription_plan_info_changerequestedperiod_enum", "changeRequestedOption" integer, "changeRequestedOriginPrice" double precision, "changeRequestedDiscountedAmount" double precision, "state" "public"."billing_subscription_plan_info_state_enum" NOT NULL, "unsubscribedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "billingSubscriptionPlanHistoryId" uuid, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_981a6d42c46383db0f0ecf47896" PRIMARY KEY ("billingSubscriptionPlanInfoId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_organization_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_organization_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(
      `CREATE TABLE "billing_organization" ("billingOrganizationId" uuid NOT NULL, "organizationId" uuid NOT NULL, "category" "public"."billing_organization_category_enum" NOT NULL, "currency" "public"."billing_organization_currency_enum", "subscriptionYearlyStartedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "subscriptionYearlyExpiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "subscriptionMonthlyStartedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "subscriptionMonthlyExpiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "graceExpiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "graceNextPurchasedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_473ad0f5bec36db5224cad15ee2" UNIQUE ("organizationId"), CONSTRAINT "PK_12beccbb6b28a149308b6da79dc" PRIMARY KEY ("billingOrganizationId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_history_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_history_method_enum" AS ENUM('nice')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_history_historytype_enum" AS ENUM('immediate-purchase', 'periodic-purchase', 'full-refund', 'partial-refund')`);
    await queryRunner.query(
      `CREATE TABLE "billing_history" ("billingHistoryId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "previewResponse" jsonb, "purchasedAmount" double precision, "currency" "public"."billing_history_currency_enum" NOT NULL, "goodsName" character varying NOT NULL, "method" "public"."billing_history_method_enum" NOT NULL, "niceSubscribePaymentsResponse" jsonb, "niceTid" character varying, "niceOrderId" character varying, "cardCode" character varying, "cardName" character varying, "cardNumberLast4Digits" character varying, "cardExpirationYear" character varying, "cardExpirationMonth" character varying, "cancelReason" character varying, "nicePaymentsCancelResponse" jsonb, "historyType" "public"."billing_history_historytype_enum" NOT NULL, "purchasedBillingHistoryId" uuid, "refundedAmount" double precision, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_825f74d6eebe60120ade722d11c" PRIMARY KEY ("billingHistoryId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_organization_used_billing_coupon" ("billingOrganizationId" uuid NOT NULL, "billingCouponId" uuid NOT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_4637389ea4f7602fa3740fdfa04" PRIMARY KEY ("billingOrganizationId", "billingCouponId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_token" ("billingTokenId" uuid NOT NULL, "token" character varying NOT NULL, "expiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1" UNIQUE ("token"), CONSTRAINT "PK_c4353d820e656e0e99a541167af" PRIMARY KEY ("billingTokenId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "date_time_simulator" ("dateTimeSimulatorId" SERIAL NOT NULL, "yearsOffset" integer NOT NULL DEFAULT '0', "monthsOffset" integer NOT NULL DEFAULT '0', "daysOffset" integer NOT NULL DEFAULT '0', "hoursOffset" integer NOT NULL DEFAULT '0', "minutesOffset" integer NOT NULL DEFAULT '0', "secondsOffset" integer NOT NULL DEFAULT '0', "millisecondsOffset" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_71d221cd6c4d74158845c8223b8" PRIMARY KEY ("dateTimeSimulatorId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."self_hosted_license_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(
      `CREATE TABLE "self_hosted_license" ("selfHostedLicenseId" uuid NOT NULL, "licenseKey" character varying NOT NULL, "organizationId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "category" "public"."self_hosted_license_category_enum" NOT NULL, "maximumEnabledMobileCount" integer NOT NULL DEFAULT '2', "maximumEnabledBrowserCount" integer NOT NULL DEFAULT '2', "openApiEnabled" boolean NOT NULL DEFAULT false, "doguAgentAutoUpdateEnabled" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "lastAccessAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "expiredAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_8662e9a2aa881e1d71991f158e4" UNIQUE ("organizationId"), CONSTRAINT "UQ_127749a3c7fb36e7e92137b5c8b" UNIQUE ("billingOrganizationId"), CONSTRAINT "REL_127749a3c7fb36e7e92137b5c8" UNIQUE ("billingOrganizationId"), CONSTRAINT "PK_ebab76510769d7f2aa8ab2cc4bf" PRIMARY KEY ("selfHostedLicenseId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."cloud_license_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(
      `CREATE TABLE "cloud_license" ("cloudLicenseId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "organizationId" uuid NOT NULL, "category" "public"."cloud_license_category_enum" NOT NULL, "liveTestingRemainingFreeSeconds" integer NOT NULL DEFAULT '10800', "liveTestingParallelCount" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_8b02c9b7033c44007d3b146f73f" UNIQUE ("billingOrganizationId"), CONSTRAINT "UQ_e3e2df21a1e3632a9d94016ae06" UNIQUE ("organizationId"), CONSTRAINT "REL_8b02c9b7033c44007d3b146f73" UNIQUE ("billingOrganizationId"), CONSTRAINT "PK_baaec3cc96c7e65d4cf614e4340" PRIMARY KEY ("cloudLicenseId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_135501b1693ec3ab2bd1b110f45" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_source" ADD CONSTRAINT "FK_66867dcca26b0a7aa5b4de0e75f" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_history" ADD CONSTRAINT "FK_6af4a5252a8b1489be32d00e729" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_history" ADD CONSTRAINT "FK_140ec1aaadac4b621564b996a72" FOREIGN KEY ("billingCouponId") REFERENCES "billing_coupon"("billingCouponId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_history" ADD CONSTRAINT "FK_d3f6af8c6caf12c9824a2c723e2" FOREIGN KEY ("billingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_history" ADD CONSTRAINT "FK_08c2172b01a27d5d2c0013d6648" FOREIGN KEY ("billingHistoryId") REFERENCES "billing_history"("billingHistoryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_info" ADD CONSTRAINT "FK_8dcc1cb42334389fe6bea3ee4ba" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_info" ADD CONSTRAINT "FK_3569f05e2b006d81282ef69571f" FOREIGN KEY ("billingCouponId") REFERENCES "billing_coupon"("billingCouponId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan_info" ADD CONSTRAINT "FK_e93d1b91b4959f087a3fd2cbda7" FOREIGN KEY ("billingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history" ADD CONSTRAINT "FK_0856c5550b05dcba47730278a09" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "self_hosted_license" ADD CONSTRAINT "FK_127749a3c7fb36e7e92137b5c8b" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_license" ADD CONSTRAINT "FK_8b02c9b7033c44007d3b146f73f" FOREIGN KEY ("billingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "FK_8b02c9b7033c44007d3b146f73f"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP CONSTRAINT "FK_127749a3c7fb36e7e92137b5c8b"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP CONSTRAINT "FK_0856c5550b05dcba47730278a09"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP CONSTRAINT "FK_e93d1b91b4959f087a3fd2cbda7"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP CONSTRAINT "FK_3569f05e2b006d81282ef69571f"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_info" DROP CONSTRAINT "FK_8dcc1cb42334389fe6bea3ee4ba"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP CONSTRAINT "FK_08c2172b01a27d5d2c0013d6648"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP CONSTRAINT "FK_d3f6af8c6caf12c9824a2c723e2"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP CONSTRAINT "FK_140ec1aaadac4b621564b996a72"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_history" DROP CONSTRAINT "FK_6af4a5252a8b1489be32d00e729"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan_source" DROP CONSTRAINT "FK_66867dcca26b0a7aa5b4de0e75f"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_135501b1693ec3ab2bd1b110f45"`);
    await queryRunner.query(`DROP TABLE "cloud_license"`);
    await queryRunner.query(`DROP TYPE "public"."cloud_license_category_enum"`);
    await queryRunner.query(`DROP TABLE "self_hosted_license"`);
    await queryRunner.query(`DROP TYPE "public"."self_hosted_license_category_enum"`);
    await queryRunner.query(`DROP TABLE "date_time_simulator"`);
    await queryRunner.query(`DROP TABLE "billing_token"`);
    await queryRunner.query(`DROP TABLE "billing_organization_used_billing_coupon"`);
    await queryRunner.query(`DROP TABLE "billing_history"`);
    await queryRunner.query(`DROP TYPE "public"."billing_history_historytype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_history_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_history_currency_enum"`);
    await queryRunner.query(`DROP TABLE "billing_organization"`);
    await queryRunner.query(`DROP TYPE "public"."billing_organization_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_organization_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan_info"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_info_state_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_info_changerequestedperiod_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_info_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_info_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_info_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_info_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan_history"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_history_historytype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_history_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_history_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_history_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_history_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_history_previousperiod_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan_source"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_coupon"`);
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_subscriptionplantype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_type_enum"`);
    await queryRunner.query(`DROP TABLE "billing_method_nice"`);
  }
}
