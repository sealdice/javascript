declare namespace seal {
  /** 信息上下文 */
  export interface MsgContext {
    endPoint: EndPointInfo;
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
    iterate(fun: (k, v) => void): void
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
    /** 服务器ID */
    guildId: string;
    /** 发送者信息 */
    sender: Sender;
    /** 原始ID，用于撤回等情况 */
    rawId: string | number;
  }

  /** 创建一个 Message 对象 */
  export function newMessage(): Message;

  /** 创建一个 ctx 对象 */
  export function createTempCtx(
    endPoint: EndPointInfo,
    msg: Message
  ): MsgContext;

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
    /** 关键字参数 */
    kwargs: Kwarg[];
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
    getRestArgsFrom(n: number): string
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

  type BanRankType = number
  /*
    禁止等级
    BanRankBanned = -30
    警告等级
    BanRankWarn = -10
    常规等级
    BanRankNomal = 0
    信任等级
    BanRankTrust = 30
  */
  interface BanListInfoItem {
    /** 对象 ID */
    id: string;
    /** 对象名称 */
    name: string;
    /** 怒气值。*/
    score: number;
    /** 0 正常，-10 警告，-30 禁止，30 信任 */
    rank: number;
    /** 历史记录时间戳 */
    times: number[];
    /** 拉黑原因记录 */
    reasons: string[];
    /** 事发会话记录 */
    places: string[];
    /** 首次记录时间 */
    banTime: number;
  }
  /** 黑名单操作 */
  export const ban: {
    /**
     * 拉黑指定 ID
     * @param ctx 上下文
     * @param id 黑名单用户或群组 ID
     * @param place 事发会话 ID
     * @param reason 拉黑原因
     */
    addBan(ctx: MsgContext, id: string, place: string, reason: string): void;

    /**
     * 信任指定 ID
     * @param ctx 上下文
     * @param id 信任用户或群组 ID
     * @param place 事发会话 ID
     * @param reason 信任原因
     */
    addTrust(ctx: MsgContext, id: string, place: string, reason: string): void;

    /**
     * 将用户从名单中删除
     * @param ctx 上下文对象
     * @param id 要移除的用户 ID
     */
    remove(ctx: MsgContext, id: string): void;

    /** 获取名单全部用户 */
    getList(): BanListInfoItem[];

    /**
     * 获取指定 ID 的黑名单记录。返回值可能为空。
     * @param id 用户群组
     */
    getUser(id: string): BanListInfoItem;
  }

  interface ConfigItem {
    key: string,
    type: string,
    defaultValue: any,
    value: any,
    option: any,
    deprecated: boolean,
    description: string
  }
  type TimeOutTaskType = 'cron'|'daily'
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
    /**
     * 注册一个字符串类型的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项值
     * @param desc 描述
     */
    registerStringConfig(ext: ExtInfo,key: string,defaultValue: string,desc?: string): void;
    /**
     * 注册一个整型的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项值
     * @param desc 描述
     */
    registerIntConfig(ext: ExtInfo,key: string,defaultValue: number,desc?: string): void;
    /**
     * 注册一个布尔类型的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项值
     * @param desc 描述
     */
    registerBoolConfig(ext: ExtInfo,key: string,defaultValue: boolean,desc?: string): void;
    /**
     * 注册一个浮点数类型的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项值
     * @param desc 描述
     */
    registerFloatConfig(ext: ExtInfo,key: string,defaultValue: number,desc?: string): void;
    /**
     * 注册一个template类型的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项值
     * @param desc 描述
     */
    registerTemplateConfig(ext: ExtInfo,key: string,defaultValue: string[],desc?: string): void;
    /**
     * 注册一个option类型的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项默认值
     * @param option 可选项
     * @param desc 描述
     */
    registerOptionConfig(ext: ExtInfo,key: string,defaultValue: string,option: string[],desc?: string): void;
    /**
     * 创建一个新的配置项
     * @param ext 扩展对象
     * @param key 配置项名称
     * @param defaultValue 配置项值
     * @param desc 描述
     */
    newConfigItem(ext: ExtInfo,key: string,defaultValue: any,desc: string): ConfigItem;
    /**
     * 注册配置
     * @param ext 扩展对象
     * @param configs 配置项对象
     */
    registerConfig(ext: ExtInfo,...configs:ConfigItem[]): void;
    /**
     * 获取指定名称的配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getConfig(ext: ExtInfo,key: string): ConfigItem;
    /**
     * 获取指定名称的字符串类型配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getStringConfig(ext: ExtInfo,key: string): string;
    /**
     * 获取指定名称的整型配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getIntConfig(ext: ExtInfo,key: string): number;
    /**
     * 获取指定名称的布尔类型配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getBoolConfig(ext: ExtInfo,key: string): boolean;
    /**
     * 获取指定名称的浮点数类型配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getFloatConfig(ext: ExtInfo,key: string): number;
    /**
     * 获取指定名称的template类型配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getTemplateConfig(ext: ExtInfo,key: string): string[];
    /**
     * 获取指定名称的option类型配置项对象
     * @param ext 扩展对象
     * @param key 配置项名称
     */
    getOptionConfig(ext: ExtInfo,key: string): string;
    /**
     * 卸载对应名称的配置项
     * @param ext 扩展对象
     * @param keys 配置项名称
     */
    unregisterConfig(ext: ExtInfo,...keys: string[]):void;

    /**
     * 注册定时任务
     * @param ext 扩展对象
     * @param taskType cron格式/每日时钟格式
     * @param value 5位cron表达式/数字时钟 例如 * * * * *或者8:30
     * @param fn 定时任务内容
     * @param key 定时任务名称
     * @param desc 定时任务描述
     */
    registerTask(ext: ExtInfo, taskType: TimeOutTaskType, value: string, fn: Function, key?: string, desc?: string): void;
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

  /** 代骰模式下，获取被代理人信息 */
  export function getCtxProxyFirst(ctx: MsgContext, cmdArgs: CmdArgs): MsgContext;
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

  /**
   * 禁言
   * @param ctx 上下文
   * @param groupID QQ群ID
   * @param userID 禁言对象ID
   * @param duration 禁言时间
   */
  export function memberBan(ctx: MsgContext, groupID: string, userID: string, duration: number): void;
  /**
   * 踢人
   * @param ctx 上下文
   * @param groupID QQ群ID
   * @param userID 踢出对象ID
   */
  export function memberKick(ctx: MsgContext, groupID: string, userID: string): void;
  /**
   * 执行海豹dicescript
   * @param ctx 上下文
   * @param s 指令文本
   */
  export function formatTmpl(ctx: MsgContext, s: string): string;
  /**
   * 创建at列表里第一个用户的代骰上下文
   * @param ctx 上下文
   * @param cmdArgs 指令参数
   */
  export function getCtxProxyFirst(ctx: MsgContext, cmdArgs: CmdArgs): MsgContext;
  /**
   * 通过通信端点对象创建上下文，与getEndPoints共用
   * @param ep 通信端点对象
   * @param msg 消息对象
   */
  export function createTempCtx(ep: EndPointInfo, msg: Message): MsgContext;
  /**
   *
   * @param ctx 上下文
   * @param tmpl 模板文本
   */
  export function applyPlayerGroupCardByTemplate(ctx: MsgContext, tmpl: string): string;
  /**
   * 创建at列表里指定用户的代骰上下文
   * @param ctx 上下文
   * @param cmdArgs 指令参数
   * @param pos at列表的序数
   */
  export function getCtxProxyAtPos(ctx: MsgContext, cmdArgs: CmdArgs, pos: number): MsgContext;

  type VersionDetailsType = {
    // 内部版本号，新版本的版本号永远比旧版本的大
    versionCode: number
    // 版本号+日期 如 1.4.6+20240810
    version: string
    // 版本号 如 1.4.6
    versionSimple: string

    versionDetail: {

      major:         number

      minor:         number

      patch:         number

      prerelease:    string
      // 创建日期 如 20240810
      buildMetaData: string
    }
  }
  /** 获取版本信息  */
  export function getVersion(): VersionDetailsType;
  /** 获取骰娘的EndPoints   */
  export function getEndPoints(): EndPointInfo[]

  export function setPlayerGroupCard(ctx: MsgContext, tmpl: string): string
  // 通过base64返回图像临时地址
  export function base64ToImage(base64: string): string

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
    newTemplate(data: string): unknown;
    /** 添加一个规则模板，需要是YAML文本格式 */
    newTemplateByYaml(data: string): unknown;
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
