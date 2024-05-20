import { Entity, Column, PrimaryColumn } from 'typeorm';
import { USER_TYPE_ENUM } from '../app/helpers/constants'

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryColumn("varchar")
  keycloakId = "";

  @Column('uuid', { unique: true })
  blockchainId =  undefined;

  @Column("varchar", { unique: true })
  email = "";

  @Column("uuid")
  orgId = undefined;

  @Column("enum", { nullable: true, enum: USER_TYPE_ENUM, default: USER_TYPE_ENUM.USER_ACCOUNT })
  role = "";

}
