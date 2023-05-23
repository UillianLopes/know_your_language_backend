import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from './word.entity';
import { Score } from './score.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @ManyToMany(() => Word, (word) => word.users)
  @JoinTable({
    name: 'user_words',
  })
  words: Word[];

  @Column()
  provider: string;

  @Column({ nullable: true })
  picture: string | null;

  @ManyToOne(() => Score, (score) => score.user)
  scores: Score[];
}
