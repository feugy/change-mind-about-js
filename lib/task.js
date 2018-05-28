
/**
 * Task hold plumber logic to serialy execute two tasks.
 * It manages start and end timestamp, success status, and parameters.
 * This is an abstract class: subclasses must implement the _execute() method,
 * which must contain the effective processing
 */
export class Task {

  /**
   * Builds a task with a given name and optionnal following task
   * @param {String} task's name
   * @param {Task} [null] next task that will be invoked
   */
  constructor(name, next = null) {
    Object.assign(this, {
      name,
      next,
      end: null,
      start: null,
      success: null
    })
  }

  /**
   * Serialized this task in a string
   * @return {String} representation for this task
   */
  toString() {
    const className = this.constructor.name
    return `${className} ${this.name}`.trim()
  }

  /**
   * Duration read-only attribute is computed once task is ran.
   * Before calling run(), its value is -1.
   */
  get duration() {
    return this.start ? (this.end || Date.now()) - this.start : -1
  }

  /**
   * Run the task, the next task, and so on.
   * @async
   * @param {Object} [{}] parameters passed to this task, may be ommited
   * @returns {Object} if the task succeeded, potential results
   * @throws {Error} if the task failed to run, the corresponding error
   */
  async run(...params) {
    this.start = Date.now()
    let failure = null
    this.success = null
    try {
      const results = await this._execute(...params)
      return this.next
        ? await this.next.run({...params, ...results})
        : results
    } catch (err) {
      failure = err
      throw err
    } finally {
      this.end = Date.now()
      this.success = failure === null
    }
  }

  /**
   * Subclasses must provide an implementation
   * @protected @abstract
   * @async
   * @param {Object} parameters passed to this task
   * @returns {Object} if the task succeeded, potential results
   * @throws {Error} if the task failed to run, the corresponding error
   */
  async _execute(params) {
    throw new Error(`${this.name} does not implemented _execute`)
  }

  /**
   * Recursively display a bunch of tasks in a string representation
   * @static
   * @param {Task} root task displayed
   * @return {String} containing the root task and subsquent tasks presentation
   */
  static display(task) {
    return task.next?
      `${task.toString()} > ${Task.display(task.next)}`:
      task.toString()
  }
}
