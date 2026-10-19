'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Server, 
  Terminal,
  Zap,
  ShieldCheck,
  ChevronRight,
  Code2,
  Layers,
  Activity,
  HardDrive
} from 'lucide-react';
import InspectorDrawer from './InspectorDrawer';
import styles from '../admin.module.css';

interface DatabaseMatrixTabProps {
  dbStatusData: {
    summary: {
      totalTables: number;
      onlineCount: number;
      missingCount: number;
      healthPercentage: number;
      hub: string;
      supabaseProject: string;
      sqlSchemaFile: string;
      directSqlRunnerUrl: string;
    };
    tables: Array<{
      table: string;
      section: string;
      description: string;
      exists: boolean;
      status: string;
      rowCount: number;
      httpStatus: number;
      error?: string;
    }>;
  } | null;
  isDbStatusLoading: boolean;
  dbSectionFilter: string;
  onSectionFilterChange: (s: string) => void;
  copiedSql: boolean;
  onCopySql: () => void;
  onRefresh: () => void;
}

export default function DatabaseMatrixTab({
  dbStatusData,
  isDbStatusLoading,
  dbSectionFilter,
  onSectionFilterChange,
  copiedSql,
  onCopySql,
  onRefresh
}: DatabaseMatrixTabProps) {
  const [selectedTable, setSelectedTable] = useState<{
    table: string;
    section: string;
    description: string;
    exists: boolean;
    status: string;
    rowCount: number;
    httpStatus: number;
    error?: string;
  } | null>(null);

  if (!dbStatusData) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.sectionCard}>
          <div className={styles.emptyState}>
            <RefreshCw size={32} className={styles.spinAnimation} />
            <div className={styles.emptyStateTitle}>Checking 27 Supabase tables...</div>
            <div className={styles.emptyStateDesc}>Querying live PostgreSQL schema, Row Level Security, and foreign keys.</div>
          </div>
        </div>
      </div>
    );
  }

  const sections = ['all', ...Array.from(new Set(dbStatusData.tables.map(t => t.section)))];
  const filteredTables = dbStatusData.tables.filter(t => {
    return dbSectionFilter === 'all' || t.section === dbSectionFilter;
  });

  const realtimeTables = [
    'orders',
    'drobe_trial_orders',
    'drobe_user_activities',
    'drobe_user_profiles',
    'drobe_user_hesitation_logs',
    'drobe_ai_telemetry_reports'
  ];

  return (
    <div className={styles.tabContent}>
      {/* 1. DATABASE SUMMARY & ACTION CARD */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Database size={18} color="#0284c7" />
              Supabase PostgreSQL Relational Schema Matrix ({dbStatusData.tables.length} Tables)
            </h3>
            <p className={styles.sectionDesc}>
              Production database health, foreign key integrity, Row Level Security (RLS), and realtime WebSocket event replication.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onCopySql}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              <Copy size={13} /> {copiedSql ? '✓ Copied SQL!' : 'Copy Migration SQL'}
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isDbStatusLoading}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <RefreshCw size={13} className={isDbStatusLoading ? styles.spinAnimation : ''} /> Refresh Health
            </button>
            {dbStatusData.summary.directSqlRunnerUrl && (
              <a
                href={dbStatusData.summary.directSqlRunnerUrl}
                target="_blank"
                rel="noreferrer"
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                <Terminal size={13} /> SQL Runner <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            {sections.map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => onSectionFilterChange(sec)}
                className={`${styles.filterPill} ${dbSectionFilter === sec ? styles.filterPillActive : ''}`}
              >
                {sec.charAt(0).toUpperCase() + sec.slice(1)} {sec === 'all' ? `(${dbStatusData.tables.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* CLICKABLE TABLE CARDS GRID (PROGRESSIVE DISCLOSURE - NO SPREADSHEET TABLE) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filteredTables.map((tbl) => {
            const isRealtime = realtimeTables.includes(tbl.table);

            return (
              <div
                key={tbl.table}
                onClick={() => setSelectedTable(tbl)}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: 'var(--font-apple-mono)',
                        fontWeight: 800,
                        fontSize: '13px',
                        color: tbl.exists ? '#0f172a' : '#dc2626'
                      }}>
                        {tbl.table}
                      </span>
                    </div>

                    {tbl.exists ? (
                      <span className={`${styles.statusChip} ${styles.statusLive}`} style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                        <CheckCircle2 size={10} /> Online
                      </span>
                    ) : (
                      <span className={`${styles.statusChip} ${styles.statusDraft}`} style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10.5px' }}>
                        <AlertTriangle size={10} /> Missing
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '11px',
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      {tbl.section}
                    </span>

                    {isRealtime && (
                      <span style={{
                        fontSize: '11px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Zap size={10} /> Realtime
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {tbl.description}
                  </p>
                </div>

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
                        Rows
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        {tbl.rowCount}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                        HTTP
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: tbl.httpStatus === 200 ? '#16a34a' : '#d97706', fontFamily: 'var(--font-apple-mono)' }}>
                        {tbl.httpStatus} OK
                      </div>
                    </div>
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
      </div>

      {/* 2. PROGRESSIVE DISCLOSURE INSPECTOR DRAWER FOR DATABASE TABLES */}
      <InspectorDrawer
        isOpen={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        title={selectedTable ? selectedTable.table : 'Table Details'}
        subtitle={selectedTable ? `Schema Section: ${selectedTable.section} · Supabase PostgreSQL` : ''}
        footerActions={
          selectedTable && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`SELECT * FROM ${selectedTable.table} LIMIT 50;`);
                  alert(`Copied "SELECT * FROM ${selectedTable.table} LIMIT 50;" to clipboard!`);
                }}
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                style={{ flex: 1 }}
              >
                <Code2 size={13} /> Copy Query Snippet
              </button>
              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedTable && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Health & Status Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Table Availability Status
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: selectedTable.exists ? '#16a34a' : '#dc2626', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedTable.exists ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {selectedTable.exists ? 'Healthy, Online & Relational' : 'Table Missing in Migration'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  HTTP Probe
                </div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-apple-mono)', fontWeight: 800, color: selectedTable.httpStatus === 200 ? '#16a34a' : '#d97706', marginTop: '4px' }}>
                  {selectedTable.httpStatus} OK
                </div>
              </div>
            </div>

            {/* Architecture Role */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Architecture Role & Purpose
              </div>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                {selectedTable.description}
              </p>
            </div>

            {/* Schema Metrics */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Schema & Realtime Characteristics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Live Record Count</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                    {selectedTable.rowCount} rows
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>WebSocket Realtime</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: realtimeTables.includes(selectedTable.table) ? '#1d4ed8' : '#64748b', marginTop: '4px' }}>
                    {realtimeTables.includes(selectedTable.table) ? 'Enabled (postgres_changes)' : 'Standard Polling'}
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Snippet & Access */}
            <div style={{
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '14px',
              padding: '14px 16px',
              fontFamily: 'var(--font-apple-mono)',
              fontSize: '12px'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '6px' }}>-- Quick Query</div>
              <div style={{ color: '#38bdf8' }}>
                SELECT * FROM {selectedTable.table} ORDER BY created_at DESC LIMIT 10;
              </div>
            </div>
          </div>
        )}
      </InspectorDrawer>
    </div>
  );
}
