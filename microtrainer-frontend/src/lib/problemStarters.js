/** Client-side fallback starters (must define solution(input)). */
export const DEFAULT_STARTERS = {
  javascript: `// Implement solution(input) — testcase input is injected automatically
function solution(input) {
  // Your code here
  return null;
}`,
  python: `# Implement solution(input) — testcase input is injected automatically
def solution(input):
    # Your code here
    return None`,
  java: `// Implement solution(input) — testcase input is injected automatically
Object solution(Object input) {
    // Your code here
    return null;
}`,
};

export const PROBLEM_STARTERS = {
  'easy-num-1': {
    javascript: `function solution(input) {
  let num = parseInt(String(input).trim(), 10);
  let sum = 0;
  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  return sum;
}`,
    python: `def solution(input):
    num = int(str(input).strip())
    total = 0
    while num > 0:
        total += num % 10
        num //= 10
    return total`,
    java: `Object solution(Object input) {
    int num = Integer.parseInt(String.valueOf(input).trim());
    int sum = 0;
    while (num > 0) {
        sum += num % 10;
        num /= 10;
    }
    return sum;
}`,
  },
  'easy-num-2': {
    javascript: `function solution(input) {
  const s = String(input).trim();
  return parseInt(s.split('').reverse().join(''), 10);
}`,
    python: `def solution(input):
    s = str(input).strip()
    return int(s[::-1])`,
    java: `Object solution(Object input) {
    String s = String.valueOf(input).trim();
    StringBuilder rev = new StringBuilder(s).reverse();
    return Integer.parseInt(rev.toString());
}`,
  },
  'easy-num-3': {
    javascript: `function solution(input) {
  let n = parseInt(String(input).trim(), 10);
  let fact = 1;
  for (let i = 2; i <= n; i++) fact *= i;
  return fact;
}`,
    python: `def solution(input):
    n = int(str(input).strip())
    fact = 1
    for i in range(2, n + 1):
        fact *= i
    return fact`,
    java: `Object solution(Object input) {
    int n = Integer.parseInt(String.valueOf(input).trim());
    long fact = 1;
    for (int i = 2; i <= n; i++) fact *= i;
    return (int) fact;
}`,
  },
};

export function getStarterCode(language, problemId) {
  const lang = language === 'js' ? 'javascript' : language === 'py' ? 'python' : language;
  if (problemId && PROBLEM_STARTERS[problemId]?.[lang]) {
    return PROBLEM_STARTERS[problemId][lang];
  }
  return DEFAULT_STARTERS[lang] || DEFAULT_STARTERS.javascript;
}
