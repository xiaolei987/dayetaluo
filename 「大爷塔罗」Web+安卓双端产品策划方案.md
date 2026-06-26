# 「大爷塔罗」Web\+安卓双端产品策划方案

以下是完整可直接使用的 Markdown 文档源码，你可以全选复制后粘贴到任意文本编辑器，保存为 `大爷塔罗产品策划方案.md` 即可得到可编辑、可导出的完整策划文档。

```Markdown
# 「大爷塔罗」Web+安卓双端产品策划方案
**文档版本**：V1.1  
**编制日期**：2026年06月26日  
**适用范围**：产品设计、技术开发、运营推广全流程  
**文档状态**：正式交付版

---

## 目录
1. 项目概述
2. 产品功能详细设计
3. 美术设计规范
4. 技术架构方案
5. AI解读系统完整设计
6. 后台管理系统功能清单
7. 核心功能代码示例
8. 开发排期与资源配置
9. 运营与商业化方案
10. 风险与合规说明
11. 附录

---

## 一、项目概述
### 1.1 项目定位
「大爷塔罗」是一款面向年轻女性群体、主打小红书内容传播的塔罗占卜工具产品。产品以**经典韦特塔罗**为专业基底，搭配小红书风格的小清新视觉体系，融合AI智能解读与沉浸式抽牌交互，实现「Web端快速获客+安卓端用户沉淀」的双端联动模式。核心优势为：高颜值视觉、专业牌理、灵活可配置的AI能力、易于长期迭代的技术架构。

### 1.2 目标用户画像
- **核心用户**：18-35岁女性，小红书深度用户，关注情感、职场、成长话题，对神秘学有好奇心，追求仪式感与审美体验
- **次核心用户**：塔罗入门爱好者，需要便捷的线上占卜工具，认可韦特塔罗的正统性
- **边缘用户**：存在决策困惑、情绪疏导需求的泛娱乐用户

### 1.3 产品核心目标
1. 体验层：打造行业内视觉差异化的抽牌体验，兼顾仪式感与轻量化
2. 内容层：基于正统韦特塔罗体系，结合AI实现低成本、个性化解读
3. 技术层：实现全链路配置化，AI模型、牌意、牌阵、前端文案均可后台修改，无需发版
4. 商业层：通过Web端内容传播引流，安卓端承接留存与后续商业化

---

## 二、产品功能详细设计
### 2.1 前端用户端功能架构
#### 2.1.1 塔罗牌库模块
- 完整收录78张韦特塔罗牌（22张大阿卡纳+56张小阿卡纳）
- 单牌详情包含：牌面大图、正位关键词、逆位关键词、正位详细释义、逆位详细释义、爱情/事业/财运三维度解读
- 支持正/逆位随机机制，抽牌结果中明确标识正逆位
- 支持牌库检索：按名称、大/小阿卡纳、元素属性筛选

#### 2.1.2 抽牌交互模块
- 自动洗牌：点击后触发物理仿真洗牌动画，持续2-3秒
- 手动洗牌：支持手指滑动牌堆驱动洗牌，增强参与感
- 切牌操作：洗牌结束后，用户可拖动切牌线将牌堆分为两叠
- 抽牌模式：
  - 自由抽牌：从牌堆中任意位置点击选牌
  - 自动抽牌：一键按牌阵数量随机抽取
- 翻牌动效：3D轴向翻转，配合淡入音效，支持单张/批量翻开

#### 2.1.3 牌阵系统模块
预置8套经典牌阵，后台支持新增编辑，无需发版：

| 牌阵名称 | 牌数 | 适用场景 | 位置含义 |
|:---|:---:|:---|:---|
| 每日一牌 | 1张 | 日常运势、快速指引 | 当日核心能量与提示 |
| 时间流三牌阵 | 3张 | 通用问题分析 | 过去 - 现在 - 未来 |
| 四元素牌阵 | 4张 | 综合现状诊断 | 火（行动）- 水（情绪）- 风（思维）- 土（现实） |
| 爱情十字牌阵 | 5张 | 情感关系分析 | 现状、对方想法、关系阻碍、发展趋势、结果指引 |
| 二择一牌阵 | 6张 | 两难决策 | 现状、选项A发展、选项A结果、选项B发展、选项B结果、最终建议 |
| 六芒星牌阵 | 7张 | 深度问题剖析 | 过去、现在、未来、环境影响、隐藏因素、建议、最终结果 |
| 事业发展牌阵 | 6张 | 职业规划 | 现状、个人能力、外部机会、潜在挑战、行动建议、发展结果 |
| 凯尔特十字 | 10张 | 全面深度占卜 | 经典10位置完整逻辑体系 |

#### 2.1.4 AI解读模块
- 一键生成解读：抽牌完成后自动调用AI，输出结构化解读报告
- 解读风格切换：用户可选择「温柔治愈」「理性分析」「传统专业」三种风格
- 追问对话：支持针对本次牌面继续提问，AI结合上下文深入解答
- 解读保存：自动存入占卜历史，支持随时回看、复制、分享
- 降级兜底：AI服务不可用时，自动切换为本地专业牌意拼接解读

#### 2.1.5 用户中心模块
- 占卜历史：按时间倒序展示所有占卜记录，支持按牌阵、日期筛选
- 收藏夹：收藏重要的占卜结果与解读
- 每日签到：连续签到机制，培养用户使用习惯
- 分享生成：一键生成小红书规格（3:4竖版）的精美分享图
- 基础设置：正逆位开关、动画音效开关、深色模式切换

### 2.2 功能优先级划分
- P0核心功能：牌库系统、基础抽牌、4个基础牌阵、AI基础解读、占卜历史
- P1重要功能：洗牌切牌动效、全部8个牌阵、AI追问、分享卡片、后台配置中心
- P2优化功能：签到体系、牌库检索、深色模式、自定义牌阵

---

## 三、美术设计规范
### 3.1 整体风格定义
**核心原则：外柔内典**
- 界面框架：小红书风格小清新，柔和、留白、精致、治愈
- 塔罗牌面：严格使用经典莱德·韦特塔罗原版高清牌面，不做风格化篡改，保证专业辨识度
- 视觉融合：通过牌背、边框、背景、动效实现风格统一，不修改牌面本身

### 3.2 色彩系统
| 色彩类型 | 色值 | 使用场景 |
|:---|:---|:---|
| 主色 | `#B8A9C9` 柔雾紫 | 主按钮、重点标识、品牌色 |
| 主色渐变 | `#9B8AC4 → #7B68A8` | 核心操作按钮、强调区块 |
| 辅助金 | `#E8D5B7` 淡粉金 | 图标点缀、卡牌边框、高光 |
| 背景色 | `#FAF8F5` 米白色 | 页面主背景 |
| 背景渐变 | `#FAF8F5 → #F5F0EB` | 沉浸式页面背景 |
| 正位标识 | `#A8C5A0` 柔绿 | 正位标签、正向提示 |
| 逆位标识 | `#E5B896` 柔橘 | 逆位标签、提醒信息 |
| 一级文字 | `#4A4A4A` 深灰 | 标题、正文 |
| 二级文字 | `#7A7A7A` 中灰 | 次要说明、辅助文字 |
| 三级文字 | `#B0B0B0` 浅灰 | 置灰、占位符 |

### 3.3 界面设计规范
- **圆角体系**：卡片16px、按钮12px、弹窗16px，全程无尖锐直角
- **阴影规范**：统一使用低不透明度柔阴影 `box-shadow: 0 4px 20px rgba(123, 104, 168, 0.08)`
- **间距系统**：采用8px基数网格，常用间距8/12/16/24/32px
- **排版层级**：标题18px加粗、副标题16px、正文14px、辅助文字12px
- **图标风格**：2px线宽线性图标，圆角端点，统一视觉重量

### 3.4 卡牌视觉规范
- 牌面：经典韦特塔罗高清原图，保留原始色彩与细节
- 牌背：原创小清新风格，对称紫金色花纹，符合整体视觉调性
- 卡牌边框：1px淡金色细边框，圆角8px，提升精致感
- 正逆位标识：卡牌右下角12x12px微型角标，不遮挡牌面主体
- 选中态：外发光淡紫色光晕，轻微放大效果

---

## 四、技术架构方案
### 4.1 整体技术选型
| 层级 | 技术方案 | 选型理由 |
|:---|:---|:---|
| 前端双端 | Flutter 3.x | 一套代码同时输出Web与安卓，动画性能优异，适合卡牌翻转动效，维护成本低 |
| 状态管理 | Riverpod 2.x | 编译期安全、可测试性强、依赖解耦，符合Clean Architecture理念 |
| 后端框架 | NestJS（TypeScript） | 模块化架构、TypeScript类型安全、前端技术栈统一、开发效率高 |
| 数据库 | MySQL 8.0 | 关系型数据存储，适配用户、牌库、历史记录等结构化数据 |
| 缓存 | Redis 7.0 | AI结果缓存、接口限流、热点数据缓存 |
| 对象存储 | 阿里云OSS / 七牛云 | 存储牌面高清图、分享生成图、静态资源 |
| 后台管理 | Vue 3 + Element Plus | 生态成熟、组件丰富、后台开发效率高 |
| 部署 | Docker + Nginx | 容器化部署，环境一致性强，便于弹性扩容 |

### 4.2 前端架构（Clean Architecture 整洁架构）
采用四层架构，严格遵循依赖倒置原则，业务逻辑与UI、数据源完全解耦，便于后期维护与修改。
```

lib/
├── core/ \# 核心基础层（无业务依赖）
│ ├── theme/ \# 主题配色、文字样式、设计系统
│ ├── utils/ \# 工具函数、通用方法、扩展类
│ ├── routes/ \# 路由配置、导航管理
│ └── constants/ \# 常量、枚举、配置项
├── domain/ \# 领域层（核心业务逻辑）
│ ├── entities/ \# 业务实体（卡牌、牌阵、解读结果）
│ ├── repositories/ \# 仓库抽象接口（契约定义）
│ └── usecases/ \# 业务用例（抽牌、洗牌、生成解读）
├── data/ \# 数据层（实现领域层契约）
│ ├── datasources/ \# 数据源（本地JSON/远程API）
│ ├── repositories/ \# 仓库实现类
│ └── models/ \# 数据模型、DTO、序列化
└── presentation/ \# 表现层（页面与交互）
├── pages/ \# 页面级组件
├── widgets/ \# 通用复用组件
├── providers/ \# 状态管理（Riverpod）
└── anim/ \# 动画控制器、动效定义

```Plaintext

**架构优势**：
- 更换AI服务商、修改牌库数据源时，仅需修改data层，不影响核心业务
- 业务逻辑集中在domain层，可单元测试，稳定性高
- 页面与状态分离，UI迭代不影响业务逻辑

### 4.3 后端架构
采用模块化单体架构，预留微服务拆分能力，初期快速迭代，后期可平滑扩展。
```

┌─────────────────────────────────────────────────┐
│ API 网关层 │
│ 路由分发、鉴权认证、限流熔断、参数校验 │
├─────────────────────────────────────────────────┤
│ 业务服务层 │
│ 用户模块 塔罗核心模块 AI解读模块 后台管理模块 │
├─────────────────────────────────────────────────┤
│ 数据层 │
│ MySQL 业务数据 Redis 缓存 OSS 文件存储 │
└─────────────────────────────────────────────────┘

```Plaintext

核心设计原则：
- 所有业务配置（牌意、牌阵、Prompt、AI参数）全部数据库化，后台可视化修改
- AI解读服务采用策略模式，新增模型仅需添加实现类，无需修改主流程
- 统一返回格式、统一异常处理、统一日志埋点

### 4.4 数据库表结构设计
基于MySQL 8.0设计，核心业务表如下：

#### 4.4.1 用户表 `sys_user`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | bigint | 是 | 用户唯一ID |
| uuid | varchar(64) | 否 | 匿名用户标识，无需登录时使用 |
| nickname | varchar(64) | 否 | 用户昵称 |
| avatar | varchar(255) | 否 | 头像地址 |
| user_type | tinyint | 否 | 用户类型：1-游客 2-注册用户 |
| total_divination | int | 否 | 累计占卜次数 |
| last_login_time | datetime | 否 | 最后登录时间 |
| create_time | datetime | 否 | 创建时间 |
| update_time | datetime | 否 | 更新时间 |
| is_deleted | tinyint | 否 | 逻辑删除：0-正常 1-删除 |

#### 4.4.2 塔罗牌表 `tarot_card`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | int | 是 | 牌ID |
| card_name | varchar(32) | 否 | 中文牌名 |
| card_name_en | varchar(64) | 否 | 英文牌名 |
| card_type | tinyint | 否 | 类型：1-大阿卡纳 2-小阿卡纳 |
| element | varchar(16) | 否 | 元素：火/水/风/土 |
| suit | varchar(16) | 否 | 花色：权杖/圣杯/宝剑/星币 |
| image_url | varchar(255) | 否 | 牌面图片地址 |
| upright_keyword | varchar(128) | 否 | 正位关键词，逗号分隔 |
| reversed_keyword | varchar(128) | 否 | 逆位关键词，逗号分隔 |
| upright_desc | text | 否 | 正位详细释义 |
| reversed_desc | text | 否 | 逆位详细释义 |
| love_desc | text | 否 | 爱情维度解读 |
| career_desc | text | 否 | 事业维度解读 |
| wealth_desc | text | 否 | 财运维度解读 |
| sort | int | 否 | 排序号 |
| status | tinyint | 否 | 状态：0-禁用 1-启用 |

#### 4.4.3 牌阵表 `tarot_spread`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | int | 是 | 牌阵ID |
| spread_name | varchar(64) | 否 | 牌阵名称 |
| card_count | int | 否 | 所需牌数 |
| cover_image | varchar(255) | 否 | 封面图 |
| scene | varchar(128) | 否 | 适用场景描述 |
| spread_desc | text | 否 | 牌阵详细介绍 |
| difficulty | tinyint | 否 | 难度：1-入门 2-进阶 3-高级 |
| is_free | tinyint | 否 | 是否免费：0-付费 1-免费 |
| sort | int | 否 | 排序号 |
| status | tinyint | 否 | 状态：0-下架 1-上架 |
| create_time | datetime | 否 | 创建时间 |
| update_time | datetime | 否 | 更新时间 |

#### 4.4.4 牌阵位置表 `spread_position`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | int | 是 | 位置ID |
| spread_id | int | 否 | 关联牌阵ID |
| position_name | varchar(64) | 否 | 位置名称 |
| position_desc | varchar(255) | 否 | 位置含义说明 |
| x_percent | decimal(5,2) | 否 | X轴坐标百分比，用于前端布局 |
| y_percent | decimal(5,2) | 否 | Y轴坐标百分比 |
| sort | int | 否 | 位置序号 |

#### 4.4.5 占卜记录表 `divination_record`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | bigint | 是 | 记录ID |
| user_id | bigint | 否 | 用户ID |
| spread_id | int | 否 | 牌阵ID |
| user_question | varchar(500) | 否 | 用户提问内容 |
| card_ids | varchar(255) | 否 | 抽到的牌ID列表，逗号分隔 |
| card_reversed | varchar(255) | 否 | 正逆位标记，0正1逆，逗号分隔 |
| interpretation_id | bigint | 否 | 关联解读结果ID |
| is_collected | tinyint | 否 | 是否收藏 |
| create_time | datetime | 否 | 占卜时间 |

#### 4.4.6 AI解读结果表 `ai_interpretation`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | bigint | 是 | 解读ID |
| record_id | bigint | 否 | 关联占卜记录ID |
| ai_model | varchar(64) | 否 | 使用的AI模型 |
| style_type | varchar(32) | 否 | 解读风格 |
| content | longtext | 否 | 解读完整内容 |
| prompt_version | varchar(32) | 否 | 使用的Prompt版本号 |
| response_time | int | 否 | 响应耗时（毫秒） |
| status | tinyint | 否 | 状态：1-生成中 2-成功 3-失败 |
| error_msg | varchar(255) | 否 | 失败原因 |
| create_time | datetime | 否 | 创建时间 |

#### 4.4.7 AI配置表 `ai_config`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | int | 是 | 配置ID |
| provider_name | varchar(64) | 否 | 服务商名称 |
| model_name | varchar(64) | 否 | 模型名称 |
| api_key | varchar(255) | 否 | 加密存储的API密钥 |
| api_url | varchar(255) | 否 | 接口地址 |
| temperature | decimal(3,2) | 否 | 温度参数 |
| max_tokens | int | 否 | 最大输出长度 |
| timeout | int | 否 | 超时时间（秒） |
| weight | int | 否 | 负载权重 |
| is_default | tinyint | 否 | 是否默认模型 |
| status | tinyint | 否 | 状态：0-禁用 1-启用 |

#### 4.4.8 Prompt模板表 `prompt_template`
| 字段名 | 数据类型 | 主键 | 说明 |
|:---|:---|:---:|:---|
| id | int | 是 | 模板ID |
| template_name | varchar(64) | 否 | 模板名称 |
| style_type | varchar(32) | 否 | 对应解读风格 |
| system_prompt | text | 否 | 系统提示词 |
| user_template | text | 否 | 用户输入模板 |
| version | varchar(32) | 否 | 版本号 |
| is_current | tinyint | 否 | 是否当前生效版本 |
| create_time | datetime | 否 | 创建时间 |
| remark | varchar(255) | 否 | 版本备注 |

### 4.5 API接口设计大纲
采用RESTful规范，统一返回格式 `{code, msg, data}`，分为**用户端接口**与**管理端接口**两大体系。

#### 4.5.1 用户端接口（C端）
##### （1）用户模块
- POST /api/user/guest-login  游客登录，生成唯一标识
- POST /api/user/login  手机号/第三方登录
- GET /api/user/info  获取用户信息
- PUT /api/user/info  更新用户信息

##### （2）塔罗核心模块
- GET /api/tarot/card/list  获取牌库列表
- GET /api/tarot/card/{id}  获取单牌详情
- GET /api/tarot/spread/list  获取牌阵列表
- GET /api/tarot/spread/{id}  获取牌阵详情（含位置信息）
- POST /api/tarot/draw  执行抽牌，返回牌面结果
- GET /api/tarot/record/list  获取占卜历史记录
- GET /api/tarot/record/{id}  获取单条记录详情
- POST /api/tarot/record/collect  收藏/取消收藏记录

##### （3）AI解读模块
- POST /api/ai/interpretation/generate  生成AI解读
- GET /api/ai/interpretation/{id}  获取解读结果
- POST /api/ai/interpretation/follow-up  追问对话

#### 4.5.2 管理端接口（B端）
##### （1）鉴权模块
- POST /api/admin/login  管理员登录
- GET /api/admin/info  获取管理员信息
- POST /api/admin/logout  退出登录

##### （2）牌库管理
- GET /api/admin/card/list  牌库分页列表
- POST /api/admin/card  新增卡牌
- PUT /api/admin/card/{id}  编辑卡牌
- DELETE /api/admin/card/{id}  删除卡牌
- POST /api/admin/card/batch-import  批量导入牌库

##### （3）牌阵管理
- GET /api/admin/spread/list  牌阵分页列表
- POST /api/admin/spread  新增牌阵
- PUT /api/admin/spread/{id}  编辑牌阵
- PUT /api/admin/spread/{id}/status  上下架牌阵

##### （4）AI配置管理
- GET /api/admin/ai/config/list  AI模型配置列表
- POST /api/admin/ai/config  新增模型配置
- PUT /api/admin/ai/config/{id}  编辑模型配置
- GET /api/admin/ai/prompt/list  Prompt模板列表
- POST /api/admin/ai/prompt  新增模板版本
- PUT /api/admin/ai/prompt/{id}/use  切换生效版本

##### （5）数据统计
- GET /api/admin/stats/overview  数据概览
- GET /api/admin/stats/divination  占卜数据统计
- GET /api/admin/stats/ai-call  AI调用统计

---

## 五、AI解读系统完整设计
### 5.1 系统架构
采用「模板引擎 + 大模型适配层 + 降级兜底」三层结构，保证专业性、灵活性与稳定性。
```

用户输入问题 \+ 牌面数据
↓
Prompt模板组装（变量注入 \+ 风格参数）
↓
大模型适配层（统一接口，适配多家厂商）
↓
结果格式化 \+ 敏感词过滤
↓
返回前端 \+ 持久化存储
↓
（异常时）本地牌意库降级解读

```Plaintext

### 5.2 完整Prompt模板库
#### 5.2.1 系统角色Prompt（通用基础版）
```

# 角色设定

你是一位拥有10年实战经验的专业韦特塔罗解读师，深度研究荣格心理学与象征主义，擅长用温暖且有力量的语言解读牌面。

# 解读原则

1. 严格基于用户提供的牌阵、每张牌的正逆位、牌阵位置含义进行解读，禁止凭空捏造信息。

2. 不做绝对化的命运预言，强调人的主观能动性，引导用户关注自身选择与成长。

3. 语言表达流畅自然，避免生硬堆砌术语，符合年轻女性用户的阅读习惯，语气温柔有共情力。

4. 禁止涉及医疗、法律、投资等专业领域建议，不做出极端负面判断。

5. 结尾必须包含温馨提示："塔罗解读仅供娱乐与心理参考，最终选择权始终在你手中。"

# 输出格式

请严格按照以下结构输出，使用Markdown格式：

## 🔮 牌面总览

用一句话概括本次牌阵的核心主题与整体能量基调。

## 📍 分牌详细解读

按牌阵位置顺序逐一解读，格式：
**【位置名称】牌名 · 正/逆位**
解读内容，结合位置含义与牌意进行分析。

## ✨ 综合结论

整合所有牌面信息，给出核心洞察与整体趋势分析。

## 🎯 行动建议

给出2\-3条具体、可落地的行动建议，不要空泛。

---

💡 温馨提示：塔罗解读仅供娱乐与心理参考，最终选择权始终在你手中。

```Plaintext

#### 5.2.2 用户输入变量模板
```

牌阵名称：\{\{spread\_name\}\}
牌阵说明：\{\{spread\_desc\}\}
用户问题：\{\{user\_question\}\}

抽到的牌面：
\{\{card\_list\}\}
（格式示例：

1. 【过去】愚人 · 正位

2. 【现在】女祭司 · 逆位

3. 【未来】魔术师 · 正位）

请基于以上信息进行专业解读。

```Plaintext

#### 5.2.3 三种风格差异化参数
| 风格 | 温度值 | 语气调整 | 适用场景 |
|:---|:---:|:---|:---|
| 温柔治愈风 | 0.7 | 多用共情性表达，侧重情绪疏导与心理安抚 | 情感问题、情绪困惑 |
| 理性分析风 | 0.5 | 逻辑清晰，客观中立，侧重现状分析与利弊梳理 | 事业决策、选择问题 |
| 传统专业风 | 0.6 | 使用专业塔罗术语，侧重象征意义与牌理推演 | 塔罗爱好者、深度占卜 |

### 5.3 后台可配置项
1. **模型管理**：支持配置多家厂商API密钥、模型名称、接口地址
2. **Prompt模板管理**：可视化编辑系统提示词、用户模板，支持版本保存与一键回滚
3. **参数调节**：温度值、最大输出长度、超时时间等参数可视化配置
4. **降级开关**：手动/自动切换降级模式，配置降级文案模板
5. **敏感词库**：可自定义敏感词列表，自动过滤违规内容

---

## 六、后台管理系统功能清单
### 6.1 内容管理中心
#### 6.1.1 牌库管理
- 78张牌的全量信息列表，支持搜索、筛选
- 单牌信息编辑：牌名、英文名、正/逆位关键词、正/逆位详细释义、爱情/事业/财运解读
- 牌面图片上传、替换
- 批量导入/导出牌库数据

#### 6.1.2 牌阵管理
- 牌阵列表：名称、牌数、适用场景、启用状态
- 新增/编辑牌阵：牌阵名称、简介、适用场景、牌数量、每个位置的名称与含义、牌阵布局坐标配置
- 上下线管理：可随时启用/停用某个牌阵，前端实时生效
- 牌阵排序：拖拽调整前端展示顺序

#### 6.1.3 文案管理
- 前端所有静态文案可视化修改：首页标语、免责声明、空状态提示、加载文案
- 分享卡片文案模板配置
- 弹窗公告、运营活动文案配置

### 6.2 AI配置中心
#### 6.2.1 模型配置
- 多模型管理：支持添加、编辑、删除AI服务商
- 配置项：服务商名称、API Key、模型ID、接口地址、请求超时时间
- 权重配置：多模型负载均衡比例设置
- 启用/停用：一键切换主力模型

#### 6.2.2 Prompt模板管理
- 模板列表：按风格分类，支持多版本并存
- 可视化编辑器：支持变量插入预览，语法高亮
- 版本管理：每次修改保存版本记录，支持一键回滚
- A/B测试配置：可配置分流比例，测试不同模板的用户满意度

#### 6.2.3 调用监控
- 调用概览：今日调用量、成功率、平均响应时间、失败率
- 调用明细：按用户、时间、模型筛选查询
- 限流配置：全局日调用上限、单用户日调用上限
- 异常告警：失败率超过阈值自动标记告警

### 6.3 用户与数据中心
- 用户管理：用户列表、账号状态、使用记录查询
- 占卜数据统计：每日占卜次数、热门牌阵排行、问题类型分布
- 留存数据：次日留存、7日留存、功能使用率
- 解读内容审核：人工审核AI生成内容，违规内容处理

### 6.4 系统设置
- 管理员账号与权限：RBAC角色权限体系，超级管理员/运营/内容编辑三级角色
- 操作日志：所有后台操作留痕，可追溯
- 系统配置：域名、安全策略、缓存清理

---

## 七、核心功能代码示例
### 7.1 Flutter 3D卡牌翻转动画核心实现
```dart
import 'package:flutter/material.dart';

class TarotFlipCard extends StatefulWidget {
  final Widget front; // 牌面
  final Widget back;  // 牌背
  final bool isFront; // 是否显示正面
  final Duration duration;

  const TarotFlipCard({
    super.key,
    required this.front,
    required this.back,
    this.isFront = false,
    this.duration = const Duration(milliseconds: 800),
  });

  @override
  State<TarotFlipCard> createState() => _TarotFlipCardState();
}

class _TarotFlipCardState extends State<TarotFlipCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    if (widget.isFront) _controller.value = 0.5;
  }

  @override
  void didUpdateWidget(TarotFlipCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isFront != widget.isFront) {
      widget.isFront ? _controller.forward() : _controller.reverse();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final angle = _animation.value * pi;
        // 翻转到90度时切换正反面
        final showFront = _animation.value > 0.5;
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001) // 透视效果
            ..rotateY(angle),
          child: showFront
              ? widget.front
              : Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.identity()..rotateY(pi),
                  child: widget.back,
                ),
        );
      },
    );
  }
}
```

### 7\.2 洗牌动画核心逻辑

```Dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';

// 单张卡牌位置状态
class CardPosition {
  final int index;
  final Offset offset;
  final double rotation;

  CardPosition(this.index, this.offset, this.rotation);
}

// 洗牌状态管理
class ShuffleNotifier extends StateNotifier<List<CardPosition>> {
  final int cardCount;
  final Random _random = Random();

  ShuffleNotifier(this.cardCount)
      : super(List.generate(cardCount, (i) => CardPosition(i, Offset.zero, 0)));

  // 执行一次洗牌动画
  Future<void> shuffle() async {
    for (int i = 0; i < 5; i++) {
      state = List.generate(cardCount, (index) {
        final dx = _random.nextDouble() * 40 - 20;
        final dy = _random.nextDouble() * 60 - 30;
        final rotation = (_random.nextDouble() * 0.1 - 0.05) * pi;
        return CardPosition(index, Offset(dx, dy), rotation);
      });
      await Future.delayed(const Duration(milliseconds: 120));
    }
    // 复位堆叠
    state = List.generate(cardCount, (i) => CardPosition(i, Offset.zero, 0));
  }
}

// Provider 定义
final shuffleProvider =
    StateNotifierProvider<ShuffleNotifier, List<CardPosition>>((ref) {
  return ShuffleNotifier(78);
});
```

### 7\.3 牌阵布局核心组件

```Dart
import 'package:flutter/material.dart';
import '../domain/entities/spread_entity.dart';

class SpreadLayout extends StatelessWidget {
  final SpreadEntity spread;
  final List<int> cardIds;
  final Function(int index) onCardTap;

  const SpreadLayout({
    super.key,
    required this.spread,
    required this.cardIds,
    required this.onCardTap,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = constraints.maxHeight;
        return Stack(
          children: List.generate(spread.positions.length, (index) {
            final pos = spread.positions[index];
            // 后台配置的百分比坐标转换为实际像素
            final left = width * pos.xPercent;
            final top = height * pos.yPercent;
            return Positioned(
              left: left - 40, // 卡牌宽度一半
              top: top - 60,  // 卡牌高度一半
              child: GestureDetector(
                onTap: () => onCardTap(index),
                child: TarotFlipCard(
                  front: TarotCardFace(cardId: cardIds[index]),
                  back: const TarotCardBack(),
                  isFront: cardIds[index] != null,
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
```

---

## 八、开发排期与资源配置

### 8\.1 项目总周期：14周

|阶段|周期|核心交付物|
|---|---|---|
|第一阶段：需求确认与设计|2周|最终PRD、全量UI设计稿、技术方案评审通过|
|第二阶段：核心功能开发|5周|牌库、抽牌、基础牌阵、用户系统、基础后端接口|
|第三阶段：AI与后台开发|3周|AI解读服务、后台管理系统、配置中心全量功能|
|第四阶段：双端适配与优化|2周|安卓打包签名、Web端响应式适配、性能优化、动效调优|
|第五阶段：测试与上线|2周|功能测试、兼容性测试、灰度发布、正式上线|

### 8\.2 人员配置建议

|角色|人数|核心职责|
|---|---|---|
|产品经理|1|需求梳理、原型设计、项目协调、验收|
|UI设计师|1|界面设计、卡牌视觉处理、动效设计、分享图模板|
|Flutter开发工程师|1\-2|双端前端开发、动效实现、适配调试|
|后端开发工程师|1\-2|业务接口、AI服务、后台管理系统开发|
|测试工程师|1|功能测试、兼容性测试、回归测试|

---

## 九、运营与商业化方案

### 9\.1 小红书传播策略

1. **分享卡片优化**：内置3套小红书风格分享模板，3:4竖版尺寸，支持一键保存图片

2. **话题矩阵**：主话题\#大爷塔罗，副话题\#每日塔罗指引 \#韦特塔罗 \#塔罗占卜

3. **内容种草**：合作情感类、塔罗类博主产出测评与占卜案例，引导Web端引流

4. **每日运势**：每日生成固定日签内容，降低用户分享门槛

### 9\.2 商业化路径

1. **第一阶段（0\-1）**：基础功能全免费，通过广告变现（插屏广告、激励视频）

2. **第二阶段（增长期）**：推出会员订阅，解锁无限AI解读、高级牌阵、专属解读风格

3. **第三阶段（成熟期）**：开放单次付费深度解读，对接真人塔罗师导流分成

### 9\.3 双端联动策略

- Web端：轻量化体验，无需登录即可使用基础功能，通过分享传播获客，引导下载APP

- 安卓端：完整功能体验，支持账号同步历史记录，承接留存与商业化

---

## 十、风险与合规说明

1. **内容合规**：所有AI解读经过敏感词过滤，禁止涉及医疗、法律、封建迷信等违规内容；显著位置标注「娱乐仅供参考」

2. **隐私合规**：用户占卜记录加密存储，不收集非必要个人信息，符合《个人信息保护法》

3. **技术风险**：AI服务不可用时有本地降级方案，不影响核心功能使用

4. **版权风险**：韦特塔罗牌面采用公版版本，或购买商用授权，避免版权纠纷

---

## 十一、附录

### 11\.1 术语表

- 大阿卡纳：22张核心塔罗牌，代表人生重大主题

- 小阿卡纳：56张花色牌，分火水土风四组，代表日常事件

- 牌阵：塔罗占卜时卡牌的排列方式与位置含义体系

- 正逆位：卡牌正放与倒放，解读含义不同

### 11\.2 接口设计规范

- 所有接口采用RESTful风格，统一返回格式

- 统一状态码、错误码体系

- 所有配置类接口设置缓存机制，降低服务器压力

### 11\.3 安卓端发布上架流程清单

#### 11\.3\.1 打包前准备

1. 生成正式签名密钥库（keystore），妥善保存密钥与密码

2. 配置应用包名、版本号（versionCode / versionName）

3. 配置混淆规则（ProGuard / R8），避免第三方SDK与核心代码被混淆

4. 完成隐私合规配置：隐私弹窗、权限声明、用户协议

5. 接入各大应用市场SDK（推送、支付、统计等）

#### 11\.3\.2 主流应用市场上架要求

|应用市场|所需资质|审核周期|注意事项|
|---|---|---|---|
|华为应用市场|企业营业执照、软件著作权、ICP备案|1\-3工作日|需完成鸿蒙适配，隐私权限严格审核|
|小米应用商店|企业营业执照、软件著作权、ICP备案|1\-2工作日|需通过小米隐私合规检测，禁止诱导分享|
|OPPO应用商店|企业营业执照、软件著作权、ICP备案|1\-3工作日|塔罗类需标注娱乐属性，禁止封建迷信宣传|
|vivo应用商店|企业营业执照、软件著作权、ICP备案|1\-2工作日|需提供内容安全承诺函|
|应用宝（腾讯）|企业营业执照、软件著作权、ICP备案|2\-3工作日|需完成腾讯安全检测，关联公众号|
|抖音应用中心|企业营业执照、软件著作权|1\-2工作日|适配抖音跳转，支持一键下载|

#### 11\.3\.3 审核避坑要点

1. 首页、关于页显著位置标注「本应用仅供娱乐，不构成任何决策建议」

2. 所有权限必须有明确使用场景，不得申请非必要权限

3. 首次启动必须弹出隐私协议弹窗，用户同意后方可初始化SDK

4. 避免使用「算命」「改运」等违规词汇，统一使用「占卜」「心理指引」「娱乐参考」表述

5. 准备好软件著作权证书，主流市场均要求上传

### 11\.4 Web端部署上线清单

1. 域名购买与ICP备案（国内服务器必须备案）

2. 服务器配置：推荐2核4G云服务器，带宽5M起步

3. 静态资源部署：Flutter Web构建产物上传OSS，配置CDN加速

4. 后端服务Docker容器化部署，配置Nginx反向代理

5. HTTPS证书配置，强制全站HTTPS

6. 配置域名解析，绑定服务器与CDN

7. 压力测试与安全扫描，修复高危漏洞

8. 配置监控告警（服务器状态、接口可用性、AI调用异常）

```Plaintext

---

### 使用说明
将上方代码块内的全部内容复制，打开记事本/VS Code/Typora等任意文本编辑器，粘贴后保存为 `大爷塔罗产品策划方案.md`，即可得到完整可编辑、可导出PDF的Markdown文档。

需要我再补充**产品原型页面清单**或者**首版MVP功能裁剪方案**吗？
```

> （注：部分内容可能由 AI 生成）
