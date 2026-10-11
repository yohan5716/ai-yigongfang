/* ============================================================
 * AI义工坊 · 点赞接口共用逻辑（P6）
 * ------------------------------------------------------------
 * 被同目录下的 likes.js / like.js 引用。
 * 独立 Worker 版见 worker/likes-worker.js（自包含，逻辑等价）。
 *
 * 存储设计（Cloudflare KV，变量名 LIKES）：
 *   like:<id>           该工具的「增量点赞数」，初始不存在时按 0 处理
 *   v:<id>:<voterId>    已投票标记，24 小时自动过期
 *
 * 为什么不把总赞数直接存 KV：
 *   种子数（tools.js 里的 likes 字段）代表站点历史基数，
 *   线上展示值 = 种子 + KV 增量。这样换存储、清空 KV 都不会让数字归零。
 *
 * ⚠️ 文件名以下划线开头，Cloudflare Pages 不会把它注册成路由。
 * ============================================================ */

/* 同域部署本不需要 CORS；开放是为了让独立 Worker 或本地调试也能复用。 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }, CORS_HEADERS)
  });
}

/* 工具 id 字符集与 tools.js 的约束一致：小写字母/数字/连字符 */
const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const isValidId = id => typeof id === "string" && ID_RE.test(id);

/* 单次批量查询允许的最大 id 数，防止有人构造超长 URL 打爆 KV 读配额 */
export const MAX_IDS = 200;

/* 投票者指纹：IP + User-Agent 做 SHA-256，只取前 16 位十六进制。
 * 不存储原始 IP，符合最小化收集原则。UA 变化会被视为新访客，属于可接受的误差。 */
export async function voterId(request) {
  const ip = request.headers.get("CF-Connecting-IP")
    || request.headers.get("x-forwarded-for")
    || "0.0.0.0";
  const ua = request.headers.get("user-agent") || "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}|${ua}`));
  return Array.from(new Uint8Array(digest).slice(0, 8), b => b.toString(16).padStart(2, "0")).join("");
}

/* 去重窗口：同一指纹在 24 小时内对同一工具只能计一次赞 */
export const VOTE_TTL = 86400;

export const deltaKey = id => `like:${id}`;
export const votedKey = (id, voter) => `v:${id}:${voter}`;

export async function readDelta(env, id) {
  const n = Number.parseInt(await env.LIKES.get(deltaKey(id)) || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/* KV 未绑定时的统一报错，便于站长一眼找到配置位置 */
export const KV_MISSING = {
  error: "kv_not_bound",
  hint: "请在 Cloudflare Pages 项目 Settings → Bindings → KV namespace bindings 中添加变量名 LIKES"
};

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
