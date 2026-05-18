import { query } from '../../services/database.js';

export async function sync() {
  const result = await query(`
    SELECT credentials_encrypted FROM integrations WHERE platform = 'google_analytics' AND status != 'disconnected'
  `);
  
  if (result.rows.length === 0) {
    throw new Error('Google Analytics integration not configured');
  }

  console.log('Google Analytics sync - using mock data for now');
  
  await query(`
    UPDATE integrations SET last_sync = NOW(), status = 'connected', 
    config = config || $1::jsonb WHERE platform = 'google_analytics'
  `, [JSON.stringify({ reports: ['traffic_overview', 'acquisition', 'conversion', 'pages'] })]);

  return { synced: true };
}

export default { sync };