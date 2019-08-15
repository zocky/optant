const optant = require('../optant.js');

if (process.argv.length > 2) {
  optant(([
    cmd
  ], {
    s = 0, skip = s,
    V = true, v = !V, verbose = v,
    code = 1,
    Q = false, q = !Q, silent = q
  }) => {
    switch (cmd) {
      case "fail": throw { message: "fail", code }
      case "skip": return skip;
      case "verbose": return verbose;
      case "silent": return silent;
      case "object": return {skip,code};
    }
  })
} else {
  const test = {};
  test.total = 0;
  test.passed = 0;

  test.getopt = function (args, argv = [], options = {}, bad = false) {
    test.total++;
    try {
      const res = optant.getopt(args);
      if (JSON.stringify(res) === JSON.stringify([argv, options, bad])) {
        test.passed++;
        console.log("[PASS] parse", args.join(" "), JSON.stringify(res[0]), JSON.stringify(res[1]))
      } else {
        console.error("[FAIL] parse", args.join(" "), JSON.stringify(res[0]), JSON.stringify(res[1]))
      }
    } catch (err) {
      console.error("[FAIL] parse", args.join(" "), String(err))
    }
  }

  const exec = require('child_process').exec;
  test.exec = function (args, stdout, stderr = "", code = 0) {
    test.total++;
    return new Promise((resolve, reject) => {
      try {
        exec(`/usr/bin/node ${__filename} ${args}`, function (_error, _stdout, _stderr) {
          const _code = _error ? _error.code : 0;
          if (_code === code && _stdout === stdout && _stderr === stderr) {
            test.passed++;
            console.log("[PASS] exec", args, JSON.stringify(_stdout), JSON.stringify(_stderr))
          } else {
            console.log("[FAIL] exec", args, JSON.stringify(_stdout), JSON.stringify(_stderr))
          }
          resolve();
        })
      } catch (error) {
        console.log("[FAIL] exec", args, String(error.message))
        resolve();
      }
    })
  }
  process.on('exit', (code) => {
    console.log("");
    if (!code && test.total == test.passed) {
      console.log(`[SUCCESS] ${test.passed}/${test.total} passed`)
    } else {
      console.error(`[FAILURE] ${test.passed}/${test.total} passed`);
    }
  });

  const runTests = async function () {
    test.getopt(["foo"], ["foo"], {})
    test.getopt(["foo", "bar"], ["foo", "bar"], {})
    test.getopt(["foo", "-a"], ["foo"], { a: true })
    test.getopt(["foo", "-a=bar"], ["foo"], { a: "bar" })
    test.getopt(["foo", "-a=10"], ["foo"], { a: 10 })
    test.getopt(["foo", "-abc"], ["foo"], { a: true, b: true, c: true })
    test.getopt(["foo", "--abc"], ["foo"], { abc: true })
    test.getopt(["foo", "--abc=def"], ["foo"], { abc: "def" })
    test.getopt(["foo", "--abc=10"], ["foo"], { abc: 10 })
    test.getopt(["foo", "--abc-de--fg"], ["foo"], { abcDeFg: true })
    test.getopt(["foo", "-abc=3"], ["foo"], {}, true)
    await test.exec("skip -s", "true")
    await test.exec("skip -skip", "true")
    await test.exec("skip -sa", "true")
    await test.exec("verbose", "false")
    await test.exec("verbose -v", "true")
    await test.exec("verbose -V", "false")
    await test.exec("verbose --verbose", "true")
    await test.exec("fail", "", "fail", 1)
    await test.exec("fail --code=2", "", "fail", 2)
    await test.exec("object", '{\n  \"skip\": 0,\n  \"code\": 1\n}')
    await test.exec("object --code=12", '{\n  \"skip\": 0,\n  \"code\": 12\n}')
    await test.exec("empty", "")
  }
  runTests();
}
