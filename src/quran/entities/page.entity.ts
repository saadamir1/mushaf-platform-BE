import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quran_pages')
export class QuranPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  pageNumber: number;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  startVerseId: number;

  @Column({ nullable: true })
  endVerseId: number;

  @Column({ nullable: true })
  startSurahNumber: number;

  @Column({ nullable: true })
  endSurahNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}