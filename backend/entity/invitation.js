import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { STATUS_ENUM } from '../app/helpers/constants';

@Entity({ name: 'invitations' })
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id = undefined;

  @Column('varchar')
  email = '';

  @Column('varchar')
  invitationCode = '';

  @Column('date')
  validTill = undefined;

  @Column('varchar')
  inviterAccountId = '';

  @Column('varchar')
  orgId = '';

  @Column('varchar')
  role = '';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt = '';

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt = '';

  @Column('enum', {
    nullable: true,
    enum: STATUS_ENUM,
    default: STATUS_ENUM.ACTIVE
  })
  status = '';

  @Column('varchar', { nullable: true })
  firstName = '';

  @Column('varchar', { nullable: true })
  lastName = '';

  @Column('boolean', { default: false })
  joined = '';
}
