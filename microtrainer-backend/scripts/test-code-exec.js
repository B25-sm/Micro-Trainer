require('dotenv').config();
const { runCodeOnce, executeCode } = require('../services/codeExecutionService');

const code = `function solution(input) {
  let num = parseInt(String(input).trim(), 10);
  let sum = 0;
  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  return sum;
}`;

(async () => {
  const run = await runCodeOnce('javascript', code, 101, 3000);
  console.log('RUN:', JSON.stringify(run, null, 2));

  const judge = await executeCode(
    'javascript',
    code,
    [
      { input: 101, output: 2 },
      { input: 567, output: 18 },
    ],
    3000
  );
  console.log(
    'JUDGE:',
    `${judge.passedTests}/${judge.totalTests}`,
    'allPassed=',
    judge.allPassed,
    'mode=',
    judge.executionMode
  );
})();
