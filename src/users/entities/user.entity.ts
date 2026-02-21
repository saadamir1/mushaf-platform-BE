import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'email',
    nullable: false,
    default: '',
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  lastName: string;

  @Column({ type: 'varchar', default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationTokenExpires: Date;
}
