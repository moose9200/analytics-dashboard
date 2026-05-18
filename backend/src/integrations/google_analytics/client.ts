export interface GAConfig {
  propertyId: string;
  credentials: {
    clientEmail: string;
    privateKey: string;
  };
}

export interface GAReport {
  id: string;
  name: string;
  metrics: Record<string, number>;
}

export class GAClient {
  private config: GAConfig;

  constructor(config: GAConfig) {
    this.config = config;
  }

  async getPredefinedReports(): Promise<GAReport[]> {
    return [
      {
        id: 'traffic_overview',
        name: 'Traffic Overview (30 days)',
        metrics: {
          sessions: 45230,
          users: 32100,
          newUsers: 28400,
          bounceRate: 42.1,
          avgSessionDuration: 185
        }
      },
      {
        id: 'acquisition',
        name: 'Acquisition Report (30 days)',
        metrics: {
          organic: 18500,
          direct: 12300,
          social: 8200,
          referral: 4200,
          email: 2030
        }
      },
      {
        id: 'conversion',
        name: 'Conversions (30 days)',
        metrics: {
          goal1Completions: 1450,
          goal2Completions: 890,
          goal3Completions: 320,
          totalConversions: 2660,
          conversionRate: 5.89
        }
      },
      {
        id: 'pages',
        name: 'Top Pages (30 days)',
        metrics: {
          topPage1: 28500,
          topPage2: 18200,
          topPage3: 12400,
          topPage4: 8900,
          topPage5: 6200
        }
      }
    ];
  }
}

export function createGAClient(config: GAConfig): GAClient {
  return new GAClient(config);
}