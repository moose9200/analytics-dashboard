import { Router } from 'express';
import { query } from '../services/database.js';
import { exchangeCodeForToken, storeOAuthToken, getOAuthConfig } from '../services/oauth.js';

const router = Router();

router.get('/callback/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error('OAuth error:', error, error_description);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=${error}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=no_code`);
    }

    const redirectUri = `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/callback/${platform}`;
    const tokens = await exchangeCodeForToken(platform, code, redirectUri);

    if (!tokens?.access_token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=token_failed`);
    }

    await storeOAuthToken(platform, tokens);

    await query(`
      UPDATE integrations SET status = 'connected', last_sync = NOW(), updated_at = NOW()
      WHERE platform = $1
    `, [platform]);

    const config = getOAuthConfig(platform);
    if (platform === 'shopify' && state && typeof state === 'string') {
      const shopDomain = state.replace('shopify_', '');
      await query(`
        UPDATE integrations SET config = config || $1::jsonb
        WHERE platform = $2
      `, [JSON.stringify({ shopDomain }), platform]);
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?connected=${platform}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=unknown`);
  }
});

export default router;