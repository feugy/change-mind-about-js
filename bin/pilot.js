#!node

if (process.argv.length < 3) {
  return console.error('please set a job name');
}
require('../build/jobs/' + process.argv[2]).default(process.argv.slice(3));
