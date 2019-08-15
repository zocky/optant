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
async function optant(callback) {
  const args = process.argv.slice(2);
  const [argv, options, bad] = optant.getopt(args);
  if (bad) process.exit(1);
  if (!callback) return [argv, options];
  try {
    const res= await callback(argv,options);
    if (typeof res === 'object') {
      process.stdout.write(JSON.stringify(res, null, 2));
    }
    else if (res !== undefined) process.stdout.write(String(res));
    process.exit(0);
  } catch  (error) {
    process.stderr.write(String(error && error.message ? error.message : String(error) ));
    process.exit(error && !isNaN(error.code) ? (0|error.code) : 1);
  }
}

optant.optant = optant;

optant.getopt = function getopt(args) {
  const argv = [];
  const options = {};
  let bad = false;

  for (const arg of args) {
    const match = arg.match(/^-(-)?(\w[\w\-]*)(?:=(.*))?$/);
    if (!match) {
      argv.push(isNaN(arg) ? arg : +arg);
      continue;
    }
    var [, long, name, value] = match;
    if (long || name.length == 1) {
      name = name.replace(/-+(.)/g, ($, $1) => $1.toUpperCase());
      if (value === undefined) options[name] = true;
      else if (value == '' || isNaN(value)) options[name] = value;
      else options[name] = +value;
    } else {
      if (name.length > 1 && value !== undefined) {
        console.error("Bad option " + arg + ". Did you mean -" + arg + "?");
        bad = true;
        continue;
      }
      for (const n of name) {
        options[n] = true;
      }
    }
  }
  return [argv, options, bad];
}