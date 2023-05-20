import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Meaning } from './meaning.entity';
import { Writing } from './writing.entity';
import { Locale } from '../enums/locale';

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
  users: User[];

  @OneToMany(() => Meaning, (meaning) => meaning.word)
  meanings: Meaning[];

  @OneToMany(() => Writing, (writing) => writing.word)
  writings: Writing[];

  @Column({ default: true })
  cached: boolean;
}
