import { Router } from 'express';
import { query } from '../services/database.js';
import { cacheGet, cacheSet } from '../services/redis.js';

const router = Router();

const SAMPLE_KPIS = {
  shopify: [
    { id: 'total_revenue', name: 'Total Revenue', value: 124500, change: 12.5, unit: 'currency' },
    { id: 'orders', name: 'Orders', value: 1847, change: 8.3, unit: 'number' },
    { id: 'avg_order_value', name: 'Avg Order Value', value: 67.42, change: 3.2, unit: 'currency' },
    { id: 'conversion_rate', name: 'Conversion Rate', value: 3.2, change: -0.5, unit: 'percent' },
    { id: 'cart_abandonment', name: 'Cart Abandonment', value: 68.5, change: -2.1, unit: 'percent' }
  ],
  klaviyo: [
    { id: 'total_subscribers', name: 'Total Subscribers', value: 15420, change: 5.2, unit: 'number' },
    { id: 'email_open_rate', name: 'Open Rate', value: 22.4, change: 1.8, unit: 'percent' },
    { id: 'click_rate', name: 'Click Rate', value: 4.2, change: 0.5, unit: 'percent' },
    { id: 'revenue_attributed', name: 'Revenue Attributed', value: 28900, change: 15.3, unit: 'currency' }
  ],
  google_analytics: [
    { id: 'sessions', name: 'Sessions', value: 45230, change: 7.8, unit: 'number' },
    { id: 'users', name: 'Users', value: 32100, change: 9.2, unit: 'number' },
    { id: 'bounce_rate', name: 'Bounce Rate', value: 42.1, change: -3.4, unit: 'percent' },
    { id: 'pageviews', name: 'Page Views', value: 128500, change: 11.2, unit: 'number' },
    { id: 'avg_session_duration', name: 'Avg Session Duration', value: 185, change: 4.5, unit: 'seconds' }
  ],
  google_ads: [
    { id: 'spend', name: 'Total Spend', value: 8500, change: -2.3, unit: 'currency' },
    { id: 'clicks', name: 'Clicks', value: 12500, change: 5.7, unit: 'number' },
    { id: 'impressions', name: 'Impressions', value: 850000, change: 8.2, unit: 'number' },
    { id: 'ctr', name: 'CTR', value: 1.47, change: 0.2, unit: 'percent' },
    { id: 'cpc', name: 'CPC', value: 0.68, change: -7.2, unit: 'currency' },
    { id: 'conversions', name: 'Conversions', value: 890, change: 12.4, unit: 'number' }
  ],
  meta_ads: [
    { id: 'spend', name: 'Total Spend', value: 6200, change: 3.5, unit: 'currency' },
    { id: 'impressions', name: 'Impressions', value: 520000, change: 15.2, unit: 'number' },
    { id: 'reach', name: 'Reach', value: 185000, change: 8.7, unit: 'number' },
    { id: 'ctr', name: 'CTR', value: 0.89, change: -1.1, unit: 'percent' },
    { id: 'cpm', name: 'CPM', value: 11.92, change: -3.2, unit: 'currency' }
  ]
};

router.get('/kpis', async (_req, res) => {
  try {
    const cache = await cacheGet('dashboard:kpis');
    if (cache) {
      return res.json(cache);
    }

    const result = await query(`
      SELECT platform, status FROM integrations WHERE status IN ('connected', 'syncing')
    `);
    
    const connectedPlatforms = result.rows.map((r: { platform: string }) => r.platform);
    
    const kpis = connectedPlatforms.reduce<Record<string, unknown[]>>((acc, platform) => {
      acc[platform] = SAMPLE_KPIS[platform as keyof typeof SAMPLE_KPIS] || [];
      return acc;
    }, {} as Record<string, unknown[]>);

    const response = {
      platforms: connectedPlatforms,
      kpis,
      lastUpdated: new Date().toISOString()
    };
    
    await cacheSet('dashboard:kpis', response, 60);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/:platform/kpis', async (req, res) => {
  try {
    const { platform } = req.params;
    const cacheKey = `dashboard:kpis:${platform}`;
    
    const cache = await cacheGet(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const result = await query(`
      SELECT status FROM integrations WHERE platform = $1
    `, [platform]);

    if (result.rows.length === 0 || !['connected', 'syncing'].includes(result.rows[0].status)) {
      return res.status(404).json({ error: 'Integration not connected' });
    }

    const kpis = SAMPLE_KPIS[platform as keyof typeof SAMPLE_KPIS] || [];
    
    await cacheSet(cacheKey, { platform, kpis }, 60);
    res.json({ platform, kpis });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/summary', async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'connected') as connected,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'disconnected') as disconnected,
        COUNT(*) as total
      FROM integrations
    `);

    const totalResult = await query(`
      SELECT 
        COALESCE(SUM((config->>'totalRevenue')::numeric), 0) as revenue,
        COALESCE(SUM((config->>'totalOrders')::integer), 0) as orders
      FROM integrations 
      WHERE status = 'connected' AND platform = 'shopify'
    `);

    res.json({
      integrations: result.rows[0],
      summary: {
        totalRevenue: 124500,
        totalOrders: 1847,
        avgOrderValue: 67.42
      }
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;