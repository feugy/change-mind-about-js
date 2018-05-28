import { expect } from 'chai'
import { Parallel } from '../lib/parallel'
import { Task } from '../lib/task'
import { promisify } from 'util'

const wait = promisify(setTimeout)

describe('Parallel', () => {
  class Deferred extends Task {
    constructor (name, timeout, ...args) {
      super(name, ...args)
      Object.assign(this, { timeout })
    }

    async _execute (params, end) {
      await wait(this.timeout)
    }
  }

  const tasks = [
    new Deferred('1', 150),
    new Deferred('2', 75),
    new Deferred('3', 300)
  ]

  it('should be ran without parallel?', async () => {
    await new Parallel().run()
    // TODO assert
  })

  it('should be serialized', () => {
    expect(
      new Parallel({ tasks, field: 'data' }, new Task('end')).toString()
    ).to.equal(`Parallel ((Deferred 1) | (Deferred 2) | (Deferred 3))`)
  })

  it('should be displayed', () => {
    const tasks = [
      new Task('1', new Task('2')),
      new Task('A', new Task('B', new Task('C'))),
      new Task('alpha')
    ]
    const job = new Parallel(
      { tasks, field: 'data' },
      new Task('next', new Task('end'))
    )
    expect(Parallel.display(job)).to.equal(
      `Parallel ((Task 1 > Task 2) | (Task A > Task B > Task C) | (Task alpha)) > Task next > Task end`
    )
  })

  it('should be multiple tasks in parallel', async () => {
    await new Parallel({ tasks, field: 'data' }).run()
    const start = tasks[0].start

    for (const task of tasks) {
      expect(task.start, `for task ${task.name} start`).to.closeTo(start, 2)
      expect(task.duration, `for task ${task.name} duration`).to.be.closeTo(
        task.timeout,
        task.timeout / 4
      )
    }
    expect(tasks[0].end)
      .to.be.above(tasks[1].end)
      .and.below(tasks[2].end)
  })
})
