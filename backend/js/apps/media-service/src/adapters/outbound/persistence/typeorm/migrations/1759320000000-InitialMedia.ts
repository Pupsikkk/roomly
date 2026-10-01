import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMedia1759320000000 implements MigrationInterface {
  name = 'InitialMedia1759320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "media_objects" (
        "id" uuid NOT NULL,
        "storage_key" character varying(512) NOT NULL,
        "content_type" character varying(128) NOT NULL,
        "size" bigint NOT NULL,
        "original_name" character varying(255),
        "status" character varying(32) NOT NULL DEFAULT 'ready',
        "owner_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_media_objects_storage_key" UNIQUE ("storage_key"),
        CONSTRAINT "PK_media_objects" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_media_objects_owner_id" ON "media_objects" ("owner_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_media_objects_owner_id"`);
    await queryRunner.query(`DROP TABLE "media_objects"`);
  }
}
