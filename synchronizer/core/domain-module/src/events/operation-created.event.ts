export class OperationCreated {
  constructor(
    public readonly id: string,
    public readonly completedAtTs: number,
    public readonly page: number
  ) {}
}
