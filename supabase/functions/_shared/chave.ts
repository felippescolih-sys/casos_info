// Chamadas do n8n (agente de WhatsApp da VPS) vêm com a chave secreta do projeto no Authorization.
// Aceita a service_role (JWT) ou qualquer chave secreta nova (sb_secret_) do projeto — a sb_secret_
// não é JWT, por isso essas funções têm verify_jwt=false e conferem a chave aqui.
export function chaveDoProjeto(req: Request) {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const validas = new Set<string>();
  const sr = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (sr) validas.add(sr);
  try {
    const coletar = (v: unknown): void => {
      if (typeof v === 'string') validas.add(v);
      else if (v && typeof v === 'object') Object.values(v).forEach(coletar);
    };
    coletar(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}'));
  } catch { /* sem chaves novas */ }
  return validas.has(token);
}
