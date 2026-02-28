import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TopicIndex } from './topic_index.entity';

@Entity('hotspots')
export class Hotspot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  pageNumber: number;

  @Column({ type: 'float' })
  x: number;         // left position as % of image width

  @Column({ type: 'float' })
  y: number;         // top position as % of image height

  @Column({ type: 'float' })
  width: number;     // width as % of image width

  @Column({ type: 'float' })
  height: number;    // height as % of image height

  @Column({ type: 'varchar', nullable: true })
  label: string;     // display label on hover

  @Column({ type: 'int', nullable: true })
  topicIndexId: number;  // links to TopicIndex

  @Column({ type: 'varchar', nullable: true })
  linkType: string;  // 'topic', 'page', 'external'

  @ManyToOne(() => TopicIndex, { nullable: true })
  @JoinColumn({ name: 'topicIndexId' })
  topic: TopicIndex;

  @CreateDateColumn()
  createdAt: Date;
}