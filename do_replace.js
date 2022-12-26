const fs = require('fs')
const child_process = require('child_process')

solve = (fn) => {
  child_process.exec(`npx prettier --write ${fn}`, (err, stdout, stderr) => {
    console.log(stdout);

    const data = fs.readFileSync(fn);
    let finalData = data.toString();
    finalData = finalData.replace(`Object.defineProperty(exports, '__esModule', { value: true });`, '');
    finalData = finalData.replace("'use strict';\n", '');
    fs.writeFileSync(fn, finalData);
  });
}

for (let i of fs.readdirSync('./examples_ts')) {
  if (i.endsWith('.ts') && (!i.endsWith('.d.ts'))) {
    const jsFn = i.slice(0, i.length - 3) + '.js';
    const fn = `./examples/${jsFn}`;
    solve(fn);
  }
}
