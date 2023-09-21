// ==UserScript==
// @name         BlackJack(二十一点)
// @author       JohNSoN
// @version      1.0.1
// @description  经典纸牌游戏Black Jack
// @timestamp    1681024053
// @license      The Unlicense
// @homepageURL  https://github.com/Xiangze-Li/sealdice-addon
// ==/UserScript==

const VERSION = '1.0.1';

class Player {
    #name = '';
    #hand = [];
    #stand = false;

    constructor(name, stand, hand = []) {
        this.#name = String(name);
        this.#stand = Boolean(stand);
        if (hand.length > 0) {
            this.#hand = hand;
        }
    }

    toJSON() {
        return {
            name: this.#name,
            deck: this.#hand,
            stand: this.#stand,
        }
    }

    hit(card) {
        if (this.#stand) return false;
        this.#hand.push(card);
        return true;
    }

    stand() {
        this.#stand = true;
    }

    check() {
        if (this.win) {
            if (this.blackjack) return 2;
            return 1;
        }
        if (this.busted) return -1;
        return 0;
    }

    get sum() {
        let s = 0;
        let ace = 0;
        for (let card of this.#hand) {
            let num = card.substring(2);
            switch (num) {
                case 'A':
                    ace++;
                    s += 11;
                    break;
                case 'J': case 'Q': case 'K':
                    s += 10;
                    break;
                default:
                    s += parseInt(num);
                    break;
            }
        }
        while (s > 21 && ace > 0) {
            s -= 10;
            ace--;
        }
        return s;
    }

    get busted() {
        let b = this.sum > 21;
        if (b) this.#stand = true;
        return b;
    }

    get win() {
        let b = this.sum === 21;
        if (b) this.#stand = true;
        return b;
    }

    get blackjack() {
        let b = this.#hand.length === 2 && this.sum === 21;
        if (b) this.#stand = true;
        return b;
    }

    get standed() { return this.#stand; }

    describe(isDealer = false) {
        let s = this.#name + ' ';
        if (isDealer) {
            s += `手牌: [${this.#hand[0]}],[?]`;
            return s;
        }

        s += `手牌: [${this.#hand.join('],[')}]; `;
        s += `点数: ${this.sum}; `;
        switch (this.check()) {
            case 2:
                s += 'BlackJack!';
                break;
            case 1:
                s += '21点!';
                break;
            case -1:
                s += '爆牌!';
                break;
            default:
                s += this.#stand ? '已停牌' : '未停牌';
                break;
        }
        return s;
    }
}

class BlackjackGame {

    #deck = [];
    #players = new Map();
    #dealer = new Player('庄家');
    #status = BlackjackGame.StIdle;

    static OneDeck = [
        '黑桃A', '黑桃2', '黑桃3', '黑桃4', '黑桃5', '黑桃6', '黑桃7', '黑桃8', '黑桃9', '黑桃10', '黑桃J', '黑桃Q', '黑桃K',
        '红桃A', '红桃2', '红桃3', '红桃4', '红桃5', '红桃6', '红桃7', '红桃8', '红桃9', '红桃10', '红桃J', '红桃Q', '红桃K',
        '草花A', '草花2', '草花3', '草花4', '草花5', '草花6', '草花7', '草花8', '草花9', '草花10', '草花J', '草花Q', '草花K',
        '方片A', '方片2', '方片3', '方片4', '方片5', '方片6', '方片7', '方片8', '方片9', '方片10', '方片J', '方片Q', '方片K',
    ];
    static StIdle = 'idle';
    static StShuffled = 'shuffled';
    static StStarted = 'started';
    static StFinished = 'finished';

    addPlayer(id, name = '') {
        if (!name) name = id;
        if (this.#status !== BlackjackGame.StShuffled) return [false, '游戏未准备好'];
        if (this.#players.has(id)) return [false, '玩家已存在'];
        this.#players.set(id, new Player(name, false, []));
        return [true, ''];
    }

    removePlayer(id) {
        if (this.#status !== BlackjackGame.StShuffled) return [false, '游戏未准备好'];
        if (!this.#players.has(id)) return [false, '玩家不存在'];
        this.#players.delete(id);
        return [true, ''];
    }

    start() {
        if (this.#status !== BlackjackGame.StShuffled) return [false, '游戏未准备好'];
        if (this.#players.size <= 0) return [false, '没有玩家'];
        this.#status = BlackjackGame.StStarted;
        this.#dealer.hit(this.#deck.shift());
        this.#dealer.hit(this.#deck.shift());
        for (let pl of this.#players.values()) {
            pl.hit(this.#deck.shift());
            pl.hit(this.#deck.shift());
        }
        return [true, ''];
    }

    hit(plID) {
        if (this.#status !== BlackjackGame.StStarted) return [false, '游戏未开始'];
        if (!this.#players.has(plID)) return [false, '玩家不存在'];
        let pl = this.#players.get(plID);
        if (pl.standed || pl.busted) return [false, '玩家已停牌或爆牌'];
        if (!pl.hit(this.#deck.shift())) return [false, '叫牌出错'];

        return [true, ''];
    }

    stand(plID) {
        if (this.#status !== BlackjackGame.StStarted) return [false, '游戏未开始'];
        if (!this.#players.has(plID)) return [false, '玩家不存在'];
        let pl = this.#players.get(plID);
        if (pl.standed || pl.busted) return [false, '玩家已停牌或爆牌'];
        pl.stand();

        return [true, ''];
    }

    tryConclude() {
        if (this.#status !== BlackjackGame.StStarted) return [false, '游戏未开始'];
        for (let pl of this.#players.values()) {
            if (!pl.standed) return [false, '有玩家未停牌'];
        }

        while (this.#dealer.check() === 0 && this.#dealer.sum < 17) {
            this.#dealer.hit(this.#deck.shift());
        }
        this.#dealer.stand();
        this.#status = BlackjackGame.StFinished;
        return [true, ''];
    }

    status() {
        return this.toJSON();
    }

    describe() {
        let s = '';
        let concluded = false;

        if (this.#status === BlackjackGame.StFinished) {
            s += '游戏已结束\n';
            concluded = true;
        } else if (this.#status === BlackjackGame.StStarted) {
            // s += `剩余牌数：${this.#deck.length}\n`;
        } else {
            s += '游戏未开始';
            return s;
        }
        s += `${this.#dealer.describe(!concluded)}\n`;
        for (let pl of this.#players.values()) {
            s += `${pl.describe()}\n`;
        }
        s.trimEnd();
        return s;
    }

    constructor(str = '') {
        if (!str) {
            this.#deck = BlackjackGame.OneDeck.slice();
            shuffle(this.#deck);
            this.#players = new Map();
            this.#status = BlackjackGame.StShuffled;
            this.#dealer = new Player('骰娘');
            return;
        }

        let obj = JSON.parse(str,
            (key, value) => {
                switch (key) {
                    case 'players':
                        let map = new Map();
                        for (let [k, v] of value) {
                            map.set(k, new Player(v.name, v.stand, v.deck));
                        }
                        return map;
                    case 'dealer':
                        return new Player(value.name, value.stand, value.deck);
                    default:
                        return value;
                }
            }
        );
        this.#deck = obj.deck;
        this.#players = obj.players;
        this.#status = obj.status;
        this.#dealer = obj.dealer;
    }

    toJSON() {
        return {
            deck: this.#deck,
            players: Array.from(this.#players.entries()),
            dealer: this.#dealer,
            status: this.#status,
        }
    }
}


let ext = seal.ext.find('blackjack');
if (!ext) {
    ext = seal.ext.new('blackjack', 'JohNSoN', VERSION);
    seal.ext.register(ext);
} else if (ext.version !== VERSION) {
    ext.version = VERSION;
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = 'bj'; // 指令名字，可用中文
cmd.help = `BlackJack 二十一点 by JohNSoN
.bj reset/init/洗牌
.bj join/加入
.bj quit/退出
.bj start/开始
.bj hit/叫牌
.bj stand/停牌
.bj status/查看/牌桌    查看当前牌桌状态
.bj conclude    (所有玩家结束后)庄家结算. 结算后会自动洗牌.
`;
cmd.disabledInPrivate = true
cmd.solve = (ctx, msg, cmdArgs) => {
    let key = `blackjack:${ctx.group.groupId}`;
    let plID = ctx.player.userId;
    let plName = ctx.player.name;
    let game = new BlackjackGame(ext.storageGet(key));

    let hint = `<${plName}>`;

    let op = cmdArgs.getArgN(1);
    switch (op) {
        case 'reset': case 'init': case '洗牌': {
            game = new BlackjackGame();
            hint += '重置游戏';
            break;
        }
        case 'join': case '加入': {
            let [succ, errMsg] = game.addPlayer(plID, plName);
            if (succ) {
                hint += '加入游戏';
            } else {
                hint += '加入失败: ' + errMsg;
            }
            break;
        }
        case 'quit': case '退出': {
            let [succ, errMsg] = game.removePlayer(plID);
            if (succ) {
                hint += '退出游戏';
            } else {
                hint += '退出失败: ' + errMsg;
            }
            break;
        }
        case 'start': case '开始': {
            let [succ, errMsg] = game.start();
            if (succ) {
                hint += '开始游戏';
                hint += '\n' + game.describe();
            } else {
                hint += '开始失败: ' + errMsg;
            }
            break;
        }
        case 'hit': case '叫牌': {
            let [succ, errMsg] = game.hit(plID);
            if (succ) {
                hint += '叫牌';
            } else {
                hint += '叫牌失败: ' + errMsg;
            }
            hint += '\n' + game.describe();
            break;
        }
        case 'stand': case '停牌': {
            let [succ, errMsg] = game.stand(plID);
            if (succ) {
                hint += '停牌';
            } else {
                hint += '停牌失败: ' + errMsg;
            }
            hint += '\n' + game.describe();
            break;
        }
        case 'conclude': case '结算': {
            let [succ, errMsg] = game.tryConclude();
            if (succ) {
                hint += '结算游戏';
            } else {
                hint += '结算失败: ' + errMsg;
            }
            hint += '\n' + game.describe();

            if (succ) {
                game = new BlackjackGame();
            }
            break;
        }
        case 'status': case '查看': case '牌桌': {
            hint = game.describe();
            break;
        }
        default: {
            const r = seal.ext.newCmdExecuteResult(true);
            r.showHelp = true;
            return r;
        }
    }

    ext.storageSet(key, JSON.stringify(game));
    seal.replyToSender(ctx, msg, hint);
    return seal.ext.newCmdExecuteResult(true);
};
// 将命令注册到扩展中
ext.cmdMap['bj'] = cmd;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/*  TODO
    1. 所有人停牌之后自动结算
    2. 结算后显示赢家
    3. (为了仪式感) 玩家自己抽初始手牌
    4. 分牌split
*/
