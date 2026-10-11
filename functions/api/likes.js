/* ============================================================
 * GET /api/likes?ids=pixpin,utools,...
 * ------------------------------------------------------------
 * 返回这批工具的「增量点赞数」（不含 tools.js 里的种子数）。
 * 响应：{ counts: { pixpin: 12, utools: 3 }, kv: true }
 * 没有增量的 id 不会出现在 counts 里，前端按 0 处理。
 * ============================================================ */
import { json, isValidId, readDelta, MAX_IDS, KV_MISSING, preflight } from "./_shared.js";

export const onRequestOptions = preflight;

export async function onRequestGet({ request, env }) {
  if (!env.LIKES) return json(KV_MISSING, 503);

  const raw = new URL(request.url).searchParams.get("ids") || "";
  const ids = [...new Set(raw.split(",").map(s => s.trim()).filter(Boolean))]
    .filter(isValidId)
    .slice(0, MAX_IDS);

  if (!ids.length) return json({ counts: {} });

  const deltas = await Promise.all(ids.map(id => readDelta(env, id)));
  const counts = {};
  ids.forEach((id, i) => { if (deltas[i] > 0) counts[id] = deltas[i]; });

  return json({ counts });
}
