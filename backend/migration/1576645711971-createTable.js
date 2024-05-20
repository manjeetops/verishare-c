export class createTable1576645711971 {
    async up(queryRunner){
        await queryRunner.query(`CREATE TYPE "accounts_role_enum" AS ENUM('SERVICE', 'USER', 'ADMIN')`, undefined);
        await queryRunner.query(`CREATE TABLE "accounts" ("keycloakId" character varying NOT NULL, "blockchainId" uuid NOT NULL, "email" character varying NOT NULL, "orgId" uuid NOT NULL, "role" "accounts_role_enum" DEFAULT 'USER', CONSTRAINT "UQ_669efeaa3879617cf36037a0f51" UNIQUE ("blockchainId"), CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE ("email"), CONSTRAINT "PK_3579d8e66833199d8b9c659d5eb" PRIMARY KEY ("keycloakId"))`, undefined);
        await queryRunner.query(`CREATE TYPE "invitations_status_enum" AS ENUM('active', 'inactive', 'deleted')`, undefined);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "invitationCode" character varying NOT NULL, "validTill" date NOT NULL, "inviterAccountId" character varying NOT NULL, "orgId" character varying NOT NULL, "role" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "invitations_status_enum" DEFAULT 'active', "firstName" character varying, "lastName" character varying, "joined" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`, undefined);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "invitations"`, undefined);
        await queryRunner.query(`DROP TYPE "invitations_status_enum"`, undefined);
        await queryRunner.query(`DROP TABLE "accounts"`, undefined);
        await queryRunner.query(`DROP TYPE "accounts_role_enum"`, undefined);
    }

}
