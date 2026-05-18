import { useState } from 'react'
import { RefreshCw, Trash2, Plus } from 'lucide-react'
import axios from 'axios'

interface Integration {
  id: string
  name: string
  icon: string
  category: string
  status: 'connected' | 'available' | 'pending' | 'disconnected'
  lastSync?: string | null
}

interface FormData {
  shopDomain?: string
  accessToken?: string
  apiKey?: string
}

const allIntegrations: Integration[] = [
  { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'ecommerce', status: 'available' },
  { id: 'klaviyo', name: 'Klaviyo', icon: '📧', category: 'marketing', status: 'available' },
  { id: 'google_analytics', name: 'Google Analytics', icon: '📊', category: 'analytics', status: 'available' },
  { id: 'search_console', name: 'Search Console', icon: '🔍', category: 'seo', status: 'available' },
  { id: 'google_ads', name: 'Google Ads', icon: '📢', category: 'ads', status: 'available' },
  { id: 'meta_ads', name: 'Meta Ads', icon: '📘', category: 'ads', status: 'available' },
  { id: 'gmc', name: 'Google Merchant Center', icon: '🛍️', category: 'ecommerce', status: 'pending' },
  { id: 'trustpilot', name: 'Trustpilot', icon: '⭐', category: 'reviews', status: 'available' },
  { id: 'freshcaller', name: 'Freshcaller', icon: '📞', category: 'support', status: 'available' },
  { id: 'ms_teams', name: 'Microsoft Teams', icon: '💬', category: 'communication', status: 'available' },
  { id: 'slack', name: 'Slack', icon: '💼', category: 'communication', status: 'available' },
  { id: 'outlook', name: 'Outlook', icon: '📧', category: 'communication', status: 'available' },
  { id: 'powerbi', name: 'Power BI', icon: '📈', category: 'bi', status: 'available' },
]

const statusLabels: Record<string, string> = {
  connected: 'Connected',
  available: 'Available',
  pending: 'Pending',
  disconnected: 'Disconnected'
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState(allIntegrations)
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Integration | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [connecting, setConnecting] = useState(false)

  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : filter === 'connected' 
      ? integrations.filter(i => i.status === 'connected')
      : integrations.filter(i => i.status === 'available')

  const handleConnect = async (integration: Integration) => {
    if (['shopify', 'klaviyo', 'google_analytics', 'google_ads', 'meta_ads'].includes(integration.id)) {
      setSelectedPlatform(integration)
      setShowModal(true)
    } else {
      alert(`${integration.name} - OAuth not yet implemented. Using API key auth coming soon.`)
    }
  }

  const handleOAuthConnect = async () => {
    if (!selectedPlatform) return
    
    setConnecting(true)
    setShowModal(false)
    
    try {
      const payload = selectedPlatform.id === 'shopify' 
        ? { shopDomain: formData.shopDomain }
        : {}
      
      const response = await axios.post(`/api/integrations/${selectedPlatform.id}/connect`, payload)
      
      if (response.data.authUrl && response.data.redirect) {
        window.location.href = response.data.authUrl
      } else {
        alert('Failed to start OAuth flow')
        setConnecting(false)
      }
    } catch (err) {
      console.error('Connect failed:', err)
      alert('Failed to connect')
      setConnecting(false)
    }
  }

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, status: 'disconnected', lastSync: undefined } : i
    ))
  }

  const handleSync = (id: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, lastSync: 'Syncing...' } : i
    ))
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === id ? { ...i, lastSync: 'Just now' } : i
      ))
    }, 2000)
  }

  const handleSubmitConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPlatform) return
    
    setConnecting(true)
    
    try {
      const payload: { config: Record<string, string>; credentials: Record<string, string> } = {
        config: {},
        credentials: {}
      }
      
      if (selectedPlatform.id === 'shopify') {
        payload.config.shopDomain = formData.shopDomain || ''
        payload.credentials.accessToken = formData.accessToken || ''
      } else if (selectedPlatform.id === 'klaviyo') {
        payload.credentials.apiKey = formData.apiKey || ''
      } else {
        payload.credentials.serviceAccount = formData.apiKey || ''
      }
      
      const response = await axios.post(`/api/integrations/${selectedPlatform.id}/connect`, payload)
      
      if (response.data.status === 'pending') {
        setIntegrations(prev => prev.map(i => 
          i.id === selectedPlatform.id 
            ? { ...i, status: 'pending' as const } 
            : i
        ))
        
        await axios.post(`/api/integrations/${selectedPlatform.id}/sync`)
        
        setIntegrations(prev => prev.map(i => 
          i.id === selectedPlatform.id 
            ? { ...i, status: 'connected' as const, lastSync: 'Just now' } 
            : i
        ))
      }
    } catch (err) {
      console.error('Connection failed:', err)
      alert('Failed to connect. Check your credentials.')
    } finally {
      setConnecting(false)
      setShowModal(false)
      setSelectedPlatform(null)
      setFormData({})
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Integrations</h2>
        <p>Connect your platforms with one-click integration</p>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({integrations.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'connected' ? 'active' : ''}`}
          onClick={() => setFilter('connected')}
        >
          Connected ({integrations.filter(i => i.status === 'connected').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Available ({integrations.filter(i => i.status === 'available').length})
        </button>
      </div>

      <div className="grid-cards">
        {filteredIntegrations.map(integration => (
          <div 
            key={integration.id} 
            className="platform-card"
            onClick={() => integration.status === 'available' && handleConnect(integration)}
          >
            <div className="platform-card-header">
              <div className="platform-info">
                <div className="platform-icon">{integration.icon}</div>
                <span className="platform-name">{integration.name}</span>
              </div>
              <div className={`platform-status status-${integration.status}`}>
                <span className="status-dot" />
                {statusLabels[integration.status]}
              </div>
            </div>
            <div className="platform-card-body">
              <div style={{ fontSize: 12, color: '#6b6b6b', textTransform: 'capitalize' }}>
                {integration.category}
              </div>
            </div>
            {integration.lastSync && (
              <div className="platform-last-sync">
                Last sync: {integration.lastSync}
              </div>
            )}
            {integration.status === 'connected' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button 
                  className="btn btn-secondary"
                  onClick={(e) => { e.stopPropagation(); handleSync(integration.id) }}
                  style={{ flex: 1, fontSize: 13 }}
                >
                  <RefreshCw size={14} /> Sync
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={(e) => { e.stopPropagation(); handleDisconnect(integration.id) }}
                  style={{ flex: 1, fontSize: 13, color: '#ef4444' }}
                >
                  <Trash2 size={14} /> Disconnect
                </button>
              </div>
            )}
            {integration.status === 'available' && (
              <button 
                className="btn btn-primary"
                onClick={(e) => { e.stopPropagation(); handleConnect(integration) }}
                style={{ width: '100%', marginTop: 16 }}
              >
                <Plus size={16} /> Connect
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && selectedPlatform && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Connect {selectedPlatform.name}</h3>
            <p style={{ color: '#a0a0a0', marginBottom: 20, fontSize: 14 }}>
              You'll be redirected to {selectedPlatform.name} to authorize access.
            </p>
            
            {selectedPlatform.id === 'shopify' && (
              <div className="form-group">
                <label>Your Store Domain</label>
                <input 
                  type="text" 
                  placeholder="your-store.myshopify.com"
                  value={formData.shopDomain || ''}
                  onChange={e => setFormData({ ...formData, shopDomain: e.target.value })}
                />
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { setShowModal(false); setFormData({}) }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                disabled={connecting || (selectedPlatform.id === 'shopify' && !formData.shopDomain)}
                onClick={handleOAuthConnect}
              >
                {connecting ? 'Redirecting...' : `Connect with ${selectedPlatform.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}