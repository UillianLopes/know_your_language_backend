import { ELocale } from '@kyl/enums/locale.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column({
    type: 'enum',
    enum: ELocale,
    default: ELocale.enUs,
    unique: true,
  })
  locale: ELocale;
}
