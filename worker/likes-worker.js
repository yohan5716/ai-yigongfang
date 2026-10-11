/* ============================================================
 * AI义工坊 · 点赞接口（独立 Cloudflare Worker 版 · 备选方案）
 * ------------------------------------------------------------
 * 什么时候用这个文件？
 *   推荐做法是走 Pages Functions（functions/api/*.js），同域、免配置。
 *   如果你把站点托管在别处（自备服务器 / Vercel / GitHub Pages），
 *   或者就是想单独有个接口地址，再部署这个 Worker。
 *
 * 部署步骤：
 *   1. Cloudflare 控制台 → Workers & Pages → Create → Worker
 *   2. 命名 aiygf-likes，把本文件内容整体粘进编辑器 → Deploy
 *   3. 该 Worker → Settings → Bindings → 添加 KV Namespace
 *        变量名填 LIKES，命名空间随便建一个（如 aiygf-likes-kv）
 *   4. 回到站点，把 index.html 里的 CONFIG.apiBase 改成
 *        "https://aiygf-likes.你的子域.workers.dev/api"
 *   5. （可选）在下面的 ALLOWED_ORIGINS 里加上你的站点域名
 *
 * 路由：GET /api/likes?ids=a,b  |  POST /api/like  |  GET /api/health
 * ============================================================ */

/* 允许跨域的来源。留空数组 = 允许任意来源。
 * 绑了自有域名后，建议填 ["https://ygf.de5.net", "https://www.ygf.de5.net"]。 */
const ALLOWED_ORIGINS = [];

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const MAX_IDS = 200;
const VOTE_TTL = 86400;

const deltaKey = id => `like:${id}`;
const votedKey = (id, voter) => `v:${id}:${voter}`;

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
    ? (ALLOWED_ORIGINS.length === 0 ? "*" : origin)
    : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }, corsHeaders(request))
  });
}

const isValidId = id => typeof id === "string" && ID_RE.test(id);

async function voterId(request) {
  const ip = request.headers.get("CF-Connecting-IP")
    || request.headers.get("x-forwarded-for")
    || "0.0.0.0";
  const ua = request.headers.get("user-agent") || "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}|${ua}`));
  return Array.from(new Uint8Array(digest).slice(0, 8), b => b.toString(16).padStart(2, "0")).join("");
}

async function readDelta(env, id) {
  const n = Number.parseInt(await env.LIKES.get(deltaKey(id)) || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const KV_MISSING = {
  error: "kv_not_bound",
  hint: "请在该 Worker 的 Settings → Bindings 中添加 KV Namespace，变量名 LIKES"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    /* 兼容带 /api 前缀与不带前缀两种写法 */
    const route = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (route === "/health") return json(request, { ok: true, kv: !!env.LIKES });

    if (!env.LIKES) return json(request, KV_MISSING, 503);

    /* ---------- GET /likes?ids=a,b,c ---------- */
    if (route === "/likes" && request.method === "GET") {
      const raw = url.searchParams.get("ids") || "";
      const ids = [...new Set(raw.split(",").map(s => s.trim()).filter(Boolean))]
        .filter(isValidId)
        .slice(0, MAX_IDS);
      if (!ids.length) return json(request, { counts: {} });

      const deltas = await Promise.all(ids.map(id => readDelta(env, id)));
      const counts = {};
      ids.forEach((id, i) => { if (deltas[i] > 0) counts[id] = deltas[i]; });
      return json(request, { counts });
    }

    /* ---------- POST /like ---------- */
    if (route === "/like" && request.method === "POST") {
      let body = null;
      try { body = await request.json(); } catch { }
      const id = body && body.id;
      const action = body && body.action;
      if (!isValidId(id)) return json(request, { error: "invalid_id" }, 400);
      if (action !== "like" && action !== "unlike") return json(request, { error: "invalid_action" }, 400);

      const voter = await voterId(request);
      const vk = votedKey(id, voter);
      const hasVoted = !!(await env.LIKES.get(vk));
      let delta = await readDelta(env, id);
      let duplicate = false;

      if (action === "like") {
        if (hasVoted) {
          duplicate = true;
        } else {
          delta += 1;
          await env.LIKES.put(deltaKey(id), String(delta));
          await env.LIKES.put(vk, "1", { expirationTtl: VOTE_TTL });
        }
      } else if (hasVoted) {
        delta = Math.max(0, delta - 1);
        await env.LIKES.put(deltaKey(id), String(delta));
        await env.LIKES.delete(vk);
      }

      return json(request, { id, delta, voted: action === "like", duplicate });
    }

    return json(request, { error: "not_found", routes: ["GET /api/likes", "POST /api/like", "GET /api/health"] }, 404);
  }
};
