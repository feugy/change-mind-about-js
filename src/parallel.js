import {Task} from './task';

/**
 * Parallel is a special task which execution is to run other tasks in parallel,
 * and to wait for them before exit.
 * All results are concatenated in a given field before being returned
 */
export class Parallel extends Task {

  /**
   * Builds a parallel task with a given sub-tasks and optionnal follower
   * @param {Object} options - used for construction
   * @param {String} options.field - field that will contain concatenated results
   * @param {Task[]} options.tasks - subtasks that will be ran in parallel
   * @param {Task} [null] next task that will be invoked
   */
  constructor({field, tasks = []} = {}, next = null) {
    super('', next);
    Object.assign(this, {tasks, field});
  }

  /**
   * @protected
   * Run sub tasks in parallel and wait for them
   * All results will be concatenated into the specified field
   *
   * @param {Object} parameters passed to this task
   * @param {End} done - completion callback, invoqued when the task is done
   */
  _execute(params, done) {
    let results = [];
    if (!this.tasks.length) {
      return done(null, {[this.field]: results});
    }

    let finished = 0;
    for (let task of this.tasks) {
      task.run(params, (err, data) => {
        if (err) {
          if (this.success === null) {
            done(err);
          }
          return;
        }
        if (data && data[this.field]) {
          results = results.concat(data[this.field]);
        }
        if (++finished === this.tasks.length) {
          done(null, {[this.field]: results});
        }
      });
    }
  }

  /**
   * Overrides the string serialization to represent parallel subtasks
   * @return {String} representation for this task
   */
  toString() {
    let subTasks = this.tasks.map(t => t.toString()).join(' | ');
    return `${super.toString()} (${subTasks})`;
  }

}
