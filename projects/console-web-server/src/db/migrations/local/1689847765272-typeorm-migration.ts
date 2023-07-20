import { MigrationInterface, QueryRunner } from 'typeorm';

export class typeormMigration1689847765272 implements MigrationInterface {
  name = 'typeormMigration1689847765272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_access_token" DROP CONSTRAINT "FK_268b1981dbd6a450107f998a1b6"`);

    await queryRunner.query(
      `CREATE TABLE "personal_access_token" ("personal_access_token_id" uuid NOT NULL, "user_id" uuid NOT NULL, "token_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_9deccbd90f07ff9e1ba1bd30669" PRIMARY KEY ("personal_access_token_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_key" ("project_key_id" uuid NOT NULL, "project_id" uuid NOT NULL, "key" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "REL_81cdb3a41d55b5ed081446fda0" UNIQUE ("project_id"), CONSTRAINT "PK_077c69d9dd3505d6caebe957ce3" PRIMARY KEY ("project_key_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_access_token" ("project_access_token_id" uuid NOT NULL, "project_id" uuid NOT NULL, "token_id" uuid NOT NULL, "creator_id" uuid, "revoker_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_f24df088a8b0448c658aa91b10e" PRIMARY KEY ("project_access_token_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_key" ("user_key_id" uuid NOT NULL, "user_id" uuid NOT NULL, "key" character varying NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "REL_a389817475d2824dd5ddca97ac" UNIQUE ("user_id"), CONSTRAINT "PK_562b4dc1d1084179e6df20a4917" PRIMARY KEY ("user_key_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "organization_key" ADD CONSTRAINT "UQ_c9de8624a82c28bb9d75d77ff2e" UNIQUE ("organization_id")`);
    await queryRunner.query(
      `ALTER TABLE "organization_key" ADD CONSTRAINT "FK_c9de8624a82c28bb9d75d77ff2e" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_access_token" ADD CONSTRAINT "FK_cd48ad0f8d6360fa953463998eb" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_access_token" ADD CONSTRAINT "FK_59dbb555e26c4422962636a8015" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_key" ADD CONSTRAINT "FK_81cdb3a41d55b5ed081446fda05" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_access_token" ADD CONSTRAINT "FK_b207553e78705d8de2b68dee58d" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_key" ADD CONSTRAINT "FK_a389817475d2824dd5ddca97ac4" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `WITH RECURSIVE random_string(project_id, string, level) AS (
        SELECT o.project_id, '', 0 FROM project AS o
        UNION ALL
        SELECT
            rs.project_id,
            rs.string || 
                SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' 
                FROM (floor(random() * 62 + 1)::integer) FOR 1),
            rs.level + 1
        FROM random_string AS rs
        WHERE rs.level < 32
    ),
    insert_candidates AS (
        SELECT r.project_id, r.string
        FROM random_string AS r
        WHERE r.level = 32
        AND NOT EXISTS (
            SELECT 1 FROM project_key ok
            WHERE ok.project_id = r.project_id
        )
    )
    INSERT INTO project_key(project_key_id, project_id, key, created_at, updated_at)
    SELECT uuid_generate_v4(), ic.project_id, ic.string, NOW(), NOW()
    FROM insert_candidates AS ic;`,
    );

    await queryRunner.query(
      `WITH RECURSIVE random_string(user_id, string, level) AS (
        SELECT o.user_id, '', 0 FROM "public"."user" AS o
        UNION ALL
        SELECT
            rs.user_id,
            rs.string || 
                SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' 
                FROM (floor(random() * 62 + 1)::integer) FOR 1),
            rs.level + 1
        FROM random_string AS rs
        WHERE rs.level < 32
    ),
    insert_candidates AS (
        SELECT r.user_id, r.string
        FROM random_string AS r
        WHERE r.level = 32
        AND NOT EXISTS (
            SELECT 1 FROM user_key ok
            WHERE ok.user_id = r.user_id
        )
    )
    INSERT INTO user_key(user_key_id, user_id, key, created_at, updated_at)
    SELECT uuid_generate_v4(), ic.user_id, ic.string, NOW(), NOW()
    FROM insert_candidates AS ic;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_key" DROP CONSTRAINT "FK_a389817475d2824dd5ddca97ac4"`);
    await queryRunner.query(`ALTER TABLE "project_access_token" DROP CONSTRAINT "FK_b207553e78705d8de2b68dee58d"`);
    await queryRunner.query(`ALTER TABLE "project_key" DROP CONSTRAINT "FK_81cdb3a41d55b5ed081446fda05"`);
    await queryRunner.query(`ALTER TABLE "personal_access_token" DROP CONSTRAINT "FK_59dbb555e26c4422962636a8015"`);
    await queryRunner.query(`ALTER TABLE "organization_access_token" DROP CONSTRAINT "FK_cd48ad0f8d6360fa953463998eb"`);
    await queryRunner.query(`ALTER TABLE "organization_key" DROP CONSTRAINT "FK_c9de8624a82c28bb9d75d77ff2e"`);
    await queryRunner.query(`ALTER TABLE "organization_key" DROP CONSTRAINT "UQ_c9de8624a82c28bb9d75d77ff2e"`);
    await queryRunner.query(`DROP TABLE "user_key"`);
    await queryRunner.query(`DROP TABLE "project_access_token"`);
    await queryRunner.query(`DROP TABLE "project_key"`);
    await queryRunner.query(`DROP TABLE "personal_access_token"`);
    await queryRunner.query(
      `ALTER TABLE "organization_access_token" ADD CONSTRAINT "FK_268b1981dbd6a450107f998a1b6" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
