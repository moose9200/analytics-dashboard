export default function Settings() {
  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your dashboard preferences</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="kpi-card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 20 }}>General Settings</h3>
          <div className="form-group">
            <label>Dashboard Name</label>
            <input type="text" defaultValue="My Analytics Dashboard" />
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <input type="text" defaultValue="UTC-5 (Eastern Time)" />
          </div>
          <div className="form-group">
            <label>Data Refresh Interval</label>
            <select style={{ 
              width: '100%', 
              padding: '12px 16px', 
              background: '#252525', 
              border: '1px solid #333', 
              borderRadius: 8, 
              color: '#fff',
              fontSize: 14
            }}>
              <option>30 seconds</option>
              <option>1 minute</option>
              <option>5 minutes</option>
              <option>15 minutes</option>
            </select>
          </div>
        </div>

        <div className="kpi-card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 20 }}>Notifications</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #333' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Sync Errors</div>
              <div style={{ fontSize: 13, color: '#a0a0a0' }}>Get notified when integrations fail</div>
            </div>
            <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #333' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Weekly Report</div>
              <div style={{ fontSize: 13, color: '#a0a0a0' }}>Receive weekly summary email</div>
            </div>
            <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>KPI Threshold Alerts</div>
              <div style={{ fontSize: 13, color: '#a0a0a0' }}>Alert when metrics exceed limits</div>
            </div>
            <input type="checkbox" style={{ width: 20, height: 20 }} />
          </div>
        </div>

        <div className="kpi-card">
          <h3 style={{ marginBottom: 20 }}>Data Management</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary">Export All Data</button>
            <button className="btn btn-secondary" style={{ color: '#ef4444' }}>Clear Cache</button>
          </div>
        </div>
      </div>
    </div>
  )
}