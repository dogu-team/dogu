import { DeepPartial, MigrationInterface, QueryRunner } from 'typeorm';
import { v4 } from 'uuid';
import { TokenService } from '../../../module/token/token.service';
import { Organization } from '../../entity/organization.entity';
import { Token } from '../../entity/token.entity';

export class typeormMigration1688635031376 implements MigrationInterface {
  name = 'typeormMigration1688635031376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_api_token" ("organization_api_token_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "token_id" uuid NOT NULL, "creator_id" uuid, "revoker_id" uuid, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_4766398a210694c90bb184c8afe" PRIMARY KEY ("organization_api_token_id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "organization_api_token" ADD CONSTRAINT "FK_268b1981dbd6a450107f998a1b6" FOREIGN KEY ("token_id") REFERENCES "token"("token_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const orgs = await queryRunner.manager.getRepository(Organization).find();
    console.log(orgs);

    for (const org of orgs) {
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createOrganizationApiToken(),
        expiredAt: null,
      };
      const tokenData = queryRunner.manager.getRepository(Token).create(newTokenData);
      const token = await queryRunner.manager.getRepository(Token).save(tokenData);

      const newOrgApiData = {
        organization_api_token_id: v4(),
        organization_id: org.organizationId,
        token_id: token.tokenId,
        creator_id: null,
        revoker_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      await queryRunner.query(
        `INSERT INTO organization_api_token (organization_api_token_id, organization_id, token_id, creator_id, revoker_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [newOrgApiData.organization_api_token_id, newOrgApiData.organization_id, newOrgApiData.token_id, newOrgApiData.creator_id, newOrgApiData.revoker_id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_api_token"`);
  }
}
