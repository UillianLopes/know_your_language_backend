import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ELocale } from '../enums/locale.enum';
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
    enum: ELocale,
    default: ELocale.ptBr,
  })
  locale: ELocale;

  @OneToMany(() => UserWord, (u) => u.word)
  users: UserWord[];

  @OneToMany(() => Meaning, (meaning) => meaning.word)
  meanings: Meaning[];

  @Column({ default: false })
  cached: boolean;

  @OneToMany(() => Score, (score) => score.word)
  scores: Score[];
}
