
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
    });
  }

  /**
   * Serialized this task in a string
   * @return {String} representation for this task
   */
  toString() {
    let className = this.constructor.name;
    return `${className} ${this.name}`.trim();
  }

  /**
   * Duration read-only attribute is computed once task is ran.
   * Before calling run(), its value is -1.
   */
  get duration() {
    return this.start ? (this.end || Date.now()) - this.start : -1;
  }

  /**
   * Run the task, the next task, and so on.
   * @param {Object} [{}] parameters passed to this task, may be ommited
   * @param {End} done - completion callback, invoqued when the task is done
   *
   * @callbak End
   * @param {Error} if the task failed to run, the corresponding error. Null otherwise
   * @param {Object} [{}] if the task succeeded, potential results.
   */
  run(...args) {
    let done = args.pop();
    let params = args.pop() || {};
    this.start = Date.now();

    this._execute(params, (err, results) => {
      this.success = err == null;
      this.end = Date.now();
      if (err || !this.next) {
        done(err, results);
      } else {
        this.next.run(Object.assign({}, params, results), done);
      }
    });
  }

  /**
   * @protected @abstract
   * Subclasses must provide an implementation
   * @param {Object} parameters passed to this task
   * @param {End} done - completion callback, invoqued when the task is done
   */
  _execute(params, end) {
    end(new Error(`${this.name} does not implemented _execute`));
  }

  /**
   * Recursively display a bunch of tasks in a string representation
   * @param {Task} root task displayed
   * @return {String} containing the root task and subsquent tasks presentation
   */
  static display(task) {
    return task.next?
      `${task.toString()} > ${Task.display(task.next)}`:
      task.toString();
  }
}
