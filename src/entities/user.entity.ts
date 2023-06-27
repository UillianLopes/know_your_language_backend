import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Score } from './score.entity';
import { UserWord } from './user_word.entity';
import * as argon2 from 'argon2';
import { EAuthProvider } from '../enums/auth-provider.enum';
import { ELocale } from '@kyl/enums/locale.enum';

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

  @Column({
    type: 'enum',
    enum: EAuthProvider,
    default: EAuthProvider.self,
  })
  provider: EAuthProvider;

  @Column({ nullable: true })
  picture: string | null;

  @OneToMany(() => Score, (score) => score.user)
  scores: Score[];

  @Column({ nullable: true })
  password: string | null;

  @Column({
    type: 'enum',
    enum: ELocale,
    default: ELocale.enUs,
  })
  locale: ELocale;

  async checkPassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }
}
