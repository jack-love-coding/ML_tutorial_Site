import assert from 'node:assert/strict'
import test from 'node:test'
import { referenceConclusion } from '../src/utils/referenceExamples.ts'

const copy = (zh: string, en: string) => ({ 'zh-CN': zh, en })
test('reference conclusions expose every keyed answer in either language', () => {
  const question = { id: 'example', prompt: copy('问题', 'Question'), explanation: copy('理由', 'Reason'), answer: ['b', 'a'], choices: [{ id: 'a', label: copy('训练集', 'Training set') }, { id: 'b', label: copy('验证集', 'Validation set') }] }
  assert.equal(referenceConclusion(question, 'zh-CN'), '验证集；训练集')
  assert.equal(referenceConclusion(question, 'en'), 'Validation set; Training set')
  assert.equal(referenceConclusion({ ...question, answer: 0.125 }, 'en'), '0.125')
})
