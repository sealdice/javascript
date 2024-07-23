// ==UserScript==
// @name         DnDSpellScript-SRD
// @author       小嘟嘟噜、冷筱华
// @version      1.0.3
// @description  DnDSRD法术脚本
// @timestamp    2024-07-22
// @license      AGPL-3.0
// @homepageURL  https://github.com/shakugannosaints/sealbot_adds/tree/main/js
// ==/UserScript==
// 使用说明：请将本脚本放入海豹的js拓展文件夹，重载脚本，然后使用deno运行server并不要关闭其弹出的对话框
const API_URL = 'http://localhost:8080';

if (!seal.ext.find('dnd_spell')) {
  const ext = seal.ext.new('dnd_spell', '小嘟嘟噜', '1.0.3');

  const cmdCastSpell = seal.ext.newCmdItemInfo();
  cmdCastSpell.name = 'cs';
  cmdCastSpell.help = '用法：.cs 法术名 [环数]';
  cmdCastSpell.solve = async (ctx, msg, cmdArgs) => {
    try {
      const args = cmdArgs.rawArgs.split(' ');
      if (args.length < 1) {
        return seal.replyToSender(ctx, msg, '请指定法术名称');
      }
      
      const spellName = args[0];
      const level = parseInt(args[1]) || 3;

      // 从 HTTP 服务器获取法术信息
      const response = await fetch(`${API_URL}/api/get_spell?name=${encodeURIComponent(spellName)}`);
      if (!response.ok) {
        throw new Error('无法获取法术信息');
      }
      const spellData = await response.json();

      if (!spellData.damage || !spellData.damage.damage_at_slot_level) {
        return seal.replyToSender(ctx, msg, '该法术没有伤害信息');
      }

      // 获取对应环数的伤害骰子
      let damageDiceStr = spellData.damage.damage_at_slot_level[level.toString()];
      if (!damageDiceStr) {
        return seal.replyToSender(ctx, msg, `没有${level}环的伤害信息`);
}

      // 解析伤害骰子（例如："8d6" 或 "20d6 + 20d6"）
      const damageParts = damageDiceStr.split(' + ');
      const damageTotals = [];
      const allDamageResults = [];

      for (const part of damageParts) {
       const [diceCount, diceSides] = part.split('d').map(Number);
       const damage = Array(diceCount).fill(0).map(() => Math.floor(Math.random() * diceSides) + 1);
       const totalDamage = damage.reduce((a, b) => a + b, 0);
       damageTotals.push(totalDamage);
       allDamageResults.push(damage);
}

      const totalDamage = damageTotals.reduce((a, b) => a + b, 0);
      const finalDamageString = damageParts.map((part, index) => {
        const damageResult = allDamageResults[index];
       return `${part}=${damageTotals[index]} (${damageResult.join('+')})`;
      }).join(' + ');

      // 构造返回消息
      const playerName = ctx.player.name || '玩家';
      const final = `${playerName}>为${level}环${spellData.name}骰伤害，结果为${finalDamageString} = ${totalDamage}`;
      seal.replyToSender(ctx, msg, final);
     } catch (error) {
      seal.replyToSender(ctx, msg, '发生错误：' + error.message);
    }

    return seal.ext.newCmdExecuteResult(true);
  };

  seal.ext.register(ext);
  ext.cmdMap['cs'] = cmdCastSpell;
}
