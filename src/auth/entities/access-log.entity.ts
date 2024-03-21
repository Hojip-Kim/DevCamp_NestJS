import { BaseEntity } from 'src/common';
import { User } from 'src/user/entities';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';

@Entity()
export class AccessLog extends BaseEntity {
  @Column({ type: 'varchar', length: 512, nullable: true })
  ua: string;

  @Column()
  endpoint: string;

  @Column()
  ip: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  accessedAt: Date;

  @ManyToOne(() => User, (user) => user.accessLog, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: Relation<User>;
}
