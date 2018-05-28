import entities from 'html-entities'

/**
 * Maximum number of quotes that ChuckNorrisFacts.fr API can serve
 */
const maxQuotes = 99
export default maxQuotes

/**
 * Decode HTML entities from a given string.
 * @param {String} incoming text to decode
 * @return {String} the decoded text
 */
export function decode(text) {
  return (new entities.AllHtmlEntities()).decode(text)
}

/**
 * Generate parameters for the ChuckNorrisFacts.fr API is expected
 * @see http://www.chucknorrisfacts.fr/api/api
 * @param {Object} [{}] params - expected parameters
 * @param {Number} params.page - 0-based index of the requested page, default to 0
 * @param {Number} params.size - number of quote retrieved, default to maxQuotes
 * @param {Number} params.type - type of retrieved quotes, default to txt
 * @return {Object} formated parameters
 */
export function generateParams(params = {}) {
  const data = Object.entries({
    nb: params.size || maxQuotes,
    page: params.page || 0,
    type: params.type || 'txt',
  })
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
  return {data}
}
