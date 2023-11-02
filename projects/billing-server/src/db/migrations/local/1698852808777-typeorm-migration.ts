import { MigrationInterface, QueryRunner } from 'typeorm';

export class TypeormMigration1698852808777 implements MigrationInterface {
  name = 'TypeormMigration1698852808777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billing_method_nice" ("billingMethodNiceId" uuid NOT NULL, "billingOrganizationId" uuid NOT NULL, "bid" character varying, "cardCode" character varying, "cardName" character varying, "cardNoLast4" character varying, "subscribeRegistResponse" jsonb, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "billingOrganizationBillingOrganizationId" uuid, CONSTRAINT "UQ_135501b1693ec3ab2bd1b110f45" UNIQUE ("billingOrganizationId"), CONSTRAINT "REL_1a5152d07299b8eb1ee4469f9f" UNIQUE ("billingOrganizationBillingOrganizationId"), CONSTRAINT "PK_db7e958e096f15ba131d001a41c" PRIMARY KEY ("billingMethodNiceId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_coupon_type_enum" AS ENUM('basic', 'promotion')`);
    await queryRunner.query(
      `CREATE TABLE "billing_coupon" ("billingCouponId" uuid NOT NULL, "code" character varying NOT NULL, "type" "public"."billing_coupon_type_enum" NOT NULL DEFAULT 'basic', "monthlyDiscountPercent" integer, "monthlyApplyCount" integer, "yearlyDiscountPercent" integer, "yearlyApplyCount" integer, "remainingAvailableCount" integer, "expiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_00fad1b7bdccd28013dafc534dd" UNIQUE ("code"), CONSTRAINT "PK_13aa77b2165776ebc8fa6455625" PRIMARY KEY ("billingCouponId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_source_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan_source" ("billingSubscriptionPlanSourceId" uuid NOT NULL, "category" "public"."billing_subscription_plan_source_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_source_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_source_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_source_period_enum" NOT NULL, "price" integer NOT NULL, "billingOrganizationId" uuid NOT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_a702dc53dd82855daf54e7b2cc6" PRIMARY KEY ("billingSubscriptionPlanSourceId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_type_enum" AS ENUM('live-testing')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_currency_enum" AS ENUM('KRW', 'USD')`);
    await queryRunner.query(`CREATE TYPE "public"."billing_subscription_plan_period_enum" AS ENUM('monthly', 'yearly')`);
    await queryRunner.query(
      `CREATE TABLE "billing_subscription_plan" ("billingSubscriptionPlanId" uuid NOT NULL, "category" "public"."billing_subscription_plan_category_enum" NOT NULL, "type" "public"."billing_subscription_plan_type_enum" NOT NULL, "option" integer NOT NULL, "currency" "public"."billing_subscription_plan_currency_enum" NOT NULL, "period" "public"."billing_subscription_plan_period_enum" NOT NULL, "price" integer NOT NULL, "billingOrganizationId" uuid NOT NULL, "billingSubscriptionPlanSourceId" uuid, "billingCouponId" uuid, "billingCouponRemainingApplyCount" integer, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "billingOrganizationBillingOrganizationId" uuid, "billingCouponBillingCouponId" uuid, "billingSubscriptionPlanSourceBillingSubscriptionPlanSourceId" uuid, CONSTRAINT "PK_092f3643830ffb26435e5a2663b" PRIMARY KEY ("billingSubscriptionPlanId"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."billing_organization_category_enum" AS ENUM('cloud', 'self-hosted')`);
    await queryRunner.query(
      `CREATE TABLE "billing_organization" ("billingOrganizationId" uuid NOT NULL, "organizationId" uuid NOT NULL, "category" "public"."billing_organization_category_enum" NOT NULL, "firstPurchasedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "UQ_473ad0f5bec36db5224cad15ee2" UNIQUE ("organizationId"), CONSTRAINT "PK_12beccbb6b28a149308b6da79dc" PRIMARY KEY ("billingOrganizationId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_history" ("billingHistoryId" uuid NOT NULL, "purchasedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "billingOrganizationId" uuid NOT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, "billingOrganizationBillingOrganizationId" uuid, CONSTRAINT "PK_825f74d6eebe60120ade722d11c" PRIMARY KEY ("billingHistoryId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_organization_used_billing_coupon" ("billingOrganizationId" uuid NOT NULL, "billingCouponId" uuid NOT NULL, "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_84fd839753ecefee0cc78bc2bf0" PRIMARY KEY ("billingOrganizationId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "billing_history_and_billing_subscription_plan" ("billingHistoryId" uuid NOT NULL, "billingSubscriptionPlanId" uuid NOT NULL, CONSTRAINT "PK_b91905b60609b2f90a0b44dfaad" PRIMARY KEY ("billingHistoryId", "billingSubscriptionPlanId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_28ea0cf2f323877489f12e3e4c" ON "billing_history_and_billing_subscription_plan" ("billingHistoryId") `);
    await queryRunner.query(`CREATE INDEX "IDX_e0f80b35bb7072dffea1b20cfc" ON "billing_history_and_billing_subscription_plan" ("billingSubscriptionPlanId") `);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "PK_c022d02dce0a33cd65e7b52ed54"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "cloud_license_id"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "UQ_9087bbbdf76af0a0eff9736722a"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "organization_id"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "live_testing_remaining_free_seconds"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "live_testing_parallel_count"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_cd0c7c2b1bdf73a3f6056794533"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_6de2bb73f339d5b3a7bb85009e1" PRIMARY KEY ("token")`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "billing_token_id"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "expired_at"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP CONSTRAINT "PK_3965612a84d3b5ca6bb6e1ce816"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "self_hosted_license_id"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "license_key"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "company_name"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "organization_id"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "maximum_enabled_mobile_count"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "maximum_enabled_browser_count"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "open_api_enabled"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "dogu_agent_auto_update_enabled"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "last_access_at"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "expired_at"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "cloudLicenseId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD CONSTRAINT "PK_baaec3cc96c7e65d4cf614e4340" PRIMARY KEY ("cloudLicenseId")`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "organizationId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD CONSTRAINT "UQ_e3e2df21a1e3632a9d94016ae06" UNIQUE ("organizationId")`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "liveTestingRemainingFreeSeconds" integer NOT NULL DEFAULT '10800'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "liveTestingParallelCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "billingOrganizationOrganizationId" uuid`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "billingTokenId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_6de2bb73f339d5b3a7bb85009e1"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_747105235f950def754f5110274" PRIMARY KEY ("token", "billingTokenId")`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "expiredAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "selfHostedLicenseId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD CONSTRAINT "PK_ebab76510769d7f2aa8ab2cc4bf" PRIMARY KEY ("selfHostedLicenseId")`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "licenseKey" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "companyName" character varying`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "organizationId" character varying`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD CONSTRAINT "UQ_8662e9a2aa881e1d71991f158e4" UNIQUE ("organizationId")`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "maximumEnabledMobileCount" integer NOT NULL DEFAULT '2'`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "maximumEnabledBrowserCount" integer NOT NULL DEFAULT '2'`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "openApiEnabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "doguAgentAutoUpdateEnabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "lastAccessAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "expiredAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "deletedAt" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "billingOrganizationOrganizationId" uuid`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_747105235f950def754f5110274"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_c4353d820e656e0e99a541167af" PRIMARY KEY ("billingTokenId")`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1" UNIQUE ("token")`);
    await queryRunner.query(
      `ALTER TABLE "billing_method_nice" ADD CONSTRAINT "FK_1a5152d07299b8eb1ee4469f9f2" FOREIGN KEY ("billingOrganizationBillingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_831306dd399c80cfd376de5cfdd" FOREIGN KEY ("billingOrganizationBillingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_b5e575c4d803395896bce6bffe7" FOREIGN KEY ("billingCouponBillingCouponId") REFERENCES "billing_coupon"("billingCouponId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_subscription_plan" ADD CONSTRAINT "FK_262235e17d85affe70b2ea96584" FOREIGN KEY ("billingSubscriptionPlanSourceBillingSubscriptionPlanSourceId") REFERENCES "billing_subscription_plan_source"("billingSubscriptionPlanSourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history" ADD CONSTRAINT "FK_2ba9e6ba9f1e52065264ecd8896" FOREIGN KEY ("billingOrganizationBillingOrganizationId") REFERENCES "billing_organization"("billingOrganizationId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_28ea0cf2f323877489f12e3e4cb" FOREIGN KEY ("billingHistoryId") REFERENCES "billing_history"("billingHistoryId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_history_and_billing_subscription_plan" ADD CONSTRAINT "FK_e0f80b35bb7072dffea1b20cfc2" FOREIGN KEY ("billingSubscriptionPlanId") REFERENCES "billing_subscription_plan"("billingSubscriptionPlanId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_e0f80b35bb7072dffea1b20cfc2"`);
    await queryRunner.query(`ALTER TABLE "billing_history_and_billing_subscription_plan" DROP CONSTRAINT "FK_28ea0cf2f323877489f12e3e4cb"`);
    await queryRunner.query(`ALTER TABLE "billing_history" DROP CONSTRAINT "FK_2ba9e6ba9f1e52065264ecd8896"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_262235e17d85affe70b2ea96584"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_b5e575c4d803395896bce6bffe7"`);
    await queryRunner.query(`ALTER TABLE "billing_subscription_plan" DROP CONSTRAINT "FK_831306dd399c80cfd376de5cfdd"`);
    await queryRunner.query(`ALTER TABLE "billing_method_nice" DROP CONSTRAINT "FK_1a5152d07299b8eb1ee4469f9f2"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "UQ_6de2bb73f339d5b3a7bb85009e1"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_c4353d820e656e0e99a541167af"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_747105235f950def754f5110274" PRIMARY KEY ("token", "billingTokenId")`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "billingOrganizationOrganizationId"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "expiredAt"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "lastAccessAt"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "doguAgentAutoUpdateEnabled"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "openApiEnabled"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "maximumEnabledBrowserCount"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "maximumEnabledMobileCount"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP CONSTRAINT "UQ_8662e9a2aa881e1d71991f158e4"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "organizationId"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "companyName"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "licenseKey"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP CONSTRAINT "PK_ebab76510769d7f2aa8ab2cc4bf"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" DROP COLUMN "selfHostedLicenseId"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "expiredAt"`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_747105235f950def754f5110274"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_6de2bb73f339d5b3a7bb85009e1" PRIMARY KEY ("token")`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP COLUMN "billingTokenId"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "billingOrganizationOrganizationId"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "liveTestingParallelCount"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "liveTestingRemainingFreeSeconds"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "UQ_e3e2df21a1e3632a9d94016ae06"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "organizationId"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP CONSTRAINT "PK_baaec3cc96c7e65d4cf614e4340"`);
    await queryRunner.query(`ALTER TABLE "cloud_license" DROP COLUMN "cloudLicenseId"`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "expired_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "last_access_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "dogu_agent_auto_update_enabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "open_api_enabled" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "maximum_enabled_browser_count" integer NOT NULL DEFAULT '2'`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "maximum_enabled_mobile_count" integer NOT NULL DEFAULT '2'`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "organization_id" character varying`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "company_name" character varying`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "license_key" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD "self_hosted_license_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "self_hosted_license" ADD CONSTRAINT "PK_3965612a84d3b5ca6bb6e1ce816" PRIMARY KEY ("self_hosted_license_id")`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "expired_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD "billing_token_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "billing_token" DROP CONSTRAINT "PK_6de2bb73f339d5b3a7bb85009e1"`);
    await queryRunner.query(`ALTER TABLE "billing_token" ADD CONSTRAINT "PK_cd0c7c2b1bdf73a3f6056794533" PRIMARY KEY ("billing_token_id", "token")`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "live_testing_parallel_count" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "live_testing_remaining_free_seconds" integer NOT NULL DEFAULT '300000000'`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "organization_id" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD CONSTRAINT "UQ_9087bbbdf76af0a0eff9736722a" UNIQUE ("organization_id")`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD "cloud_license_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cloud_license" ADD CONSTRAINT "PK_c022d02dce0a33cd65e7b52ed54" PRIMARY KEY ("cloud_license_id")`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e0f80b35bb7072dffea1b20cfc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_28ea0cf2f323877489f12e3e4c"`);
    await queryRunner.query(`DROP TABLE "billing_history_and_billing_subscription_plan"`);
    await queryRunner.query(`DROP TABLE "billing_organization_used_billing_coupon"`);
    await queryRunner.query(`DROP TABLE "billing_history"`);
    await queryRunner.query(`DROP TABLE "billing_organization"`);
    await queryRunner.query(`DROP TYPE "public"."billing_organization_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_subscription_plan_source"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_period_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billing_subscription_plan_source_category_enum"`);
    await queryRunner.query(`DROP TABLE "billing_coupon"`);
    await queryRunner.query(`DROP TYPE "public"."billing_coupon_type_enum"`);
    await queryRunner.query(`DROP TABLE "billing_method_nice"`);
  }
}
