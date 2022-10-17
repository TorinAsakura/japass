export class GetAllProductsQuery {
  constructor(public readonly detailed: boolean, public readonly startFrom: number) {}
}
