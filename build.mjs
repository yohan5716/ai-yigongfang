/* ============================================================
 * AI义工坊 · 静态站点生成器（P4）
 * 用法：node build.mjs
 *
 * 读取：data/categories.js + data/tools.js
 * 产出：
 *   tool/<slug>.html        每条工具的详情页（含分享 + 二维码）
 *   category/<slug>.html    6 个分类落地页
 *   sitemap.xml             首页 + 分类页 + 详情页
 *   robots.txt              爬虫规则 + sitemap 指引
 *   404.html                找不到页面时的兜底页
 *
 * 站长改完数据（或上传封面图）后重跑本命令即可；P5 后台提交后由 CI 自动执行。
 * ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
global.window = {};
await import("./data/categories.js");
await import("./data/tools.js");

const CATS = window.SITE_CATEGORIES || [];
const PRICING = window.SITE_PRICING_LABELS || {};
const TOOLS = (window.SITE_TOOLS || []).filter(t => t.status === "published");
const CAT_MAP = Object.fromEntries(CATS.map(c => [c.key, c]));

/* 站点常量：绑定自有域名后只改这里（P8） */
const SITE = {
  name: "AI义工坊",
  url: "https://ygf.de5.net",
  owner: "Yohan",
  desc: "站长实测收录的免费工具导航目录，只收官方与开源来源，无广告无捆绑。"
};

/* 分类渐变统一取自 data/categories.js 的 grad 字段（全站唯一来源，改一处三端生效） */
const FALLBACK_GRAD = "linear-gradient(135deg,#10B981,#06B6D4)";
const gradOf = c => (CAT_MAP[c] && CAT_MAP[c].grad) || FALLBACK_GRAD;

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = n => Number(n) || 0;
const fmtDate = iso => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "—" : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; };
const isNew = t => { const ts = new Date(t.addedAt).getTime(); return Number.isFinite(ts) && (Date.now() - ts) < 7 * 864e5; };
const TODAY = new Date().toISOString().slice(0, 10);
const oneLine = (s, n = 78) => String(s || "").replace(/\s+/g, " ").slice(0, n);

/* ---------- 目录准备 ---------- */
for (const d of ["tool", "category"]) fs.mkdirSync(path.join(root, d), { recursive: true });

/* ============================================================
 * 样式（详情页 / 分类页共用；首页样式独立维护在 index.html）
 * ============================================================ */
const CSS = `
:root{--bg:#F5FAF8;--card:#fff;--card-2:#F1F8F6;--ink:#0F172A;--muted:#64748B;--line:rgba(15,23,42,.08);--primary:#10B981;--primary-d:#059669;--primary-l:#047857;--cyan-d:#0E7490;--shadow:0 6px 22px rgba(15,23,42,.08);--glow:0 4px 16px rgba(16,185,129,.35)}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.wrap{max-width:860px;margin:0 auto;padding:0 16px}
:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:8px}
header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.hd{display:flex;align-items:center;justify-content:space-between;height:60px;gap:12px}
.logo{display:flex;align-items:center;gap:10px;min-width:0}
.logo .mark{width:38px;height:38px;border-radius:11px;overflow:hidden;flex-shrink:0}
.logo .mark img{display:block;width:100%;height:100%;object-fit:cover}
.logo b{font-size:17px;letter-spacing:1px;display:block}
.logo small{display:block;font-size:10px;color:var(--muted);font-weight:400}
.back{flex-shrink:0;font-size:13px;font-weight:600;color:var(--primary-l);background:rgba(16,185,129,.1);padding:8px 14px;border-radius:9px;transition:.15s}
.back:hover{background:rgba(16,185,129,.18)}
.crumb{font-size:12px;color:var(--muted);margin:16px 0 10px;line-height:1.6}
.crumb a{color:var(--primary-l)}
.crumb a:hover{text-decoration:underline}

/* 分类页头 */
.chead{background:var(--card);border-radius:16px;box-shadow:var(--shadow);border:1px solid var(--line);padding:24px;display:flex;gap:16px;align-items:flex-start}
.chead .cico{width:56px;height:56px;border-radius:15px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:28px}
.chead h1{font-size:22px;font-weight:800;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.chead .csub{font-size:13px;color:var(--muted);margin-top:6px}
.chead .cdesc{font-size:13.5px;line-height:1.95;color:#334155;margin-top:12px}

/* 列表行（与首页同构） */
.list{display:flex;flex-direction:column;gap:12px;margin-top:16px}
.tool{position:relative;display:flex;gap:16px;background:var(--card);border-radius:14px;padding:12px;box-shadow:var(--shadow);border:1px solid var(--line);transition:.15s}
.tool:hover{transform:translateY(-2px);border-color:rgba(16,185,129,.5);box-shadow:0 8px 26px rgba(16,185,129,.2)}
.tcover{position:relative;width:180px;aspect-ratio:16/10;border-radius:10px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:38px;color:#fff}
.tcover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.tcover.nocover img{display:none}
.tnew{position:absolute;top:8px;left:8px;z-index:2;background:#EF4444;color:#fff;font-size:10px;font-weight:800;letter-spacing:1px;padding:2.5px 8px;border-radius:6px}
.tbody{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px}
.ttitle{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:16px;font-weight:700;line-height:1.4}
.tool:hover .ttitle{color:var(--primary-l)}
.ttitle em.pick{font-style:normal;font-size:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--primary),#06B6D4);padding:2px 8px;border-radius:7px}
.tintro{font-size:12.5px;color:#475569;line-height:1.75;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tmeta{margin-top:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11.5px;color:var(--muted)}
.pricing{font-size:10.5px;font-weight:700;padding:2.5px 8px;border-radius:6px}
.p-free{background:rgba(16,185,129,.14);color:#047857}.p-open{background:rgba(6,182,212,.14);color:#0E7490}
.p-freemium{background:rgba(245,158,11,.18);color:#B45309}.p-paid{background:rgba(100,116,139,.16);color:#475569}
.ttags{display:flex;gap:6px;flex-wrap:wrap}
.ttags .ptag{font-size:11px;color:var(--cyan-d);background:rgba(6,182,212,.1);padding:2px 8px;border-radius:5px}

/* 详情页 */
.cover{position:relative;width:100%;aspect-ratio:16/7;border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:72px;color:#fff;box-shadow:var(--shadow)}
.cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cover.nocover img{display:none}
.cover .new{position:absolute;top:12px;left:12px;background:#EF4444;color:#fff;font-size:11px;font-weight:800;letter-spacing:1px;padding:3px 10px;border-radius:7px}
.dcard{background:var(--card);border-radius:16px;box-shadow:var(--shadow);border:1px solid var(--line);padding:24px;margin-top:16px}
.dtitle{font-size:24px;font-weight:800;line-height:1.4;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dtitle em.pick{font-style:normal;font-size:11px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--primary),#06B6D4);padding:3px 10px;border-radius:8px}
.dtitle .pricing{font-size:11px;padding:3px 9px;border-radius:7px}
.dsub{font-size:14px;color:var(--muted);margin-top:8px;line-height:1.7}
.dmeta{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0}
.dmeta span{font-size:11.5px;background:var(--card-2);border:1px solid var(--line);color:#475569;padding:3px 11px;border-radius:20px}
.ddesc{font-size:14px;line-height:2;color:#334155;background:var(--card-2);border-radius:12px;padding:16px 18px;border:1px solid var(--line)}
.dtags{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}
.dtags .ptag{font-size:11.5px;color:var(--cyan-d);background:rgba(6,182,212,.1);padding:2.5px 9px;border-radius:6px}
.dacts{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.go{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;padding:11px 22px;border-radius:11px;background:linear-gradient(135deg,#34D399,var(--primary));color:#fff;box-shadow:var(--glow);transition:.15s}
.go:hover{filter:brightness(1.07)}
.dnote{font-size:11.5px;color:var(--muted);text-align:center;margin-top:14px;line-height:1.8}

/* 分享区 */
.share{margin-top:22px;padding-top:18px;border-top:1px dashed var(--line)}
.share .stit{font-size:13px;font-weight:700;color:#475569;margin-bottom:10px}
.sbtns{display:flex;gap:8px;flex-wrap:wrap}
.sbtn{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;background:rgba(15,23,42,.05);color:#475569;transition:.15s}
.sbtn:hover{background:rgba(16,185,129,.14);color:var(--primary-l)}
.qrbox{display:none;margin-top:14px;text-align:center;background:var(--card-2);border:1px solid var(--line);border-radius:12px;padding:16px}
.qrbox.show{display:block}
.qrbox svg{display:block;margin:0 auto;border-radius:8px;background:#fff;padding:8px}
.qrbox p{font-size:11.5px;color:var(--muted);margin-top:9px}

.relate{margin-top:26px}
.relate h2{font-size:16px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.relate h2::before{content:"";width:4px;height:16px;border-radius:2px;background:linear-gradient(180deg,var(--primary),#06B6D4)}
.rgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.ritem{display:flex;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 13px;box-shadow:var(--shadow);transition:.15s}
.ritem:hover{border-color:rgba(16,185,129,.5);transform:translateY(-2px)}
.ritem .rico{width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:19px;color:#fff}
.ritem .rt{font-size:13.5px;font-weight:700;line-height:1.4;display:block}
.ritem .rd{font-size:11.5px;color:var(--muted);display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.toast{position:fixed;left:50%;bottom:32px;transform:translateX(-50%) translateY(12px);background:rgba(15,23,42,.9);color:#fff;font-size:13px;padding:10px 18px;border-radius:10px;opacity:0;pointer-events:none;transition:.2s;z-index:99}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
/* 分页条 */
:root{--line-strong:rgba(15,23,42,.14)}
.pager{display:none;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;margin-top:22px;font-size:13.5px}
.pager.show{display:flex}
.pager button{min-width:34px;height:34px;padding:0 11px;border-radius:8px;background:var(--card);border:1px solid var(--line-strong);color:#475569;font-weight:500;font-size:13.5px;transition:.15s;display:inline-flex;align-items:center;justify-content:center;gap:3px}
.pager button:hover:not(:disabled):not(.on){border-color:var(--primary);color:var(--primary-l)}
.pager button.on{background:var(--primary);border-color:var(--primary);color:#fff;font-weight:700}
.pager button:disabled{opacity:.45;cursor:not-allowed}
.pager .pg-dots{color:var(--muted);padding:0 2px}
.pager .pg-jump{display:inline-flex;align-items:center;gap:6px;margin-left:8px;color:#475569}
.pager .pg-jump input{width:48px;height:34px;border:1px solid var(--line-strong);border-radius:8px;text-align:center;font-size:13.5px;outline:none;color:var(--ink);background:var(--card);font-family:inherit}
.pager .pg-jump input:focus{border-color:var(--primary)}

footer{margin-top:34px;padding:24px 0 32px;text-align:center;color:var(--muted);font-size:12px;line-height:2;border-top:1px solid var(--line)}
footer b{color:var(--ink)}
footer nav{margin-bottom:8px;line-height:2.2}
footer nav a{color:var(--primary-l);margin:0 7px;white-space:nowrap}
footer nav a:hover{text-decoration:underline}
@media (max-width:640px){.rgrid{grid-template-columns:1fr}.dcard,.chead{padding:18px}.cover{font-size:52px}.tcover{width:120px}.tool{gap:12px}}
`;

/* ============================================================
 * 分享区脚本（纯静态页内联，二维码按需加载本地 vendor/qrcode.js）
 * ============================================================ */
const SHARE_JS = `
(function(){
  var url = document.querySelector('link[rel=canonical]').href;
  var title = document.title;
  function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show')},2200);}
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-share]');
    if(!btn) return;
    var act = btn.dataset.share;
    if(act==='copy'){
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function(){toast('🔗 链接已复制');})
        .catch(function(){window.prompt('复制下面的链接：', url);});
    } else if(act==='qr'){
      var box=document.getElementById('qrBox');
      if(box.classList.contains('show')){box.classList.remove('show');return;}
      function draw(){
        try{
          var qr=qrcode(0,'M'); qr.addData(url); qr.make();
          document.getElementById('qrCanvas').innerHTML=qr.createSvgTag({cellSize:4,margin:2});
          box.classList.add('show');
        }catch(err){toast('二维码生成失败');}
      }
      if(window.qrcode) draw();
      else{
        var s=document.createElement('script');
        s.src='../vendor/qrcode.js';
        s.onload=draw;
        s.onerror=function(){toast('二维码组件加载失败');};
        document.head.appendChild(s);
      }
    } else if(act==='native'){
      if(navigator.share) navigator.share({title:title,url:url}).catch(function(){});
    }
  });
  if(navigator.share){var n=document.querySelector('[data-share=native]'); if(n) n.hidden=false;}
})();
`;

/* ============================================================
 * 右下角快捷按钮（明暗主题 / 微信二维码 / 返回顶部）· 仅分类页启用
 * ============================================================ */
const FAB_CSS = `
/* 右下角快捷按钮 */
.fab{position:fixed;right:18px;bottom:24px;z-index:90;display:flex;flex-direction:column;gap:10px}
.fab>button{width:44px;height:44px;border-radius:13px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);display:flex;align-items:center;justify-content:center;transition:.15s}
.fab>button:hover{transform:translateY(-2px);border-color:var(--primary);box-shadow:var(--shadow-hover)}
.fab svg{width:20px;height:20px;display:block}
.fab-panel{position:absolute;right:0;bottom:calc(100% + 12px);background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 32px rgba(15,23,42,.18);padding:14px;text-align:center;animation:fabIn .18s ease}
@keyframes fabIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.fab-panel .qr{display:flex;align-items:center;justify-content:center;width:150px;height:150px;border-radius:10px;background:#fff;padding:8px}
.fab-panel .qr svg{width:134px;height:134px}
.fab-panel p{font-size:11.5px;color:var(--muted);margin-top:8px}
/* 暗色主题 */
html.dark{--bg:#0B1220;--card:#111A2C;--card-2:#0E1626;--ink:#E2E8F0;--muted:#94A3B8;--line:rgba(148,163,184,.16);--line-strong:rgba(148,163,184,.24);--shadow:0 6px 22px rgba(0,0,0,.45);--shadow-hover:0 8px 26px rgba(0,0,0,.55)}
html.dark body{background:var(--bg);color:var(--ink)}
html.dark header{background:rgba(17,26,44,.92)}
html.dark .cdesc,html.dark .tintro,html.dark .dsub{color:#94A3B8}
html.dark .ddesc{color:#B6C2D4;background:var(--card-2)}
html.dark .ptag{color:#67E8F9}
html.dark .p-free{color:#6EE7B7}html.dark .p-open{color:#67E8F9}html.dark .p-freemium{color:#FCD34D}html.dark .p-paid{color:#CBD5E1}
html.dark .dmeta span{background:var(--card-2);border-color:var(--line);color:#B6C2D4}
html.dark .pager button{background:var(--card);color:#B6C2D4}
html.dark .pager .pg-jump{color:#B6C2D4}
html.dark .pager .pg-jump input{background:var(--card);color:var(--ink)}
html.dark .sbtn{background:rgba(148,163,184,.12);color:#B6C2D4}
html.dark .fab-panel{box-shadow:0 12px 32px rgba(0,0,0,.5)}
`;
const FAB_HTML = `
<div class="fab" id="fab">
  <div class="fab-panel" id="fabPanel" hidden>
    <div class="qr" id="fabQrBox" aria-hidden="true"></div>
    <p>微信扫码打开本页</p>
  </div>
  <button type="button" id="fabTheme" aria-label="切换明暗主题" title="明暗主题切换"></button>
  <button type="button" id="fabQr" aria-label="微信二维码" title="微信二维码"></button>
  <button type="button" id="fabTop" aria-label="返回顶部" title="返回顶部"></button>
</div>`;
const FAB_ICONS = {
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M18 18h3v3h-3zM21 21v.01"/></svg>',
  top: '<svg viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
};
function fabJS(qrSrc) {
  return `
(function(){
  var KEY = "aiygf:theme";
  var ICON_MOON = ${JSON.stringify(FAB_ICONS.moon)};
  var ICON_SUN = ${JSON.stringify(FAB_ICONS.sun)};
  var ICON_QR = ${JSON.stringify(FAB_ICONS.qr)};
  var ICON_TOP = ${JSON.stringify(FAB_ICONS.top)};
  function get(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}}
  function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  var theme = get(KEY,"light");
  function paintTheme(){
    document.documentElement.classList.toggle("dark", theme==="dark");
    document.getElementById("fabTheme").innerHTML = theme==="dark" ? ICON_SUN : ICON_MOON;
  }
  paintTheme();
  document.getElementById("fabTheme").addEventListener("click", function(){
    theme = theme==="dark" ? "light" : "dark";
    set(KEY, theme);
    paintTheme();
  });
  document.getElementById("fabQr").innerHTML = ICON_QR;
  document.getElementById("fabTop").innerHTML = ICON_TOP;
  document.getElementById("fabTop").addEventListener("click", function(){
    window.scrollTo({top:0, behavior:"smooth"});
  });
  var qrLoaded = false;
  var panel = document.getElementById("fabPanel");
  function pageUrl(){
    return (location.protocol==="http:"||location.protocol==="https:") ? location.href : "https://ygf.de5.net/";
  }
  function draw(){
    try{
      var qr = qrcode(0,"M"); qr.addData(pageUrl()); qr.make();
      document.getElementById("fabQrBox").innerHTML = qr.createSvgTag({cellSize:4, margin:2});
    }catch(e){}
  }
  document.getElementById("fabQr").addEventListener("click", function(){
    if(panel.hidden){
      panel.hidden = false;
      if(window.qrcode) draw();
      else if(!qrLoaded){
        qrLoaded = true;
        var s = document.createElement("script");
        s.src = ${JSON.stringify(qrSrc)};
        s.onload = draw;
        document.head.appendChild(s);
      }
    } else {
      panel.hidden = true;
    }
  });
  document.addEventListener("click", function(e){
    var fab = document.getElementById("fab");
    if(!panel.hidden && !fab.contains(e.target)) panel.hidden = true;
  });
})();
`;
}
const FAB_THEME_INIT = `<script>try{if(JSON.parse(localStorage.getItem("aiygf:theme"))==="dark")document.documentElement.classList.add("dark")}catch(e){}</script>`;

/* ============================================================
 * 页面骨架
 * ============================================================ */
function shell({ title, desc, canonical, ogImg, jsonld, body, relRoot = "..", withShare = false, fab = false }) {
  const qrSrc = `${relRoot ? relRoot + "/" : ""}vendor/qrcode.js`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#10B981">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='88'>🧰</text></svg>">
${fab ? FAB_THEME_INIT : ""}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImg)}">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>${CSS}${fab ? FAB_CSS : ""}</style>
</head>
<body>
<header>
  <div class="wrap hd">
    <a class="logo" href="${relRoot}/index.html" aria-label="返回${esc(SITE.name)}首页">
      <span class="mark" aria-hidden="true"><img src="${relRoot}/logo.jpg" alt=""></span>
      <span><b>${esc(SITE.name)}</b><small>${esc(SITE.desc.split("，")[0])}</small></span>
    </a>
    <a class="back" href="${relRoot}/index.html">← 返回首页</a>
  </div>
</header>

<main class="wrap">
${body}
</main>

<footer>
  <div class="wrap">
    <nav aria-label="分类导航">
      ${CATS.map(c => `<a href="${relRoot}/category/${c.slug}.html">${esc(c.key)}</a>`).join("")}
    </nav>
    <b>🧰 ${esc(SITE.name)}</b><br>
    只收官方与开源来源 · 本站不提供二次打包文件
  </div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
${fab ? FAB_HTML : ""}
${withShare ? `<script>${SHARE_JS}</script>` : ""}
${fab ? `<script>${fabJS(qrSrc)}</script>` : ""}
</body>
</html>
`;
}

/* ============================================================
 * 组件：列表行 / 封面
 * ============================================================ */
function coverHTML(t, relRoot) {
  const cover = t.cover ? `${relRoot}/${String(t.cover).replace(/^\.\//, "")}` : "";
  return `<div class="tcover" style="background:${gradOf(t.category)}" aria-hidden="true">
    ${isNew(t) ? `<span class="tnew">NEW</span>` : ""}
    <span>${esc(t.icon || "🔧")}</span>
    ${cover ? `<img src="${esc(cover)}" alt="${esc(t.name)} 封面图" loading="lazy" onerror="this.closest('.tcover').classList.add('nocover')">` : ""}
  </div>`;
}

function rowHTML(t, relRoot) {
  const p = PRICING[t.pricing] || PRICING.free;
  return `<a class="tool" href="${relRoot}/tool/${encodeURIComponent(t.slug)}.html">
    ${coverHTML(t, relRoot)}
    <div class="tbody">
      <h2 class="ttitle">${esc(t.name)}${t.featured ? '<em class="pick">站长推荐</em>' : ""}</h2>
      <p class="tintro">简介 ${esc(t.description)}</p>
      <div class="ttags">${(t.tags || []).slice(0, 4).map(x => `<span class="ptag">#${esc(x)}</span>`).join("")}</div>
      <div class="tmeta">
        <span class="pricing ${p.cls}">${esc(p.text)}</span>
        <span>${esc((t.platform || []).join(" / ") || "全平台")}</span>
        <span>· 收录于 ${esc(fmtDate(t.addedAt))}</span>
      </div>
    </div>
  </a>`;
}

/* ============================================================
 * 详情页
 * ============================================================ */
function detailPage(t) {
  const p = PRICING[t.pricing] || PRICING.free;
  const cat = CAT_MAP[t.category] || {};
  const cover = t.cover ? `../${String(t.cover).replace(/^\.\//, "")}` : "";
  const related = TOOLS.filter(x => x.category === t.category && x.id !== t.id).slice(0, 4);
  const canonical = `${SITE.url}/tool/${t.slug}.html`;
  const ogImg = cover ? `${SITE.url}/${String(t.cover).replace(/^\.\//, "")}` : `${SITE.url}/logo.jpg`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t.name,
    description: t.description,
    url: canonical,
    sameAs: [t.url, t.github].filter(Boolean),
    downloadUrl: t.github || t.url,
    operatingSystem: (t.platform || []).join(", ") || "全平台",
    applicationCategory: t.category,
    datePublished: t.addedAt,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    author: { "@type": "Person", name: SITE.owner },
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url }
  };

  const shareText = encodeURIComponent(`${t.name} - ${t.tagline}`);
  const shareUrl = encodeURIComponent(canonical);

  const body = `
  <nav class="crumb" aria-label="面包屑"><a href="../index.html">首页</a> › <a href="../category/${cat.slug || ""}.html">${esc(t.category)}</a> › ${esc(t.name)}</nav>

  <div class="cover ${cover ? "" : "nocover"}" style="background:${gradOf(t.category)}" aria-hidden="true">
    ${isNew(t) ? `<span class="new">NEW</span>` : ""}
    <span>${esc(t.icon || "🔧")}</span>
    ${cover ? `<img src="${esc(cover)}" alt="${esc(t.name)} 封面图" onerror="this.closest('.cover').classList.add('nocover')">` : ""}
  </div>

  <article class="dcard">
    <h1 class="dtitle">${esc(t.name)}${t.featured ? '<em class="pick">站长推荐</em>' : ""}<span class="pricing ${p.cls}">${esc(p.text)}</span></h1>
    <p class="dsub">${esc(t.tagline)}</p>
    <div class="dmeta">
      <span>📂 ${esc(t.category)}</span>
      <span>💻 ${esc((t.platform || []).join(" / ") || "全平台")}</span>
      <span>🗓 收录于 ${esc(fmtDate(t.addedAt))}</span>
      <span>👍 ${esc(String(t.likes ?? 0))} 人点赞</span>
    </div>
    <p class="ddesc">${esc(t.description)}</p>
    <div class="dtags">${(t.tags || []).map(x => `<span class="ptag">#${esc(x)}</span>`).join("")}</div>
    <div class="dacts">
      ${t.github ? `<a class="go" href="${esc(t.github)}" target="_blank" rel="noopener noreferrer nofollow">GitHub 仓库 ↗</a>` : ""}
      ${t.url && t.url !== t.github ? `<a class="go" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer nofollow">官网 / 下载 ↗</a>` : ""}
    </div>

    <div class="share">
      <div class="stit">🔗 分享这个工具</div>
      <div class="sbtns">
        <button type="button" class="sbtn" data-share="copy">📋 复制链接</button>
        <button type="button" class="sbtn" data-share="qr">📱 微信二维码</button>
        <a class="sbtn" href="https://service.weibo.com/share/share.php?url=${shareUrl}&title=${shareText}" target="_blank" rel="noopener noreferrer nofollow">🅦 分享到微博</a>
        <button type="button" class="sbtn" data-share="native" hidden>↗ 系统分享</button>
      </div>
      <div class="qrbox" id="qrBox">
        <div id="qrCanvas"></div>
        <p>用微信扫一扫，在手机上打开本页</p>
      </div>
    </div>

    <p class="dnote">下载与安装请认准上方官方地址，本站不提供任何二次打包文件。<br>链接失效或内容侵权，欢迎联系站长下架。</p>
  </article>

  ${related.length ? `
  <section class="relate">
    <h2>同分类推荐</h2>
    <div class="rgrid">
      ${related.map(r => `
      <a class="ritem" href="./${encodeURIComponent(r.slug)}.html">
        <span class="rico" style="background:${gradOf(r.category)}" aria-hidden="true">${esc(r.icon || "🔧")}</span>
        <span style="min-width:0">
          <span class="rt">${esc(r.name)}</span>
          <span class="rd">${esc(r.tagline)}</span>
        </span>
      </a>`).join("")}
    </div>
  </section>` : ""}
  `;

  return shell({
    title: `${t.name} - ${t.tagline} | ${SITE.name}`,
    desc: oneLine(t.description),
    canonical,
    ogImg,
    jsonld,
    body,
    relRoot: "..",
    withShare: true
  });
}

/* ============================================================
 * 分类落地页
 * ============================================================ */
function categoryPage(c) {
  const list = TOOLS
    .filter(t => t.category === c.key)
    .sort((a, b) => (Number(!!b.featured) - Number(!!a.featured)) || (num(b.likes) - num(a.likes)));
  const canonical = `${SITE.url}/category/${c.slug}.html`;
  const desc = oneLine(`${c.key}：${c.sub}。${c.desc}`, 96);

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${c.key} - ${SITE.name}`,
    description: desc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: list.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${SITE.url}/tool/${t.slug}.html`
      }))
    }
  };

  const body = `
  <nav class="crumb" aria-label="面包屑"><a href="../index.html">首页</a> › ${esc(c.key)}</nav>

  <section class="chead">
    <span class="cico" style="background:${c.bg}" aria-hidden="true">${c.ico}</span>
    <div>
      <h1>${esc(c.key)}${c.badge ? `<em class="pricing p-open" style="font-style:normal">${esc(c.badge)}</em>` : ""}</h1>
      <div class="csub">${esc(c.sub)} · 共收录 ${list.length} 款</div>
      <p class="cdesc">${esc(c.desc)}</p>
    </div>
  </section>

  <div class="list">
    ${list.map(t => rowHTML(t, "..")).join("") || `<div class="tintro">这个分类还在收集中。</div>`}
  </div>
  <div class="pager" id="pager"></div>
  <script>
  /* 分类页分页：每页 8 条，条目仍在 HTML 里（SEO 可抓），仅用 display 控制显示 */
  (function(){
    var PER = 8;
    var list = document.querySelector(".list");
    var pager = document.getElementById("pager");
    if (!list || !pager) return;
    var items = [].slice.call(list.querySelectorAll("a.tool"));
    var pages = Math.ceil(items.length / PER);
    if (pages <= 1) return;
    var cur = 1;

    function render() {
      var nums = [1];
      for (var p = cur - 1; p <= cur + 1; p++) if (p > 1 && p < pages) nums.push(p);
      nums.push(pages);
      var uniq = nums.filter(function(v, i, a){ return a.indexOf(v) === i; }).sort(function(a,b){ return a - b; });
      var html = '<button type="button" data-page="' + (cur - 1) + '"' + (cur === 1 ? " disabled" : "") + '>‹ 上一页</button>';
      var prev = 0;
      uniq.forEach(function(p){
        if (p - prev > 1) html += '<span class="pg-dots">…</span>';
        html += '<button type="button" data-page="' + p + '"' + (p === cur ? ' class="on" aria-current="page"' : "") + '>' + p + '</button>';
        prev = p;
      });
      html += '<button type="button" data-page="' + (cur + 1) + '"' + (cur === pages ? " disabled" : "") + '>下一页 ›</button>';
      html += '<span class="pg-jump">跳转 <input type="number" min="1" max="' + pages + '" value="' + cur + '" aria-label="跳转到指定页"><button type="button" data-page-jump aria-label="跳转">》</button></span>';
      pager.innerHTML = html;
      pager.classList.add("show");
    }

    function go(p, scroll) {
      p = Math.min(Math.max(1, Number(p) || 1), pages);
      if (p !== cur || scroll) {
        cur = p;
        items.forEach(function(el, i){
          el.style.display = (i >= (cur - 1) * PER && i < cur * PER) ? "" : "none";
        });
        render();
      }
      if (scroll) {
        var y = list.getBoundingClientRect().top + window.pageYOffset - 76;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }

    pager.addEventListener("click", function(e){
      var jump = e.target.closest("[data-page-jump]");
      if (jump) { go(pager.querySelector("input").value, true); return; }
      var b = e.target.closest("button[data-page]");
      if (b && !b.disabled) go(b.dataset.page, true);
    });
    pager.addEventListener("keydown", function(e){
      if (e.key === "Enter" && e.target.tagName === "INPUT") go(e.target.value, true);
    });

    go(1, false);
  })();
  </script>
  `;

  return shell({
    title: `${c.key} - ${c.sub} | ${SITE.name}`,
    desc,
    canonical,
    ogImg: `${SITE.url}/logo.jpg`,
    jsonld,
    body,
    relRoot: "..",
    fab: true
  });
}

/* ============================================================
 * 404 页
 * ============================================================ */
function notFoundPage() {
  const body = `
  <section class="chead" style="margin-top:24px;flex-direction:column;align-items:center;text-align:center">
    <span class="cico" style="background:rgba(16,185,129,.14);font-size:30px" aria-hidden="true">🧭</span>
    <div>
      <h1 style="justify-content:center">页面走丢了</h1>
      <div class="csub">你要找的页面可能已经被移动或下线</div>
      <p class="cdesc">回到<a href="/index.html" style="color:var(--primary-l);font-weight:700">首页</a>看看收录的工具，或者从下面的分类进入。</p>
    </div>
  </section>
  <div class="list">
    ${CATS.map(c => `<a class="tool" href="/category/${c.slug}.html">
      <div class="tcover" style="background:${gradOf(c.key)}" aria-hidden="true"><span>${c.ico}</span></div>
      <div class="tbody">
        <h2 class="ttitle">${esc(c.key)}</h2>
        <p class="tintro">${esc(c.sub)}</p>
        <div class="tmeta"><span>共 ${TOOLS.filter(t => t.category === c.key).length} 款工具</span></div>
      </div>
    </a>`).join("")}
  </div>
  `;
  return shell({
    title: `页面走丢了 | ${SITE.name}`,
    desc: "页面不存在，回到首页或按分类浏览收录的工具。",
    canonical: `${SITE.url}/404.html`,
    ogImg: `${SITE.url}/logo.jpg`,
    jsonld: { "@context": "https://schema.org", "@type": "WebPage", name: "404", isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url } },
    body,
    relRoot: ""
  });
}

/* ============================================================
 * 写入 + 统计
 * ============================================================ */
let nTool = 0, nCat = 0;
for (const t of TOOLS) {
  fs.writeFileSync(path.join(root, "tool", `${t.slug}.html`), detailPage(t));
  nTool++;
}
for (const c of CATS) {
  fs.writeFileSync(path.join(root, "category", `${c.slug}.html`), categoryPage(c));
  nCat++;
}

/* sitemap.xml */
const urls = [
  { loc: `${SITE.url}/`, lastmod: TODAY, freq: "daily", pri: "1.0" },
  ...CATS.map(c => ({ loc: `${SITE.url}/category/${c.slug}.html`, lastmod: TODAY, freq: "weekly", pri: "0.8" })),
  ...TOOLS.map(t => ({ loc: `${SITE.url}/tool/${t.slug}.html`, lastmod: t.addedAt || TODAY, freq: "monthly", pri: "0.7" }))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

/* robots.txt */
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *
Allow: /

# 数据与第三方脚本目录无需被收录
Disallow: /data/
Disallow: /vendor/
Disallow: /images/covers/

# 站长后台不入索引（接口路径同样屏蔽）
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`);

/* 404.html */
fs.writeFileSync(path.join(root, "404.html"), notFoundPage());

console.log(`详情页 ${nTool} 个 → tool/`);
console.log(`分类页 ${nCat} 个 → category/`);
console.log(`sitemap.xml（${urls.length} 条 URL）、robots.txt、404.html 已生成`);
