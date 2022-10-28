export class ProductCreated {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly remains: number,
    public readonly articleNumber: string,
    public readonly code: string,
    public readonly description: string,
    public readonly brand: string,
    public readonly UOM: string,
    public readonly nds: number,
    public readonly country: string,
    public readonly imagePreview: string,
    public readonly images: Array<string>,
    public readonly width: number,
    public readonly height: number,
    public readonly depth: number,
    public readonly weight: number,
    public readonly volume: number,
    public readonly barcodes: Array<string>,
    public readonly category: string,
    public readonly updatedAt: Date
  ) {}
}
