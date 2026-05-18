import { query } from '../../services/database.js';
import { createShopifyClient, type ShopifyConfig } from './client.js';

export async function sync() {
  const result = await query(`
    SELECT config, credentials_encrypted 
    FROM integrations 
    WHERE platform = 'shopify' AND status != 'disconnected'
  `);
  
  if (result.rows.length === 0) {
    throw new Error('Shopify integration not configured');
  }

  const { config, credentials_encrypted } = result.rows[0];
  const shopifyConfig: ShopifyConfig = {
    shopDomain: config.shopDomain || credentials_encrypted.shopDomain,
    accessToken: credentials_encrypted.accessToken
  };

  const client = createShopifyClient(shopifyConfig);
  const reports = await client.getPredefinedReports();

  await query(`
    UPDATE integrations 
    SET config = config || $1::jsonb, last_sync = NOW(), status = 'connected'
    WHERE platform = 'shopify'
  `, [JSON.stringify({ reports, lastReportDate: new Date().toISOString() })]);

  console.log(`Shopify synced: ${reports.length} reports`);
  return { reports: reports.length, synced: true };
}

export default { sync };