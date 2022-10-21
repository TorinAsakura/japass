import { Entity }        from 'typeorm'
import { Column }        from 'typeorm'
import { PrimaryColumn } from 'typeorm'

@Entity()
export class RewriteEnforcerEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column()
  flag!: boolean
}
