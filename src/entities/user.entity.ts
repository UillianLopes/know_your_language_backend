import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Score } from './score.entity';
import { UserWord } from './user_word.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @OneToMany(() => UserWord, (word) => word.user)
  words: UserWord[];

  @Column()
  provider: string;

  @Column({ nullable: true })
  picture: string | null;

  @OneToMany(() => Score, (score) => score.user)
  scores: Score[];
}
