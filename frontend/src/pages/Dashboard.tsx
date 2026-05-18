import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface KPI {
  id: string
  name: string
  value: number
  change: number
  unit: string
}

interface DashboardData {
  platforms: string[]
  kpis: Record<string, KPI[]>
  lastUpdated: string
}

const sampleData = {
  platforms: ['shopify', 'klaviyo', 'google_analytics', 'google_ads', 'meta_ads'],
  kpis: {
    shopify: [
      { id: 'total_revenue', name: 'Total Revenue', value: 124500, change: 12.5, unit: 'currency' },
      { id: 'orders', name: 'Orders', value: 1847, change: 8.3, unit: 'number' },
      { id: 'avg_order_value', name: 'Avg Order Value', value: 67.42, change: 3.2, unit: 'currency' },
      { id: 'conversion_rate', name: 'Conversion Rate', value: 3.2, change: -0.5, unit: 'percent' },
    ],
    klaviyo: [
      { id: 'subscribers', name: 'Total Subscribers', value: 15420, change: 5.2, unit: 'number' },
      { id: 'open_rate', name: 'Open Rate', value: 22.4, change: 1.8, unit: 'percent' },
      { id: 'revenue', name: 'Revenue Attributed', value: 28900, change: 15.3, unit: 'currency' },
    ],
    google_analytics: [
      { id: 'sessions', name: 'Sessions', value: 45230, change: 7.8, unit: 'number' },
      { id: 'users', name: 'Users', value: 32100, change: 9.2, unit: 'number' },
      { id: 'bounce_rate', name: 'Bounce Rate', value: 42.1, change: -3.4, unit: 'percent' },
    ],
    google_ads: [
      { id: 'spend', name: 'Total Spend', value: 8500, change: -2.3, unit: 'currency' },
      { id: 'clicks', name: 'Clicks', value: 12500, change: 5.7, unit: 'number' },
      { id: 'conversions', name: 'Conversions', value: 890, change: 12.4, unit: 'number' },
    ],
    meta_ads: [
      { id: 'spend', name: 'Total Spend', value: 6200, change: 3.5, unit: 'currency' },
      { id: 'impressions', name: 'Impressions', value: 520000, change: 15.2, unit: 'number' },
      { id: 'reach', name: 'Reach', value: 185000, change: 8.7, unit: 'number' },
    ]
  },
  lastUpdated: new Date().toISOString()
}

const chartData = [
  { name: 'Mon', revenue: 4200, orders: 62 },
  { name: 'Tue', revenue: 3800, orders: 55 },
  { name: 'Wed', revenue: 5100, orders: 78 },
  { name: 'Thu', revenue: 4600, orders: 67 },
  { name: 'Fri', revenue: 6200, orders: 92 },
  { name: 'Sat', revenue: 5800, orders: 85 },
  { name: 'Sun', revenue: 4900, orders: 71 },
]

const platformNames: Record<string, string> = {
  shopify: 'Shopify',
  klaviyo: 'Klaviyo',
  google_analytics: 'Google Analytics',
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  gmc: 'Google Merchant Center',
  trustpilot: 'Trustpilot',
  freshcaller: 'Freshcaller',
  ms_teams: 'MS Teams',
  slack: 'Slack',
  outlook: 'Outlook',
  powerbi: 'Power BI'
}

function formatValue(value: number, unit: string): string {
  if (unit === 'currency') return `$${value.toLocaleString()}`
  if (unit === 'percent') return `${value}%`
  return value.toLocaleString()
}

export default function Dashboard() {
  const [data] = useState<DashboardData>(sampleData)
  const [filter, setFilter] = useState<string>('all')

  const totalRevenue = data.kpis.shopify?.find(k => k.id === 'total_revenue')?.value || 0
  const totalOrders = data.kpis.shopify?.find(k => k.id === 'orders')?.value || 0
  const totalSessions = data.kpis.google_analytics?.find(k => k.id === 'sessions')?.value || 0

  const filteredKPIs = filter === 'all' 
    ? Object.entries(data.kpis).flatMap(([platform, kpis]) => 
        kpis.map(k => ({ ...k, platform }))
      )
    : (data.kpis[filter] || []).map(k => ({ ...k, platform: filter }))

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Unified view of all your connected platforms and KPIs</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue (30d)</div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">↑ 12.5% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{totalOrders.toLocaleString()}</div>
          <div className="stat-change positive">↑ 8.3% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{totalSessions.toLocaleString()}</div>
          <div className="stat-change positive">↑ 7.8% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Platforms</div>
          <div className="stat-value">{data.platforms.length}</div>
          <div className="stat-change">All synced</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Revenue Overview</h3>
        <div style={{ height: 300, background: '#1e1e1e', borderRadius: 12, padding: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" />
              <Tooltip 
                contentStyle={{ background: '#252525', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="page-header">
        <h3>KPIs by Platform</h3>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {data.platforms.map(p => (
          <button 
            key={p}
            className={`filter-tab ${filter === p ? 'active' : ''}`}
            onClick={() => setFilter(p)}
          >
            {platformNames[p] || p}
          </button>
        ))}
      </div>

      <div className="kpi-grid">
        {filteredKPIs.map((kpi, idx) => (
          <div key={`${kpi.platform}-${kpi.id}-${idx}`} className="kpi-card">
            <div className="kpi-header">
              <div>
                <div className="kpi-platform">{platformNames[kpi.platform] || kpi.platform}</div>
                <div className="kpi-name">{kpi.name}</div>
              </div>
            </div>
            <div className="kpi-value">{formatValue(kpi.value, kpi.unit)}</div>
            <div className={`stat-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
              {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}