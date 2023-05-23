import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Meaning } from './meaning.entity';
import { Writing } from './writing.entity';
import { Locale } from '../enums/locale';
import { Score } from './score.entity';

@Entity()
@Unique(['value', 'locale'])
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column({
    type: 'enum',
    enum: Locale,
    default: Locale.ptBr,
  })
  locale: Locale;

  @ManyToMany(() => User, (u) => u.words)
  @JoinTable({
    name: 'user_words',
  })
  users: User[];

  @OneToMany(() => Meaning, (meaning) => meaning.word)
  meanings: Meaning[];

  @OneToMany(() => Writing, (writing) => writing.word)
  writings: Writing[];

  @Column({ default: false })
  cached: boolean;

  @OneToMany(() => Score, (score) => score.word)
  scores: Score[];
}
