import { CREATOR_TYPE } from '@dogu-private/types';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { RoutinePipeline } from '../../entity/pipeline.entity';

export class typeormMigration1689733596855 implements MigrationInterface {
  name = 'typeormMigration1689733596855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_pipeline" ADD "creator_type" smallint NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "routine_pipeline" ALTER COLUMN "creator_id" DROP NOT NULL`);

    const pipelines = await queryRunner.manager.getRepository(RoutinePipeline).find();
    const pipelineIds = pipelines.map((pipeline) => pipeline.routinePipelineId);

    await queryRunner.manager.getRepository(RoutinePipeline).update(pipelineIds, { creatorType: CREATOR_TYPE.USER });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routine_pipeline" ALTER COLUMN "creator_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "routine_pipeline" DROP COLUMN "creator_type"`);
  }
}
