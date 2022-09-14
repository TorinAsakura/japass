export class OperationUpdated {
  constructor(public readonly completedAtTs: number, public readonly page: number) {}
}
