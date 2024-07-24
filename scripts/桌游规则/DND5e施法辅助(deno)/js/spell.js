// ==UserScript==
// @name         DnDSpellScript
// @author       MMMartt、冷筱华
// @version      1.0.4
// @description  DnDSRD法术脚本
// @timestamp    2024-07-24
// @license      AGPL-3.0
// @homepageURL  https://github.com/shakugannosaints/sealbot_adds/tree/main/js
// ==/UserScript==
// 使用说明：请将本脚本放入海豹的js拓展文件夹，重载脚本，然后使用deno运行server并不要关闭其弹出的对话框
const API_URL = 'http://localhost:8080'

if (!seal.ext.find('dnd_spell')) {
  const ext = seal.ext.new('dnd_spell', 'MMMartt、冷筱华', '1.0.4')

  const cmdCastSpell = seal.ext.newCmdItemInfo()
  cmdCastSpell.name = 'cs'
  cmdCastSpell.help = '用法：.cs 法术名 [环数]'
  cmdCastSpell.solve = async (ctx, msg, cmdArgs) => {
    try {
      const args = cmdArgs.rawArgs.split(' ')
      if (args.length < 1) {
        return seal.replyToSender(ctx, msg, '请指定法术名称')
      }

      const spellName = args[0]
      const level = parseInt(args[1]) || 3
      const playerName = ctx.player.name || '玩家'

      // 从 HTTP 服务器获取法术信息
      const response = await fetch(`${API_URL}/api/use_spell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spell: spellName,
          level,
          user: playerName
        })
      })
      if (!response.ok) {
        throw new Error('法术服务器开小差了')
      }
      const resp = await response.json()
      seal.replyToSender(ctx, msg, resp.message)
    } catch (error) {
      seal.replyToSender(ctx, msg, '发生错误：' + error.message)
    }

    return seal.ext.newCmdExecuteResult(true)
  }

  seal.ext.register(ext)
  ext.cmdMap['cs'] = cmdCastSpell
}
