import { Router } from 'express';
import { query } from '../services/database.js';
import { buildAuthUrl, getOAuthConfig } from '../services/oauth.js';

const router = Router();

const AVAILABLE_INTEGRATIONS = [
  { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'ecommerce' },
  { id: 'klaviyo', name: 'Klaviyo', icon: '📧', category: 'marketing' },
  { id: 'google_analytics', name: 'Google Analytics', icon: '📊', category: 'analytics' },
  { id: 'search_console', name: 'Search Console', icon: '🔍', category: 'seo' },
  { id: 'google_ads', name: 'Google Ads', icon: '📢', category: 'ads' },
  { id: 'meta_ads', name: 'Meta Ads', icon: '📘', category: 'ads' },
  { id: 'gmc', name: 'Google Merchant Center', icon: '🛍️', category: 'ecommerce' },
  { id: 'trustpilot', name: 'Trustpilot', icon: '⭐', category: 'reviews' },
  { id: 'freshcaller', name: 'Freshcaller', icon: '📞', category: 'support' },
  { id: 'ms_teams', name: 'Microsoft Teams', icon: '💬', category: 'communication' },
  { id: 'slack', name: 'Slack', icon: '💼', category: 'communication' },
  { id: 'outlook', name: 'Outlook', icon: '📧', category: 'communication' },
  { id: 'powerbi', name: 'Power BI', icon: '📈', category: 'bi' }
];

router.get('/', async (_req, res) => {
  try {
    const result = await query(`
      SELECT platform, name, status, last_sync 
      FROM integrations
      ORDER BY name
    `);
    
    const connected = result.rows;
    const connectedPlatforms = new Set(connected.map((i: { platform: string }) => i.platform));
    
    const all = AVAILABLE_INTEGRATIONS.map(i => {
      const existing = connected.find((c: { platform: string }) => c.platform === i.id);
      return {
        ...i,
        status: existing?.status || 'available',
        lastSync: existing?.last_sync || null
      };
    });
    
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/:platform/connect', async (req, res) => {
  try {
    const { platform } = req.params;
    const { shopDomain } = req.body;
    
    const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === platform);
    if (!integration) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    const oauthConfig = getOAuthConfig(platform);
    
    if (!oauthConfig) {
      return res.status(400).json({ error: 'OAuth not supported for this platform' });
    }

    await query(`
      INSERT INTO integrations (platform, name, status, config)
      VALUES ($1, $2, 'pending', $3)
      ON CONFLICT (platform) DO UPDATE SET
        status = 'pending',
        updated_at = NOW()
    `, [platform, integration.name, JSON.stringify({ shopDomain })]);

    const state = platform === 'shopify' ? `shopify_${shopDomain}` : `oauth_${platform}`;
    const authUrl = buildAuthUrl(platform, state);

    if (!authUrl) {
      return res.status(500).json({ error: 'Failed to build auth URL' });
    }

    res.json({ authUrl, redirect: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/:platform/disconnect', async (req, res) => {
  try {
    const { platform } = req.params;
    
    await query(`
      UPDATE integrations 
      SET status = 'disconnected', config = '{}', credentials_encrypted = '{}', updated_at = NOW()
      WHERE platform = $1
    `, [platform]);
    
    res.json({ status: 'disconnected' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/:platform/status', async (req, res) => {
  try {
    const { platform } = req.params;
    const result = await query(`
      SELECT platform, name, status, config, last_sync, created_at, updated_at
      FROM integrations WHERE platform = $1
    `, [platform]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/:platform/sync', async (req, res) => {
  try {
    const { platform } = req.params;
    const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === platform);
    
    if (!integration) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    const { default: syncModule } = await import(`../integrations/${platform}/sync.js`)
      .catch(() => ({ default: null }));
    
    if (!syncModule) {
      return res.status(501).json({ error: 'Sync not implemented yet' });
    }
    
    await syncModule.sync();
    
    await query(`
      UPDATE integrations SET last_sync = NOW(), status = 'connected', updated_at = NOW()
      WHERE platform = $1
    `, [platform]);
    
    res.json({ status: 'synced', message: 'Data synced successfully' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;