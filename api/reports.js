import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — list recent reports
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  // POST — submit a new report
  if (req.method === 'POST') {
    try {
      const { username, village, category, method, message, is_anonymous, language } = req.body;

      const { data, error } = await supabase.from('reports').insert([{
        username: is_anonymous ? 'Anonymous' : (username || 'Anonymous'),
        village: village || 'Unknown',
        category: category || 'other',
        method: method || 'text',
        message: message || '',
        is_anonymous: Boolean(is_anonymous),
        language: language || 'en',
        status: 'pending'
      }]).select().single();

      if (error) throw error;

      // Increment village report count
      if (village) {
        await supabase.rpc('increment_village_reports', { village_name: village });
      }

      return res.status(200).json({ success: true, id: data.id, message: 'Report submitted successfully!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to submit report' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
