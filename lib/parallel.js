import Task from './task'

/**
 * Parallel is a special task which execution is to run other tasks in parallel,
 * and to wait for them before exit.
 * All results are concatenated in a given field before being returned
 */
export default class Parallel extends Task {
  /**
   * Builds a parallel task with a given sub-tasks and optionnal follower
   * @param {Object} options - used for construction
   * @param {String} options.field - field that will contain concatenated results
   * @param {Task[]} options.tasks - subtasks that will be ran in parallel
   * @param {Task} [null] next task that will be invoked
   */
  constructor ({ field, tasks = [] } = {}, next = null) {
    super('', next)
    Object.assign(this, { tasks, field })
  }

  /**
   * Overrides the string serialization to represent parallel subtasks
   * @return {String} representation for this task
   */
  toString () {
    const subTasks = this.tasks.map(t => `(${Task.display(t)})`).join(' | ')
    return `${super.toString()} (${subTasks})`
  }

  /**
   * Run sub tasks in parallel and wait for them
   * All results will be concatenated into the specified field
   *
   * @protected
   * @async
   * @param {Object} parameters passed to this task
   */
  async _execute (params) {
    if (!this.tasks.length) return { [this.field]: [] }

    const results = await Promise.all(this.tasks.map(task => task.run(params)))
    return {
      [this.field]: results.reduce((total, current) => {
        const currentData = current && current[this.field]
        return total.concat(currentData)
      }, [])
    }
  }
}
