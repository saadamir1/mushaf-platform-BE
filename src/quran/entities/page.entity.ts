import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quran_pages')
export class QuranPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  pageNumber: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar' })
  startVerse: string;  // Format: "surahNumber:verseNumber" e.g. "1:1"

  @Column({ type: 'varchar' })
  endVerse: string;    // Format: "surahNumber:verseNumber" e.g. "1:7"

  @Column({ type: 'int', nullable: true })
  juzNumber: number;

  @Column({ type: 'int', nullable: true })
  surahNumberStart: number;  // if a new Surah starts on this page

  @CreateDateColumn()
  createdAt: Date;
}
