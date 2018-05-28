import request from 'request'
import {Parallel} from '../parallel'
import {Task as BaseTask} from '../task'
import nbQuotes, * as utils from './utils'

const req = request.defaults({
  timeout: 10000,
  pool: {maxSockets: 10}
})

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
    args.unshift('')
    super(...args)
  }

  /**
   * Get quotations stored in params.data, and return the most popular (on points)
   *
   * @protected
   * @async
   * @param {Object} params - parameters passed to this task
   * @param {Object[]} params.data - sorted quotations
   * @param {End} done - completion callback, invoqued when the task is done
   */
  async _execute({data = []} = {}, end) {
    if (!data || !data.length) {
      return {data: []}
    }
    const best = data.reduce((max, q) => +q.points > +max.points ? q : max)
    best.fact = utils.decode(best.fact)
    return {data: [best]}
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
    let {page} = options
    args.unshift(`page ${page}`)
    super(...args)
    Object.assign(this, options)
  }

  /**
   * Make the HTTP call and return quotations
   *
   * @protected
   * @async
   * @param {Object} params - unused
   * @param {End} done - completion callback, invoqued when the task is done
   */
  async _execute(params, end) {
    return new Promise((resolve, reject) =>
      req(Object.assign({
        method: 'GET',
        url: 'http://www.chucknorrisfacts.fr/api/get',
        qs: utils.generateParams(this),
        json: true
      }, this), (err, res, data) => {
        if (!err) {
          if (res.statusCode !== 200) {
            err = new Error(`unexpected status ${res.statusCode}`)
          } else if (typeof data === 'string') {
            err = new Error(`unexpected response ${data}`)
          }
        }
        if (err) {
          return reject(err)
        }
        resolve({data})
      })
    )
  }
}

/**
 * Job execution:
 * - make 100 parallel crawler + sorter
 * - sort results
 * - display on console
 */
export default async function main() {
  const sorter = new Sorter()
  const nbWorkers = 100
  const crawlers = Array.from(new Array(nbWorkers), (x, i) =>
    new Crawler({page: i+1}, sorter)
  )

  console.log(`get quotes per ${nbQuotes} with ${nbWorkers} crawlers...`)
  try {
    const {data: [{fact, points: score}]=[]} = await new Parallel({tasks: crawlers, field: 'data'}, sorter).run()
    console.log(`best fact found (${score} pts) :\n\n${fact}`)
  } catch (err) {
    console.error(`unexpected error: ${err.message}`)
  }
}
