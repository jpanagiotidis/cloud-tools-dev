'use strict';

const npm = require('npm');
const _ = require('lodash');
const shell = require('shelljs');

let errorFlag = false;
const SEPERATOR = '================================';
const OK_MSG = 'EVERYTHING IS OK.'

function outdated() {
  return new Promise((resolve, reject) => {
    console.log('pwd', shell.exec('pwd').stdout);
    console.log('__dirname', __dirname);
    const npmOut = shell.exec('npm outdated --json=true --parseable=true --long=true');

    if (npmOut.stderr !== '') {
      reject(npmOut.stderr);
    }

    let count = 0;
    const modules = _.map(
      JSON.parse(npmOut.stdout !== '' ? npmOut.stdout : '{}'),
      (v, k) => {
        return `${++count}) NAME: ${k} \tINSTALLED: ${v.current} \tLATEST: ${v.latest}`;
      }
    )

    resolve(prepareString('OUTDATED MODULES REPORT', modules));
  });
}

function vulnurable() {
  return new Promise((resolve, reject) => {
    const npmOut = shell.exec('npm run security');

    if (npmOut.stderr !== '') {
      reject(npmOut.stderr);
    }

    const modules = JSON.parse(
      npmOut.stdout.split('\n')
      .filter((x) => (x.indexOf('>') !== 0 && x !== ''))
      .join('')
    ).map((x, i) => {
      return `${i + 1}) NAME: ${x.module} INSTALLER: ${x.version} SAFE: ${x.patched_versions}
TITLE: ${x.title}
DESCRIPTION: ${x.overview}
RECOMMENDATION: ${x.recommendation}
      `;
    });

    if (modules.length > 0) {
      errorFlag = true;
    }

    resolve(prepareString('VULNURABLE MODULES REPORT', modules));
  });
}

function prepareString(title, modules) {
  let out = [];
  out.push(`\n${SEPERATOR}`);
  out.push(title);
  out.push(SEPERATOR);
  if (modules.length === 0) {
    out.push(`\n${OK_MSG}\n`);
  }else{
    out.push(`\n${modules.join('\n')}\n`);
  }
  return out.join('\n');
}

let out = [];
outdated()
.then((x) => {
  out.push(x);
  return vulnurable();
})
.then((x) => {
  out.push(x);
  console.log(out.join(''));

  if (errorFlag) {
    console.log('A blocking error was detected in the modules. Please refer to the report.');
    process.exit(1);
  }
})
.catch((err) => {
  console.log('ERR', err);
})
