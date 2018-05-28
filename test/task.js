import { expect } from 'chai'
import { Task } from '../lib/task'

describe('Task', () => {
  it('should be serialized into string', () => {
    const name = 'task 1'
    expect(new Task(name).toString()).to.equal(`Task ${name}`)
  })

  it('should throw an error when ran', async () => {
    await expect(new Task().run({})).to.be.rejectedWith(Error)
  })

  it('should have empty duration until started', () => {
    expect(new Task())
      .to.have.property('duration')
      .that.equals(-1)
  })

  it('should be displayed without next', () => {
    const name = 'single'
    expect(Task.display(new Task(name))).to.equal(`Task ${name}`)
  })

  it('should be displayed with next tasks', () => {
    const names = ['task 1', 'task 2', 'task 3']
    const [name1, name2, name3] = names
    expect(
      Task.display(new Task(name1, new Task(name2, new Task(name3))))
    ).to.equal(names.map(n => `Task ${n}`).join(' > '))
  })

  describe('with a simple subclass', () => {
    class Simple extends Task {
      async _execute (params) {
        return params
      }
    }

    it('should string representation use subclass', () => {
      const name = 'task 2'
      expect(new Simple(name).toString()).to.equal(`Simple ${name}`)
    })

    it('should be ran with parameters', async () => {
      const params = { count: 10 }
      expect(await new Simple().run(params)).to.deep.equal(params)
    })

    it('should be ran without parameters', async () => {
      expect(await new Simple().run()).to.be.undefined
    })

    it('should have a duration after being run', async () => {
      const task = new Simple()
      await task.run()
      expect(task)
        .to.have.property('duration')
        .that.is.greaterThan(0)
      expect(task).to.have.property('success').that.is.true
    })
  })

  describe('with a serial subclass', () => {
    class Serial extends Task {
      async _execute (params) {
        params.order.push(this.name)
        return params
      }
    }

    it('should be ran without next', async () => {
      const params = { order: [] }
      const name = 'task 1'
      await new Serial(name).run(params)
      expect(params.order).to.deep.equals([name])
    })

    it('should be with multiple next in right order', async () => {
      const params = { order: [] }
      const [name1, name2, name3] = ['task 1', 'task 2', 'task 3']
      await new Serial(name1, new Serial(name2, new Serial(name3))).run(params)
      expect(params.order).to.deep.equals([name1, name2, name3])
    })
  })
})
