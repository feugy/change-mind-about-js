import request from 'request';
import {Parallel} from '../parallel';
import {Task as BaseTask} from '../task';
import nbQuotes, * as utils from './utils';

var req = request.defaults({
  timeout: 10000,
  pool: {maxSockets: 10}
});

/**
 * Sort retrieved quotations by using their score.
 * Quotations must be stored in an array under the 'data' attribute
 */
export class Sorter extends BaseTask {

  /**
   * Builds a sorter task
   * @param {Task} next task that will be invoked
   */
  constructor(...args) {
    args.unshift('');
    super(...args);
  }

  /**
   * @protected
   * Get quotations stored in params.data, and return the most popular (on points)
   *
   * @param {Object} params - parameters passed to this task
   * @param {Object[]} params.data - sorted quotations
   * @param {End} done - completion callback, invoqued when the task is done
   */
  _execute({data = []} = {}, end) {
    if (!data || !data.length) {
      return end(null, {data: []});
    }
    let best = data.reduce((max, q) => +q.points > +max.points ? q : max);
    best.fact = utils.decode(best.fact);
    end(null, {data: [best]});
  }
}

/**
 * Make an HTTP GET on ChuckNorrisFact.fr API to get a given page of quotations
 */
export class Crawler extends BaseTask {

  /**
   * Builds a crawler task
   * @param {Object} options used to build this crawler
   * @param {Number} options.page 1-based page retrieved
   * @param {Number} options.size number of quotations retrieved in page
   * @param {String|Boolean} [false] options.proxy - optionnal proxy used
   * @param {Number} page that will be requested
   * @param {Task} next task that will be invoked
   */
  constructor(options, ...args) {
    let {page} = options;
    args.unshift(`page ${page}`);
    super(...args);
    Object.assign(this, options);
  }

  /**
   * @protected
   * Make the HTTP call and return quotations
   *
   * @param {Object} params - unused
   * @param {End} done - completion callback, invoqued when the task is done
   */
  _execute(params, end) {
    req(Object.assign({
      method: 'GET',
      url: 'http://www.chucknorrisfacts.fr/api/get',
      qs: utils.generateParams(this),
      json: true
    }, this), (err, res, data) => {
      if (!err) {
        if (res.statusCode !== 200) {
          err = new Error(`unexpected status ${res.statusCode}`);
        } else if (typeof data === 'string') {
          err = new Error(`unexpected response ${data}`);
        }
      }
      if (err) {
        return end(err);
      }
      end(null, {data});
    });
  }
}

/**
 * Job execution:
 * - make 100 parallel crawler + sorter
 * - sort results
 * - display on console
 */
export default function main() {
  let sorter = new Sorter();
  const nbWorkers = 100;
  let crawlers = Array.from(new Array(nbWorkers), (x, i) =>
    new Crawler({page: i+1, proxy: 'http://proxy-internet.localnet:3128'}, sorter)
  );

  console.log(`

  get quotes per ${nbQuotes} with ${nbWorkers} crawlers...
`);

  new Parallel({tasks: crawlers, field: 'data'}, sorter).run((err, results) => {
    if (err) {
      return console.error(`unexpected error: ${err.message}`);
    }
    let {data: [{fact, points: score}]=[]} = results;
    console.log(`
  best fact found (${score} pts) :

  ${fact}

    `);
  });
}
