import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Surah } from './surah.entity';

@Entity('verses')
@Index(['surahId', 'verseNumber'])
export class Verse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  surahId: number;

  @Column()
  verseNumber: number;

  @Column({ type: 'text' })
  textArabic: string;

  @Column({ type: 'text' })
  textUrdu: string;

  @Column({ type: 'text', nullable: true })
  tafseerUrdu: string;

  @Column({ nullable: true })
  pageNumber: number;

  @Column({ nullable: true })
  juzNumber: number;

  @ManyToOne(() => Surah, surah => surah.verses)
  @JoinColumn({ name: 'surahId' })
  surah: Surah;

  @CreateDateColumn()
  createdAt: Date;
}