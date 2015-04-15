import {expect} from 'chai';
import {Task} from '../src/task';

describe('Task', () => {

  it('should be serialized into string', () => {
    let name = 'task 1';
    expect(new Task(name).toString()).to.equal(`Task ${name}`);
  });

  it('should throw an error when ran', done => {
    new Task().run({}, err => {
      expect(err).to.exist.and.to.be.an.instanceOf(Error);
      done();
    });
  });

  it('should have empty duration until started', () => {
    expect(new Task()).to.have.property('duration').that.equals(-1);
  });

  it('should be displayed without next', () => {
    let name = 'single';
    expect(Task.display(new Task(name))).to.equal(`Task ${name}`);
  });

  it('should be displayed with next tasks', () => {
    let names = ['task 1', 'task 2', 'task 3'];
    let [name1, name2, name3] = names;
    expect(Task.display(new Task(name1, new Task(name2, new Task(name3))))).to.equal(names.map(n => `Task ${n}`).join(' > '));
  });

  describe('with a simple subclass', () => {

    class Simple extends Task {
      _execute(params, end) {
        end(null, params);
      }
    }

    it('should string representation use subclass', () => {
      let name = 'task 2';
      expect(new Simple(name).toString()).to.equal(`Simple ${name}`);
    });

    it('should be ran with parameters', done => {
      let params = {count: 10};
      new Simple().run(params, (err, results) => {
        expect(err).not.to.exist;
        expect(results).to.deep.equal(params);
        done();
      });
    });

    it('should be ran without parameters', done => {
      new Simple().run((err, results) => {
        expect(err).not.to.exist;
        expect(results).to.be.an('object').and.to.be.empty;
        done();
      });
    });

    it('should have a duration after being run', done => {
      let task = new Simple();
      task.run(err => {
        expect(err).not.to.exist;
        expect(task).to.have.property('duration').that.is.closeTo(0, 1);
        expect(task).to.have.property('success').that.is.true;
        done();
      });
    });
  });

  describe('with a serial subclass', () => {

    class Serial extends Task {
      _execute(params, end) {
        params.order.push(this.name);
        end(null, params);
      }
    }

    it('should be ran without next', done => {
      let params = {order: []};
      let name = 'task 1';
      new Serial(name).run(params, err => {
        expect(err).not.to.exist;
        expect(params.order).to.deep.equals([name]);
        done();
      });
    });

    it('should be with multiple next in right order', done => {
      let params = {order: []};
      let [name1, name2, name3] = ['task 1', 'task 2', 'task 3'];
      new Serial(name1, new Serial(name2, new Serial(name3))).run(params, err => {
        expect(err).not.to.exist;
        expect(params.order).to.deep.equals([name1, name2, name3]);
        done();
      });
    });
  });
});
