import { query } from './database.js';

const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectParam: string;
}> = {
  shopify: {
    authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    scopes: ['read_orders', 'read_products', 'read_customers', 'read_analytics'],
    redirectParam: 'shop'
  },
  google_analytics: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    redirectParam: 'redirect_uri'
  },
  google_ads: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/adwords'],
    redirectParam: 'redirect_uri'
  },
  meta_ads: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['ads_read', 'ads_management', 'business_management'],
    redirectParam: 'redirect_uri'
  },
  klaviyo: {
    authUrl: 'https://www.klaviyo.com/oauth/authorize',
    tokenUrl: 'https://a.klaviyo.com/oauth/token',
    scopes: ['profile:read', 'profile:write', 'list:read', 'list:write', 'metric:read'],
    redirectParam: 'redirect_uri'
  }
};

export function getOAuthConfig(platform: string) {
  return OAUTH_CONFIGS[platform];
}

export function buildAuthUrl(platform: string, state: string): string | null {
  const config = OAUTH_CONFIGS[platform];
  if (!config) return null;

  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/callback/${platform}`;

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state
  });

  if (platform === 'shopify') {
    const shopDomain = state.replace('shopify_', '');
    return config.authUrl.replace('{shop}', shopDomain) + '?' + params.toString();
  }

  return config.authUrl + '?' + params.toString();
}

export async function exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<{ access_token: string; refresh_token?: string } | null> {
  const config = OAUTH_CONFIGS[platform];
  if (!config) return null;

  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

  const params = new URLSearchParams({
    client_id: clientId || '',
    client_secret: clientSecret || '',
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await response.json() as { access_token: string; refresh_token?: string } | null;
    return data;
  } catch (error) {
    console.error('Token exchange failed:', error);
    return null;
  }
}

export async function storeOAuthToken(platform: string, tokens: { access_token: string; refresh_token?: string }) {
  await query(`
    UPDATE integrations 
    SET credentials_encrypted = $1::jsonb, status = 'connected', updated_at = NOW()
    WHERE platform = $2
  `, [JSON.stringify(tokens), platform]);
}

export default { getOAuthConfig, buildAuthUrl, exchangeCodeForToken, storeOAuthToken };