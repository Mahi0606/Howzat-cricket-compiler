import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compile } from '../src/index';
import { sampleMatch } from '../examples/sampleMatch';

const examplesDirectory = new URL('../examples/', import.meta.url);

function compileExample(filename: string) {
  return compile(readFileSync(new URL(filename, examplesDirectory), 'utf8'));
}

test('five-player example completes the compiler pipeline', () => {
  const result = compileExample('five-player-match.howzat');

  assert.equal(result.success, true, result.errors.map((error) => error.message).join('\n'));
  assert.ok(result.tokens?.length);
  assert.equal(result.ast?.name, 'India vs Australia — Practice Match');
  assert.ok(result.ir?.length);
  assert.ok(result.generatedCode?.includes('function summarize'));
  assert.ok(result.scorecard);
});

test('two-player all-out example compiles', () => {
  const result = compileExample('two-player-all-out.howzat');

  assert.equal(result.success, true, result.errors.map((error) => error.message).join('\n'));
  assert.equal(result.scorecard?.wickets, 1);
  assert.equal(result.scorecard?.completionReason, 'All out');
});

test('TypeScript sample example compiles', () => {
  const result = compile(sampleMatch);

  assert.equal(result.success, true, result.errors.map((error) => error.message).join('\n'));
  assert.ok(result.scorecard);
});

test('seven legal deliveries are rejected by cricket validation', () => {
  const result = compileExample('invalid-seven-legal-balls.howzat');

  assert.equal(result.success, false);
  assert.match(result.errors[0]?.message ?? '', /after its sixth legal ball/i);
  assert.equal(result.errors[0]?.phase, 'Cricket Rule');
});

test('an incomplete final over compiles', () => {
  const partialFinalOver = sampleMatch.replace('0 1 1 2 4 1', '0 1');
  const result = compile(partialFinalOver);

  assert.equal(result.success, true, result.errors.map((error) => error.message).join('\n'));
  assert.equal(result.scorecard?.legalBalls, 14);
});

test('an incomplete over cannot be followed by another over', () => {
  const incompleteEarlierOver = sampleMatch.replace('1 4 W . 6 wd 2', '1 4 .');
  const result = compile(incompleteEarlierOver);

  assert.equal(result.success, false);
  assert.match(result.errors[0]?.message ?? '', /must contain 6 legal balls/i);
  assert.equal(result.errors[0]?.phase, 'Cricket Rule');
});