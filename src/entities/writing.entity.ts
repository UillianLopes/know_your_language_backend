import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Word } from './word.entity';

@Entity()
export class Writing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @ManyToOne(() => Word, (word) => word.writings)
  word: Word;
}
