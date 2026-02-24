import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Verse } from '../../quran/entities/verse.entity';

@Entity('bookmarks')
@Unique(['userId', 'verseId'])
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  verseId: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Verse, { eager: true })
  @JoinColumn({ name: 'verseId' })
  verse: Verse;

  @CreateDateColumn()
  createdAt: Date;
}
