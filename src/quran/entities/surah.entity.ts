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

  @Column({ type: 'varchar', nullable: true })  
  nameTransliteration: string;

  @Column({ type: 'varchar' })  
  nameUrdu: string;

  @Column({ type: 'int' })  
  versesCount: number;

  @Column({ type: 'enum', enum: ['Meccan', 'Medinan'] })
  revelationType: string;

  @Column({ type: 'int', nullable: true })
  orderOfRevelation: number;

  @Column({ type: 'text', nullable: true })
  descriptionUrdu: string;

  @Column({ type: 'int', nullable: true })
  startPageNumber: number;  // which PDF page this Surah starts on

  @OneToMany(() => Verse, verse => verse.surah)
  verses: Verse[];

  @CreateDateColumn()
  createdAt: Date;
}
