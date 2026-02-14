import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('juz')
export class Juz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  juzNumber: number;

  @Column()
  startVerseId: number;

  @Column()
  endVerseId: number;

  @Column()
  startSurahNumber: number;

  @Column()
  endSurahNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}