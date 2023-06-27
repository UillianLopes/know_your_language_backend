import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Word } from './word.entity';
import { User } from './user.entity';
import { EGameMode } from '../enums/game-mode.enum';

@Entity()
export class UserWord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Word, (word) => word.users)
  word: Word;

  @ManyToOne(() => User, (user) => user.words)
  user: User;

  @Column()
  incorrectAttempts: number;

  @Column()
  learned: boolean;

  @Column({
    type: 'enum',
    enum: EGameMode,
    default: EGameMode.guessTheMeaning,
  })
  gameMode: EGameMode;
}
