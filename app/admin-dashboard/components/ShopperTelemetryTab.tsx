'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Sparkles, 
  Bot, 
  KeyRound, 
  Download, 
  Activity, 
  User, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Radio,
  ChevronRight,
  ShieldAlert,
  CreditCard,
  Smartphone,
  Eye,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { 
  DrobeUserProfile, 
  DrobeUserActivity, 
  DrobeAIShopperReport 
} from '../../lib/darkstoreData';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface ShopperTelemetryTabProps {
  userProfiles: DrobeUserProfile[];
  userActivities: DrobeUserActivity[];
  usersFilter: string;
  onFilterChange: (f: any) => void;
  usersSearch: string;
  onSearchChange: (q: string) => void;
  onSelectCustomer: (user: DrobeUserProfile) => void;
  aiReport: DrobeAIShopperReport;
  aiCountdown: number;
  isAiGenerating: boolean;
  onRunAISynthesis: () => void;
  onOpenCopilot: () => void;
  onOpenApiKey: () => void;
  onExportUsersCsv: () => void;
}

export default function ShopperTelemetryTab({
  userProfiles,
  userActivities,
  usersFilter,
  onFilterChange,
  usersSearch,
  onSearchChange,
  onSelectCustomer,
  aiReport,
  aiCountdown,
  isAiGenerating,
  onRunAISynthesis,
  onOpenCopilot,
  onOpenApiKey,
  onExportUsersCsv
}: ShopperTelemetryTabProps) {
  const [activeTelemetrySubtab, setActiveTelemetrySubtab] = useState<'shoppers' | 'activities'>('shoppers');
  const [selectedShopper, setSelectedShopper] = useState<DrobeUserProfile | null>(null);

  const filteredUsers = userProfiles.filter(u => {
    const q = usersSearch.toLowerCase();
    const matchesSearch = (u.name && u.name.toLowerCase().includes(q)) ||
                          (u.phone && u.phone.toLowerCase().includes(q)) ||
                          (u.email && u.email.toLowerCase().includes(q)) ||
                          (u.hubZone && u.hubZone.toLowerCase().includes(q)) ||
                          ((u as any).address && (u as any).address.toLowerCase().includes(q));
    const isOnline = (u as any).isOnline || u.currentStatus === 'Active Browsing' || u.currentStatus === 'In Doorstep Trial';
    const trials = (u as any).trialsRequested || u.doorstepTrialsCount || 0;
    const matchesFilter = usersFilter === 'all' ||
                          (usersFilter === 'online' && isOnline) ||
                          (usersFilter === 'trial' && trials > 0) ||
                          (usersFilter === 'offline' && !isOnline);
    return matchesSearch && matchesFilter;
  });

  const onlineCount = userProfiles.filter(u => (u as any).isOnline || u.currentStatus === 'Active Browsing' || u.currentStatus === 'In Doorstep Trial').length;

  return (
    <div className={styles.tabContent}>
      {/* 1. AUTONOMOUS HEURISTIC AI SHOPPER INTELLIGENCE HERO CARD */}
      <div className={styles.sectionCard} style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
        color: '#ffffff',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)'
      }}>
        <div className={styles.sectionHeader} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={styles.livePulseDot} style={{ background: '#38bdf8' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38bdf8' }}>
                HEURISTIC AI SHOPPER ENGINE · AUTO-HEARTBEAT ({aiCountdown}s)
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              Autonomous Demand Synthesis & Hesitation Forecaster
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onRunAISynthesis}
              disabled={isAiGenerating}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
            >
              <Sparkles size={13} /> {isAiGenerating ? 'Synthesizing...' : 'Run Live Synthesis'}
            </button>
            <button
              type="button"
              onClick={onOpenCopilot}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Bot size={13} color="#38bdf8" /> Ask Copilot AI
            </button>
            <button
              type="button"
              onClick={onOpenApiKey}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <KeyRound size={13} /> AI Key
            </button>
          </div>
        </div>

        {/* AI Findings Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Executive Demand Verdict
            </div>
            <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, marginTop: '6px', lineHeight: 1.4 }}>
              {aiReport.executiveSummary || (aiReport as any).summary || 'Strong demand detected for oversized tees and lightweight linen in Bodakdev and Satellite sectors.'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Top High-Intent Garments
            </div>
            <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, marginTop: '6px', lineHeight: 1.4 }}>
              {(aiReport as any).highDemandItems?.join(', ') || 'Heavyweight Graphic Tee, Pleated Trousers, Oversized Oxford Shirt'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Size Hesitation Warning
            </div>
            <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, marginTop: '6px', lineHeight: 1.4 }}>
              {(aiReport as any).hesitationInsights || 'Shoppers toggle 3.8x between M and L before ordering trials. Recommend multi-size trial packs.'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHOPPER PROFILES & LIVE ACTIVITY FEED */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Users size={18} color="#0284c7" />
              Customer Telemetry & Real-Time Event Stream
            </h3>
            <p className={styles.sectionDesc}>
              Click any customer card to inspect size preferences, live trial conversion metrics, and cart hesitation traces.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportUsersCsv}
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
          >
            <Download size={13} /> Export Shoppers CSV
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.filterGroup}>
              <button
                type="button"
                onClick={() => setActiveTelemetrySubtab('shoppers')}
                className={`${styles.filterPill} ${activeTelemetrySubtab === 'shoppers' ? styles.filterPillActive : ''}`}
              >
                Shopper Profiles ({userProfiles.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTelemetrySubtab('activities')}
                className={`${styles.filterPill} ${activeTelemetrySubtab === 'activities' ? styles.filterPillActive : ''}`}
              >
                Live Event Stream ({userActivities.length})
              </button>
            </div>

            {activeTelemetrySubtab === 'shoppers' && (
              <div className={styles.searchBox}>
                <Search size={14} className={styles.searchBoxIcon} />
                <input
                  type="text"
                  placeholder="Search customer name, phone, zone..."
                  value={usersSearch}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            )}
          </div>

          {activeTelemetrySubtab === 'shoppers' && (
            <div className={styles.filterGroup}>
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className={`${styles.filterPill} ${usersFilter === 'all' ? styles.filterPillActive : ''}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('online')}
                className={`${styles.filterPill} ${usersFilter === 'online' ? styles.filterPillActive : ''}`}
              >
                Online Now ({onlineCount})
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('trial')}
                className={`${styles.filterPill} ${usersFilter === 'trial' ? styles.filterPillActive : ''}`}
              >
                Active Trials
              </button>
            </div>
          )}
        </div>

        {/* PROGRESSIVE DISCLOSURE VIEWS */}
        {activeTelemetrySubtab === 'shoppers' ? (
          filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={36} color="#94a3b8" />
              <div className={styles.emptyStateTitle}>No customer profiles found</div>
              <div className={styles.emptyStateDesc}>Try adjusting your search query or filter.</div>
            </div>
          ) : (
            /* CLICKABLE SHOPPER CARDS GRID (NO TEXT-HEAVY TABLES) */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {filteredUsers.map((user) => {
                const isOnline = (user as any).isOnline || user.currentStatus === 'Active Browsing' || user.currentStatus === 'In Doorstep Trial';
                const trials = (user as any).trialsRequested || user.doorstepTrialsCount || 0;
                const kept = (user as any).trialsKept || Math.round((user.doorstepTrialsCount || 0) * ((user.keptRatioPercentage || 70) / 100));
                const hesitation = (user as any).hesitationEventsCount || (user.dropoffRisk === 'High' ? 4 : user.dropoffRisk === 'Medium' ? 2 : 0);

                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedShopper(user)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      cursor: 'pointer',
                      transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
                      e.currentTarget.style.borderColor = '#0284c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                    }}
                  >
                    <div>
                      {/* Card Top: Avatar, Name, Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isOnline ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : '#64748b',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 800,
                            boxShadow: isOnline ? '0 0 12px rgba(2, 132, 199, 0.35)' : 'none'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} color="#94a3b8" />
                              {user.hubZone || (user as any).address || 'Ahmedabad, Gujarat'}
                            </div>
                          </div>
                        </div>

                        {isOnline ? (
                          <span className={`${styles.statusChip} ${styles.statusLive}`} style={{ padding: '3px 8px' }}>
                            <Radio size={10} /> Online
                          </span>
                        ) : (
                          <span className={`${styles.statusChip} ${styles.statusDraft}`} style={{ padding: '3px 8px' }}>
                            Offline
                          </span>
                        )}
                      </div>

                      {/* Phone & Contact */}
                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.phone || '+91 98980 12345'}</span>
                        {user.email && <span style={{ color: '#94a3b8', marginLeft: '6px' }}>· {user.email}</span>}
                      </div>

                      {/* Quick Sizing & Fit Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {user.topSize && (
                          <span style={{ fontSize: '10.5px', background: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>
                            Top: {user.topSize}
                          </span>
                        )}
                        {user.bottomSize && (
                          <span style={{ fontSize: '10.5px', background: 'rgba(99, 102, 241, 0.08)', color: '#4f46e5', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>
                            Bottom: {user.bottomSize}
                          </span>
                        )}
                        {user.preferredFit && (
                          <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: '6px', fontWeight: 600 }}>
                            {user.preferredFit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Metrics & Chevron */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                            Trials
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                            {trials} ({kept} kept)
                          </div>
                        </div>

                        {hesitation > 0 && (
                          <div>
                            <div style={{ fontSize: '10px', color: '#d97706', textTransform: 'uppercase', fontWeight: 700 }}>
                              Hesitations
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
                              {hesitation} traces
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0284c7'
                      }}>
                        Inspect <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* MODERN CHRONOLOGICAL EVENT STREAM (NO TEXT-HEAVY TABLES) */
          userActivities.length === 0 ? (
            <div className={styles.emptyState}>
              <Activity size={36} color="#94a3b8" />
              <div className={styles.emptyStateTitle}>No live activity traces recorded</div>
              <div className={styles.emptyStateDesc}>User interaction events from mobile clients will appear here in real-time.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userActivities.slice(0, 25).map((act) => {
                const isTrial = (act as any).eventType === 'trial_requested' || act.activityType === 'TRIAL_ORDER_PLACED';
                const isHesitation = (act as any).eventType === 'size_hesitation' || act.activityType === 'SIZE_UNAVAILABLE' || act.activityType === 'PRICE_HESITATION';
                const isView = (act as any).eventType === 'product_view' || act.activityType === 'PRODUCT_CLICK' || act.activityType === 'PAGE_VIEW';

                return (
                  <div
                    key={act.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'all 140ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isTrial ? 'rgba(16, 185, 129, 0.1)' : isHesitation ? 'rgba(245, 158, 11, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                        color: isTrial ? '#16a34a' : isHesitation ? '#d97706' : '#0284c7'
                      }}>
                        {isTrial ? <ShoppingBag size={16} /> : isHesitation ? <AlertTriangle size={16} /> : <Eye size={16} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                            {act.userName || act.userId}
                          </span>
                          <span className={`${styles.statusChip} ${
                            isTrial ? styles.statusLive : isHesitation ? styles.statusTransit : styles.statusDraft
                          }`} style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                            {(act as any).eventType || act.activityType}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{(act as any).productName || act.title || 'Garment SKU'}</span> · {typeof act.details === 'string' ? act.details : (act.details ? JSON.stringify(act.details) : 'User interacted on live mobile client')}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#94a3b8', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* 3. PROGRESSIVE DISCLOSURE INSPECTOR DRAWER FOR SHOPPERS */}
      <InspectorDrawer
        isOpen={Boolean(selectedShopper)}
        onClose={() => setSelectedShopper(null)}
        title={selectedShopper ? `${selectedShopper.name}'s Dossier` : 'Shopper Telemetry'}
        subtitle={selectedShopper ? `Customer ID: ${selectedShopper.id} · ${selectedShopper.hubZone || 'Ahmedabad'}` : ''}
        footerActions={
          selectedShopper && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  onSelectCustomer(selectedShopper);
                  setSelectedShopper(null);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                style={{ flex: 1 }}
              >
                <User size={13} /> Open Full Customer Modal
              </button>
              <button
                type="button"
                onClick={() => setSelectedShopper(null)}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedShopper && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Identity Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800
              }}>
                {selectedShopper.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedShopper.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedShopper.phone} · {selectedShopper.email || 'No email provided'}
                </div>
                {selectedShopper.upiId && (
                  <div style={{ fontSize: '11px', color: '#0284c7', fontFamily: 'var(--font-apple-mono)', marginTop: '2px' }}>
                    UPI: {selectedShopper.upiId}
                  </div>
                )}
              </div>
            </div>

            {/* Sizing & Style DNA */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Customer Fit & Sizing DNA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Top Size</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                    {selectedShopper.topSize || 'M'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Bottom Size</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
                    {selectedShopper.bottomSize || '32'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Preferred Fit</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {selectedShopper.preferredFit || 'Relaxed'}
                  </div>
                </div>
              </div>

              {selectedShopper.favouriteBrands && selectedShopper.favouriteBrands.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>Affinity Brands:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedShopper.favouriteBrands.map(b => (
                      <span key={b} style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trial & Conversion Telemetry */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Doorstep Trial Performance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Trials Requested</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {(selectedShopper as any).trialsRequested || selectedShopper.doorstepTrialsCount || 0}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#16a34a', textTransform: 'uppercase' }}>Kept / Purchase Rate</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                    {selectedShopper.keptRatioPercentage || 75}%
                  </div>
                </div>
              </div>
            </div>

            {/* Live Cart & Hesitation Signals */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Real-Time Session Signals
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Current App Screen:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedShopper.currentScreen || 'Home Feed'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Client Device:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedShopper.deviceInfo || 'Apple iPhone 15 Pro'}</span>
                </div>
                {selectedShopper.dropoffRisk && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569' }}>Dropoff Risk:</span>
                    <span style={{
                      fontWeight: 800,
                      color: selectedShopper.dropoffRisk === 'High' ? '#dc2626' : '#16a34a',
                      background: selectedShopper.dropoffRisk === 'High' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}>
                      {selectedShopper.dropoffRisk}
                    </span>
                  </div>
                )}
                {selectedShopper.lastHesitationReason && (
                  <div style={{ marginTop: '6px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px', borderRadius: '8px', color: '#92400e', fontSize: '12px' }}>
                    <AlertTriangle size={13} style={{ display: 'inline', marginRight: '6px' }} />
                    {selectedShopper.lastHesitationReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </InspectorDrawer>
    </div>
  );
}
