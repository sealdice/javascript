import { replaceDices } from './match_spell.ts'
export type Spell = {
  name: string
  level: number
  entries: string[]
  entriesHigherLevel?: {
    type: string
    name: string
    ENG_name: string
    entries: string[]
  }[]
  ENG_name: string
}

export const SPELL_DATA: { spell: Spell[] } = JSON.parse(Deno.readTextFileSync('./data/spells-phb.json'))
export function findMostSimilarSpell(input: string, spells: Spell[]): Spell | null {
  if (spells.length === 0) return null

  function levenshteinDistance(a: string, b: string): number {
    const matrix = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[b.length][a.length]
  }

  let mostSimilar = spells[0]
  let smallestDistance = levenshteinDistance(input.toLowerCase(), mostSimilar.name.toLowerCase())

  for (let i = 1; i < spells.length; i++) {
    const distance = levenshteinDistance(input.toLowerCase(), spells[i].name.toLowerCase())
    if (distance < smallestDistance) {
      smallestDistance = distance
      mostSimilar = spells[i]
    }
  }

  return mostSimilar
}

export type UseSpellArgs = {
  spell: string
  level: number
  user: string
}

export type UseSpellResponse = {
  success: boolean
  message: string
  dices?: Array<{
    raw: string
    results: number[]
    sum: number
  }>
  fullMessage?: string
}

export function useSpell(args: UseSpellArgs): UseSpellResponse {
  if (!args.spell || !args.user) {
    return { success: false, message: '法术查询缺少参数' }
  }
  if (args.level === undefined) {
    args.level = 3
  }
  const spell = SPELL_DATA.spell.find((s: Spell) => s.name === args.spell || s.ENG_name === args.spell)

  if (!spell) {
    const perhapsSpell = findMostSimilarSpell(args.spell, SPELL_DATA.spell)
    if (perhapsSpell)
      return {
        success: false,
        message: `法术名未找到，但找到了类似的法术：${perhapsSpell.name}`
      }
    return { success: false, message: '法术名未找到' }
  }

  if (args.level < spell.level) {
    return { success: false, message: `${spell.name} 最低要 ${spell.level} 环，${args.level} 环无法施放` }
  }

  if (args.level == spell.level || spell.entriesHigherLevel === undefined) {
    return {
      success: true,
      message: `${args.user} 施放了 ${spell.name}\n${replaceDices(spell.entries.join(''), spell.level)}`
    }
  }
  return {
    success: true,
    message: `${args.user} 施放了 ${spell.name}\n${replaceDices(spell.entries.join(''), spell.level)}\n${replaceDices(
      spell.entriesHigherLevel[0].entries.join(''),
      args.level
    )}`
  }
}
