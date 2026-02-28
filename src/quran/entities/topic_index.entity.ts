import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('topic_index')
export class TopicIndex {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  topicNameUrdu: string;       // e.g. "توحید کا باب"

  @Column({ type: 'varchar', nullable: true })
  topicNameEnglish: string;    // optional, for admin use

  @Column({ type: 'int' })
  pageNumber: number;          // jump to this page in the viewer

  @Column({ type: 'varchar', nullable: true })
  category: string;            // e.g. "Aqeedah", "Fiqh", "Tafseer", "Ibadah"

  @Column({ type: 'int', nullable: true })
  surahNumber: number;         // which surah this topic relates to

  @Column({ type: 'int', nullable: true })
  juzNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}