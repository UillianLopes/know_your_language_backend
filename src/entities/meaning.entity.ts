import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Word } from './word.entity';

@Entity()
export class Meaning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @ManyToOne(() => Word, (word) => word.meanings)
  word: Word;

  @Column({ default: true })
  isFake: boolean;
}
