import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quran_pages')
export class QuranPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  pageNumber: number;

  @Column({ type: 'string' })
  imageUrl: string;

  @Column({ type: 'int', nullable: true })
  startVerseId: number;

  @Column({ type: 'int', nullable: true })
  endVerseId: number;

  @Column({ type: 'int', nullable: true })
  startSurahNumber: number;

  @Column({ type: 'int', nullable: true })
  endSurahNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}