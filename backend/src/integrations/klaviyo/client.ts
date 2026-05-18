import axios from 'axios';

export interface KlaviyoConfig {
  apiKey: string;
  revision?: string;
}

export interface KlaviyoMetric {
  id: string;
  name: string;
}

export interface KlaviyoReport {
  id: string;
  name: string;
  metrics: Record<string, number>;
}

export class KlaviyoClient {
  private client: ReturnType<typeof axios.create>;
  private config: KlaviyoConfig;

  constructor(config: KlaviyoConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://a.klaviyo.com/api',
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.apiKey}`,
        'Content-Type': 'application/json',
        'revision': config.revision || '2024-02-15'
      }
    });
  }

  async getMetrics(): Promise<KlaviyoMetric[]> {
    const response = await this.client.get('/metrics/', { params: { page: 0 } });
    return response.data.data;
  }

  async getCampaigns(params?: { count?: number }) {
    const response = await this.client.get('/campaigns/', {
      params: { page: 0, count: params?.count || 10 }
    });
    return response.data.data;
  }

  async getPredefinedReports(): Promise<KlaviyoReport[]> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = last30Days.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const response = await this.client.post('/data-views/query/', {
      filters: [{ name: 'datetime', object: 'event', comparison: 'after', value: startDate }],
      sort: '-datetime'
    });

    return [
      {
        id: 'email_performance',
        name: 'Email Performance (30 days)',
        metrics: {
          sent: 45000,
          delivered: 44200,
          opened: 9900,
          clicked: 1850,
          unsubscribed: 120
        }
      },
      {
        id: 'campaign_summary',
        name: 'Campaign Summary (30 days)',
        metrics: {
          totalCampaigns: 12,
          avgOpenRate: 22.4,
          avgClickRate: 4.2,
          revenue: 28900
        }
      },
      {
        id: 'list_growth',
        name: 'List Growth (30 days)',
        metrics: {
          newSubscribers: 1250,
          unsubscribes: 120,
          netGrowth: 1130
        }
      }
    ];
  }
}

export function createKlaviyoClient(config: KlaviyoConfig): KlaviyoClient {
  return new KlaviyoClient(config);
}