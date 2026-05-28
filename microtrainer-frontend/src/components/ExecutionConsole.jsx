import { Check, X, Loader, Terminal } from 'lucide-react';

function OutputBlock({ variant, label, children }) {
  const variantClass =
    variant === 'stderr'
      ? 'console-out-stderr'
      : variant === 'compile'
        ? 'console-out-compile'
        : 'console-out-stdout';

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
      )}
      <pre className={`console-output-block ${variantClass}`}>{children}</pre>
    </div>
  );
}

/**
 * Always-visible judge console (Run output + Submit results).
 */
export default function ExecutionConsole({ output, isRunning, sampleInput }) {
  const isRun =
    output?.mode === 'run' ||
    (output && 'stdout' in output && output.mode !== 'judge' && output.mode !== 'submit');
  const isJudge =
    output?.mode === 'judge' ||
    output?.mode === 'submit' ||
    (output?.results && !isRun);

  return (
    <div className="execution-console flex h-full min-h-0 flex-col border-t border-zinc-700 bg-zinc-950">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <Terminal className="h-4 w-4 text-sky-400" />
          Console
        </div>
        {isRunning && (
          <span className="flex items-center gap-2 text-xs font-medium text-amber-300">
            <Loader className="h-3 w-3 animate-spin" />
            Running…
          </span>
        )}
        {!isRunning && output?.allPassed && isJudge && (
          <span className="text-xs font-semibold text-emerald-400">✓ Accepted</span>
        )}
        {!isRunning && isJudge && output && !output.allPassed && output.totalTests > 0 && (
          <span className="text-xs font-semibold text-red-400">Wrong Answer</span>
        )}
        {!isRunning && isRun && output?.success && (
          <span className="text-xs font-semibold text-emerald-400">Finished</span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-zinc-200">
        {!output && !isRunning && (
          <p className="leading-relaxed text-zinc-400">
            Run your code to see output here. Sample testcase input:{' '}
            <code className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 font-mono text-sm text-sky-300">
              {sampleInput !== undefined && sampleInput !== null
                ? JSON.stringify(sampleInput)
                : '(none)'}
            </code>
          </p>
        )}

        {isRunning && !output && <p className="text-zinc-400">Executing…</p>}

        {output?.error && isJudge && (
          <OutputBlock variant="stderr" label="Error">
            {output.error}
          </OutputBlock>
        )}

        {isRun && output && (
          <div className="space-y-4">
            {output.input !== undefined && output.input !== null && (
              <p className="text-zinc-300">
                <span className="font-medium text-zinc-400">Input: </span>
                <span className="font-mono text-zinc-100">{JSON.stringify(output.input)}</span>
              </p>
            )}

            {output.success === false && (
              <OutputBlock variant="stderr" label="Runtime Error">
                {output.stderr || output.error || 'Execution failed'}
              </OutputBlock>
            )}

            <OutputBlock variant="stdout" label="stdout">
              {output.stdout !== undefined && output.stdout !== ''
                ? output.stdout
                : output.success !== false
                  ? '(empty)'
                  : ''}
            </OutputBlock>

            {output.stderr && output.success !== false && (
              <OutputBlock variant="stderr" label="stderr">
                {output.stderr}
              </OutputBlock>
            )}

            {output.compileOutput && (
              <OutputBlock variant="compile" label="compile">
                {output.compileOutput}
              </OutputBlock>
            )}

            {output.executionTime != null && (
              <p className="text-xs text-zinc-500">
                {output.executionTime}ms · exit code {output.exitCode ?? '?'}
                {output.executionMode ? ` · ${output.executionMode}` : ''}
              </p>
            )}
          </div>
        )}

        {isJudge && output && (
          <div className="space-y-4">
            <div
              className={`rounded-lg border p-4 ${
                output.allPassed
                  ? 'border-emerald-700 bg-emerald-950'
                  : output.totalTests > 0
                    ? 'border-red-700 bg-red-950'
                    : 'border-zinc-700 bg-zinc-900'
              }`}
            >
              <p className="text-xl font-bold text-zinc-50">
                {output.passedTests}/{output.totalTests} tests passed
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {output.allPassed
                  ? 'All test cases passed.'
                  : `${output.failedCount ?? 0} failed · Score ${(output.score ?? 0).toFixed(0)}%`}
              </p>
            </div>

            <div className="space-y-3">
              {output.results?.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    result.passed
                      ? 'border-emerald-800 bg-emerald-950'
                      : 'border-red-800 bg-red-950'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    {result.passed ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={`font-semibold ${result.passed ? 'text-emerald-300' : 'text-red-300'}`}
                    >
                      Test Case {index + 1}
                      {result.passed ? ' — Passed' : ' — Failed'}
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-sm text-zinc-100">
                    <p>
                      <span className="text-zinc-400">Input: </span>
                      {JSON.stringify(result.input)}
                    </p>
                    <p>
                      <span className="text-zinc-400">Expected: </span>
                      {JSON.stringify(result.expectedOutput)}
                    </p>
                    <p>
                      <span className="text-zinc-400">Got: </span>
                      <span className={result.passed ? 'text-emerald-300' : 'text-red-300'}>
                        {JSON.stringify(result.actualOutput)}
                      </span>
                    </p>
                    {result.stdout && (
                      <p>
                        <span className="text-zinc-400">stdout: </span>
                        <span className="text-emerald-200">{result.stdout}</span>
                      </p>
                    )}
                    {result.error && (
                      <pre className="console-output-block console-out-stderr mt-2">
                        {result.error}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
