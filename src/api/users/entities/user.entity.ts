import { IsEmail } from 'class-validator';
import { Company } from 'src/api/assets/entities/company.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @IsEmail()
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  agreepi: boolean;

  @Column()
  companyname: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'identifier', referencedColumnName: 'id' })
  @Index()
  identifier: number;
}
