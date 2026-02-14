import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Verse } from './verse.entity';

@Entity('surahs')
export class Surah {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  surahNumber: number;

  @Column()
  nameArabic: string;

  @Column()
  nameEnglish: string;

  @Column()
  nameUrdu: string;

  @Column()
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