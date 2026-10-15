import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eswnhehlnzasiaybjikh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const ALL_SYSTEM_TABLES = [
  // Section 1: Darkstore Physical Warehouse & Shelf Matrix
  { table: 'drobe_warehouses', section: 'Darkstore Operations', description: 'Darkstore Central Hubs & Geo-Fenced Zones' },
  { table: 'drobe_warehouse_shelves', section: 'Darkstore Operations', description: 'Physical Racks, Shelves & Bin Matrix' },
  
  // Section 2: Brand Partners, Catalog & Categories
  { table: 'drobe_brands', section: 'Brand Ecosystem', description: 'Brand Partners Directory & Commercial Dossiers' },
  { table: 'drobe_categories', section: 'Brand Ecosystem', description: 'Fashion Taxonomy & Gender Classifications' },
  { table: 'drobe_products', section: 'Catalog & Inventory', description: 'Live SKUs, Base Wholesale & 5% Platform Markup' },
  { table: 'drobe_product_variants', section: 'Catalog & Inventory', description: 'Size & Color Breakdown with Shelf Bins' },
  { table: 'drobe_inbound_shipments', section: 'Catalog & Inventory', description: 'Consignment Shipments Inwarded from Brands' },
  { table: 'drobe_stock_adjustments', section: 'Catalog & Inventory', description: 'Audit Trail for Shelf Allocations & Damage Write-offs' },
  
  // Section 3: Fleet & Real-time Telemetry
  { table: 'drobe_runners', section: 'Fleet & Dispatch', description: '30-Minute Electric Fleet Riders & Status' },
  { table: 'drobe_runner_telemetry', section: 'Fleet & Dispatch', description: 'Real-time GPS Pings & Battery/Speed Telemetry' },
  
  // Section 4: 30-Minute Orders & Doorstep Trials
  { table: 'drobe_trial_orders', section: '30-Min Fitting Trial', description: 'Doorstep Fitting Orders & 6-Min Trial Windows' },
  { table: 'drobe_order_items', section: '30-Min Fitting Trial', description: 'Individual Items in Doorstep Trial Fitting' },
  { table: 'drobe_order_events', section: '30-Min Fitting Trial', description: 'Auditable Timeline of Order Dispatch & Doorstep Trials' },
  
  // Section 5: Customer User Profiles & Tracking
  { table: 'drobe_user_profiles', section: 'Customer Profiles & Tracking', description: 'Shopper Sizing Matrix, LTV & Drop-off Risk Ratings' },
  { table: 'drobe_user_activities', section: 'Customer Profiles & Tracking', description: 'Real-time Clickstream & Drop-off Detection Feed' },
  { table: 'drobe_user_hesitation_logs', section: 'Customer Profiles & Tracking', description: 'Detailed Friction Signals (Dwell, Backout, Stockout)' },
  { table: 'drobe_user_sessions', section: 'Customer Profiles & Tracking', description: 'Browser & Mobile App Dwell Sessions' },
  
  // Section 6: AI Telemetry & Drop-Off Reporting
  { table: 'drobe_ai_telemetry_reports', section: 'AI Telemetry & Diagnostics', description: '2-Minute Automated Pulse Reports & AI Recommendations' },
  { table: 'drobe_dropoff_analytics_hourly', section: 'AI Telemetry & Diagnostics', description: 'Hourly Aggregations of Checkout Friction' },
  { table: 'drobe_stock_friction_reports', section: 'AI Telemetry & Diagnostics', description: 'Stock-out Bounces & Missed Revenue Opportunities' },
  { table: 'drobe_doorstep_fitting_analytics', section: 'AI Telemetry & Diagnostics', description: '6-Minute Doorstep Window Compliance & Overtime' },
  
  // Section 7: Wholesale Settlements & Profitability Ledger
  { table: 'drobe_wholesale_settlements', section: 'Wholesale & Financials', description: 'Brand Consignment Payouts & UTR Reference Ledger' },
  { table: 'drobe_margin_ledger', section: 'Wholesale & Financials', description: 'Transaction Economics, 5% Markup & Net Margins' },
  { table: 'drobe_refund_records', section: 'Wholesale & Financials', description: 'Instant UPI Refund Processing Records' },
  
  // Section 8 & 9: CRM Interventions, SLA Metrics & System Audit
  { table: 'drobe_recovery_interventions', section: 'CRM & Operations', description: 'Automated WhatsApp Recovery for Abandoned Fits' },
  { table: 'drobe_darkstore_metrics', section: 'CRM & Operations', description: 'Ahmedabad Hub 30-Min SLAs, Picking Speed & Kept Ratio' },
  { table: 'drobe_system_audit_logs', section: 'CRM & Operations', description: 'Administrative Action Trail & Inward Approvals' }
];

export async function GET() {
  const results = await Promise.all(
    ALL_SYSTEM_TABLES.map(async (meta) => {
      try {
        const url = `${supabaseUrl}/rest/v1/${meta.table}?select=*&limit=1`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'count=exact'
          },
          cache: 'no-store'
        });

        if (res.ok) {
          const contentRange = res.headers.get('content-range');
          let count = 0;
          if (contentRange && contentRange.includes('/')) {
            const total = contentRange.split('/')[1];
            count = total === '*' ? 0 : parseInt(total, 10);
          } else {
            const json = await res.json();
            count = Array.isArray(json) ? json.length : 0;
          }

          return {
            ...meta,
            exists: true,
            status: 'online',
            rowCount: isNaN(count) ? 0 : count,
            httpStatus: res.status
          };
        } else {
          const errText = await res.text();
          return {
            ...meta,
            exists: false,
            status: res.status === 404 ? 'missing' : 'error',
            rowCount: 0,
            httpStatus: res.status,
            error: errText.slice(0, 120)
          };
        }
      } catch (err: any) {
        return {
          ...meta,
          exists: false,
          status: 'unreachable',
          rowCount: 0,
          httpStatus: 500,
          error: err?.message || 'Network timeout'
        };
      }
    })
  );

  const totalTables = results.length;
  const onlineCount = results.filter(r => r.exists).length;
  const missingCount = results.filter(r => !r.exists).length;

  return NextResponse.json({
    summary: {
      totalTables,
      onlineCount,
      missingCount,
      healthPercentage: Math.round((onlineCount / totalTables) * 100),
      hub: 'AMD-DARKSTORE-01 (Ahmedabad)',
      supabaseProject: 'eswnhehlnzasiaybjikh',
      sqlSchemaFile: 'supabase_schema.sql',
      directSqlRunnerUrl: 'https://supabase.com/dashboard/project/eswnhehlnzasiaybjikh/sql/new'
    },
    tables: results
  });
}
