/* ============================================================
 * POST /api/like   body: { id: "pixpin", action: "like" | "unlike" }
 * ------------------------------------------------------------
 * 返回：{ id, delta, voted, duplicate }
 *   delta      该工具当前的增量点赞数（+ tools.js 的种子数 = 前端展示值）
 *   voted      这次请求之后，该访问者的投票状态
 *   duplicate  action=like 时为 true，表示 24 小时内已投过、本次未计数
 *
 * 防刷：同一 IP+UA 指纹在 24 小时内对同一工具只计一次赞。
 * 诚实说明：KV 是最终一致存储，并发写入可能丢个别计数。
 * 对一个小站来说完全够用；若将来量级上来了，把它换成 Durable Object
 * 即可获得强一致，接口契约不用改。
 * ============================================================ */
import {
  json, isValidId, voterId, readDelta,
  deltaKey, votedKey, VOTE_TTL, KV_MISSING, preflight
} from "./_shared.js";

export const onRequestOptions = preflight;

export async function onRequestPost({ request, env }) {
  if (!env.LIKES) return json(KV_MISSING, 503);

  let body = null;
  try { body = await request.json(); } catch { /* 交给下面统一报错 */ }

  const id = body && body.id;
  const action = body && body.action;
  if (!isValidId(id)) return json({ error: "invalid_id" }, 400);
  if (action !== "like" && action !== "unlike") return json({ error: "invalid_action" }, 400);

  const voter = await voterId(request);
  const vk = votedKey(id, voter);
  const hasVoted = !!(await env.LIKES.get(vk));
  let delta = await readDelta(env, id);

  let duplicate = false;
  if (action === "like") {
    if (hasVoted) {
      duplicate = true;            // 已投过，幂等返回，不重复计数
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

  return json({ id, delta, voted: action === "like", duplicate });
}
