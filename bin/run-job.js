#!/usr/bin/env node

const main = async args => {
  if (args.length < 1) {
    console.error('please set a job name')
    process.exit(-1)
  }
  const { default: run } = await import(`../lib/jobs/${args}`)
  await run(args.slice(1))
}

main(process.argv.slice(2))
