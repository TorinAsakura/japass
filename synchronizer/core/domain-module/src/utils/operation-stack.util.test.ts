import { OperationStack } from './operation-stack.util'

describe('synchronizer', () => {
  describe('domain', () => {
    describe('operation-stack.util', () => {
      it('should await for all operations in stack', async () => {
        const operationStack = new OperationStack<boolean>()

        const asyncOperation = async () =>
          new Promise<boolean>((resolve) => {
            setTimeout(() => {
              resolve(true)
            }, 1000)
          })

        operationStack.push(asyncOperation)
        operationStack.push(asyncOperation)
        operationStack.push(asyncOperation)

        await operationStack.waitForAll()

        expect(operationStack.operations).toEqual(expect.arrayContaining([true, true, true]))
      })
    })
  })
})
