import { Entity }        from 'typeorm'
import { Column }        from 'typeorm'
import { PrimaryColumn } from 'typeorm'

@Entity()
export class ProductEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column({ nullable: true })
  name!: string

  @Column('float', { nullable: true })
  price!: number

  @Column({ nullable: true })
  remains!: number

  @Column()
  articleNumber!: string

  @Column({ nullable: true })
  code!: string

  @Column({ nullable: true })
  description!: string

  @Column({ nullable: true })
  brand!: string

  @Column({ nullable: true })
  UOM!: string

  @Column('float', { nullable: true })
  nds!: number

  @Column({ nullable: true })
  country!: string

  @Column({ nullable: true })
  imagePreview!: string

  @Column('text', { array: true })
  images!: string[]

  @Column('float', { nullable: true })
  width!: number

  @Column('float', { nullable: true })
  height!: number

  @Column('float', { nullable: true })
  depth!: number

  @Column('float', { nullable: true })
  weight!: number

  @Column('float', { nullable: true })
  volume!: number

  @Column('text', { array: true })
  barcodes!: string[]

  @Column({ nullable: true })
  category!: string
}
