import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

import { useForm, FormProvider } from 'react-hook-form';
export default function IndexPage() {
  const navigate = useNavigate()

  // State
  const [agreements, setAgreements] = useState<any[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'create' | 'view'>('dashboard');
  const [activeTab, setActiveTab] = useState<'all' | 'inbox' | 'outbox' | 'progress' | 'completed'>('all');
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zamsign_agreements');
    if (saved) setAgreements(JSON.parse(saved));
  }, []);

  // Save to localStorage whenever agreements change
  useEffect(() => {
    localStorage.setItem('zamsign_agreements', JSON.stringify(agreements));
  }, [agreements]);

  // Telegram WebApp init
  // useEffect(() => {
  //   if (window.Telegram?.WebApp) {
  //     const tg = window.Telegram.WebApp;
  //     tg.ready();
  //     tg.expand();
  //     tg.BackButton.show();
  //     tg.MainButton.show();
  //     tg.MainButton.setText('Create Agreement');
  //     tg.MainButton.onClick(() => navigate('/agreements/create'));
  //     tg.BackButton.onClick(() => navigate('/'));
  //     // You can add more Telegram features here
  //   }
  // }, []);

  const showTab = (tab: 'all' | 'inbox' | 'outbox' | 'progress' | 'completed') => {
    setActiveTab(tab);
    setCurrentScreen('dashboard');
  };

  // Filter agreements based on active tab
  const filteredAgreements = agreements.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'inbox') return a.role === 'buyer';
    if (activeTab === 'outbox') return a.role === 'seller';
    if (activeTab === 'progress') return a.status === 'in_progress';
    if (activeTab === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <>
        <div id="screen-dashboard" className="screen active">
          <div className="header">
            <div>
              <div className="logo-text">⚡ ZamSign</div>
              <div className="tagline">Sign. Agree. Trust.</div>
            </div>
          </div>
          <div className="content-area">
            <div 
              className="card" 
              style={{ background: 'linear-gradient(135deg,#1A4F9C,#22A06B)', color: 'white', padding: '20px' }}
            >
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Welcome to</div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>ZamSign Platform</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                Digital Agreements Made Simple.
              </div>
			  <button 
                className="btn-primary" 
                style={{ marginTop: '16px', background: 'white', color: '#1A4F9C' }}
				onClick={() => navigate('/agreements/create')}

			  >
                📝 Initiate New Agreement
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {[
                { label: 'Inbox', emoji: '📥', key: 'inbox', filter: 'inbox' },
                { label: 'Outbox', emoji: '📤', key: 'outbox', filter: 'outbox' },
                { label: 'In Progress', emoji: '🔄', key: 'progress', filter: 'progress' },
                { label: 'Completed', emoji: '✅', key: 'completed', filter: 'completed' },
              ].map(({ label, emoji, key, filter }) => (
                <div 
                  key={key}
                  className="card" 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => showTab(filter as any)}
                >
                  <div style={{ fontSize: '28px' }}>{emoji}</div>
                  <div style={{ fontWeight: 700, color: '#1A4F9C' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {agreements.filter(a => {
                      if (filter === 'inbox') return a.role === 'buyer';
                      if (filter === 'outbox') return a.role === 'seller';
                      if (filter === 'progress') return a.status === 'in_progress';
                      if (filter === 'completed') return a.status === 'completed';
                      return true;
                    }).length} agreements
                  </div>
                </div>
              ))}
            </div>

            <div id="dashboard-list">
              {filteredAgreements.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                  <div style={{ fontSize: '40px' }}>📋</div>
                  <div>No agreements yet.<br />Tap "+ New" to create one.</div>
                </div>
              ) : (
                filteredAgreements.map((a, i) => {
                  const globalIndex = agreements.indexOf(a);
                  return (
                    <div 
                      key={i}
                      className="card" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setViewingIndex(globalIndex);
                        
                      }}
                    >
                      {/* Agreement card content - same as before */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, color: '#111', fontSize: '15px', flex: 1 }}>
                          {a.title}
                        </div>
                        {/* status badge logic here */}
                      </div>
                      {/* Add more fields as needed */}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="tab-bar">
            <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => showTab('all')}>
              <span>🏠</span>Home
            </button>
            <button className={`tab-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => showTab('inbox')}>
              <span>📥</span>Inbox
            </button>
            <button className={`tab-item ${activeTab === 'outbox' ? 'active' : ''}`} onClick={() => showTab('outbox')}>
              <span>📤</span>Outbox
            </button>
            <button className={`tab-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => showTab('progress')}>
              <span>🔄</span>Progress
            </button>
            <button className="tab-item" onClick={() => navigate('/agreements/create')}>
              <span>➕</span>New
            </button>
          </div>
        </div>
      

      {/* You can add {currentScreen === 'create' && <CreateScreen ... />} */}
      {/* and {currentScreen === 'view' && <ViewScreen agreement={agreements[viewingIndex!]} />} */}
    </>
  );
}