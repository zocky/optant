# Optant
Minimalistic command line option parsing for Node scripts. 

Optant is a tiny library that parses any arguments and options supplied to your script
on the command line. It's perfect when you need to write a script that reads some arguments and/or options 
from the command line, but don't want to invest time and energy into constructing a complex 
setup with commander or other more advanced tools.

- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Examples](#examples)
  - [Advanced usage](#advanced-usage)
  - [ES6 destructuring and default values](#es6-destructuring-and-default-values)
- [Recipes](#recipes)
  - [Sync](#sync)
  - [Old-Style Async](#old-style-async)
  - [Promise](#promise)
  - [Async/Await](#asyncawait)
- [License](#license)

## Usage

Optant can be used in two ways:
* Simply calling `optant()` with no arguments will return an array containing two elements: the first is an array of
  supplied positional arguments, and the second is an object containing supplied options. See **Basic usage**.

* Alternatively, you can call `optant` with a callback function that will receive the parsed arguments and options. 
  Optant wil then wait for the function to return its result (or error) and output it appropriately. See **Advanced usage**.

### Basic usage

```bash
$ npm install optant
```

```javascript
const optant = require('optant');
const [argv,options] = optant();
```

Optant will recognize short and long options, beginning with one or two dashes, and optionally followed by an equals
sign and a string value. These will be returned in the `options` object. All other arguments will be 
returned in the `argv` array. 

Options without values will be treated as boolean, options with number values will be converted to numbers,
other values will be returned as strings. Arguments that are numbers will also be converted to numbers.

Option names that include dashes will be camelCased.

### Examples
| command line | argv | options |
| ------------ | ---- | ------- |
| `yourscript inputfile outputfile` | `["inputfile","outputfile"]` | `{}` |
| `yourscript -v` | `[]` | `{v:true}` | 
| `yourscript -abc` | `[]` | `{a:true,b:true,c:true}` | 
| `yourscript --help` | `[]` | `{help:true}` | 
| `yourscript --char-count=100` | `[]` | `{charCount:100}` | 
| `yourscript 20 30 --output=outputfile` | `[20,30]` | `{output:"outputfile"}` | 
| `yourscript -b --count=10 inputfile` | `["inputfile"]` | `{b:true, output:10}` | 

**NOTE** Option arguments without equals signs are not supported.

### Advanced usage

Alternatively, you can use Optant as scaffolding for your shell script. It will parse the options and arguments,
optionally print out the results, and exit the process with the correct exit code.

```javascript
optant( (argv,options) => {
  // do stuff, then return a result or throw an error
})
```

Call `optant` with a callback, which will be called with two arguments: an array of positional arguments and an object of boolean, string or numerical options. The callback can return a result or a promise, or nothing.

Once a result is returned, or the promise is resolved, optant will print out any results and exit the process. 

- Returned scalars will be printed to `stdout`, and the process will exit with exit code `0`.
- Returned objects will be printed to `stdout ` as formatted JSON, and the process will exit with code `0`. If the returned object is not JSONable, the process will exit with code `1`, and an error message will be displayed on `stderr`. 
- If an error is thrown, it will be reported to `stderr` and the process will exit with code `1`. If the error that was thrown includes a numerical property `.code`, that will used instead.
- If nothing (or `undefined`) is returned, the process will print nothing and exit with code `0`. 

### ES6 destructuring and default values

You can also take advantage of argument destructuring in ES6 to receive the arguments and the options as named
variables, and provide them with default values. Consider the following script to appreciate the possibilities:

```javascript
const optant = require('optant');

optant( ([
    inputfile, 
    outputfile = inputfile+'.out'
  ],{
    s = 0, skip = s, 
    n = 10, lines = n,
    force,
    h, help = h,
    v, version = v
  }) => {
  
  // version = --version or -v
  if (version) return 'v1.0';
  
  // help = --help or -h
  if (help || !inputfile) return 'Usage: myscript inputfile [outputfile] [--force] [-n|--lines=10] [-s|--skip=0]';
  
  // script
  // force = --force 
  if (fs.existsSync(outputfile) && !force && !f) {
    throw new Error(`${outputfile} exists. Use --force to overwrite.`);
  }
  var input = fs.readFileSync(inputfile,'utf8');
  // skip = --skip or --s
  // lines = --lines or -n
  var output = input.split(/\n/).slice(skip,skip+lines).join('\n');
  fs.writeFileSync(outputfile);
});
```

## Recipes


### Sync 

```javascript
optant((argv,options) => {
  var result = ...
  return result;    // or throw to signal an error
});
```

### Old-Style Async

```javascript
optant( (argv,options) => new Promise(resolve,reject) {
  oldStyleAsyncFunction(..., (err,res) => {
    if (err) return reject(err);
    var result = ...
    resolve(result);  // or reject to signal an error
  })
});
```

### Promise

```javascript
optant( (argv,options) => {
  return promisefulFunction(...)
  .then(res=>{
    var result = ...
    return result; // or throw to signal an error
  })
});
```

### Async/Await
```javascript
optant( async (argv,options) => {
  var result = await asyncFunction(...);
  return result; // or throw to signal an error
});
```

## License

MIT License - Use this software as you please, as long as you include the license notice in any distributions.
