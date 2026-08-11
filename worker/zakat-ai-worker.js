/**
 * ZakatMaal AI Proxy — Cloudflare Worker
 *
 * Secrets:
 *   ANTHROPIC_API_KEY
 * Optional variable:
 *   ANTHROPIC_MODEL
 */
const SYSTEM = `Kamu adalah Asisten Islami di aplikasi ZakatMaal.
Jawab Bahasa Indonesia dengan santun dan ringkas (sekitar 80-150 kata).
Gunakan heading ## untuk bagian pendek, bullet - untuk daftar.
Jangan mengarang dalil. Jika ada khilafiyah, sebutkan secara singkat.
Bedakan estimasi kalkulator dari fatwa resmi.
Untuk pertanyaan rumit atau nilai besar, anjurkan konsultasi ustadz/lembaga amil zakat.`;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors(origin)});
    if (request.method !== 'POST') return new Response('Method Not Allowed',{status:405,headers:cors(origin)});

    try {
      const body = await request.json();
      const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
      if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY belum dikonfigurasi');

      const api = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{
          'content-type':'application/json',
          'x-api-key':env.ANTHROPIC_API_KEY,
          'anthropic-version':'2023-06-01'
        },
        body:JSON.stringify({
          model: env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens:1000,
          system:SYSTEM,
          messages:messages
            .filter(m=>m && (m.role==='user'||m.role==='assistant'))
            .map(m=>({role:m.role,content:String(m.content||'')}))
        })
      });

      const data = await api.json();
      if (!api.ok) {
        return new Response(JSON.stringify({error:'AI upstream error',details:data}),{
          status:502,headers:{'content-type':'application/json',...cors(origin)}
        });
      }
      const answer=(data.content||[]).map(x=>x.text||'').join('\n').trim();
      return new Response(JSON.stringify({answer}),{
        status:200,headers:{'content-type':'application/json',...cors(origin)}
      });
    } catch (err) {
      return new Response(JSON.stringify({error:String(err.message||err)}),{
        status:500,headers:{'content-type':'application/json',...cors(origin)}
      });
    }
  }
};
