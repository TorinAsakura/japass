export class ProductUpdated {
  constructor(
    public readonly price: number,
    public readonly remains: number,
    public readonly updatedAt: Date
  ) {}
}
