import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Seed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  timestamp: number;
}
