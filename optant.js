module.exports = optant;

/** 
 * Optant callback. 
 * 
 * Will be called with an array of positional arguments
 * and an object of boolean or string options.
 * It may return a result or a promise.
 * 
 * Returned scalars will be printed to stdout, returned 
 * objects will be printed as JSON. 
 * Thrown errors will be reported to stderr. 
 * If nothing is returned, "OK" will be printed to stderr.
 * 
 * @typedef {function(string[],{string:(string|boolean)}):PromiseLink<any>} optantCB 
 * 
*/

/**
 * Parse command line options
 * @param {optantCB} callback function([arg1,arg2,...],{opt1,opt2,...})
 */
function optant(callback) {
  const args = process.argv.slice(2);
  const argv = [];
  const options = {}
  var match;
  args.forEach(arg => {
    if (match = arg.match(/^--?(\w[\w\-]*)$/)) {
      options[match[1]] = true;
      return;
    }
    if (match = arg.match(/^--?(\w[\w\-]*)=(.*)$/)) {
      options[match[1]] = isNaN(match[2]) ? match[2] : +match[2];
      return;
    }
    argv.push( isNaN(arg) ? arg : +arg );
  })

  if (!callback) return [argv,options];

  Promise.resolve(callback(argv,options))
  .then( res => {
    if (typeof res === 'object') {
        process.stdout.write(JSON.stringify(res,null,2));
    }
    else if (res !== undefined) process.stdout.write(String(res));
    else process.stderr.write('OK')
    process.stderr.write('\n');
    process.exit(0);
  })
  .catch(error=>{
    process.stderr.write(String(error)+'\n');
    process.exit(-1);
  })
}
