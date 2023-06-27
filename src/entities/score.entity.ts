import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Word } from './word.entity';

@Entity()
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: number;

  @Column({
    type: 'timestamptz',
  })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.scores)
  user: User;

  @ManyToOne(() => Word, (word) => word.scores)
  word: Word;
}
