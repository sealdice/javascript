/** 海豹核心的 JS 接口.*/
declare namespace seal {
  /**
   * 依据模板设定 `ctx` 中玩家名片. 返回格式化后的名片.
   * @param ctx   玩家上下文, 将设定 `ctx.player.userId` 的名片.
   * @param tmpl  名片模版.
   */
  export function applyPlayerGroupCardByTemplate(ctx: MsgContext, tmpl: string): string;

  /**
   * 从提供的终结点信息和原始消息创造一个独立的上下文.
   * @param ep    终结点信息.
   * @param msg   原始信息.
   */
  export function createTempCtx(ep: EndPointInfo, msg: Message): MsgContext;

  /**
   * 格式化一条信息，相当于 text 指令.
   * @param ctx   上下文信息, 读取个人变量等时所用.
   * @param text  要格式化的信息.
   */
  export function format(ctx: seal.MsgContext, text: string): string;

  /**
   * 取回一条由骰主自定义的文本信息, 例如检定大失败提示. 如果有多条信息则随机返回一条.
   * `key` 的格式为 `分类:标识符`, 在 WebUI 中可以看见, 如 `COC:检定_大失败`.
   */
  export function formatTmpl(ctx: seal.MsgContext, key: string): string;

  /**
   * 允许代骰时, 获取第一个自己以外的被 @ 对象. 返回的上下文独立于 `ctx`.
   * @param ctx       原始上下文.
   * @param cmdArgs   原始指令参数.
   * @see   CmdItemInfo.allowDelegate
   */
  export function getCtxProxyFirst(ctx: MsgContext, cmdArgs: CmdArgs): MsgContext;

  /**
   * 创建一个新的 `Message` 实例, 其任何字段都是默认值.
   */
  export function newMessage(): Message;

  /**
   * 在 `msg` 所在上下文内发送消息. 群聊/私聊取决于 [`msg.messageType`]{@link Message.messageType},
   * 发送对象取决于 [`msg.groupId`]{@link Message.groupId}(群聊)或
   * [`msg.sender.userId`]{@link Message.sender}(私聊).
   * @param ctx   群组上下文, 在该函数内几乎没有用, 但可能被下游事件使用, 因此建议保证其数据有效.
   * @param msg   原消息.
   * @param text  要发送的消息.
   */
  export function replyToSender(ctx: MsgContext, msg: Message, text: string): void;

  /**
   * 私聊发送消息给 [`msg.sender.userId`]{@link Message.sender}.
   * @param ctx   群组上下文, 在该函数内几乎没有用, 但可能被下游事件使用, 因此建议保证其数据有效.
   * @param msg   原始消息.
   * @param text  要发送的消息.
   */
  export function replyPerson(ctx: MsgContext, msg: Message, text: string): void;

  /**
   * 群聊发送消息给 [`msg.groupId`]{@link Message.groupId}, 原始消息必须是群聊事件.
   * @param ctx   群组上下文, 在该函数内几乎没有用, 但可能被下游事件使用, 因此建议保证其数据有效.
   * @param msg   原始消息.
   * @param text  要发送的消息.
   */
  export function replyGroup(ctx: MsgContext, msg: Message, text: string): void;

  /** 黑名单管理接口. */
  export const ban: {
      /**
       * 添加一个封禁项目.
       * @param ctx    上下文信息, 用于提取用户名与个人变量等.
       * @param id     要封禁的用户或群组 ID, 需带上平台前缀.
       * @param place  事发地点, 群组或私聊. 一般与 `ctx.group.groupId` 相同.
       * @param reason 封禁理由.
       */
      addBan(ctx: MsgContext, id: string, place: string, reason: string): void;

      /**
       * 添加一个豁免项目.
       * @param ctx    上下文信息, 用于提取用户名与个人变量等.
       * @param id     要信任的用户或群组 ID, 需带上平台前缀.
       * @param place  事发地点, 群组或私聊. 一般与 `ctx.group.groupId` 相同.
       * @param reason 信任理由.
       */
      addTrust(ctx: MsgContext, id: string, place: string, reason: string): void;

      /**
       * 移除名单中的一个项目.
       * @param ctx 上下文信息, 用于提取用户名与个人变量等.
       * @param id  项目 ID.
       */
      remove(ctx: MsgContext, id: string): void;

      /** 列出当前所有的黑名单, 可能耗时较长. */
      getList(): BanListInfoItem[];

      /**
       * 获取名单中的一个项目.
       * @param id 项目 ID.
       */
      getUser(id: string): BanListInfoItem;
  }

  /** CoC 规则相关. */
  export const coc: {
      // TODO
  }

  /** 牌堆相关. */
  export const deck: {
      // TODO
  }

  /** 插件管理相关. */
  export const ext: {
      /** 获得一个新的指令项目. */
      newCmdItemInfo(): CmdItemInfo;

      /**
       * 获得一个新的指令执行结果.
       * @param solved 执行结果 `solved` 字段的值, 推荐始终为 `true`,
       *               详见 [`CmdItemInfo.solve`]{@link CmdItemInfo.solve}.
       */
      newCmdExecuteResult(solved: boolean): CmdExecuteResult;

      /**
       * 新建一个扩展.
       * @param name    扩展名称, 注意事项见 [`ExtInfo.name`]{@link ExtInfo.name}.
       * @param author  作者名称.
       * @param version 版本号, 注意事项见 [`ExtInfo.version`]{@link ExtInfo.version}.
       */
      'new'(name: string, author: string, version: string): ExtInfo;

      /**
       * 查找一个扩展.
       * @param name 扩展名.
       */
      find(name: string): ExtInfo | undefined;

      /**
       * 注册一个扩展. 扩展名不能和已有的冲突.
       * @param info 要注册的扩展信息.
       */
      register(info: ExtInfo): void;

      /**
       * 注册一个字符串配置项. 如果 `info` 尚未被注册, 该函数会抛出一个异常.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值.
       * @param description   配置项描述.
       */
      registerStringConfig(info: ExtInfo, key: string, defaultValue: string, description: string): void;

      /**
       * 注册一个整数型配置项. 如果 `info` 尚未被注册或 `defaultValue` 不是整数, 该函数会抛出一个异常.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值, 内部类型为 `int64`.
       * @param description   配置项描述.
       */
      registerIntConfig(info: ExtInfo, key: string, defaultValue: number, description: string): void;

      /**
       * 注册一个布尔值配置项. 如果 `info` 尚未被注册, 该函数会抛出一个异常.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值.
       * @param description   配置项描述.
       */
      registerBoolConfig(info: ExtInfo, key: string, defaultValue: boolean, description: string): void;

      /**
       * 注册一个浮点数配置项. 如果 `info` 尚未被注册, 该函数会抛出一个异常.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值, 内部类型为 `float64`.
       * @param description   配置项描述.
       */
      registerFloatConfig(info: ExtInfo, key: string, defaultValue: number, description: string): void;

      /**
       * 注册一个模版配置项. 如果 `info` 尚未被注册, 该函数会抛出一个异常.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值.
       * @param description   配置项描述.
       */
      registerTemplateConfig(info: ExtInfo, key: string, defaultValue: string[], description: string): void;

      /**
       * 注册一个选项卡配置项. 如果 `info` 尚未被注册, 该函数会抛出一个异常.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值.
       * @param options       所有可行的选项.
       * @param description   配置项描述.
       */
      registerOptionConfig(info: ExtInfo, key: string, defaultValue: string, options: string[], description: string): void;

      /**
       * 新建一个任意类型的配置项, 返回原始配置项对象. 注意事项见 [`ConfigItem`]{@link ConfigItem} 各字段.
       * 如果 `info` 尚未被注册, 该函数会引发 panic.
       * @param info          配置项所属的插件.
       * @param key           配置项标识符, 在插件内必须唯一.
       * @param defaultValue  配置项默认值.
       * @param description   配置项描述.
       */
      newConfigItem(info: ExtInfo, key: string, defaultValue: any, description: string): ConfigItem;

      /**
       * 注册不定个任意类型的配置项, 注意事项见 [`ConfigItem`]{@link ConfigItem} 各字段.
       * 如果 `info` 尚未被注册, 该函数会抛出一个异常.
       * @param info   配置项所属的插件.
       * @param config 要注册的配置项.
       */
      registerConfig(info: ExtInfo, ...config: ConfigItem[]): void;

      /**
       * 获取一个已经注册的配置项.
       * @param info  配置项所属的插件.
       * @param key   配置项的标识符.
       */
      getConfig(info: ExtInfo, key: string): ConfigItem | undefined;

      /**
       * 获取一个字符串配置项当前的值. 如果配置项名称不存在或类型不匹配则引发 panic.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      getStringConfig(info: ExtInfo, key: string): string;

      /**
       * 获取一个整数型配置项当前的值. 如果配置项名称不存在或类型不匹配则引发 panic.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      getIntConfig(info: ExtInfo, key: string): number;

      /**
       * 获取一个布尔值配置项当前的值. 如果配置项名称不存在或类型不匹配则引发 panic.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      getBoolConfig(info: ExtInfo, key: string): boolean;

      /**
       * 获取一个浮点数配置项当前的值. 如果配置项名称不存在或类型不匹配则引发 panic.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      getFloatConfig(info: ExtInfo, key: string): number;

      /**
       * 获取一个模版配置项当前的值. 如果配置项名称不存在或类型不匹配则引发 panic.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      getTemplateConfig(info: ExtInfo, key: string): string[];

      /**
       * 获取一个选项卡配置项当前的值. 如果配置项名称不存在或类型不匹配则引发 panic.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      getOptionConfig(info: ExtInfo, key: string): string;

      /**
       * 取消注册不定个配置项.
       * @param info  配置项所属的插件.
       * @param key   配置项标识符.
       */
      unregisterConfig(info: ExtInfo, ...key: string[]): void;
  }

  /** 与内置脚本语言互动的接口. */
  export const vars: {
      /** 变量系统中存在 `key` 且类型正确, 返回 `[number, true]`, 否则返回 `[0, false]`. */
      intGet(ctx: MsgContext, key: string): [number, boolean];
      /** 赋值 `key` 为 `value`, 等价于指令 `.text {key=value}`. `value` 类型为数字. */
      intSet(ctx: MsgContext, key: string, value: number): void;
      /** 变量系统中存在 `key` 且类型正确 返回 `[string, true]`, 否则返回 `['', false]`. */
      strGet(ctx: MsgContext, key: string): [string, boolean];
      /** 赋值 `key` 为 `value`, 等价于指令 `.text {key=value}`. `value` 类型为字符串. */
      strSet(ctx: MsgContext, key: string, value: string): void;
  }

  /** 代表一个 @ 的信息. */
  export interface AtInfo {
      /** 被 @ 的用户 ID. */
      userId: string

      /**
       * 深拷贝一个上下文信息, 并将 `player.userId` 字段设置为自己. 如果 `ctx` 是有效的,
       * 返回新的上下文和 `true`, 否则返回 `undefined` 和 `false`.
       * @param ctx  要拷贝的上下文.
       */
      copyCtx(ctx: MsgContext): [MsgContext | undefined, boolean];
  }

  /** 代表黑名单中的一个项目. */
  export interface BanListInfoItem {
      /** 项目 ID. */
      id: string;

      /** 用户或群组名, 在最后一次读写时更新. */
      name: string;

      /** 怒气值, 不同怒气值的具体行为由骰主设置. 内部类型为 `int64`. */
      score: number;

      /** 黑名单等级, 0 无特殊行为, -10 为警告, -30 为禁止, 30 为信任. 内部类型为 `BanRankType`. */
      rank: number;

      /** 历来被记录的时间戳. 内部类型为 `[]int64`.*/
      times: number[];

      /** 历来被记录的原因.*/
      reasons: string[];

      /** 历来被记录的地点.*/
      places: string[];

      /** 第一次上黑名单时间. 内部类型为 `int64`.*/
      banTime: number;
  }

  /** 代表一次指令的用户参数. */
  export interface CmdArgs {
      /** 指令名称. */
      command: string;

      /**
       * 指令参数. 诸如 `3#`(如果指令允许
       * [`enableExecuteTimesParse`]{@link CmdItemInfo.enableExecuteTimesParse})和
       * `--key=value` 这样的特殊参数不会包含在内.*/
      args: string[];

      /** 键值对参数, 如 `--key=3`. */
      kwargs: Kwarg[];

      /** 所有 @ 的信息. */
      at: AtInfo[];

      /** 原始的参数, 不包含指令名称. */
      rawArgs: string;

      /** 骰子自己是否被 @. */
      amIBeMentioned: boolean;

      /** 骰子自己是否首先被 @. */
      amIBeMentionedFirst: boolean;

      /** 清洁过的参数字符串, 所有参数用一个空格隔开, 同样不包括特殊参数. */
      cleanArgs: string;

      /** 诸如 `3#`(如果指令允许
       * [`enableExecuteTimesParse`]{@link CmdItemInfo.enableExecuteTimesParse})的参数.
       */
      specialExecuteTimes: number;

      /** 原始信息, 等同于 `Message.message`. */
      rawText: string;

      /** 获取第 `n` 个参数, `n` 从 1 开始. 如果参数总量小于 `n` 则返回空字符串. */
      getArgN(n: number): string;

      /** 获取键为 `key` 的键值对参数. */
      getKwarg(key: string): Kwarg | undefined;

      /**
       * 从指令名中分离出前缀, 如 `.stpow` 中的 `pow` 会被分离. 此方法会永久修改 `CmdArgs`
       * 的状态. 返回是否有前缀被分离.
       * @param s  要分离的前缀.
       */
      chopPrefixToArgsWith(...s: string[]): boolean;

      /**
       * 在 [`cleanArgs`]{@link cleanArgs} 中尝试删去所给前缀, 有匹配到的前缀即删去并立刻返回
       * `true`, 否则返回 `["", false]`.
       * @param s  要删除的前缀.
       */
      eatPrefixWith(...s: string[]): [string, boolean];

      /**
       * 检查第 `n` 个参数是否为 `s` 中的任何一个, `n` 从 1 开始. 如果有则返回 `true`.
       */
      isArgEqual(n: number, ...s: string[]): boolean;

      /** 获取 [`cleanArgs`]{@link cleanArgs} 中从 `n` 开始的所有参数, 包括第 `n` 个. */
      getRestArgsFrom(n: number): string;

      // 省略了一些不应在 JS 插件中使用的方法.
  }

  /** 代表指令执行结果. */
  export interface CmdExecuteResult {
      /** 是否是指令. 用 `seal.ext.newCmdExecuteResult` 取得时始终为 `true`. */
      matched: boolean;

      /** 是否响应此指令. */
      solved: boolean;

      /** 是否显示帮助信息(使用 `CmdItemInfo.help` 而非 `helpFunc`). */
      showHelp: boolean;
  }

  /** 代表插件中定义的一个指令. */
  export interface CmdItemInfo {
      /**
       * 指令名称. 这并不一定是触发指令的名称(后者是在对应插件的 `cmdMap`中注册的),
       * 例如骰点指令的 `name` 可以是 `roll`, 而在 `cmdMap` 中注册为 `r`.
       *
       * 与其他指令名称冲突会导致该指令所属的插件解析失败.
       */
      name: string;

      /** 指令帮助. */
      help: string;

      /** 帮助文档生成函数. 如果该项被定义, `help` 指令会优先调用它来生成帮助信息, 否则使用 `help` 的内容. */
      helpFunc: (isShort: boolean) => string;

      /**
       * 指令的核心逻辑函数. 指令触发者和群组上下文信息在 `ctx` 和 `msg` 中取得. **不要直接修改 `ctx` 和 `msg`
       * 中的内容**, 如确有需要可以深拷贝一份使用. 这两个对象是按引用传递的, 修改它们可能会导致后续写入错误的数据.
       *
       * 通常建议直接返回 `seal.ext.newCmdExecuteResult(true)`, 尽量不要将执行结果的 `solved` 字段设置为
       * `false`, 否则骰子会在控制台中打印令人困惑的"骰子关闭/忽略指令/未知指令"内容.
       */
      solve: (ctx: MsgContext, msg: Message, cmdArgs: CmdArgs) => CmdExecuteResult;

      /**
       * 是否允许代骰. 如果为 `false`，在使用指令时 @ 骰子以外的用户(无论此用户是否被标记为骰子),
       * 骰子会优先认为该指令不由自己负责. 将此项设为 `true` 来改变这一行为.
       *
       * 允许代骰后, 可以使用 `cmdArgs.at`, `seal.getCtxProxyFirst` 等. 普通模式下可在
       * `solve` 中将 [`ctx.delegateText`]{@link MsgContext.delegateText} 设置为空字符串来关闭代骰文本.
       */
      allowDelegate: boolean;

      /**
       * 是否在私聊中禁用此命令. 设置为 `true` 后, 若用户尝试在私聊中使用该指令, 骰子会回复骰主自定义的
       * `核心:提示_私聊不可用` 内容.
       */
      disabledInPrivate: boolean;

      /** 是否解析骰点次数, 如 `.r 3#` 中的 `3#`. 如果不启用, 这样的文本会被当作普通参数处理. */
      enableExecuteTimesParse: boolean;

      /**
       * 是否开启高级模式. 在高级模式下:
       *   1. 不检查 `disabledInPrivate`.
       *   2. 不检查 `allowDelegate`, 代骰时不发送 `ctx.DelegateText`.
       *   3. 启用 `checkCurrentBotOn` 和 `checkMentionOthers`.
       */
      raw: boolean;

      /**
       * 是否要求骰子被启用, **仅在高级模式下有效**. 如果设置为 `true`,
       * 当骰子在当前群组中关闭时, 即使被 @ 也不会处理该指令.
       */
      checkCurrentBotOn: boolean;

      /**
       * 是否要求提及他人, **仅在高级模式下有效**. 如果设置为 `true`,
       * 如 @ 了除骰子以外的其他用户, 骰子不会响应指令.
       */
      checkMentionOthers: boolean;
  }

  /** 代表一个允许用户自定义的插件配置项. */
  export interface ConfigItem {
      /** 配置项标识符. */
      key: string;

      /** 配置项类型. */
      type: "string" | "int" | "bool" | "float" | "template" | "option";

      /** 当前启用的值, 可被骰主更改. */
      value: any;

      /** 默认值. */
      defaultValue: any;

      /** 所有可用选项, 仅在类型为"option"时可用. */
      option: any[];

      /**
       * 该配置项是否已经过时. 不要在插件端手动修改它; 当插件注册的配置项更改时,
       * 旧的配置项会自动被标记为过时.
       */
      deprecated: boolean;

      /** 对该配置项的描述. */
      description: string;
  }

  /** 一个终结点信息. */
  export interface EndPointInfo {
      /** 终结点内部 ID, 不是账号 ID. */
      id: string;

      /** 最后一次登录时获取的账号名. */
      nickname: string;

      /** 终结点状态. 0 断开, 1 已连接, 2 连接中, 3 连接失败. */
      state: number;

      /** 账号 ID. */
      userId: string;

      /** 账号加入的群组统计, 不保证准确. 内部类型为 `int64`. */
      groupNum: number;

      /** 指令执行统计. 内部类型为 `int64`. */
      cmdExecutedNum: number;

      /** 最后指令执行时间. 内部类型为 `int64`. */
      cmdExecutedLastTime: number;

      /**
       * 累计在线时间.
       * @deprecated 源码中尚未实现.
       */
      onlineTotalTime: number;

      /** 工作平台. */
      platform: string;

      /** 是否启用. */
      enable: boolean;
  }

  /** 代表一个插件的信息. */
  export interface ExtInfo {
      /** 插件名称, 不能与内置插件名(log, fun, story 等)相同. */
      name: string;

      /** 插件别名, 不能与内置插件名(log, fun, story 等)相同. */
      aliases: string[];

      /**
       * 插件版本. 推荐使用 Semantic Versioning, 即 `大版本.小版本.补丁`.
       * 如果插件目录下存在多个名称相同但版本不同的插件, 它们可能会全部被读取, 从而造成冲突.
       */
      version: string;

      /**
       * 是否在骰子加入新群时自动开启该插件. 从 `seal.ext.new` 取得时为 `true`.
       * 可被骰主在插件管理中更改.
       */
      autoActive: boolean;

      /**
       * 该插件的指令集合. 指令只有在这里注册的名字才会被用户触发, 而自身的 `name` 与此无关.
       * 指令可以将多个名字关联到自身.
       */
      cmdMap: {[_: string]: CmdItemInfo};

      /** 插件作者. */
      author: string;

      /** 插件是否已经被加载. */
      isLoaded: boolean;

      /** 收到非指令时的回调函数. */
      onNotCommandReceived: (ctx: MsgContext, msg: Message) => void;

      /** 收到指令(包括本插件的指令和其他插件的指令)时的回调函数. 在正常执行完指令后被调用. */
      onCommandReceived: (ctx: MsgContext, msg: Message, cmdArgs: CmdArgs) => void;

      /** 收到任何信息时的回调函数. 如果信息是指令, 则在处理完后被调用. */
      onMessageReceived: (ctx: MsgContext, msg: Message) => void;

      /**
       * 消息被删除时的回调函数. 被调用时 `ctx` 中的任何字段都不保证有效,
       * `msg` 中仅保证 `time`, `groupId` 或 `channelId` 有效.
       */
      onMessageDeleted: (ctx: MsgContext, msg: Message) => void;

      /**
       * 消息被修改时的回调函数. 仅在部分平台有效. 被调用时 `ctx` 中的任何字段都不保证有效,
       * `msg` 中仅保证 `time`, `message`, `groupId` 或 `channelId` 有效.
       */
      onMessageEdit: (ctx: MsgContext, msg: Message) => void;

      /** 骰子加入新群组时的回调函数. 在发送完入群致辞后被调用. 仅保证 `msg` 中的 `groupId` 或 `channelId` 有效. */
      onGroupJoined: (ctx: MsgContext, msg: Message) => void;

      // 在源码中从未读取过这个字段
      // /** 他人加入新群组时的回调函数. 在发送完欢迎词后被调用. */
      // onGroupMemberJoined: (ctx: MsgContext, msg: Message) => void;

      /** 一些平台上, 骰子加入新服务器时的回调函数. 在发送完入群致辞后被调用. 仅保证 `msg` 中的 `guildId` 有效. */
      onGuildJoined: (ctx: MsgContext, msg: Message) => void;

      /** 用户添加骰子为好友后的回调函数. 在发送完致辞后被调用. 仅保证 `msg` 中的 `sender.userId` 有效. */
      onBecomeFriend: (ctx: MsgContext, msg: Message) => void;

      /** 插件加载完成后的回调函数. */
      onLoad: () => void;

      /** 系统内部用来获取插件信息的函数, 在执行 `.help <插件名>` 时可能被调用. */
      getDescText: (info: ExtInfo) => string;

      /**
       * 从插件独有的数据库中获取名为 `key` 的数据表.
       * @example
       * const data = JSON.parse(extension.storageGet("player_levels") || "{}");
       */
      storageGet(key: string): string;

      /**
       * 向插件独有的数据库中存储名为 `key` 的数据表.
       * @example
       * const data = { name: "Alice", age: 32 };
       * extension.storageSet("player_profile", JSON.stringify(data));
       */
      storageSet(key: string, value: string): void;

      // 省略了不应在 JS 插件中使用的方法.
  }

  /** 群组信息. */
  export interface GroupInfo {
      /** 骰子在该群组内是否开启. */
      active: boolean;

      /** 群组 ID. */
      groupId: string;

      /** 某些平台上的服务器 ID. */
      guildId: string;

      /** 某些平台上的频道 ID. */
      channelId: string;

      /** 群组名称. */
      groupName: string;

      /** COC 规则序号, 见 `setcoc` 指令. */
      cocRuleIndex: number;

      /** 如果当前有 log, 当前 log 的名字. */
      logCurName: string;

      /** 当前群组内是否开启 log. */
      logOn: boolean;

      /** 骰子最后发送消息的事件. */
      recentDiceSendTime: number;

      /** 是否在该群组发送欢迎消息. */
      showGroupWelcome: boolean;

      /** 欢迎消息文本. */
      groupWelcomeMessage: string;

      /** 骰子进群时间. */
      enteredTime: number;

      /** 邀请骰子进群的用户 ID. */
      inviteUserId: number;

      // 省略了一些不应在 JS 环境内使用的方法.
  }

  /** 群组中用户信息. */
  export interface GroupPlayerInfo {
      /** 用户昵称, 该字段是缓存的, 可能不准确. */
      name: string;

      /** 用户 ID. */
      userId: number;

      /** 最后发送指令的时间. 内部类型为 `int64`. */
      lastCommandTime: number;

      /** 名片模版. */
      autoSetNameTemplate: string;
  }

  /** 键值对参数类型. */
  export interface Kwarg {
      /** 键名. */
      name: string;

      /** 该参数是否有值. */
      valueExists: boolean;

      /** 如果有值, 该参数的值. */
      value: string;

      /** 将该参数转换为布尔值. */
      asBool: boolean;

      /** 将该参数转换为 `--ok` 或者 `--key=value` 格式.*/
      string(): string;
  }

  /** 信息源. 在不同的上下文中, 并不是所有字段都有效. */
  export interface Message {
      /** 信息发送的时间戳. 内部类型为 `int64`. */
      time: number;

      /** 是私聊还是群聊. */
      messageType: "private" | "group";

      /** 消息所在的群组 ID. */
      groupId: string;

      /** 类似 Discord 的平台中, 一个频道(类似一个群)的 ID. */
      channelId: string;

      /** 类似 Discord 的平台中, 一个服务器的 ID. */
      guildId: string;

      /** 消息发送人信息. */
      sender: { nickname: string, userId: string };

      /** 原始消息内容. */
      message: string;

      /** 原始消息 ID, 具体格式视具体平台和 SDK 而定. */
      rawId: any;

      /** 消息平台代号. */
      platform: string;

      /** 群组名, 在一些上下文中没有有效值. */
      groupName: string;

      // /** 消息段. */
      // segment: IMessageElement[];
  }

  /** 信息上下文. 在不同的上下文中, 并不是所有字段都有效. */
  export interface MsgContext {
      /** 群组信息. 指令的解析函数中, `ctx` 一般是缓存的. 其他一些事件中这个字段可能无效. */
      group: GroupInfo;

      /** 主要用户信息. 通常是发送指令或消息的用户. */
      player: GroupPlayerInfo;

      /** 终结点信息, 可以简单地理解为一个骰子账号. */
      endPoint: EndPointInfo;

      /** 当前群组骰子是否开启. */
      isCurGroupBotOn: boolean;

      /** 当前是否是私聊. */
      isPrivate: boolean;

      /** `player` 的权限等级. -30 黑名单, 0 一般用户, 40 邀请者, 50 管理, 60 群主, 70 信任, 100 骰主*/
      privilegeLevel: number;

      /** 代骰文本, 代骰时可修改. */
      delegateText: string;

      /** 对骰主通知列表中的每个 ID, 如果与当前终结点平台相同则发送通知信息, 否则跳过. */
      notice(text: string): void;

      /**
       * 对骰主通知列表中的每个 ID, 如果与当前终结点平台相同则发送通知信息, 否则搜索所有可用终结点,
       * 用平台相同的终结点发送通知.
       */
      noticeCrossPlatform(text: string): void;

      // 省略了许多不适合在 JS 环境使用的方法.
  }
}