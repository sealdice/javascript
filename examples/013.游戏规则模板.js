// ==UserScript==
// @name         示例:规则模板
// @author       木落
// @version      1.0.0
// @description  注册一个 trpg-test 模板，可用.set trpgtest开启，此模板完全为演示作用，提供一个叫做人品的属性，血量上限为“人品 * 5”
// @timestamp    1677167150
// 2023-02-24
// @diceRequireVer 1.2.0
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

// 编写规则模板
// 建议配合扩展使用

const aa = {
    "name": "trpg-test",
    "fullName": "完全测试用",
    "authors": ["木落"],
    "version": "1.0.0",
    "updatedTime": "20230223",
    "templateVer": "1.0",

    "nameTemplate": {
        "game1": {
            "template": "{$t玩家_RAW} RP{人品} HP{生命值}/{生命值上限}",
            "helpText": "自动设置测试名片"
        }
    },

    "attrSettings": {
        // st show 置顶内容
        "top": ["人品", "生命值"],
        "sortBy": "name",
        // st show 隐藏内容
        "ignores": ["生命值上限"],
        // st show 展示内容，例如到 st show hp 会展示“生命值: 10/14”
        "showAs": {
            "生命值": "{生命值}/{生命值上限}",
        },
        // 暂未实装
        "setter": null
    },

    // .set 相关内容，使用.set coc/coc7开启，切100面骰，并提示enableTip中的内容
    "diceSides": 99,
    "keysForSet": ["trpgtest"],
    "enableTip": "已切换至99面骰，什么扩展也不开",
    "relatedExt": [],

    // 默认值
    "defaults": {
        "做好事": 40
    },
    // 默认值 - 计算属性，如闪避为“敏捷 / 2 ”
    "defaultsComputed": {
        "生命值上限": "人品 * 5"
    },
    // 同义词，存卡和设置属性时，所有右边的词会被转换为左边的词，不分大小写(sAN视同San/san)
    "alias": {
        "生命值": ["hp"],
        "生命值上限": ["hpmax"],
        "人品": ["RP"]
    },

    // 可自定义词组，未实装
    "textMap": {
        "trpg-test": {
            "设置测试_成功": [
                ["设置完成", 1]
            ]
        }
    },
    "textMapHelpInfo": null
}

try {
    seal.gameSystem.newTemplate(JSON.stringify(aa))
} catch (e) {
    // 如果扩展已存在，或加载失败，那么会走到这里
    console.log(e)
}
