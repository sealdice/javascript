// ==UserScript==
// @name         龙蛋物语规则
// @author       NoahTie
// @version      1.0.0
// @description  龙蛋物语(りゅうたま)规则判定指令。.rtm 体质+敏捷 / .rtm STR AGI，支持难度与加值；并支持预设判定与武器命中/伤害。
// @timestamp    1789000000
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

/*
 *
 * 用法：
 *   .rtm                       显示帮助
 *   .rtm help                  显示帮助
 *   .rtm set 8 6 6 4           快速设置 体力/敏捷/智力/精神（自动计算 HP/MP）
 *   .rtm set 体力 8 敏捷 6 …   也可按 名称 数值 成对设置
 *   .rtm 体质+敏捷             进行 体力+敏捷 判定（不指定难度则只显示骰值）
 *   .rtm 体质 敏捷             也可以分开空格书写
 *   .rtm STR DEX               英文缩写同样支持
 *   .rtm 体质+敏捷 10          指定难度=10
 *   .rtm 体力+敏捷 难          使用难度关键词（见下方 DIFFICULTY）
 *   .rtm 体力+敏捷 难+2        难度关键词并带 +2 加值
 *   .rtm 运动 10               预设判定：进行难度 10 的 体力+敏捷 判定（运动）
 *   .rtm 武器 短剑             设置/查看当前武器（短剑/长剑/长枪/斧子/弓箭/空手）
 *   .rtm 命中 10               使用当前武器进行命中判定（难度 10，可省略）
 *   .rtm 伤害                  使用当前武器进行伤害掷骰
 * 属性名同时支持：体力(STR/体质/体)、敏捷(DEX/敏)、智力(INT/智)、精神(SPI/精)。
 */

// ===================== 可配置区域 =====================

// 难度关键词 → 难度数值。以下为【示例值】，请按你的团规自行调整。
// 说明：龙蛋物语的判定难度由 GM 自由决定，通常与骰子的总面数/能力值相关。
const DIFFICULTY = {
  易: 4, 简单: 4, easy: 4,
  较难: 7, 比较困难: 7, shard: 7,
  难: 9, 困难: 9, hard: 9,
  极难: 12, 相当困难: 12, vhard: 12,
  不可能: 16, 一般人不可能成功: 16, impossible: 16,
  奇迹: 20, 几乎是奇迹一般的成功: 20, miracle: 20
};

// 四种能力及其所有别名（不区分大小写）。若你的角色卡用了别的叫法，在此追加即可。
const ABILITIES = [
  { key: '体力', names: ['体力', '体', 'STR', 'str',
                         '体质',       'STA', 'sta'] },
  { key: '敏捷', names: ['敏捷', '敏', 'AGI', 'agi',
                                     'DEX', 'dex'] },
  { key: '智力', names: ['智力', '智', 'INT', 'int'] },
  { key: '精神', names: ['精神', '精', 'SPI', 'spi'] },
];

// 预设判定类型（规则书中的“技术/判定”）。通过名称即可快速判定，例如 .rtm 运动 10。
// abilities 为参与判定的能力（可重复，如 力气=体力+体力）；mod 为额外的判定加值（可选）。
// 数值均取自《龙蛋物语》规则书的判定表，可按你的团规增删。
const PRESET_CHECKS = [
  { key: '移动', names: ['移动', 'move', 'MOV', '移動'],             abilities: ['体力', '敏捷'] },
  { key: '方向', names: ['方向', 'dir', 'direction', '方向判定'],     abilities: ['智力', '敏捷'] },
  { key: '野营', names: ['野营', 'camp', '野営'],                     abilities: ['敏捷', '智力'] },
  { key: '状态', names: ['状态', 'status', '狀態', '状态判定'],       abilities: ['体力', '精神'] },
  { key: '交涉', names: ['交涉', 'nego', 'negotiate', '交涉判定'],    abilities: ['智力', '精神'] },
  { key: '运动', names: ['运动', 'exercise', 'EXE', '運動'],         abilities: ['体力', '敏捷'] },
  { key: '观察', names: ['观察', '侦察', 'observe', '観察'],         abilities: ['智力', '敏捷'] },
  { key: '知识', names: ['知识', 'knowledge', '知識'],               abilities: ['智力', '精神'] },
  { key: '回避', names: ['回避', '闪避', 'evade', '回避判定'],       abilities: ['敏捷', '敏捷'] },
  { key: '力气', names: ['力气', '蛮力', '力量', 'str', '力'],        abilities: ['体力', '体力'] },
  { key: '听力', names: ['听力', '聆听', 'listen', '聴力'],           abilities: ['智力', '精神'] },
  { key: '游泳', names: ['游泳', 'swim', '泳ぐ'],                    abilities: ['体力', '敏捷'] },
  { key: '攀登', names: ['攀登', '攀爬', 'climb', '登る'],            abilities: ['体力', '敏捷'] },
  { key: '治疗', names: ['治疗', 'heal', '治療'],                    abilities: ['智力', '精神'] },
];

// 武器种类（规则书“选择擅长武器”）。每个武器的 hit 为命中判定所用能力，dmg 为伤害掷骰所用能力（骰子面数=该能力值）。
// hitMod / dmgMod 为规则书标注的命中/伤害修正值。
const WEAPONS = {
  '短剑': { names: ['短剑', '短刀', '匕首', '小剑', 'shortsword', 'ss', '短剣'], hit: ['敏捷', '智力'], hitMod: +1, dmg: '智力', dmgMod: 0 },
  '长剑': { names: ['长剑', '刀',    '细剑', '宽剑', 'longsword', 'ls', '長剣'], hit: ['敏捷', '体力'], hitMod: +1, dmg: '体力', dmgMod: 0 },
  '长枪': { names: ['长枪', '长戟', '长矛', 'spear', 'sp', '長槍'],             hit: ['敏捷', '体力'], hitMod: 0,  dmg: '体力', dmgMod: +1 },
  '斧子': { names: ['斧子', '斧',    '战斧', '巨斧', 'axe', 'ax'],             hit: ['体力', '体力'], hitMod: -1, dmg: '体力', dmgMod: 0 },
  '弓箭': { names: ['弓箭', '弓',    '短弓', '长弓', '十字弓', 'bow', 'b'],     hit: ['智力', '敏捷'], hitMod: -2, dmg: '敏捷', dmgMod: 0 },
  '空手': { names: ['空手', '徒手', '拳', 'fist', 'unarmed'],                  hit: ['敏捷', '体力'], hitMod: 0,  dmg: '体力', dmgMod: -2 },
};
const WEAPON_VAR = 'rtm_weapon'; // 角色卡上保存当前武器的变量名

// ===================== 以下一般无需改动 =====================

let ext = seal.ext.find('ryutama');
if (!ext) {
  ext = seal.ext.new('ryutama', 'NoahTie', '1.0.0');
  seal.ext.register(ext);
}

// 工具：转义正则特殊字符
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 工具：把修正值格式化为 +1 / -2 / '' （0 视为无修正）
function fmtMod(m) {
  if (!m) return '';
  return (m > 0 ? '+' : '') + m;
}

// 根据别名解析能力分组；找不到返回 null
function resolveAbility(token) {
  if (!token) return null;
  const t = String(token).trim().toLowerCase();
  for (const g of ABILITIES) {
    for (const name of g.names) {
      if (name.toLowerCase() === t) return g;
    }
  }
  return null;
}

// 根据别名解析预设判定；找不到返回 null
function resolvePreset(token) {
  if (!token) return null;
  const t = String(token).trim().toLowerCase();
  for (const p of PRESET_CHECKS) {
    for (const name of p.names) {
      if (name.toLowerCase() === t) return p;
    }
  }
  return null;
}

// 根据别名解析武器；找不到返回 null
function findWeapon(token) {
  if (!token) return null;
  const t = String(token).trim().toLowerCase();
  for (const [name, w] of Object.entries(WEAPONS)) {
    for (const n of w.names) {
      if (n.toLowerCase() === t) return { name, ...w };
    }
  }
  return null;
}

// 读取当前装备武器（含名称）；未装备返回 null
function getWeapon(ctx) {
  const [name] = seal.vars.strGet(ctx, WEAPON_VAR);
  if (!name) return null;
  const data = WEAPONS[name];
  if (!data) return null;
  return { name, ...data };
}

// 从角色卡读取某能力的数值；返回 { name, value } 或 null
function getAbilityValue(ctx, group) {
  for (const name of group.names) {
    const [v, ok] = seal.vars.intGet(ctx, name);
    if (ok && v >= 1) return { name, value: v };
  }
  return null;
}

// 解析 难度 token，返回 { difficulty, bonus, label } 或 null
function parseDifficulty(token) {
  if (!token) return null;
  // 纯数字，可带加值：10 / 10+2 / 10-1
  const m = String(token).match(/^(\d+)([+-]\d+)?$/);
  if (m) {
    return { difficulty: parseInt(m[1], 10), bonus: m[2] ? parseInt(m[2], 10) : 0, label: m[1] + (m[2] || '') };
  }
  // 难度关键词，可带加值：难 / 难+2 / hard / normal-1
  for (const kw of Object.keys(DIFFICULTY)) {
    const re = new RegExp('^' + escapeRegex(kw) + '([+-]\\d+)?$', 'i');
    const mm = String(token).match(re);
    if (mm) {
      return { difficulty: DIFFICULTY[kw], bonus: mm[1] ? parseInt(mm[1], 10) : 0, label: kw + (mm[1] || '') };
    }
  }
  return null;
}

// 解析独立的调整值 token（如 +2 / -3），返回数值或 null
function parseAdjustment(token) {
  if (!token) return null;
  const m = String(token).match(/^[+-]\d+$/);
  return m ? parseInt(m[0], 10) : null;
}

// 判定大成功/大失败（仅对恰好两骰有效）。rolls 与 sides 一一对应：
//   大成功：两个骰子都掷出各自的最大值（如 d6 的 6+6、d8 的 8+8）
//   大失败：两个骰子都掷出 1（1+1）
// 返回 'success' / 'fail' / null
function detectCritical(rolls, sides) {
  if (!rolls || rolls.length !== 2) return null;
  const bothMax = rolls[0] === sides[0] && rolls[1] === sides[1];
  const bothSix = rolls[0] === 6 && rolls[1] === 6;
  const bothOne = rolls[0] === 1 && rolls[1] === 1;
  if (bothMax || bothSix) return 'success';
  if (bothOne) return 'fail';
  return null;
}

function getPlayerName(ctx) {
  try {
    const n = seal.format(ctx, '{$t玩家}');
    if (n) return n;
  } catch (e) {}
  return (ctx.player && ctx.player.name) || '旅人';
}

// 进行一次判定，返回 { ok, text }；ok=false 时 text 为错误信息
// attrTokens 中的纯数字/难度关键词会被当作难度，其余解析为能力（可重复，如 体力+体力）
function doJudge(ctx, attrTokens) {
  const playerName = getPlayerName(ctx);

  // 拆分出 难度（数字 / 难度关键词）、独立的调整值（末尾的 +x / -x），其余作为属性
  let diffInfo = null;
  let rollAdj = 0;
  const abilityTokens = [];
  for (const t of attrTokens) {
    const d = parseDifficulty(t);
    if (d) { diffInfo = d; continue; }
    const adj = parseAdjustment(t);
    if (adj !== null) { rollAdj += adj; continue; }
    abilityTokens.push(t);
  }

  // 把每个 token 按 + / / 、 ， , 空格 进一步拆成单个能力
  const groupsOrder = [];
  const unknown = [];
  for (const t of abilityTokens) {
    const pieces = String(t).split(/[+\/、，,\s]/).map((s) => s.trim()).filter(Boolean);
    for (const p of pieces) {
      const g = resolveAbility(p);
      if (g) groupsOrder.push(g);
      else unknown.push(p);
    }
  }

  if (unknown.length > 0) {
    return {
      ok: false,
      text:
        `无法识别的属性：${unknown.join('、')}\n` +
        `支持：体力(STR/体质) / 敏捷(AGI) / 智力(INT) / 精神(SPI)\n` +
        `可先用 .rtm set 8 6 6 4 设置角色卡。`,
    };
  }
  if (groupsOrder.length === 0) {
    return { ok: false, text: '至少需要指定一个属性，例如：.rtm 体质+敏捷 10' };
  }

  // 每个能力各投一颗骰子（不强行去重，以支持 体力+体力 这类组合判定）
  const groups = groupsOrder;

  // 读取数值并投骰
  const dieLines = [];
  const missing = [];
  let total = 0;
  const rollResults = [];
  const sidesArr = [];

  for (const g of groups) {
    const av = getAbilityValue(ctx, g);
    if (!av) {
      missing.push(g.key);
      continue;
    }
    const sides = Math.max(1, av.value);
    const roll = parseInt(String(seal.format(ctx, '{1d' + sides + '}')), 10);
    total += roll;
    rollResults.push(roll);
    sidesArr.push(sides);
    dieLines.push(`${g.key}(${av.value}) → d${sides} = ${roll}`);
  }
  if (missing.length) return { ok: false, text: missingText(missing) };

  // 大成功/大失败：仅当恰好两骰时判定
  const critical = detectCritical(rollResults, sidesArr);

  // 拼装结果文本
  let text = `[龙蛋物语·判定] ${playerName}\n`;
  text += dieLines.join('\n') + '\n';
  // 判定値 行：骰值 + 末尾调整值(调整) = 最终值
  let judgeLine = `判定値 = ${rollResults.join(' + ')}`;
  if (rollAdj !== 0) {
    judgeLine += ` ${rollAdj >= 0 ? '+' : '-'} ${Math.abs(rollAdj)}（调整）`;
  }
  judgeLine += ` = ${total + diffInfo.bonus + rollAdj}`;
  text += judgeLine + '\n';

  if (diffInfo) {
    const finalVal = total + diffInfo.bonus + rollAdj;
    let success;
    let resultText;
    if (critical === 'success') { success = true; resultText = '大成功！'; }
    else if (critical === 'fail') { success = false; resultText = '大失败…'; }
    else { success = finalVal >= diffInfo.difficulty; resultText = success ? '成功！' : '失败'; }
    if (diffInfo.bonus !== 0) {
      text += `（难度加值 ${diffInfo.bonus >= 0 ? '+' : ''}${diffInfo.bonus}）\n`;
    }
    text += `难度: ${diffInfo.label}\n`;
    text += `结果: ${resultText}\n`;
  } else {
    if (critical === 'success') text += '大成功！\n';
    else if (critical === 'fail') text += '大失败…）\n';
    else text += `（未指定难度，请附加难度，如 .rtm ${attrTokens.join(' ')} 10）\n`;
  }
  return { ok: true, text };
}

function missingText(missing) {
  return (
    `未找到能力值：${missing.join('、')}\n` +
    `请先用 .st 或 .rtm set 设置，例如：.st 体力:8 敏捷:6 智力:6 精神:4\n` +
    `（龙蛋物语能力值范围为 4 / 6 / 8 / 10 / 12）`
  );
}

// 设置角色卡
function doSet(ctx, msg, setTokens) {
  const playerName = getPlayerName(ctx);
  if (setTokens.length === 0) {
    const lines = ABILITIES.map((g) => {
      const av = getAbilityValue(ctx, g);
      return `${g.key}: ${av ? av.value : '未设置'}`;
    });
    const [hp] = seal.vars.intGet(ctx, '生命点数');
    const [mp] = seal.vars.intGet(ctx, '精力点数');
    lines.push(`生命点数(HP): ${hp || '未设置'}（体力×2）`);
    lines.push(`精力点数(MP): ${mp || '未设置'}（精神×2）`);
    seal.replyToSender(ctx, msg, `[龙蛋物语·人物卡] ${playerName}\n` + lines.join('\n'));
    return;
  }

  const isAllNum = setTokens.every((t) => /^\d+$/.test(String(t)));
  const values = {};
  if (isAllNum) {
    if (setTokens.length < 4) {
      seal.replyToSender(ctx, msg, '需要 4 个数值（体力 敏捷 智力 精神），例如：.rtm set 8 6 6 4');
      return;
    }
    const order = ['体力', '敏捷', '智力', '精神'];
    for (let i = 0; i < 4; i++) values[order[i]] = parseInt(setTokens[i], 10);
  } else {
    for (let i = 0; i + 1 < setTokens.length; i += 2) {
      const g = resolveAbility(setTokens[i]);
      const v = parseInt(setTokens[i + 1], 10);
      if (g && !isNaN(v)) values[g.key] = v;
    }
  }

  if (Object.keys(values).length === 0) {
    seal.replyToSender(ctx, msg, '设置失败：用法 .rtm set 8 6 6 4 或 .rtm set 体力 8 敏捷 6 智力 6 精神 4');
    return;
  }

  for (const [k, v] of Object.entries(values)) {
    seal.vars.intSet(ctx, k, v);
  }

  let extra = '';
  if (values['体力'] !== undefined) {
    const hp = values['体力'] * 2;
    seal.vars.intSet(ctx, '生命点数', hp);
    extra += ` 生命点数=${hp}(体力×2)`;
  }
  if (values['精神'] !== undefined) {
    const mp = values['精神'] * 2;
    seal.vars.intSet(ctx, '精力点数', mp);
    extra += ` 精力点数=${mp}(精神×2)`;
  }

  const summary = Object.entries(values).map(([k, v]) => `${k}:${v}`).join(' ');
  seal.replyToSender(
    ctx,
    msg,
    `已设置角色卡：${summary}${extra}\n（也可直接使用海豹原生 .st 命令设置属性）`
  );
}

// 设置/查看当前武器
function doWeaponSet(ctx, msg, token) {
  if (!token) {
    const w = getWeapon(ctx);
    seal.replyToSender(ctx, msg, w ? `当前武器：${w.name}` : '尚未装备武器。用法：.rtm 武器 短剑/长剑/长枪/斧子/弓箭/空手');
    return;
  }
  const w = findWeapon(token);
  if (!w) {
    seal.replyToSender(ctx, msg, '未知武器。可选：短剑 / 长剑 / 长枪 / 斧子 / 弓箭 / 空手');
    return;
  }
  seal.vars.strSet(ctx, WEAPON_VAR, w.name);
  seal.replyToSender(
    ctx,
    msg,
    `已装备武器：${w.name}\n` +
    `命中[${w.hit.join('+')}]${fmtMod(w.hitMod)}　伤害[${w.dmg}]${fmtMod(w.dmgMod)}`
  );
}

// 武器命中判定
function doWeaponHit(ctx, msg, extraTokens) {
  const playerName = getPlayerName(ctx);
  const w = getWeapon(ctx);
  if (!w) {
    seal.replyToSender(ctx, msg, '尚未装备武器，请先用 .rtm 武器 短剑 设置武器。');
    return;
  }

  const dieLines = [];
  const missing = [];
  let total = 0;
  const rollResults = [];
  const sidesArr = [];
  for (const a of w.hit) {
    const g = resolveAbility(a);
    const av = g ? getAbilityValue(ctx, g) : null;
    if (!av) { missing.push(a); continue; }
    const sides = Math.max(1, av.value);
    const roll = parseInt(String(seal.format(ctx, '{1d' + sides + '}')), 10);
    total += roll;
    rollResults.push(roll);
    sidesArr.push(sides);
    dieLines.push(`${a}(${av.value}) → d${sides} = ${roll}`);
  }
  if (missing.length) { seal.replyToSender(ctx, msg, missingText(missing)); return; }

  const mod = w.hitMod || 0;
  // 大成功/大失败：仅当恰好两骰时判定
  const critical = detectCritical(rollResults, sidesArr);
  // 解析难度与独立调整值（支持 .rtm 命中 10 +2）
  let dcInfo = null;
  let rollAdj = 0;
  for (const t of (extraTokens || [])) {
    const d = parseDifficulty(t);
    if (d) { dcInfo = d; continue; }
    const adj = parseAdjustment(t);
    if (adj !== null) { rollAdj += adj; continue; }
  }
  const finalVal = total + mod + rollAdj + (dcInfo ? dcInfo.bonus : 0);

  let text = `[龙蛋物语·武器命中] ${playerName}\n`;
  text += `武器：${w.name}\n`;
  text += dieLines.join('\n') + '\n';
  // 命中判定値 行：骰值 + 武器修正 + 末尾调整值(调整) = 最终值
  let hitLine = `命中判定値 = ${rollResults.join(' + ')}${fmtMod(mod)}`;
  if (rollAdj !== 0) {
    hitLine += ` ${rollAdj >= 0 ? '+' : '-'} ${Math.abs(rollAdj)}（调整）`;
  }
  hitLine += ` = ${finalVal}`;
  text += hitLine + '\n';

  if (dcInfo) {
    let resultText;
    if (critical === 'success') resultText = '大成功！';
    else if (critical === 'fail') resultText = '大失败…';
    else resultText = finalVal >= dcInfo.difficulty ? '成功！' : '失败';
    if (dcInfo.bonus !== 0) {
      text += `（难度加值 ${dcInfo.bonus >= 0 ? '+' : ''}${dcInfo.bonus}）\n`;
    }
    text += `难度: ${dcInfo.label}\n`;
    text += `结果: ${resultText}\n`;
  } else {
    if (critical === 'success') text += '大成功！（两个骰子均为最大值）\n';
    else if (critical === 'fail') text += '大失败…（两个骰子均为 1）\n';
    else text += `（未指定难度，请附加难度，如 .rtm 命中 10）\n`;
  }
  seal.replyToSender(ctx, msg, text);
}

// 武器伤害掷骰
function doWeaponDamage(ctx, msg) {
  const playerName = getPlayerName(ctx);
  const w = getWeapon(ctx);
  if (!w) {
    seal.replyToSender(ctx, msg, '尚未装备武器，请先用 .rtm 武器 短剑 设置武器。');
    return;
  }
  const g = resolveAbility(w.dmg);
  const av = g ? getAbilityValue(ctx, g) : null;
  if (!av) { seal.replyToSender(ctx, msg, missingText([w.dmg])); return; }

  const sides = Math.max(1, av.value);
  const roll = parseInt(String(seal.format(ctx, '{1d' + sides + '}')), 10);
  const mod = w.dmgMod || 0;
  const total = roll + mod;

  let text = `[龙蛋物语·武器伤害] ${playerName}\n`;
  text += `武器：${w.name}\n`;
  text += `伤害[${w.dmg}] → d${sides} = ${roll}${fmtMod(mod)} = ${total}\n`;
  text += `（造成伤害 ${total} 点）\n`;
  seal.replyToSender(ctx, msg, text);
}

// ===================== 指令主体 =====================

const cmdRtm = seal.ext.newCmdItemInfo();
cmdRtm.name = 'rtm';
cmdRtm.help =
  '龙蛋物语(Ryuutama)规则掷骰\n' +
  '.rtm                       显示本帮助\n' +
  '.rtm set 8 6 6 4           快速设置 体力/敏捷/智力/精神\n' +
  '.rtm 体质 敏捷             进行 体力+敏捷 判定（不指定难度只显示骰值）\n' +
  '.rtm STR DEX               英文缩写同样支持\n' +
  '.rtm 体 敏 10              指定难度=10\n' +
  '.rtm 体力 敏捷 难          使用难度关键词(易4/较难7/难9/极难12/不可能16/奇迹20)\n' +
  '.rtm 运动 10               规则书中的预设判定\n' +
  '.rtm 运动 10 +2            调整值以 +x/-x 写在末尾\n' +
  '.rtm 体力+敏捷             两骰都为最大值=大成功，都为1=大失败\n' +
  '.rtm 武器 短剑             设置/查看武器\n' +
  '.rtm 命中 10               用当前武器进行命中判定\n' +
  '.rtm 伤害                  用当前武器进行伤害掷骰\n' +
  '属性别名：体力(STR/体) 敏捷(AGI/敏) 智力(INT/智) 精神(SPI/精)';

cmdRtm.solve = (ctx, msg, cmdArgs) => {
  const ret = seal.ext.newCmdExecuteResult(true);

  // 收集参数（跳过命令名本身）
  const rawTokens = [];
  for (let i = 1; i <= 30; i++) {
    const a = cmdArgs.getArgN(i);
    if (a === undefined || a === '') break;
    rawTokens.push(String(a).trim());
  }

  const head = (rawTokens[0] || '').toLowerCase();

  if (rawTokens.length === 0 || head === 'help') {
    ret.showHelp = true;
    return ret;
  }

  if (head === 'set') {
    doSet(ctx, msg, rawTokens.slice(1));
    return ret;
  }

  // 武器设置：.rtm 武器 短剑 / .rtm weapon ss / .rtm wp
  if (head === '武器' || head === 'weapon' || head === 'wp') {
    doWeaponSet(ctx, msg, rawTokens.slice(1).join(' '));
    return ret;
  }

  // 武器命中：.rtm 命中 [难度] [+x/-x] / .rtm hit 10 +2
  if (head === '命中' || head === 'hit') {
    doWeaponHit(ctx, msg, rawTokens.slice(1));
    return ret;
  }

  // 武器伤害：.rtm 伤害 / .rtm dmg
  if (head === '伤害' || head === 'dmg' || head === 'damage') {
    doWeaponDamage(ctx, msg);
    return ret;
  }

  // 预设判定：.rtm 运动 10 / .rtm observe
  const preset = resolvePreset(head);
  if (preset) {
    const r = doJudge(ctx, [...preset.abilities, ...rawTokens.slice(1)]);
    seal.replyToSender(ctx, msg, r.text);
    return ret;
  }

  // 通用判定：.rtm 体质+敏捷 10 / .rtm STR AGI 10
  const r = doJudge(ctx, rawTokens);
  seal.replyToSender(ctx, msg, r.text);
  return ret;
};

ext.cmdMap['rtm'] = cmdRtm;
ext.cmdMap['龙蛋'] = cmdRtm;
ext.cmdMap['ryutama'] = cmdRtm;
