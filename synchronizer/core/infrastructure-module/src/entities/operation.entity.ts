import { Entity }        from 'typeorm'
import { Column }        from 'typeorm'
import { PrimaryColumn } from 'typeorm'

@Entity()
export class OperationEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column('bigint')
  completedAtTs!: number

  @Column()
  page!: number
}
