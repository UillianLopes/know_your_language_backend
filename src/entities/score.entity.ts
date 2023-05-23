import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToMany(() => User, (user) => user.scores)
  user: User;

  @OneToMany(() => Word, (word) => word.scores)
  word: Word;
}
