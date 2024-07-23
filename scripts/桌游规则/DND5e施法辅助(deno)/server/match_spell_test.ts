import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts'
import { matchDices, parseDiceContent, parseScaleDiceContent } from './match_spell.ts'
import { replaceDices } from './match_spell.ts'

type MatchCase = {
  input: string
  lv: number
  expected: Array<{
    type: 'dice' | 'scale_dice'
    raw: string
    lenList: number[]
  }>
}

Deno.test('test replaceDices', () => {
  const raw =
    '当你使用2环或更高的法术位施放此法术时，你使用的法术位每比原本高一环，伤害便会再增加{@scaledice 2d6|1-9|1d6}。'
  const r = replaceDices(raw, 3)
  assertEquals(r.length - raw.length > 8, true)
})

Deno.test('match dices', () => {
  const allCases: MatchCase[] = [
    {
      input:
        '当你使用2环或更高的法术位施放此法术时，你使用的法术位每比原本高一环，伤害便会再增加{@scaledice 2d6|1-9|1d6}。',
      lv: 3,
      expected: [{ type: 'scale_dice', raw: '{@scaledice 2d6|1-9|1d6}', lenList: [4] }]
    },
    {
      input:
        '当你使用{@scaledice 2d6; 3d7 + 40|1-9|1d6}, {@dice 2d6; 3d7 + 40}2环或更高的法术位施放此法术时，你使用的法术位每比原本高一环，伤害便会再增加{@scaledice 2d6|1-9|1d6}。',
      lv: 3,
      expected: [
        { type: 'scale_dice', raw: '{@scaledice 2d6; 3d7 + 40|1-9|1d6}', lenList: [4, 6] },
        { type: 'dice', raw: '{@dice 2d6; 3d7 + 40}', lenList: [2, 4] },
        { type: 'scale_dice', raw: '{@scaledice 2d6|1-9|1d6}', lenList: [4] }
      ]
    }
  ]
  allCases.forEach((c) => {
    const r = matchDices(c.input, c.lv)
    assertEquals(r.dices.length, c.expected.length)
    assertEquals(
      JSON.stringify(r.dices.map((a) => ({ type: a.type, raw: a.raw, lenList: a.results.map((b) => b.length) }))),
      JSON.stringify(c.expected)
    )
  })
})

Deno.test('parse dice content', () => {
  const allCases: Array<{
    i: string
    e: number[][]
  }> = [
    { i: '2d6', e: [[6, 6]] },
    { i: '2d6 + 40', e: [[6, 6, 40]] },
    { i: '5d6 + 40', e: [[6, 6, 6, 6, 6, 40]] },
    {
      i: '4d2 ;5d6 + 40',
      e: [
        [2, 2, 2, 2],
        [6, 6, 6, 6, 6, 40]
      ]
    }
  ]
  allCases.forEach((c) => {
    const r = parseDiceContent(c.i)
    assertEquals(r.length, c.e.length)
    assertEquals(JSON.stringify(r.map((a) => a.map((b) => b.value))), JSON.stringify(c.e))
  })
})

Deno.test('parse scale dice content', () => {
  const allCases: Array<{
    i: string
    l: number
    e: number[][]
  }> = [
    { i: '2d6|1-9|1d4', l: 2, e: [[6, 6, 4]] },
    { i: '4d6|2,4,6,8|1d4', l: 4, e: [[6, 6, 6, 6, 4]] },
    { i: '2d6+40|1-9|1d4', l: 2, e: [[6, 6, 40, 4]] },
    {
      i: '2d6; 3d7 + 40|3-9|1d6',
      l: 3,
      e: [
        [6, 6],
        [7, 7, 7, 40]
      ]
    },
    {
      i: '3d7;4d6+40|2,4,6,8|2d3',
      l: 4,
      e: [
        [7, 7, 7, 3, 3],
        [6, 6, 6, 6, 40, 3, 3]
      ]
    }
  ]
  allCases.forEach((c) => {
    const r = parseScaleDiceContent(c.i, c.l)
    assertEquals(r.length, c.e.length)
    assertEquals(JSON.stringify(r.map((a) => a.map((b) => b.value))), JSON.stringify(c.e))
  })
})
