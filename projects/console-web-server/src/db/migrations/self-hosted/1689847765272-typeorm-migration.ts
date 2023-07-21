import { DeepPartial, MigrationInterface, QueryRunner } from 'typeorm';
import { v4 } from 'uuid';
import { TokenService } from '../../../module/token/token.service';
import { Project } from '../../entity/project.entity';
import { Token } from '../../entity/token.entity';
import { User } from '../../entity/user.entity';

export class typeormMigration1689847765272 implements MigrationInterface {
  name = 'typeormMigration1689847765272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_access_token" DROP CONSTRAINT "FK_268b1981dbd6a450107f998a1b6"`);

    await queryRunner.query(
      `CREATE TABLE "personal_access_token" ("personal_access_token_id" uuid NOT NULL, "user_id" uuid NOT NULL, "token_id" uuid NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_9deccbd90f07ff9e1ba1bd30669" PRIMARY KEY ("personal_access_token_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_access_token" ("project_access_token_id" uuid NOT NULL, "project_id" uuid NOT NULL, "token_id" uuid NOT NULL, "creator_id" uuid, "revoker_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_f24df088a8b0448c658aa91b10e" PRIMARY KEY ("project_access_token_id"))`,
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
      `ALTER TABLE "project_access_token" ADD CONSTRAINT "FK_b207553e78705d8de2b68dee58d" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const projects = await queryRunner.manager.getRepository(Project).find();
    console.log(projects);

    for (const project of projects) {
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createProjectAccessToken(),
        expiredAt: null,
      };
      const tokenData = queryRunner.manager.getRepository(Token).create(newTokenData);
      const token = await queryRunner.manager.getRepository(Token).save(tokenData);

      const data = {
        project_access_token_id: v4(),
        project_id: project.projectId,
        token_id: token.tokenId,
        creator_id: null,
        revoker_id: null,
      };

      await queryRunner.query(
        `INSERT INTO project_access_token (project_access_token_id, project_id, token_id, creator_id, revoker_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.project_access_token_id, data.project_id, data.token_id, data.creator_id, data.revoker_id],
      );
    }

    const users = await queryRunner.manager.getRepository(User).find();
    console.log(users);

    for (const user of users) {
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createPersonalAccessToken(),
        expiredAt: null,
      };
      const tokenData = queryRunner.manager.getRepository(Token).create(newTokenData);
      const token = await queryRunner.manager.getRepository(Token).save(tokenData);

      const data = {
        personal_access_token_id: v4(),
        user_id: user.userId,
        token_id: token.tokenId,
      };

      await queryRunner.query(
        `INSERT INTO personal_access_token (personal_access_token_id, user_id, token_id )
         VALUES ($1, $2, $3)`,
        [data.personal_access_token_id, data.user_id, data.token_id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project_access_token" DROP CONSTRAINT "FK_b207553e78705d8de2b68dee58d"`);
    await queryRunner.query(`ALTER TABLE "personal_access_token" DROP CONSTRAINT "FK_59dbb555e26c4422962636a8015"`);
    await queryRunner.query(`ALTER TABLE "organization_access_token" DROP CONSTRAINT "FK_cd48ad0f8d6360fa953463998eb"`);
    await queryRunner.query(`ALTER TABLE "organization_key" DROP CONSTRAINT "FK_c9de8624a82c28bb9d75d77ff2e"`);
    await queryRunner.query(`ALTER TABLE "organization_key" DROP CONSTRAINT "UQ_c9de8624a82c28bb9d75d77ff2e"`);
    await queryRunner.query(`DROP TABLE "project_access_token"`);
    await queryRunner.query(`DROP TABLE "personal_access_token"`);
    await queryRunner.query(
      `ALTER TABLE "organization_access_token" ADD CONSTRAINT "FK_268b1981dbd6a450107f998a1b6" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
