import {AllHtmlEntities as Entities} from 'html-entities';

var entities = new Entities();

/**
 * Maximum number of quotes that ChuckNorrisFacts.fr API can serve
 */
const maxQuotes = 99;
export default maxQuotes;

/**
 * Decode HTML entities from a given string.
 * @param {String} incoming text to decode
 * @return {String} the decoded text
 */
export function decode(text) {
  return entities.decode(text);
}

/**
 * Generate parameters for the ChuckNorrisFacts.fr API is expected
 * @param {Object} params - expected parameters
 * @param {Number} params.page - 0-based index of the requested page
 * @param {Number} params.number - number of quote retrieved, default to maxQuotes
 * @return {Object} formated parameters
 */
export function generateParams({page, number= maxQuotes}) {
  return {
    data: `type:txt;nb:${number};page:${page}`
  };
}
