import { Timer } from './timer.util'

describe('synchronizer', () => {
  describe('domain', () => {
    describe('timer.util', () => {
      it('should await for all operations in stack', async () => {
        const timer = new Timer()

        timer.start()

        await new Promise((resolve) => {
          setTimeout(() => {
            timer.stop()
            resolve(undefined)
          }, 1500)
        })

        expect(timer.count >= 1500).toBeTruthy()
      })
    })
  })
})
