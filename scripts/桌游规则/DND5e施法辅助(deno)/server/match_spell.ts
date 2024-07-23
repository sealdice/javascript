export type DiceRaw = {
  type: 'dice' | 'const'
  value: number
}

type MatchedDice = {
  index: number
  type: 'dice' | 'scale_dice'
  raw: string
  results: DiceRaw[][]
}

type MatchedResult = {
  dices: Array<MatchedDice>
}

function rollDice(dice: DiceRaw): number {
  return dice.type === 'dice' ? Math.floor(Math.random() * dice.value) + 1 : dice.value
}

function rollMatchedDice(dice: MatchedDice): [number, number[]][] {
  return dice.results.map((group) => {
    const rolledGroup = group.map((d) => rollDice(d)); 
    const sum = rolledGroup.reduce((acc, curr) => acc + curr, 0); 
    return [sum, rolledGroup]; 
  });
}

export function parseDiceContent(c: string): DiceRaw[][] {
  const diceGroups = c.split(';').map((group) => group.trim())

  return diceGroups.map((group) => {
    const parts = group.split('+').map((part) => part.trim())
    const diceRaw: DiceRaw[] = []

    parts.forEach((part) => {
      if (part.includes('d')) {
        const [count, sides] = part.split('d').map(Number)
        for (let i = 0; i < count; i++) {
          diceRaw.push({ type: 'dice', value: sides })
        }
      } else {
        diceRaw.push({ type: 'const', value: Number(part) })
      }
    })

    return diceRaw
  })
}

export function parseScaleDiceContent(c: string, l: number): DiceRaw[][] {
  const [diceExpr, levelExpr, scaleDice] = c.split('|')

  // 解析主骰子表达式
  const mainDice = parseDiceContent(diceExpr)

  // 解析等级表达式
  let baseLevel: number
  let levelEach = 1
  if (levelExpr.includes('-')) {
    ;[baseLevel] = levelExpr.split('-').map(Number)
  } else {
    const levels = levelExpr.split(',').map(Number)
    baseLevel = levels[0]
    levelEach = levels[1] - levels[0]
  }

  // 计算额外骰子的数量
  const extraLevels = Math.floor(Math.max(0, l - baseLevel) / levelEach)
  // console.log({c, l, baseLevel, levelEach, extraLevels})

  // 解析缩放骰子
  const [scaleCount, scaleSides] = scaleDice.split('d').map(Number)
  const extraDice: DiceRaw[] = Array(scaleCount * extraLevels).fill({ type: 'dice', value: scaleSides })

  // 合并主骰子和额外骰子
  return mainDice.map((group) => [...group, ...extraDice])
}

export function matchDices(input: string, lv: number): MatchedResult {
  const diceRegex = /{@dice ([^}]+)}/g
  const scaleDiceRegex = /{@scaledice ([^}]+)}/g

  const dices: MatchedDice[] = []

  let match

  // 匹配普通骰子
  while ((match = diceRegex.exec(input)) !== null) {
    dices.push({
      type: 'dice',
      raw: match[0],
      index: match.index,
      results: parseDiceContent(match[1])
    })
  }

  // 匹配缩放骰子
  while ((match = scaleDiceRegex.exec(input)) !== null) {
    dices.push({
      type: 'scale_dice',
      raw: match[0],
      index: match.index,
      results: parseScaleDiceContent(match[1], lv)
    })
  }

  // 按照 index 排序
  dices.sort((a, b) => a.index - b.index)

  return { dices }
}

export function replaceDices(q: string, lv: number): string {
  const matchedResults = matchDices(q, lv)
  let final = q
  matchedResults.dices
    .sort((a, b) => b.index - a.index)
    .forEach((d) => {
      const rolled = rollMatchedDice(d)
      rolled.forEach(([sum, results]) => {
        const formattedResults = `[${results.join(', ')} = ${sum}]`
        final = final.slice(0, d.index) + d.raw + formattedResults + final.slice(d.index + d.raw.length)
      })
    })
  return final
}
