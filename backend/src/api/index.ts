import { Router } from 'express';
import integrationsRouter from './integrations.js';
import dashboardRouter from './dashboard.js';
import authRouter from './auth.js';
import oauthCallbackRouter from './oauth-callback.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/auth/callback', oauthCallbackRouter);
router.use('/integrations', integrationsRouter);
router.use('/dashboard', dashboardRouter);

router.get('/', (_req, res) => {
  res.json({ 
    message: 'Analytics Dashboard API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

export default router;