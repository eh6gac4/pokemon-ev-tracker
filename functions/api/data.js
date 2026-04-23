const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    "SELECT data FROM ev_data WHERE id = 1"
  ).first();
  const data = row ? JSON.parse(row.data) : {};
  return Response.json(data, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400, headers: CORS });
  }
  await env.DB.prepare(
    "INSERT INTO ev_data (id, data) VALUES (1, ?)" +
    " ON CONFLICT(id) DO UPDATE SET data = excluded.data"
  )
    .bind(JSON.stringify(data))
    .run();
  return Response.json({ ok: true }, { headers: CORS });
}
