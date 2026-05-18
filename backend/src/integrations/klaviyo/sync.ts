import { query } from '../../services/database.js';

export async function sync() {
  const result = await query(`
    SELECT credentials_encrypted FROM integrations WHERE platform = 'klaviyo' AND status != 'disconnected'
  `);
  
  if (result.rows.length === 0) {
    throw new Error('Klaviyo integration not configured');
  }

  console.log('Klaviyo sync - using mock data for now');
  
  await query(`
    UPDATE integrations SET last_sync = NOW(), status = 'connected', 
    config = config || $1::jsonb WHERE platform = 'klaviyo'
  `, [JSON.stringify({ reports: ['email_performance', 'campaign_summary', 'list_growth'] })]);

  return { synced: true };
}

export default { sync };