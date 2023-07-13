declare namespace seal {
  /** 信息上下文 */
  export interface MsgContext {
    /** 当前群信息 */
    group: GroupInfo;
    /** 当前群的玩家数据 */
    player: GroupPlayerInfo;
    /** 当前群内是否启用bot（注:强制@时这个值也是true，此项是给特殊指令用的） */
    isCurGroupBotOn: boolean;
    /** 是否私聊 */
    isPrivate: boolean;
    /** 权限等级 40邀请者 50管理 60群主 100master */
    privilegeLevel: number;
    /** 代骰附加文本 */
    delegateText: string
    /** 对通知列表发送消息 */
    notice(text: string): void

    // 谨慎使用角色卡相关 api ，有可能写坏数据库

    /** 绑定角色卡到当前群 */
    chBindCur(name: string)
    /* 获取当前群绑定角色 返回名字或者空字符串*/
    chBindCurGet(): string
    /** 获取一个正在绑定状态的卡，可用于该卡片是否绑卡检测 */
    chBindGet(name: string): ValueMap
    /** 返回当前卡绑定的群列表 */
    chBindGetList(): string[]
    /** 解除某个角色的绑定 返回绑定过的群列表 */
    chUnbind(name: string): string[]
    /** 解除绑定 成功返回 `[角色名,true]`，失败返回 `["",false]`  */
    chUnbindCur(name: string): [string, boolean]


    /* 判断角色是否存在 */
    chExists(name: string): boolean
    /** 新建角色 成功 true；存在同名角色 false */
    chNew(name: string): boolean
    /** 清空当前群角色卡变量 返回被清空的变量数量 */
    chVarsClear(): number
    /** 获取当前角色 ValueMap */
    chVarsGet(): [ValueMap,boolean]
    /** 获取当前角色变量数量，底层为 `ValueMap.len()` */
    chVarsNumGet(): number
    /** 更新角色卡操作时间 */
    chVarsUpdateTime(): void

    // 这些接口不推荐使用，太麻烦了
    /**  获取角色数据 成功返回 ValueMap ，失败返回 null */
    chGet(name: string): ValueMap | null
    /** 加载角色，成功返回 ValueMap ，失败返回 null */
    chLoad(name: string): ValueMap | null
    /** 加载个人群内数据 */
    loadGroupVars(g: GroupInfo, p: GroupPlayerInfo): void
    /** 加载个人全局数据 */
    loadPlayerGlobalVars(): void
    /** 加载个人群内数据 */
    loadPlayerGroupVars(): void

  }

  export interface ValueMap {
    /** 获取 */
    get(k): [any, boolean]
    /** 添加 */
    set(k, v): void
    /** 删除 */
    del(k): void
    /** 数量 */
    len(): number
    /** 迭代 */
    next(): [any, any, boolean]
    /** 遍历 参数不能传入 `()=>null`，但可以传入 `()=>{}` 或者 `function(){}` */
    iterate(fun: (k,v)=>void): void
    // 加锁
    lock(): void
    // 解锁
    unlock(): void
  }

  /** 群信息 */
  export interface GroupInfo {
    active: boolean;
    groupId: string;
    groupName: string;
    /** COC规则序号 */
    cocRuleIndex: number;
    /** 当前log名字，若未开启为空 */
    logCurName: string;
    /** 当前log是否开启 */
    logOn: boolean;
    /** 是否显示入群迎新信息 */
    showGroupWelcome: boolean;
    /** 入群迎新文本 */
    groupWelcomeMessage: string;
    /** 最后指令时间(时间戳) */
    recentCommandTime: number;
    /** 入群时间(时间戳) */
    enteredTime: number;
    /** 邀请人ID */
    inviteUserId: string;
  }

  /** 群内玩家数据 */
  export interface GroupPlayerInfo {
    /** 用户昵称 */
    name: string;
    /** 用户ID */
    userId: string;
    /** 上次执行指令时间 */
    lastCommandTime: number;
    /** 上次发送指令时间(即sn) */
    autoSetNameTemplate: string;
  }

  /** 消息详情 */
  export interface Message {
    /** 当前平台，如QQ */
    platform: string;
    /** 消息内容 */
    message: string;
    /** 发送时间 */
    time: number;
    /** 群消息/私聊消息 */
    messageType: 'group' | 'private';
    /** 群ID */
    groupId: string;
    /** 发送者信息 */
    sender: Sender;
    /** 原始ID，用于撤回等情况 */
    rawId: string | number;
  }

  /** 发送者信息 */
  export interface Sender {
    nickname: string;
    userId: string;
  }

  /** 通信端点，即骰子关联的帐号的信息 */
  export interface EndPointInfo {
    id: string;
    /** 昵称 */
    nickname: string;
    /** 状态 0 断开 1已连接 2连接中 3连接失败 */
    state: number;
    /** 用户id */
    userId: string;
    /** 命令执行数量 */
    cmdExecutedNum: number;
    /** 最后命令执行时间 */
    cmdExecutedLastTime: number;
    /** 平台 */
    platform: string;
    /** 是否启用 */
    enable: boolean;

    // adapter: PlatformAdapter;
  }

  export interface AtInfo {
    userId: string;
  }

  export interface Kwarg {
    /** 名称 */
    name: string;
    /** 是否存在value */
    valueExists: boolean;
    /** value的值 */
    value: string;
    /** 将value转换为bool，如'0' ''等会自动转为false */
    asBool: boolean;
  }

  export interface CmdArgs {
    /** 当前命令，与指令的name相对，例如.ra时，command为ra */
    command: string;
    /** 指令参数，如“.ra 力量 测试”时，参数1为“力量”，参数2为“测试” */
    args: string[];
    /** 当前被at的有哪些 */
    at: AtInfo[];
    /** 参数的原始文本 */
    rawArgs: string;
    /** 我被at了 */
    amIBeMentioned: boolean;
    /** 同上，但要求是第一个被at的 */
    amIBeMentionedFirst: boolean;
    /** 一种格式化后的参数，也就是中间所有分隔符都用一个空格替代 */
    cleanArgs: string;
    // 暂不提供，未来可能有变化
    // specialExecuteTimes: number;
    // 但是额外指出， `ra10#50` 时此项 = 10，并且 argv[0] 会被处理为 50；请注意这一点

    /** 获取关键字参数，如“.ra 50 --key=20 --asm”时，有两个kwarg，一个叫key，一个叫asm */
    getKwarg(key: string): Kwarg;
    /** 获取第N个参数，从1开始，如“.ra 力量50 推门” 参数1为“力量50”，参数2是“推门” */
    getArgN(n: number): string;
    /** 分离前缀 如 `.stdel力量` => [del,力量] ，直接修改 argv 属性*/
    chopPrefixToArgsWith(...s: string[]): boolean
    /** 吃掉前缀并去除复数空格 `set xxx  xxx` => `xxx xxx`，返回修改后的字符串和是否修改成功的布尔值  */
    eatPrefixWith(...s: string[]): [string, boolean]
    /** 将第 n 个参数及之后参数用空格拼接起来; 如指令 `send to qq x1 x2`,n=3返回 `x1 x2` */
    getRestArgsFrom(n: number): number
    /** 检查第N项参数是否为某个字符串，n从1开始，若没有第n项参数也视为失败 */
    isArgEqual(n: number, ...s: string[]): boolean
  }


  interface CmdItemInfo {
    solve: (ctx: MsgContext, msg: Message, cmdArgs: CmdArgs) => CmdExecuteResult;

    /** 指令名称 */
    name: string;
    /** 长帮助，带换行的较详细说明  */
    help: string;
    /** 允许代骰 */
    allowDelegate: boolean;
    /** 私聊不可用 */
    disabledInPrivate: boolean;

    /** 高级模式。默认模式下行为是：需要在当前群/私聊开启，或@自己时生效(需要为第一个@目标)。一般不建议使用 */
    // raw: boolean;
    /** 是否检查当前可用状况，包括群内可用和是私聊两种方式，如失败不进入solve */
    // checkCurrentBotOn: boolean;
    /** 是否检查@了别的骰子，如失败不进入solve */
    // checkMentionOthers: boolean;
  }

  interface ExtInfo {
    /** 名字 */
    name: string;
    /** 版本 */
    version: string;
    /** 名字 */
    author: string;
    /** 指令映射 */
    cmdMap: { [key: string]: CmdItemInfo };
    /** 是否加载完成 */
    isLoaded: boolean
    /** 存放数据 */
    storageSet(key: string, value: string);
    /** 取数据 */
    storageGet(key: string): string;
    /** 匹配非指令消息 */
    onNotCommandReceived: (ctx: MsgContext, msg: Message) => void
    /** 试图匹配自定义指令（只对内置扩展有意义） */ // 已废弃
    // onCommandOverride: (ctx: MsgContext, msg: Message, cmdArgs: CmdArgs) => boolean;
    /** 监听 收到指令 事件 */
    onCommandReceived: (ctx: MsgContext, msg: Message, cmdArgs: CmdArgs) => void
    /** 监听 收到消息 事件，如 log 模块记录收到文本 */
    onMessageReceived: (ctx: MsgContext, msg: Message) => void
    /** 监听 发送消息 事件，如 log 模块记录指令文本 */
    onMessageSend: (ctx: MsgContext, msg: Message) => void
    /** 获取扩展介绍文本 */
    getDescText(): string
    /** 监听 加载时 事件，如 deck 模块需要读取牌堆文件 */
    onLoad: (...any: any) => void
    /** 初始化数据，读写数据时会自动调用 */
    storageInit()
    /** 读数据 如果无需自定义错误处理就无需使用 */
    storageGetRaw(k: string)
    /** 写数据 如果无需自定义错误处理就无需使用 */
    storageSetRaw(k: string, v: string)
  }


  interface CmdExecuteResult {
    /** 是否顺利完成执行 */
    solved: boolean;
    /** 是否返回帮助信息 */
    showHelp: boolean;
  }

  export const ext: {
    /**
     * 新建一个扩展
     */
    new: (name: string, author: string, version: string) => ExtInfo;

    /**
     * 创建指令结果对象
     * @param success 是否执行成功
     */
    newCmdExecuteResult(success: boolean): CmdExecuteResult;

    /**
     * 注册一个扩展
     * @param ext
     */
    register(ext: ExtInfo): unknown;

    /**
     * 按名字查找扩展对象
     * @param name
     */
    find(name: string): ExtInfo;
    /** 创建指令对象 */
    newCmdItemInfo(): CmdItemInfo;
  }

  interface CocRuleInfo {
    /** 序号 */
    index: number;
    /** .setcoc key */
    key: string;
    /** 已切换至规则 Name: Desc */
    name: string;
    /** 规则描述 */
    desc: string;

    /**
     * 检定函数
     * @param ctx 上下文对象
     * @param d100 使用骰子骰出的值
     * @param checkValue 检定线，对应属性，例如力量、敏捷等
     */
    check(ctx: MsgContext, d100: number, checkValue: number): CocRuleCheckRet;
  }

  interface CocRuleCheckRet {
    /** 成功级别，失败小于0，成功大于0。大失败-2 失败-1 成功1 困难成功2 极难成功3 大成功4 */
    successRank: number;
    /** 大成功数值 */
    criticalSuccessValue: number;
  }

  export const coc: {
    newRule(): CocRuleInfo;
    newRuleCheckResult(): CocRuleCheckRet;
    registerRule(rule: CocRuleInfo): boolean;
  }

  /** 回复发送者(发送者私聊即私聊回复，群内即群内回复) */
  export function replyToSender(ctx: MsgContext, msg: Message, text: string): void;
  /** 回复发送者(私聊回复，典型应用场景如暗骰) */
  export function replyPerson(ctx: MsgContext, msg: Message, text: string): void;
  /** 回复发送者(群内回复，私聊时无效) */
  export function replyGroup(ctx: MsgContext, msg: Message, text: string): void;
  /** 格式化文本 等价于 `text` 指令 */
  export function format(ctx: MsgContext, text: string): string;
  /** 获取回复文案 */
  export function formatTmpl(ctx: MsgContext, text: string): string
  /** 代骰模式下，获取被代理人信息 */
  export function getCtxProxyFirst(ctx: MsgContext, cmdArgs: CmdArgs): MsgContext;
  /** 新建一条消息 */
  export function newMessage(): Message;
  /** 创建一个临时Context */
  export function createTempCtx(ep: EndPointInfo, msg: Message): MsgContext;
  /** 应用名片模板，返回值为格式化完成的名字。此时已经设置好名片(如有权限) */
  export function applyPlayerGroupCardByTemplate(ctx: MsgContext, tmpl: string): string;

  /** 获取/修改 VM 变量 ，如 `$t`、`$g` */
  export const vars: {
    /** VM 中存在 key 且类型正确 返回 `[number,true]` ，否则返回 `[0,false]` */
    intGet(ctx: MsgContext, key: string): [number, boolean];
    /** 赋值 key 为 value 等价于指令 `text {key=value}` value 类型为数字 */
    intSet(ctx: MsgContext, key: string, value: number): void;
    /** VM 中存在 key 且类型正确 返回 `[string,true]` ，否则返回 `['',false]` */
    strGet(ctx: MsgContext, key: string): [string, boolean];
    /** 赋值 key 为 value 等价于指令 `text {key=value}` value 类型为字符串 */
    strSet(ctx: MsgContext, key: string, value: string): void;
  }

  export const gameSystem: {
    /** 添加一个规则模板，需要是JSON文本格式 */
    newTemplate(data: string);
    /** 添加一个规则模板，需要是YAML文本格式 */
    newTemplateByYaml(data: string);
  }


  /** deck */
  export interface deckResult {
    /** 是否存在 */
    "exists": boolean,
    /** 错误信息 */
    "err": string,
    /** 抽牌结果 */
    "result": string | null
  }

  export const deck: {
    /**
     * 抽牌函数
     * @param ctx
     * @param name 牌堆名
     * @param isShuffle 是否放回
     */
    draw(ctx: MsgContext, name: string, isShuffle: boolean): deckResult
  }

}
