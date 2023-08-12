import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Category } from './category.entity';
import { User } from 'src/api/users/entities/user.entity';
import { Status } from './status.entity';
@Entity()
export class Asset {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @IsNotEmpty()
  @IsString()
  @Column()
  name: string;

  @IsNumber()
  @ManyToOne(() => Status, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'status', referencedColumnName: 'id' })
  status: number;

  @IsNumber()
  @ManyToOne(() => Category, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'category', referencedColumnName: 'id' })
  category: number;

  // @IsNotEmpty()
  // @IsNumber()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'identifier', referencedColumnName: 'id' })
  @Index()
  identifier: number;

  @Column({ nullable: true })
  serialnumber: string;

  @Column({ nullable: true })
  product: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  acquisitionDate: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  team: string;

  @Column({ nullable: true })
  assetnumber: number;
}
