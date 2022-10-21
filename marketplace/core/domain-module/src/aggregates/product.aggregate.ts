import { AggregateRoot }         from '@nestjs/cqrs'

import assert                    from 'assert'

import { MIN_PRICE }             from '../constants'
import { ProductCreated }        from '../events'
import { ProductUpdated }        from '../events'
import { IdEmptyValueException } from '../exceptions'

export class Product extends AggregateRoot {
  #id!: string

  #name!: string

  #price!: number

  #remains!: number

  #articleNumber!: string

  #code!: string

  #description!: string

  #brand!: string

  #UOM!: string

  #nds!: number

  #country!: string

  #imagePreview!: string

  #images: Array<string> = []

  #width!: number

  #height!: number

  #depth!: number

  #weight!: number

  #volume!: number

  #barcodes: Array<string> = []

  #category!: string

  protected constructor() {
    super()
  }

  private get extraChargeMultiplier() {
    const value = Number(process.env.EXTRA_CHARGE_MULTIPLIER)

    assert.ok(!Number.isNaN(value), `Missing env variable 'EXTRA_CHARGE_MULTIPLIER'`)

    return value
  }

  private get consumablesExtraCharge() {
    const value = Number(process.env.CONSUMABLES_EXTRA_CHARGE)

    assert.ok(!Number.isNaN(value), `Missing env variable 'CONSUMABLES_EXTRA_CHARGE'`)

    return value
  }

  private get orderProcessingMultiplier() {
    const value = Number(process.env.ORDER_PROCESSING_MULTIPLIER)

    assert.ok(!Number.isNaN(value), `Missing env variable 'ORDER_PROCESSING_MULTIPLIER'`)

    return value
  }

  private get categoryMultiplier() {
    const value = Number(process.env.CATEGORY_MULTIPLIER)

    assert.ok(!Number.isNaN(value), `Missing env variable 'CATEGORY_MULTIPLIER'`)

    return value
  }

  get id() {
    return this.#id
  }

  get name() {
    return this.#name
  }

  get price() {
    return this.#price
  }

  get remains() {
    return this.#remains
  }

  get articleNumber() {
    return this.#articleNumber
  }

  get code() {
    return this.#code
  }

  get description() {
    return this.#description
  }

  get brand() {
    return this.#brand
  }

  get UOM() {
    return this.#UOM
  }

  get nds() {
    return this.#nds
  }

  get country() {
    return this.#country
  }

  get imagePreview() {
    return this.#imagePreview
  }

  get images() {
    return this.#images
  }

  get width() {
    return this.#width
  }

  get height() {
    return this.#height
  }

  get depth() {
    return this.#depth
  }

  get weight() {
    return this.#weight
  }

  get volume() {
    return this.#volume
  }

  get barcodes() {
    return this.#barcodes
  }

  get category() {
    return this.#category
  }

  get properties() {
    return {
      id: this.#id,
      name: this.#name,
      price: this.#price,
      remains: this.#remains,
      articleNumber: this.#articleNumber,
      code: this.#code,
      description: this.#description,
      brand: this.#brand,
      UOM: this.#UOM,
      nds: this.#nds,
      country: this.#country,
      imagePreview: this.#imagePreview,
      images: this.#images,
      width: this.#width,
      height: this.#height,
      depth: this.#depth,
      weight: this.#weight,
      volume: this.#volume,
      barcodes: this.#barcodes,
      category: this.#category,
    }
  }

  minForOrder() {
    if (this.price < MIN_PRICE) return Math.ceil(MIN_PRICE / this.price)

    return 1
  }

  minPrice() {
    const minForOrder = this.minForOrder()

    if (minForOrder > 1) return this.price * minForOrder

    return this.price
  }

  priceWithExtraCharge() {
    return (
      (this.minPrice() * this.extraChargeMultiplier + this.consumablesExtraCharge) *
      this.orderProcessingMultiplier *
      this.categoryMultiplier
    )
  }

  static create(
    id: string,
    name: string,
    price: number,
    remains: number,
    articleNumber: string,
    code: string,
    description: string,
    brand: string,
    UOM: string,
    nds: number,
    country: string,
    imagePreview: string,
    images: Array<string>,
    width: number,
    height: number,
    depth: number,
    weight: number,
    volume: number,
    barcodes: Array<string>,
    category: string
  ) {
    assert.ok(id, new IdEmptyValueException())

    const product = new Product()

    product.apply(
      new ProductCreated(
        id,
        name,
        price,
        remains,
        articleNumber,
        code,
        description,
        brand,
        UOM,
        nds,
        country,
        imagePreview,
        images,
        width,
        height,
        depth,
        weight,
        volume,
        barcodes,
        category
      )
    )

    return product
  }

  protected onProductCreated(event: ProductCreated) {
    this.#id = event.id
    this.#name = event.name
    this.#price = event.price
    this.#remains = event.remains
    this.#articleNumber = event.articleNumber
    this.#code = event.code
    this.#description = event.description
    this.#brand = event.brand
    this.#UOM = event.UOM
    this.#nds = event.nds
    this.#country = event.country
    this.#imagePreview = event.imagePreview
    this.#images = event.images || []
    this.#width = event.width
    this.#height = event.height
    this.#depth = event.depth
    this.#weight = event.weight
    this.#volume = event.volume
    this.#barcodes = event.barcodes || []
    this.#category = event.category
  }

  update(price: number, remains: number) {
    this.apply(new ProductUpdated(price, remains))

    return this
  }

  protected onProductUpdated(event: ProductUpdated) {
    this.#price = event.price
    this.#remains = event.remains
  }
}
