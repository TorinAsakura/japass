import { AggregateRoot }                    from '@nestjs/cqrs'

import assert                               from 'assert'

import { ProductCreated }                   from '../events'
import { ProductUpdated }                   from '../events'
import { IdEmptyValueException }            from '../exceptions'
import { PriceEmptyValueException }         from '../exceptions'
import { RemainsEmptyValueException }       from '../exceptions'
import { ArticleNumberEmptyValueException } from '../exceptions'
import { NameEmptyValueException }          from '../exceptions'

export interface ProductOptions {
  id: string
  name: string
  price: number
  remains: number
  articleNumber: string
  code: string
  description: string
  brand: string
  UOM: string
  nds: number
  country: string
  imagePreview: string
  images: Array<string>
  width: number
  height: number
  depth: number
  weight: number
  volume: number
  barcodes: Array<string>
  category: string
}

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

  constructor(options?: ProductOptions) {
    super()

    if (options) {
      this.#id = options.id
      this.#name = options.name
      this.#price = options.price
      this.#remains = options.remains
      this.#articleNumber = options.articleNumber
      this.#code = options.code
      this.#description = options.description
      this.#brand = options.brand
      this.#UOM = options.UOM
      this.#nds = options.nds
      this.#country = options.country
      this.#imagePreview = options.imagePreview
      this.#images = options.images || []
      this.#width = options.width
      this.#height = options.height
      this.#depth = options.depth
      this.#weight = options.weight
      this.#volume = options.volume
      this.#barcodes = options.barcodes || []
      this.#category = options.category
    }
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

  async create(
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
    assert.ok(price, new PriceEmptyValueException())
    assert.ok(remains, new RemainsEmptyValueException())
    assert.ok(name, new NameEmptyValueException())
    assert.ok(articleNumber, new ArticleNumberEmptyValueException())

    this.apply(
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

    return this
  }

  onProductCreated(event: ProductCreated) {
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

  async update(price: number, remains: number) {
    assert.ok(price, new PriceEmptyValueException())
    assert.ok(remains, new RemainsEmptyValueException())

    this.apply(new ProductUpdated(price, remains))

    return this
  }

  onProductUpdated(event: ProductUpdated) {
    this.#price = event.price
    this.#remains = event.remains
  }
}
