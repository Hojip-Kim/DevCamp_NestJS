import { BaseEntity } from 'src/common';
import { Column, Entity } from 'typeorm';

export type productType = 'available' | 'not-available';

@Entity()
export class Product extends BaseEntity {
  @Column({ type: 'decimal' })
  price: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column()
  imgURL: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'available' })
  status: productType;
}
