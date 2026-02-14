import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('juz')
export class Juz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })  
  juzNumber: number;

  @Column({ type: 'int' })  
  startVerseId: number;

  @Column({ type: 'int' })  
  endVerseId: number;

  @Column({ type: 'int' })  
  startSurahNumber: number;

  @Column({ type: 'int' })  
  endSurahNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}