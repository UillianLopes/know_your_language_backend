import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Word } from './word.entity';

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
  @JoinTable()
  words: Word[];

  @Column()
  provider: string;

  @Column({ nullable: true })
  picture: string | null;
}
