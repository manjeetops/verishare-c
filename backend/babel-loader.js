// #!/usr/bin/env node --inspect

// This is used to start the node process

/**
 * Module dependencies.
 */
require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx']
})
console.log('Running=>', process.argv[2])
require(process.argv[2])
