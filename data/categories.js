/* ============================================================
 * AI义工坊 · 分类定义
 * ------------------------------------------------------------
 * 这是站点的唯一分类来源。新增/删改分类只改本文件，
 * 页面导航、分类卡片、筛选标签、详情页面包屑都会跟着变。
 *
 * 字段说明：
 *   key  分类名（同时用作工具的 category 值，务必与 tools.js 一致）
 *   slug 分类落地页地址片段（纯 ASCII，决定 /category/<slug>.html，慎改）
 *   ico  分类图标（emoji）
 *   sub  分类卡片下的一句话说明
 *   desc 分类落地页的段落介绍（SEO 用，2–3 句）
 *   bg   分类图标底色（薄荷青配色板的低透明度色）
 *   tint 该分类在主色系中的强调色，用于详情页标签与角标
 *   grad 该分类的封面渐变（卡片图标底、详情页大图共用；改这里三端同步生效）
 *   badge 可选，卡片右上角小角标文字（留空则不显示）
 *   badgeClass 可选，角标配色类名：b-new / b-good / b-go / b-hot / b-best
 * ============================================================ */

window.SITE_CATEGORIES = [
  {
    key: "办公必备", slug: "office", ico: "💼", sub: "文档、截图、协作一网打尽",
    desc: "日常办公里最耗时间的往往不是难事，而是截图、贴图、找文件、写文档这些碎活。这个栏目收录的是站长实测过的效率工具，覆盖截图与 OCR、快速启动、知识库协作、本地办公套件等场景，共同点是装完即用、没有捆绑推广。",
    bg: "rgba(16,185,129,.14)", tint: "#047857", grad: "linear-gradient(135deg,#10B981,#059669)", badge: "Good", badgeClass: "b-good"
  },
  {
    key: "系统工具", slug: "system", ico: "🧰", sub: "装完效率翻倍",
    desc: "系统工具解决的是「电脑不好用」这类问题：文件找不到、U 盘做不好启动盘、网速和占用看不见。这里收录的都是单文件、免安装或轻量级的 Windows 向工具，很多是开源项目，更新活跃、无广告。",
    bg: "rgba(6,182,212,.14)", tint: "#0E7490", grad: "linear-gradient(135deg,#06B6D4,#0891B2)", badge: "GO", badgeClass: "b-go"
  },
  {
    key: "音视频处理", slug: "media", ico: "🎬", sub: "剪辑、转码、录音与直播",
    desc: "从录屏、剪辑到转码压缩，音视频这一类的工具要么很贵、要么很难用。这个栏目按「实际能跑完一个流程」的标准筛选，包含开源录屏与转码方案、免费的剪辑与音频处理工具，导出没有强制水印。",
    bg: "rgba(245,158,11,.16)", tint: "#B45309", grad: "linear-gradient(135deg,#F59E0B,#D97706)", badge: "NEW", badgeClass: "b-new"
  },
  {
    key: "Android应用", slug: "android", ico: "📱", sub: "手机也能当生产力",
    desc: "安卓端值得装的工具和桌面端完全不同：要能改文件、能管安装包、够轻量。这个栏目收录文件与 APK 管理、极简浏览器、可自定义书源的阅读器等应用，多数支持侧载安装包直接下载。",
    bg: "rgba(6,182,212,.14)", tint: "#0E7490", grad: "linear-gradient(135deg,#10B981,#06B6D4)", badge: "", badgeClass: ""
  },
  {
    key: "教程", slug: "tutorial", ico: "📖", sub: "从入门到精通的文档站",
    desc: "工具解决一时的问题，教程解决长期的问题。这里收录中文友好的编程教程、权威技术文档、系统化的计算机自学路线，以及持续更新的工具资讯周刊，适合把「查资料」这件事固定成习惯。",
    bg: "rgba(16,185,129,.14)", tint: "#047857", grad: "linear-gradient(135deg,#34D399,#10B981)", badge: "HOT", badgeClass: "b-hot"
  },
  {
    key: "资源推荐", slug: "resources", ico: "🎁", sub: "图标、字体、图库白嫖清单",
    desc: "做设计、做视频、做 PPT，最怕素材侵权。这个栏目只收免费可商用的资源站：矢量图标库、高清图库、开源中文字体，以及查替代方案的选型工具，用之前记得核对各自的授权条款。",
    bg: "rgba(6,182,212,.12)", tint: "#0E7490", grad: "linear-gradient(135deg,#06B6D4,#10B981)", badge: "Best", badgeClass: "b-best"
  }
];

/* 收费模式中文标签（详情页与卡片角标共用） */
window.SITE_PRICING_LABELS = {
  free:     { text: "完全免费", cls: "p-free"     },
  open:     { text: "开源免费", cls: "p-open"     },
  freemium: { text: "免费增值", cls: "p-freemium" },
  paid:     { text: "付费",     cls: "p-paid"     }
};
