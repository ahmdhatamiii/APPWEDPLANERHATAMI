export default async function handler(req, res) {
  const GAS_URL = process.env.GAS_EXEC_URL || "https://script.google.com/macros/s/AKfycby4ra7QTQOc_vMMW9VmrtTShlnDld3SbynkqxYoEM_IoOhyW9pPRgiktM8RqAO-HMgE/exec";
  const action = req.query.action || '';
  const params = req.query.params || '[]';

  if (!action) return res.status(400).json({ status: 'error', message: 'Parameter action wajib diisi' });

  const url = `${GAS_URL}?action=${encodeURIComponent(action)}&params=${encodeURIComponent(params)}`;

  try {
    let response = await fetch(url, { redirect: 'follow' });
    let text = await response.text();

    // Deteksi Google meta-refresh atau JS-redirect jika fetch tidak otomatis follow
    if (text.includes('<!DOCTYPE html') || text.includes('<!doctype html')) {
      const metaMatch = text.match(/content=["']0;\s*url=(.*?)["']/i);
      const jsMatch = text.match(/location\.(?:replace|href)\s*[\(=]\s*["'](https:\/\/[^"']+)["']/);
      const redirectUrl = (metaMatch && metaMatch[1]) || (jsMatch && jsMatch[1]);
      if (redirectUrl) {
        const redir = await fetch(redirectUrl, { redirect: 'follow' });
        text = await redir.text();
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

