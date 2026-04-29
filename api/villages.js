import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;

  try {
    let query = supabase.from('villages').select('*').order('score', { ascending: false });
    if (q) {
      query = query.or(`name.ilike.%${q}%,state.ilike.%${q}%,district.ilike.%${q}%`);
    }
    const { data, error } = await query.limit(20);
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch villages' });
  }
}
