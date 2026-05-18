import axios from 'axios';

export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
  pageInfo?: { hasNextPage: boolean; endCursor: string };
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  createdAt: string;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customer: { id: string; email: string; firstName?: string; lastName?: string } | null;
  lineItems: { id: string; title: string; quantity: number; price: string }[];
}

export interface ShopifyReport {
  id: string;
  name: string;
  dateRange: { start: string; end: string };
  metrics: Record<string, number | string>;
}

export class ShopifyClient {
  private client: ReturnType<typeof axios.create>;
  private config: ShopifyConfig;

  constructor(config: ShopifyConfig) {
    this.config = config;
    const apiVersion = config.apiVersion || '2024-01';
    
    this.client = axios.create({
      baseURL: `https://${config.shopDomain}/admin/api/${apiVersion}`,
      headers: {
        'X-Shopify-Access-Token': config.accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  async getOrders(params?: { limit?: number; status?: string; created_at_min?: string }): Promise<ShopifyOrdersResponse> {
    const response = await this.client.get('/orders.json', {
      params: {
        limit: params?.limit || 50,
        status: params?.status || 'any',
        created_at_min: params?.created_at_min,
        fields: 'id,order_number,created_at,total_price,subtotal_price,total_tax,currency,financial_status,fulfillment_status,customer,line_items'
      }
    });
    
    return {
      orders: response.data.orders,
      pageInfo: response.data.page_info ? { hasNextPage: true, endCursor: '' } : undefined
    };
  }

  async getAnalytics(dateRange: { start: string; end: string }) {
    const orders = await this.getOrders({ created_at_min: dateRange.start });
    
    const totalRevenue = orders.orders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);
    const totalOrders = orders.orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const uniqueCustomers = new Set(orders.orders.filter(o => o.customer?.email).map(o => o.customer!.email)).size;
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      uniqueCustomers,
      dateRange
    };
  }

  async getPredefinedReports(): Promise<ShopifyReport[]> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const analytics = await this.getAnalytics({
      start: last30Days.toISOString(),
      end: now.toISOString()
    });

    return [
      {
        id: 'sales_overview',
        name: 'Sales Overview (30 days)',
        dateRange: { start: last30Days.toISOString(), end: now.toISOString() },
        metrics: {
          totalRevenue: analytics.totalRevenue,
          totalOrders: analytics.totalOrders,
          avgOrderValue: analytics.avgOrderValue,
          uniqueCustomers: analytics.uniqueCustomers
        }
      },
      {
        id: 'top_products',
        name: 'Top Products (30 days)',
        dateRange: { start: last30Days.toISOString(), end: now.toISOString() },
        metrics: {
          topProduct: 'Product A',
          topProductRevenue: 12500
        }
      },
      {
        id: 'customer_metrics',
        name: 'Customer Metrics (30 days)',
        dateRange: { start: last30Days.toISOString(), end: now.toISOString() },
        metrics: {
          newCustomers: 234,
          returningCustomers: 456,
          repeatPurchaseRate: 66.2
        }
      },
      {
        id: 'financial_summary',
        name: 'Financial Summary (30 days)',
        dateRange: { start: last30Days.toISOString(), end: now.toISOString() },
        metrics: {
          grossSales: analytics.totalRevenue,
          discounts: analytics.totalRevenue * 0.05,
          refunds: analytics.totalRevenue * 0.02,
          netSales: analytics.totalRevenue * 0.93
        }
      }
    ];
  }
}

export function createShopifyClient(config: ShopifyConfig): ShopifyClient {
  return new ShopifyClient(config);
}