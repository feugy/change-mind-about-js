import {expect} from 'chai';
import {Parallel} from '../src/parallel';
import {Task} from '../src/task';

describe('Parallel', () => {

  class Deferred extends Task {

    constructor(name, timeout, ...args) {
      super(name, ...args);
      Object.assign(this, {timeout});
    }

    _execute(params, end) {
      setTimeout(() => end(null), this.timeout);
    }
  }

  it('should be ran without parallel', done => {
    new Parallel().run(err => {
      expect(err).not.to.exist;
      done();
    });
  });

  it.skip('should be be serialized', () => {
  });

  it('should be multiple tasks in parallel', done => {
    let tasks = [
      new Deferred('1', 150), new Deferred('2', 75), new Deferred('3', 300)
    ];

    new Parallel({tasks, field: 'data'}).run(err => {
      expect(err).not.to.exist;
      let start = tasks[0].start;

      for (let task of tasks) {
        expect(task.start, `for task ${task.name} start`).to.closeTo(start, 2);
        expect(task.duration, `for task ${task.name} duration`).to.be.closeTo(task.timeout, task.timeout / 4);
      }
      expect(tasks[0].end).to.be.above(tasks[1].end).and.below(tasks[2].end);
      done();
    });
  });
});
