const readline = require('readline');

function createInterface() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

async function askYesNo(rl, question, defaultValue = true) {
  const suffix = defaultValue ? ' [Y/n] ' : ' [y/N] ';
  const answer = (await ask(rl, `${question}${suffix}`)).toLowerCase();
  if (!answer) return defaultValue;
  return answer === 'y' || answer === 'yes';
}

module.exports = { createInterface, ask, askYesNo };
