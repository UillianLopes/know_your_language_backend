import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Locale } from '../enums/locale';
import { Meaning } from './meaning.entity';
import { Score } from './score.entity';
import { UserWord } from './user_word.entity';

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

  @OneToMany(() => UserWord, (u) => u.word)
  users: UserWord[];

  @OneToMany(() => Meaning, (meaning) => meaning.word)
  meanings: Meaning[];

  @Column({ default: false })
  cached: boolean;

  @OneToMany(() => Score, (score) => score.word)
  scores: Score[];
}
