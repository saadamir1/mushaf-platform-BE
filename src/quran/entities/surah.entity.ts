import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Unique } from 'typeorm';
import { Verse } from './verse.entity';

@Entity('surahs')
@Unique(['surahNumber'])
export class Surah {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })  
  surahNumber: number;

  @Column({ type: 'varchar' })  
  nameArabic: string;

  @Column({ type: 'varchar' })  
  nameEnglish: string;

  @Column({ type: 'varchar' })  
  nameUrdu: string;

  @Column({ type: 'int' })  
  versesCount: number;

  @Column({ type: 'enum', enum: ['Meccan', 'Medinan'] })
  revelationType: string;

  @Column({ type: 'text', nullable: true })
  descriptionUrdu: string;

  @OneToMany(() => Verse, verse => verse.surah)
  verses: Verse[];

  @CreateDateColumn()
  createdAt: Date;
}