import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, Unique } from 'typeorm';
import { Surah } from './surah.entity';

@Entity('verses')
@Index(['surahId', 'verseNumber'])
@Unique(['surahId', 'verseNumber'])
export class Verse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })  
  surahId: number;

  @Column({ type: 'int' }) 
  verseNumber: number;

  @Column({ type: 'text', nullable: true })
  textArabic: string;

  @Column({ type: 'text', nullable: true })
  textUrdu: string;

  @Column({ type: 'varchar', nullable: true })
  transliteration: string;

  @Column({ type: 'text', nullable: true })
  tafseerUrdu: string;

  @Column({ type: 'int', nullable: true }) 
  pageNumber: number;

  @Column({ type: 'int', nullable: true })  
  juzNumber: number;

  @Column({ type: 'enum', enum: ['recommended', 'obligatory'], nullable: true })
  sajdahType: string;

  @Column({ type: 'varchar', nullable: true })
  audioUrl: string;

  @ManyToOne(() => Surah, surah => surah.verses)
  @JoinColumn({ name: 'surahId' })
  surah: Surah;

  @CreateDateColumn()
  createdAt: Date;
}