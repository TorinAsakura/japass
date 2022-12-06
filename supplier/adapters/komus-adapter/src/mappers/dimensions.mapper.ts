export class DimensionsMapper {
  static fromMetres(value: number): number {
    return value * 100
  }

  static fromDecimetres(value: number): number {
    return value * 10
  }
}
