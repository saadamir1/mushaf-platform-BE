import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('juz')
export class Juz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })  
  juzNumber: number;

  @Column({ type: 'varchar' })
  startVerse: string;  // Format: "surahNumber:verseNumber" e.g. "1:1"

  @Column({ type: 'varchar' })
  endVerse: string;    // Format: "surahNumber:verseNumber" e.g. "2:141"

  @Column({ type: 'int', nullable: true })
  startPageNumber: number;  // which PDF page this Juz starts on

  @CreateDateColumn()
  createdAt: Date;
}
