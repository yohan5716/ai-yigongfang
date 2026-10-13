/* ============================================================
 * AI义工坊 · 工具条目数据（唯一数据源）
 * ------------------------------------------------------------
 * 站长维护入口：P5 上线后由 /admin 后台写入本文件对应的 JSON。
 * 现阶段直接改这个文件即可，改完刷新页面生效。
 *
 * ⚠️ 新增条目必须遵守以下约束，否则 P4 的静态页面生成器会报错：
 *   - id   全局唯一，只用小写字母/数字/连字符
 *   - slug 全局唯一（决定详情页 URL：/tool/<slug>.html），同上字符集
 *   - category 必须是 categories.js 里已有的 key
 *   - status 为 "published" 才会出现在前台
 *
 * 字段说明：
 *   id         唯一标识（P6 点赞接口的主键，建议与 slug 一致）
 *   slug       详情页地址片段，纯 ASCII，改了就换 URL（慎改）
 *   name       工具名
 *   icon       卡片图标（emoji），无封面图时的回落显示
 *   cover      封面图路径（可选）。约定放 images/covers/<id>.jpg，站长后期自行上传；
 *              留空或文件不存在时，列表与详情页自动回落为分类渐变色块 + 图标
 *   guide      使用介绍 md 路径（可选）。约定 guides/<id>.md，由 /admin 后台「一键上传 .md」维护；
 *              文件存在时详情页用图文教程替换简单介绍框，配图放 images/guides/<id>/
 *   tagline    一句话简介；在详情页中作为「最大的一行标题」原样渲染（工具名下方），长度不限，
 *              站长自行决定文案（如「一个 U 盘同时支持装多个系统」），写什么就显示什么
 *   description 详细介绍，详情页正文，2–4 句
 *   category   所属分类（对应 categories.js 的 key）
 *   tags       标签数组，用于搜索与详情页展示，建议 2–4 个
 *   url        官网/下载地址
 *   github     开源仓库地址（可选）。填写后卡片按钮显示「GitHub ↗」而非「官网 ↗」
 *   platform   支持平台数组，如 ["Windows","macOS"]
 *   pricing    free | open | freemium | paid
 *   featured   是否「站长推荐」，为 true 时在推荐排序中靠前并显示角标
 *   addedAt    收录日期 YYYY-MM-DD，用于「最新」排序
 *   status     published | draft
 *   likes      点赞种子数；P6 上线后由 Worker 返回的真实值覆盖
 * ============================================================ */

window.SITE_TOOLS = [

  /* ---------- 办公必备 ---------- */
  {
    id: "pixpin", slug: "pixpin", name: "PixPin", icon: "📷", cover: "images/covers/pixpin.jpg",
    tagline: "截图贴图长截图 OCR 一体化",
    description: "把截图、贴图、长截图、OCR 文字识别塞进一个工具里，装完基本可以卸载掉三四个同类软件。贴图功能可以把截图钉在屏幕最上层，对着资料抄写或比对特别顺手；长截图对网页、聊天记录都支持一键拼接。",
    category: "办公必备", tags: ["截图", "贴图", "OCR"],
    url: "https://pixpin.cn", platform: ["Windows", "macOS"],
    pricing: "free", featured: true, addedAt: "2026-10-09", status: "published", likes: 1290
  },
  {
    id: "utools", slug: "utools", name: "uTools", icon: "🧿", cover: "images/covers/utools.jpg",
    tagline: "按一下空格就出来的效率启动器",
    description: "按下快捷键唤出搜索框，输入关键词就能找文件、算数、剪贴板历史、翻译、写 JSON、查颜色。真正的价值在于插件市场：需要什么装什么，不用装一堆常驻后台的软件。",
    category: "办公必备", tags: ["启动器", "插件", "效率"],
    url: "https://u.tools", platform: ["Windows", "macOS", "Linux"],
    pricing: "freemium", featured: true, addedAt: "2026-10-08", status: "published", likes: 963
  },
  {
    id: "yuque", slug: "yuque", name: "语雀", icon: "📚", cover: "images/covers/yuque.jpg",
    tagline: "团队知识库与文档协作",
    description: "中文排版体验最好的知识库之一，支持文档、表格、画板、思维导图混排，层级目录适合沉淀长期资料。个人免费版容量够用，适合把零散笔记整理成体系。",
    category: "办公必备", tags: ["文档", "知识库", "协作"],
    url: "https://www.yuque.com", platform: ["Web", "Windows", "macOS", "Android", "iOS"],
    pricing: "freemium", featured: false, addedAt: "2026-10-05", status: "published", likes: 654
  },
  {
    id: "libreoffice", slug: "libreoffice", name: "LibreOffice", icon: "📄", cover: "images/covers/libreoffice.jpg",
    tagline: "完全开源免费的办公套件",
    description: "Writer / Calc / Impress 对应文档、表格、演示，兼容 docx、xlsx、pptx 格式。不想为办公软件付费、又需要本地离线可用的场景，这是最稳的选择。",
    category: "办公必备", tags: ["办公套件", "开源", "离线"],
    url: "https://www.libreoffice.org", platform: ["Windows", "macOS", "Linux"],
    pricing: "open", featured: false, addedAt: "2026-09-28", status: "published", likes: 421
  },

  /* ---------- 系统工具 ---------- */
  {
    id: "everything", slug: "everything", name: "Everything", icon: "🔍", cover: "images/covers/everything.jpg",
    tagline: "Everything 本地文件 秒级 搜索 / 快到不可想象",
    description: "建立 NTFS 索引后，输入文件名几乎瞬间出结果，比 Windows 自带搜索快几个量级。支持正则、通配符、按大小和修改时间筛选，找十年前的文件也不费劲。",
    category: "系统工具", tags: ["搜索", "文件", "轻量"],
    url: "https://www.voidtools.com", platform: ["Windows"],
    pricing: "free", featured: true, addedAt: "2026-10-08", status: "published", likes: 1108
  },
  {
    id: "rufus", slug: "rufus", name: "Rufus", icon: "💾", cover: "images/covers/rufus.jpg", guide: "guides/rufus.md",
    tagline: "Rufus 让你三分钟做好一个启动盘/小白优选",
    description: "把 ISO 写成可启动 U 盘，体积不到 2MB 免安装。装 Windows 11 时可以顺手跳过 TPM 与联网账户检查，重装系统必备。",
    category: "系统工具", tags: ["U盘", "装系统", "免安装"],
    url: "https://rufus.ie", github: "https://github.com/pbatard/rufus", platform: ["Windows"],
    pricing: "open", featured: false, addedAt: "2026-10-02", status: "published", likes: 876
  },
  {
    id: "ventoy", slug: "ventoy", name: "Ventoy", icon: "🧩", cover: "images/covers/ventoy.jpg", guide: "guides/ventoy.md",
    tagline: "Ventoy一个 U 盘同时支持装多个系统Windows/Linux/",
    description: "装一次 Ventoy，之后把 ISO 文件直接拷进 U 盘就能启动，不用反复格式化。同时放 Windows、Ubuntu、PE 工具箱镜像也没问题，是装机的终极方案。",
    category: "系统工具", tags: ["多合一", "启动盘", "开源"],
    url: "https://www.ventoy.net", github: "https://github.com/ventoy/Ventoy", platform: ["Windows", "Linux"],
    pricing: "open", featured: true, addedAt: "2026-09-30", status: "published", likes: 1327
  },
  {
    id: "trafficmonitor", slug: "trafficmonitor", name: "TrafficMonitor", icon: "📶", cover: "images/covers/trafficmonitor.jpg",
    tagline: "TrafficMonitor  任务栏实时网速与占用监控 / 小巧轻便",
    description: "把上传下载速度、CPU 和内存占用直接嵌进任务栏，或者在桌面悬浮一个小窗。开源无广告，比各种捆绑了全家桶的监控软件干净得多。",
    category: "系统工具", tags: ["监控", "网速", "开源"],
    url: "https://zhongyang219.github.io/TrafficMonitor", github: "https://github.com/zhongyang219/TrafficMonitor", platform: ["Windows"],
    pricing: "open", featured: false, addedAt: "2026-09-26", status: "published", likes: 592
  },

  /* ---------- 音视频处理 ---------- */
  {
    id: "handbrake", slug: "handbrake", name: "HandBrake", icon: "🎞", cover: "images/covers/handbrake.jpg",
    tagline: "开源视频转码与压缩",
    description: "把大体积视频压到能发微信、能上传的大小，预设方案开箱可用。支持批量队列、字幕烧录、裁边和去交错，是老牌且仍在活跃更新的转码工具。",
    category: "音视频处理", tags: ["转码", "压缩", "开源"],
    url: "https://handbrake.fr", github: "https://github.com/HandBrake/HandBrake", platform: ["Windows", "macOS", "Linux"],
    pricing: "open", featured: true, addedAt: "2026-10-07", status: "published", likes: 1442
  },
  {
    id: "obs", slug: "obs-studio", name: "OBS Studio", icon: "🎥", cover: "images/covers/obs.jpg",
    tagline: "录屏与直播推流标配",
    description: "免费开源的录屏与直播软件，支持多场景切换、窗口捕获、绿幕抠像、音轨分离。做教程视频、录网课、直播都能用，插件生态非常成熟。",
    category: "音视频处理", tags: ["录屏", "直播", "开源"],
    url: "https://obsproject.com", github: "https://github.com/obsproject/obs-studio", platform: ["Windows", "macOS", "Linux"],
    pricing: "open", featured: false, addedAt: "2026-10-04", status: "published", likes: 1189
  },
  {
    id: "audacity", slug: "audacity", name: "Audacity", icon: "🎚", cover: "images/covers/audacity.jpg",
    tagline: "免费录音与音频编辑",
    description: "录人声、去底噪、裁剪拼接、变速变调都能做，界面朴素但功能完整。配合免费插件还能做降噪和响度标准化，做播客够用了。",
    category: "音视频处理", tags: ["音频", "录音", "降噪"],
    url: "https://www.audacityteam.org", github: "https://github.com/audacity/audacity", platform: ["Windows", "macOS", "Linux"],
    pricing: "open", featured: false, addedAt: "2026-10-01", status: "published", likes: 733
  },
  {
    id: "capcut", slug: "capcut-cn", name: "剪映专业版", icon: "✂️", cover: "images/covers/capcut.jpg",
    tagline: "零门槛的免费视频剪辑",
    description: "国内做短视频最顺手的一款，自动生成字幕、AI 配音、一键成片都有。电脑版支持多轨道精细剪辑，导出免费且没有强制水印。",
    category: "音视频处理", tags: ["剪辑", "字幕", "AI配音"],
    url: "https://www.capcut.cn", platform: ["Windows", "macOS"],
    pricing: "free", featured: true, addedAt: "2026-09-29", status: "published", likes: 2157
  },
  {
    id: "asr", slug: "asrtools", name: "ASR-Tools", icon: "🧩", cover: "images/covers/asr.jpg",
    tagline: "ASR-Tools 一键分离音频 / 字幕，获取短视频脚本最快的小工具",
    description: "一键分离音频 / 字幕，快速获取短视频脚本，多线程并发+批量处理，文字转换快如闪电。支持生成 .srt 和 .txt 、ass 字幕文件，满足不同需求。",
    category: "音视频处理", tags: ["音频分离", "生成字幕", "脚本获取"],
    github: "https://github.com/WEIFENG2333/AsrTools", platform: ["Windows"],
    pricing: "free", featured: true, addedAt: "2026-10-13", status: "published", likes: 6314
  },

  /* ---------- Android应用 ---------- */
  {
    id: "mtmanager", slug: "mt-manager", name: "MT管理器", icon: "🗂", cover: "images/covers/mtmanager.jpg",
    tagline: "Android 文件与 APK 全能管理",
    description: "双窗口文件管理，能直接解包、编辑、重签 APK，查看和修改应用内部资源。装个来路不明的安装包想先看一眼里面有什么，用这个最快。",
    category: "Android应用", tags: ["文件管理", "APK", "逆向"],
    url: "https://mt2.cn", platform: ["Android"],
    pricing: "freemium", featured: true, addedAt: "2026-10-06", status: "published", likes: 742
  },
  {
    id: "via", slug: "via-browser", name: "Via 浏览器", icon: "🌐", cover: "images/covers/via.jpg",
    tagline: "不到 2MB 的极简浏览器",
    description: "安装包极小、启动极快，支持自定义广告拦截规则和脚本。低配手机或只想安安静静查个资料的场景，它比主流浏览器舒服得多。",
    category: "Android应用", tags: ["浏览器", "轻量", "拦截广告"],
    url: "https://viayoo.com", platform: ["Android"],
    pricing: "free", featured: false, addedAt: "2026-09-27", status: "published", likes: 618
  },
  {
    id: "woobx", slug: "yigemu-han", name: "一个木函", icon: "🧰", cover: "images/covers/woobx.jpg",
    tagline: "上百种小工具的百宝箱",
    description: "把单位换算、图片压缩、文字处理、二维码生成、网速测试等一大堆小功能塞进一个 App。平时用不到，需要的时候找不到替代品。",
    category: "Android应用", tags: ["工具箱", "实用", "合集"],
    url: "https://www.woobx.cn", platform: ["Android"],
    pricing: "free", featured: false, addedAt: "2026-09-22", status: "published", likes: 507
  },

  /* ---------- 教程 ---------- */
  {
    id: "runoob", slug: "runoob", name: "菜鸟教程", icon: "📘", cover: "images/covers/runoob.jpg",
    tagline: "中文编程入门速查首选",
    description: "覆盖从 HTML、Python 到 MySQL、Git 的入门教程，每个知识点都配可在线运行的示例。语法忘了随手查一查，比翻文档快。",
    category: "教程", tags: ["编程入门", "速查", "在线示例"],
    url: "https://www.runoob.com", platform: ["Web"],
    pricing: "free", featured: true, addedAt: "2026-10-03", status: "published", likes: 1830
  },
  {
    id: "mdn", slug: "mdn-web-docs", name: "MDN Web Docs", icon: "📕", cover: "images/covers/mdn.jpg",
    tagline: "Web 技术的权威中文文档",
    description: "HTML、CSS、JavaScript 以及浏览器 API 的标准参考，由 Mozilla 与社区共同维护。做前端遇到不确定的行为，最终都以这里的说明为准。",
    category: "教程", tags: ["前端", "文档", "标准"],
    url: "https://developer.mozilla.org/zh-CN/", platform: ["Web"],
    pricing: "free", featured: false, addedAt: "2026-09-24", status: "published", likes: 1264
  },
  {
    id: "csdiy", slug: "cs-diy", name: "CS 自学指南", icon: "🎓", cover: "images/covers/csdiy.jpg",
    tagline: "一条完整的计算机自学路线",
    description: "把国外名校的公开课按课程难度和依赖关系重新编排，从编程入门一直排到操作系统、编译原理、分布式系统。想系统补基础又不知道从哪开始，照着这条线走就行。",
    category: "教程", tags: ["自学路线", "公开课", "计算机基础"],
    url: "https://csdiy.wiki", github: "https://github.com/PKUFlyingPig/cs-self-learning", platform: ["Web"],
    pricing: "open", featured: true, addedAt: "2026-09-21", status: "published", likes: 1476
  },
  {
    id: "weekly", slug: "tech-weekly", name: "科技爱好者周刊", icon: "📰",
    tagline: "每周一份的科技与工具清单",
    description: "阮一峰维护的周刊，每期推荐若干工具、文章和资源，配一段简短的点评。想持续发现新东西又不想刷信息流，订阅它最省心。",
    category: "教程", tags: ["周刊", "资讯", "开源"],
    url: "https://www.ruanyifeng.com/blog/weekly/", github: "https://github.com/ruanyifeng/weekly", platform: ["Web"],
    pricing: "open", featured: false, addedAt: "2026-09-18", status: "published", likes: 988
  },

  /* ---------- 资源推荐 ---------- */
  {
    id: "iconfont", slug: "iconfont", name: "阿里巴巴矢量图标库", icon: "🎨", cover: "images/covers/iconfont.jpg",
    tagline: "国内最大的免费图标库",
    description: "数百万枚矢量图标，支持改色、改粗细、批量下载，还能在线管理自己的项目图标集。做网页、PPT、海报找图标，这里基本都能找到。",
    category: "资源推荐", tags: ["图标", "矢量", "免费商用"],
    url: "https://www.iconfont.cn", platform: ["Web"],
    pricing: "free", featured: true, addedAt: "2026-10-04", status: "published", likes: 3241
  },
  {
    id: "unsplash", slug: "unsplash", name: "Unsplash", icon: "🖼", cover: "images/covers/unsplash.jpg",
    tagline: "高质量免费可商用图库",
    description: "几十万张摄影师投稿的高分辨率照片，全部免费可商用且无需署名。找封面图、配图、壁纸都很合适，按色调和构图筛选也方便。",
    category: "资源推荐", tags: ["图库", "免费商用", "高清"],
    url: "https://unsplash.com", platform: ["Web"],
    pricing: "free", featured: false, addedAt: "2026-09-30", status: "published", likes: 1622
  },
  {
    id: "sourcehansans", slug: "source-han-sans", name: "思源黑体", icon: "🔤", cover: "images/covers/sourcehansans.jpg",
    tagline: "免费可商用的中文字体",
    description: "Adobe 与 Google 联合发布的开源中文字体，七个字重，覆盖简繁日韩。做设计、做视频、做 PPT 都不用担心授权问题，是目前最稳妥的免费中文字体选择。",
    category: "资源推荐", tags: ["字体", "免费商用", "开源"],
    url: "https://github.com/adobe-fonts/source-han-sans/releases", github: "https://github.com/adobe-fonts/source-han-sans", platform: ["Windows", "macOS", "Linux"],
    pricing: "open", featured: false, addedAt: "2026-09-23", status: "published", likes: 1345
  },
  {
    id: "alternativeto", slug: "alternativeto", name: "AlternativeTo", icon: "🔄",
    tagline: "给任何软件找替代品",
    description: "输入一个软件名，就能看到同类替代方案以及用户投票。收费软件想找免费替代、Windows 独占软件想找跨平台版本，先来这里查一查。",
    category: "资源推荐", tags: ["替代方案", "选型", "对比"],
    url: "https://alternativeto.net", platform: ["Web"],
    pricing: "free", featured: false, addedAt: "2026-09-19", status: "published", likes: 856
  },

];
