'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  Truck, 
  ArrowUpRight, 
  Sparkles, 
  X, 
  RotateCcw,
  Check,
  ShieldCheck,
  Navigation,
  Barcode,
  Boxes,
  Store,
  UserCheck,
  Activity,
  Calendar,
  FileText,
  Globe,
  Mail,
  Phone,
  Eye,
  Download,
  DollarSign,
  Wallet,
  Receipt,
  TrendingUp,
  ArrowDownRight,
  Users,
  Smartphone,
  Radio,
  ShoppingBag,
  Zap,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  Timer,
  RefreshCw,
  Bot,
  Database,
  Copy,
  Server,
  ChevronDown,
  ChevronUp,
  Terminal
} from 'lucide-react';
import { 
  AHMEDABAD_WAREHOUSE,
  DarkstoreBrand,
  DarkstoreProduct,
  InboundStockShipment,
  TrialOrder,
  getDarkstoreBrands,
  getDarkstoreProducts,
  getInboundShipments,
  getTrialOrders,
  adminApproveBrand,
  adminRejectBrand,
  adminInwardProduct,
  updateTrialOrderStatus,
  adminMarkOrderReturnedAndRestocked,
  adminMarkOrderDeliveredAndKept,
  adjustProductStock,
  getNextSkuNumber,
  getNextAvailableShelfLocation,
  markShipmentArrived,
  syncDarkstoreWithSupabase,
  calculateDrobeMarkupPricing,
  getProductPricingInfo,
  DrobeMarkupPricing,
  DrobeUserProfile,
  DrobeUserActivity,
  DrobeAIShopperReport,
  getUserProfiles,
  getUserActivities,
  saveUserProfiles,
  logUserActivity,
  getLatestAIReport,
  saveAIReport,
  generateHeuristicAIShopperReport,
  INITIAL_AI_REPORT
} from '../lib/darkstoreData';
import { 
  subscribeToRealtimeOrders, 
  supabaseFetchAdminBrandsWithProducts, 
  supabaseFetchOrders,
  supabaseFetchUserProfiles,
  supabaseFetchUserActivities,
  subscribeToRealtimeUserProfiles,
  subscribeToRealtimeUserActivities,
  supabaseUpsertUserProfile,
  supabaseFetchLatestAIReport,
  supabaseSaveAIReport,
  slugify 
} from '../lib/supabaseClient';
import styles from './admin.module.css';
import StockInwardingTab from './components/StockInwardingTab';
import SkuInventoryTab from './components/SkuInventoryTab';
import FloorPlanTab from './components/FloorPlanTab';
import BrandApprovalsTab from './components/BrandApprovalsTab';
import DoorstepTrialsTab from './components/DoorstepTrialsTab';
import WholesaleSettlementTab from './components/WholesaleSettlementTab';
import ShopperTelemetryTab from './components/ShopperTelemetryTab';
import DatabaseMatrixTab from './components/DatabaseMatrixTab';

import { toast } from 'sonner';
import NumberFlow from '@number-flow/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inwarding' | 'inventory' | 'shelves' | 'trials' | 'approvals' | 'settlement' | 'users' | 'database'>('inwarding');
  const [brands, setBrands] = useState<DarkstoreBrand[]>([]);
  const [products, setProducts] = useState<DarkstoreProduct[]>([]);
  const [inbounds, setInbounds] = useState<InboundStockShipment[]>([]);
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Database System Matrix & Connectivity State (27 Tables)
  const [dbStatusData, setDbStatusData] = useState<{
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
  } | null>(null);
  const [isDbStatusLoading, setIsDbStatusLoading] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [dbSectionFilter, setDbSectionFilter] = useState<string>('all');

  const fetchDbStatus = async () => {
    setIsDbStatusLoading(true);
    try {
      const res = await fetch('/api/admin/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatusData(data);
      }
    } catch (e) {
      console.warn('Failed to fetch db status:', e);
    } finally {
      setIsDbStatusLoading(false);
    }
  };

  const copyCompleteSql = async () => {
    try {
      const res = await fetch('/api/admin/sql-schema');
      if (res.ok) {
        const data = await res.json();
        if (data.sql) {
          await navigator.clipboard.writeText(data.sql);
          setCopiedSql(true);
          triggerToast('✅ Complete 27-Table SQL Schema copied! Paste in Supabase SQL editor & click Run.');
          setTimeout(() => {
            setCopiedSql(false);
          }, 4500);
        }
      }
    } catch {
      triggerToast('❌ Failed to copy SQL to clipboard.');
    }
  };

  // Customer User Profiles & Realtime Telemetry State
  const [userProfiles, setUserProfiles] = useState<DrobeUserProfile[]>([]);
  const [userActivities, setUserActivities] = useState<DrobeUserActivity[]>([]);
  const [usersFilter, setUsersFilter] = useState<'all' | 'online' | 'trial' | 'offline'>('all');
  const [usersSearch, setUsersSearch] = useState<string>('');
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<DrobeUserProfile | null>(null);

  // AI Shopper Telemetry & 2-Minute Heartbeat State
  const [aiReport, setAiReport] = useState<DrobeAIShopperReport>(INITIAL_AI_REPORT);
  const [aiCountdown, setAiCountdown] = useState<number>(120);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [aiApiKey, setAiApiKey] = useState<string>('');
  const [showApiKeyText, setShowApiKeyText] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'dropoffs'>('all');

  // NVIDIA NIM meta/muse-glimmer-30b Executive Copilot State
  const [copilotModalOpen, setCopilotModalOpen] = useState<boolean>(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string>('Which number is larger, 9.11 or 9.8?');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotResult, setCopilotResult] = useState<{
    content: string;
    reasoning?: string | null;
    model?: string;
    timestamp?: string;
  } | null>(null);
  const [showCopilotReasoning, setShowCopilotReasoning] = useState<boolean>(false);
  const [copiedCopilotText, setCopiedCopilotText] = useState<boolean>(false);

  // Wholesale Settlement & Margin Ledger State
  const [settlementSearch, setSettlementSearch] = useState<string>('');
  const [settlementBrandFilter, setSettlementBrandFilter] = useState<string>('all');
  const [settlementModalBrand, setSettlementModalBrand] = useState<{
    brandId: string;
    brandName: string;
    category?: string;
    keptUnits: number;
    wholesalePayoutDue: number;
    drobeMarkup: number;
    grossGmv: number;
    avgBaseWholesale?: number;
    dispatchedUnits?: number;
    returnedUnits?: number;
  } | null>(null);
  const [payoutUtrRef, setPayoutUtrRef] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [settledBrands, setSettledBrands] = useState<Record<string, { utr: string; date: string; amount: number; notes?: string }>>({});

  // Brand Dossier Review Modal State
  const [selectedBrandForDossier, setSelectedBrandForDossier] = useState<DarkstoreBrand | null>(null);

  // Brand Products Catalog Modal State
  const [selectedBrandForProducts, setSelectedBrandForProducts] = useState<DarkstoreBrand | null>(null);
  const [brandProductsSearch, setBrandProductsSearch] = useState<string>('');

  // Orders & Returns Filter & Search State
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'active' | 'doorstep' | 'returning' | 'kept' | 'restocked'>('all');
  const [ordersSearch, setOrdersSearch] = useState<string>('');
  const [returningOrderModal, setReturningOrderModal] = useState<TrialOrder | null>(null);
  const [selectedReturnReason, setSelectedReturnReason] = useState<string>('Size / fit did not suit at doorstep');
  const [customReturnNotes, setCustomReturnNotes] = useState<string>('');

  // Brand Filter
  const [brandFilter, setBrandFilter] = useState<'all' | 'with_products' | 'awaiting_products' | 'waiting' | 'approved'>('all');

  // Inventory Filter
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');

  // Global Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Barcode Label Modal State
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<DarkstoreProduct | null>(null);

  // Inwarding Modal State
  const [inwardModalOpen, setInwardModalOpen] = useState(false);
  const [selectedProductToInward, setSelectedProductToInward] = useState<DarkstoreProduct | null>(null);
  const [associatedShipment, setAssociatedShipment] = useState<InboundStockShipment | null>(null);

  // Inward Form State
  const [inwardUnits, setInwardUnits] = useState<number>(20);
  const [inwardBasePrice, setInwardBasePrice] = useState<number>(600);
  const [inwardSku, setInwardSku] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState('Zone A - Outerwear & Heavy Silhouettes');
  const [selectedRack, setSelectedRack] = useState('Rack A-02');
  const [selectedShelf, setSelectedShelf] = useState('Shelf 3');
  const [selectedBin, setSelectedBin] = useState('Bin 04');

  const triggerToast = (msg: string) => {
    if (msg.startsWith('✅') || msg.startsWith('✓') || msg.startsWith('🎉')) {
      toast.success(msg.replace(/^[✅✓🎉]\s*/, ''));
    } else if (msg.startsWith('❌') || msg.startsWith('⚠️')) {
      toast.error(msg.replace(/^[❌⚠️]\s*/, ''));
    } else if (msg.startsWith('⚡') || msg.startsWith('📦') || msg.startsWith('🖨️') || msg.startsWith('💬') || msg.startsWith('↩')) {
      toast.info(msg);
    } else {
      toast(msg);
    }
  };

  const loadAllData = async () => {
    // 1. Initial cached/offline state
    const localBrands = getDarkstoreBrands();
    const localProds = getDarkstoreProducts();
    if (localBrands.length > 0) setBrands(localBrands);
    if (localProds.length > 0) setProducts(localProds);
    setInbounds(getInboundShipments());
    setTrialOrders(getTrialOrders());

    const localUsers = getUserProfiles();
    const localActs = getUserActivities();
    if (localUsers.length > 0) setUserProfiles(localUsers);
    if (localActs.length > 0) setUserActivities(localActs);

    const localAi = getLatestAIReport();
    if (localAi) setAiReport(localAi);

    // 2. Query live Supabase DB for all partner brands, catalog creations, live orders, users, activities & AI reports
    try {
      const [dbData, dbOrders, dbUsers, dbActs, dbAiReport] = await Promise.all([
        supabaseFetchAdminBrandsWithProducts(),
        supabaseFetchOrders(),
        supabaseFetchUserProfiles(),
        supabaseFetchUserActivities(60),
        supabaseFetchLatestAIReport()
      ]);
      if (dbData && dbData.brands && dbData.products) {
        setBrands(dbData.brands);
        setProducts(dbData.products);
      }
      if (dbOrders && dbOrders.length > 0) {
        setTrialOrders(dbOrders);
      }
      if (dbUsers && dbUsers.length > 0) {
        setUserProfiles(dbUsers);
      }
      if (dbActs && dbActs.length > 0) {
        setUserActivities(dbActs);
      }
      if (dbAiReport) {
        setAiReport(dbAiReport);
        saveAIReport(dbAiReport);
      }
    } catch (err) {
      console.warn('Live fetch from Supabase failed, using cached data:', err);
    }

    // Load initial 27-table Supabase DB connectivity status
    fetchDbStatus();
  };

  const runAIShopperSynthesis = async (overrideApiKey?: string) => {
    if (isAiGenerating) return;
    setIsAiGenerating(true);
    try {
      const keyToUse = overrideApiKey !== undefined ? overrideApiKey : (aiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('drobe_ai_api_key') || '' : ''));
      const res = await fetch('/api/admin/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: keyToUse,
          activities: userActivities,
          users: userProfiles
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.report) {
          setAiReport(data.report);
          saveAIReport(data.report);
          supabaseSaveAIReport(data.report).catch(() => {});
          triggerToast('⚡ 2-Min AI Pulse: Fresh Drop-off Root-Cause Intelligence Generated');
        }
      } else {
        const fallback = generateHeuristicAIShopperReport(userActivities, userProfiles);
        setAiReport(fallback);
        saveAIReport(fallback);
        supabaseSaveAIReport(fallback).catch(() => {});
      }
    } catch {
      const fallback = generateHeuristicAIShopperReport(userActivities, userProfiles);
      setAiReport(fallback);
      saveAIReport(fallback);
      supabaseSaveAIReport(fallback).catch(() => {});
    } finally {
      setIsAiGenerating(false);
      setAiCountdown(120);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = aiApiKey.trim();
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('drobe_ai_api_key', trimmed);
        triggerToast('✓ AI API Key saved securely! Running live synthesis...');
      } else {
        localStorage.removeItem('drobe_ai_api_key');
        triggerToast('Using Adaptive Local Behavioral Engine');
      }
    }
    setApiKeyModalOpen(false);
    await runAIShopperSynthesis(trimmed);
  };

  const handleRunCopilotQuery = async (overridePrompt?: string) => {
    const query = (overridePrompt !== undefined ? overridePrompt : copilotPrompt).trim();
    if (!query || copilotLoading) return;
    setCopilotLoading(true);
    try {
      const liveContext = `DROBE Ahmedabad Darkstore Hub (AMD-DARKSTORE-01)
Live Orders: ${trialOrders.length}
Registered Shoppers: ${userProfiles.length} (${userProfiles.filter(u => u.currentStatus === 'Active Browsing' || u.currentStatus === 'In Doorstep Trial').length} currently active)
Active Doorstep Trials: ${userProfiles.filter(u => u.currentStatus === 'In Doorstep Trial').length}
Shoppers with Drop-off Hesitation: ${userProfiles.filter(u => u.dropoffRisk === 'High' || u.dropoffRisk === 'Immediate Dropoff').map(u => `${u.name} (Stage: ${u.funnelDropoffStage}, Cart: ₹${u.cartTotalInr}, Trigger: "${u.lastHesitationReason}")`).join('; ') || 'None'}
Catalog SKUs: ${products.length} products across Zone A, Zone B, Zone C, Zone D`;

      const keyToUse = aiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('drobe_ai_api_key') || '' : '');
      const res = await fetch('/api/admin/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          apiKey: keyToUse,
          context: liveContext,
          temperature: 1,
          top_p: 0.95,
          max_tokens: 8192
        })
      });

      const data = await res.json();
      if (data.success && (data.content || data.reasoning)) {
        setCopilotResult({
          content: data.content,
          reasoning: data.reasoning,
          model: data.model || 'meta/muse-glimmer-30b',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        triggerToast('⚡ NVIDIA meta/muse-glimmer-30b reasoning finished');
      } else {
        triggerToast('⚠️ ' + (data.error || 'Failed to complete query'));
      }
    } catch (err: any) {
      triggerToast('❌ Error calling NVIDIA AI: ' + err.message);
    } finally {
      setCopilotLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    syncDarkstoreWithSupabase().then(() => {
      loadAllData();
    });

    try {
      const savedSettled = localStorage.getItem('drobe_settled_brands');
      if (savedSettled) {
        setSettledBrands(JSON.parse(savedSettled));
      }
      const savedKey = localStorage.getItem('drobe_ai_api_key');
      if (savedKey) {
        setAiApiKey(savedKey);
      }
    } catch {}

    const unsubRealtimeOrders = subscribeToRealtimeOrders(() => {
      syncDarkstoreWithSupabase().then(() => loadAllData());
    });

    const unsubRealtimeProfiles = subscribeToRealtimeUserProfiles((newProfile) => {
      supabaseFetchUserProfiles().then((up) => {
        if (up && up.length > 0) setUserProfiles(up);
      });
    });

    const unsubRealtimeActivities = subscribeToRealtimeUserActivities((newAct) => {
      if (newAct) {
        setUserActivities(prev => [{
          id: newAct.id || `act-${Date.now()}`,
          userId: newAct.user_id,
          userName: newAct.user_name,
          activityType: newAct.activity_type,
          title: newAct.title,
          details: newAct.details || {},
          screen: newAct.screen,
          device: newAct.device,
          timestamp: 'Just now',
          isDropoffSignal: Boolean(newAct.is_dropoff_signal),
          hesitationReason: newAct.hesitation_reason,
          dropoffStage: newAct.dropoff_stage,
          dwellSeconds: newAct.dwell_seconds,
          aiRiskScore: newAct.ai_risk_score
        }, ...prev].slice(0, 60));
      }
    });

    const handleStorageChange = () => {
      loadAllData();
      try {
        const savedSettled = localStorage.getItem('drobe_settled_brands');
        if (savedSettled) {
          setSettledBrands(JSON.parse(savedSettled));
        }
        const savedKey = localStorage.getItem('drobe_ai_api_key');
        if (savedKey) {
          setAiApiKey(savedKey);
        }
      } catch {}
    };

    const handleReportUpdate = (e: any) => {
      if (e.detail) {
        setAiReport(e.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('drobe_ai_report_updated', handleReportUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('drobe_ai_report_updated', handleReportUpdate);
      if (unsubRealtimeOrders) unsubRealtimeOrders();
      if (unsubRealtimeProfiles) unsubRealtimeProfiles();
      if (unsubRealtimeActivities) unsubRealtimeActivities();
    };
  }, []);

  // 2-Minute Recurring Heartbeat Timer for AI Pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setAiCountdown(prev => {
        if (prev <= 1) {
          runAIShopperSynthesis();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [userActivities, userProfiles, aiApiKey]);

  // Telemetry counts
  const waitingBrandsCount = brands.filter(b => b.status === 'Waiting for Approval').length;
  const approvedBrandsCount = brands.filter(b => b.status === 'Approved').length;
  const brandsWithProductsCount = brands.filter(b => (b.totalProductsCount || 0) > 0).length;
  const brandsAwaitingCount = brands.filter(b => (b.totalProductsCount || 0) === 0).length;
  const pendingInwardsCount = products.filter(p => p.inwardStatus !== 'Inwarded & Live').length;
  const liveSkusCount = products.filter(p => p.isLive).length;
  const activeTrialsCount = trialOrders.filter(o => o.status === 'Out for 30-Min Delivery' || o.status.includes('Doorstep Fitting')).length;

  // Customer Telemetry Counts
  const onlineUsersCount = userProfiles.filter(u => u.currentStatus === 'Active Browsing' || u.currentStatus === 'In Doorstep Trial').length;
  const doorstepUsersCount = userProfiles.filter(u => u.currentStatus === 'In Doorstep Trial').length;
  const totalRegisteredUsers = userProfiles.length;

  // Order & Return Telemetry Counts
  const orderCountActive = trialOrders.filter(o => o.status === 'Out for 30-Min Delivery').length;
  const orderCountDoorstep = trialOrders.filter(o => o.status.includes('Doorstep Fitting')).length;
  const orderCountReturning = trialOrders.filter(o => o.status.includes('Returned on Spot')).length;
  const orderCountKept = trialOrders.filter(o => o.status === 'Kept on Spot (Purchased)').length;
  const orderCountRestocked = trialOrders.filter(o => o.status === 'Restocked to Warehouse Shelf').length;

  const handleMarkReturned = (orderId: string, returnReason?: string, notes?: string) => {
    const res = adminMarkOrderReturnedAndRestocked(orderId, returnReason, notes);
    if (res.order) {
      loadAllData();
      triggerToast(`✓ Return Restocked: +1 Stock added back to DB for ${res.order.productName} on shelf ${res.order.shelfLocation} (Now ${res.updatedStock ?? ''} pcs). Full UPI refund issued.`);
      setReturningOrderModal(null);
    }
  };

  const handleMarkDelivered = (orderId: string) => {
    const res = adminMarkOrderDeliveredAndKept(orderId);
    if (res.order) {
      loadAllData();
      triggerToast(`🎉 Order ${res.order.orderNumber} marked Delivered & Kept! Stock remains deducted in live DB.`);
    }
  };

  // =========================================================================
  // FINANCIAL & WHOLESALE SETTLEMENT LEDGER RECONCILIATION
  // =========================================================================
  const financialLedger = React.useMemo(() => {
    let totalAdvanceGMV = 0;
    let totalInstantRefunds = 0;
    let totalKeptGMV = 0;
    let totalBrandPayoutsDue = 0;
    let totalDrobeMarkupEarnings = 0;
    let totalOvertimeFees = 0;
    let totalUnitsDispatched = 0;
    let totalUnitsKept = 0;
    let totalUnitsReturned = 0;

    // Per-brand ledger map
    const brandMap: Record<string, {
      brandId: string;
      brandName: string;
      category?: string;
      dispatchedUnits: number;
      keptUnits: number;
      returnedUnits: number;
      grossGmv: number;
      refundsDisbursed: number;
      netKeptGmv: number;
      wholesalePayoutDue: number;
      drobeMarkup: number;
      avgBaseWholesale: number;
    }> = {};

    // Initialize with all approved brands
    brands.forEach((b) => {
      brandMap[b.id] = {
        brandId: b.id,
        brandName: b.name,
        category: b.category,
        dispatchedUnits: 0,
        keptUnits: 0,
        returnedUnits: 0,
        grossGmv: 0,
        refundsDisbursed: 0,
        netKeptGmv: 0,
        wholesalePayoutDue: 0,
        drobeMarkup: 0,
        avgBaseWholesale: 600
      };
    });

    // Populate pricing info for products
    const productPricingMap: Record<string, DrobeMarkupPricing> = {};
    products.forEach((p) => {
      productPricingMap[p.id] = getProductPricingInfo(p);
      if (p.sku) productPricingMap[p.sku] = productPricingMap[p.id];
    });

    // Iterate through trial orders
    trialOrders.forEach((ord) => {
      const advancePaid = ord.advancePaidAmount ?? (parseFloat(ord.price.replace(/[^0-9.]/g, '')) || 0);
      const refundPaid = (ord.refundStatus === 'Refund Processed Instantly' || ord.status === 'Restocked to Warehouse Shelf')
        ? (ord.netRefundAmount ?? ord.refundAmount ?? 0)
        : (ord.netRefundAmount ?? ord.refundAmount ?? 0);
      const overtime = ord.overtimeFee || 0;

      totalAdvanceGMV += advancePaid;
      totalInstantRefunds += refundPaid;
      totalOvertimeFees += overtime;

      // Items within order
      const items = (ord.items && ord.items.length > 0)
        ? ord.items
        : [{
            productId: ord.productId,
            productName: ord.productName,
            productSku: ord.productSku,
            brandId: ord.brandId,
            brandName: ord.brandName,
            price: ord.price,
            priceNum: parseFloat(ord.price.replace(/[^0-9.]/g, '')) || 0,
            size: ord.size,
            status: ord.status === 'Kept on Spot (Purchased)' ? 'kept' as const : ord.status === 'Restocked to Warehouse Shelf' ? 'returned' as const : 'pending' as const
          }];

      items.forEach((it) => {
        totalUnitsDispatched += 1;
        const bId = it.brandId || slugify(it.brandName || 'drobe');
        if (!brandMap[bId]) {
          brandMap[bId] = {
            brandId: bId,
            brandName: it.brandName || 'Brand Partner',
            category: 'Apparel',
            dispatchedUnits: 0,
            keptUnits: 0,
            returnedUnits: 0,
            grossGmv: 0,
            refundsDisbursed: 0,
            netKeptGmv: 0,
            wholesalePayoutDue: 0,
            drobeMarkup: 0,
            avgBaseWholesale: 600
          };
        }

        const bEntry = brandMap[bId];
        bEntry.dispatchedUnits += 1;

        // Pricing lookup
        const pricing = productPricingMap[it.productId] || calculateDrobeMarkupPricing(it.priceNum || 629);
        const itemSellingPrice = pricing.sellingPrice || it.priceNum || 629;
        const baseWholesale = pricing.brandBasePrice || Math.round(itemSellingPrice / 1.05);
        const markup = pricing.markupAmount || (itemSellingPrice - baseWholesale);

        bEntry.grossGmv += itemSellingPrice;
        bEntry.avgBaseWholesale = baseWholesale;

        if (it.status === 'kept') {
          totalUnitsKept += 1;
          totalKeptGMV += itemSellingPrice;
          totalBrandPayoutsDue += baseWholesale;
          totalDrobeMarkupEarnings += markup;

          bEntry.keptUnits += 1;
          bEntry.netKeptGmv += itemSellingPrice;
          bEntry.wholesalePayoutDue += baseWholesale;
          bEntry.drobeMarkup += markup;
        } else if (it.status === 'returned') {
          totalUnitsReturned += 1;
          bEntry.returnedUnits += 1;
          bEntry.refundsDisbursed += itemSellingPrice;
        }
      });
    });

    const netPlatformEarnings = totalDrobeMarkupEarnings + totalOvertimeFees;
    const avgMarkupPct = totalBrandPayoutsDue > 0
      ? Number(((totalDrobeMarkupEarnings / totalBrandPayoutsDue) * 100).toFixed(2))
      : 4.83;
    const conversionRate = totalUnitsDispatched > 0
      ? Number(((totalUnitsKept / totalUnitsDispatched) * 100).toFixed(1))
      : 0;

    return {
      totalAdvanceGMV,
      totalInstantRefunds,
      totalKeptGMV,
      totalBrandPayoutsDue,
      totalDrobeMarkupEarnings,
      totalOvertimeFees,
      netPlatformEarnings,
      avgMarkupPct,
      totalUnitsDispatched,
      totalUnitsKept,
      totalUnitsReturned,
      conversionRate,
      brandLedgerRows: Object.values(brandMap)
    };
  }, [trialOrders, brands, products]);

  const handleExportSettlementCsv = () => {
    try {
      const headers = [
        'Brand Partner',
        'Category',
        'Units Dispatched',
        'Units Kept',
        'Units Returned',
        'Gross GMV (₹)',
        'Refunds Disbursed (₹)',
        'Net Retained GMV (₹)',
        'Wholesale Base B (₹)',
        'Net Brand Payout Due (₹)',
        'Drobe 5% Markup Retained (₹)',
        'Settlement Status',
        'Disbursement UTR'
      ];

      const rows = financialLedger.brandLedgerRows.map((b) => {
        const isSettled = !!settledBrands[b.brandId];
        return [
          `"${b.brandName}"`,
          `"${b.category || 'Apparel'}"`,
          b.dispatchedUnits,
          b.keptUnits,
          b.returnedUnits,
          b.grossGmv,
          b.refundsDisbursed,
          b.netKeptGmv,
          b.avgBaseWholesale,
          b.wholesalePayoutDue,
          b.drobeMarkup,
          isSettled ? 'Disbursed via Bank Transfer' : (b.wholesalePayoutDue > 0 ? 'Ready for Payout' : 'No Balance Due'),
          isSettled ? `"${settledBrands[b.brandId].utr}"` : 'Pending'
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DROBE_Brand_Wholesale_Settlement_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('✓ Exported Brand Wholesale Settlement Ledger to CSV');
    } catch {
      triggerToast('Failed to export settlement report');
    }
  };

  const handleConfirmPayout = () => {
    if (!settlementModalBrand) return;
    const finalUtr = payoutUtrRef.trim() || `NEFT-DROBE-${Date.now().toString().slice(-6)}`;
    const updated = {
      ...settledBrands,
      [settlementModalBrand.brandId]: {
        utr: finalUtr,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: settlementModalBrand.wholesalePayoutDue,
        notes: payoutNotes || 'Automated weekly darkstore wholesale payout'
      }
    };
    setSettledBrands(updated);
    try {
      localStorage.setItem('drobe_settled_brands', JSON.stringify(updated));
    } catch {}
    triggerToast(`✓ Disbursed ₹${settlementModalBrand.wholesalePayoutDue.toLocaleString('en-IN')} Payout to ${settlementModalBrand.brandName} (UTR: ${finalUtr})`);
    setSettlementModalBrand(null);
    setPayoutUtrRef('');
    setPayoutNotes('');
  };

  const handleExportUsersCsv = () => {
    try {
      const headers = [
        'ID',
        'Customer Name',
        'Email',
        'Phone',
        'City',
        'Hub Zone',
        'Top Size',
        'Bottom Size',
        'Footwear Size',
        'Preferred Fit',
        'Drop-Off Risk',
        'Funnel Stage',
        'Last Hesitation Reason',
        'Cart Total (INR)',
        'Cart Items',
        'Total Orders',
        'Total Spent (INR)',
        'Doorstep Trials',
        'Kept Ratio %',
        'Current Status',
        'Current Screen',
        'Device',
        'Last Active'
      ];

      const rows = userProfiles.map(u => [
        `"${u.id}"`,
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.phone}"`,
        `"${u.city}"`,
        `"${u.hubZone}"`,
        `"${u.topSize}"`,
        `"${u.bottomSize}"`,
        `"${u.footwearSize}"`,
        `"${u.preferredFit}"`,
        `"${u.dropoffRisk || 'Low'}"`,
        `"${u.funnelDropoffStage || 'Active Browsing'}"`,
        `"${(u.lastHesitationReason || '').replace(/"/g, '""')}"`,
        u.cartTotalInr || 0,
        u.cartItemCount || 0,
        u.totalOrdersCount,
        u.totalSpentInr,
        u.doorstepTrialsCount,
        u.keptRatioPercentage,
        `"${u.currentStatus}"`,
        `"${u.currentScreen}"`,
        `"${u.deviceInfo}"`,
        `"${u.lastActiveAt}"`
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DROBE_Customer_Dropoff_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('✓ Exported Customer Directory & Drop-Off Telemetry to CSV');
    } catch {
      triggerToast('Failed to export customer directory');
    }
  };

  // Handlers
  const handleApproveBrand = (brandId: string, brandName: string) => {
    const res = adminApproveBrand(brandId);
    if (res) {
      loadAllData();
      triggerToast(`✓ Approved ${brandName} · Listed on Drobe directory & consignment stock dispatch unlocked!`);
    }
  };

  const handleRejectBrand = (brandId: string, brandName: string) => {
    const res = adminRejectBrand(brandId);
    if (res) {
      loadAllData();
      triggerToast(`Brand ${brandName} marked as Rejected`);
    }
  };

  const handleOpenInwardModal = (prod: DarkstoreProduct, ship?: InboundStockShipment) => {
    setSelectedProductToInward(prod);
    setAssociatedShipment(ship || null);
    setInwardUnits(ship ? ship.units : (prod.inventory || 20));

    // Initialize brand wholesale base price
    const currentPricing = getProductPricingInfo(prod);
    setInwardBasePrice(currentPricing.brandBasePrice || 600);

    const nextSku = getNextSkuNumber();
    setInwardSku(prod.sku || nextSku.sku);

    // Automatically assign next vacant shelf in Ahmedabad Darkstore Hub!
    const autoShelf = getNextAvailableShelfLocation(prod.category);
    setSelectedZone(autoShelf.zone);
    setSelectedRack(autoShelf.rack);
    setSelectedShelf(autoShelf.shelf);
    setSelectedBin(autoShelf.bin);

    setInwardModalOpen(true);
  };

  const handleMarkArrived = (shipmentId: string, prodName: string) => {
    const res = markShipmentArrived(shipmentId);
    if (res) {
      loadAllData();
      triggerToast(`📦 Consignment arrived at Shivam Bungalows 1, Koteshwar Road hub! Ready for shelf allocation.`);
    }
  };

  const handleDirectAutoInward = (ship: InboundStockShipment, prod?: DarkstoreProduct) => {
    const targetProdId = prod?.id || ship.productId;
    const autoShelf = getNextAvailableShelfLocation(prod?.category);
    const nextSku = getNextSkuNumber();

    const res = adminInwardProduct({
      productId: targetProdId,
      sku: prod?.sku || nextSku.sku,
      unitsReceived: ship.units || 20,
      shelfLocation: {
        zone: autoShelf.zone,
        rack: autoShelf.rack,
        shelf: autoShelf.shelf,
        bin: autoShelf.bin
      },
      verifiedBy: 'Harshil M. (Ahmedabad Hub Ops)',
      shipmentId: ship.id
    });

    loadAllData();
    triggerToast(`🎉 Auto-Assigned Shelf ${res.shelfCode}! Assigned ${res.skuAssigned} · Shelved at Shivam Bungalows 1, Koteshwar Road · Now LIVE on Platform & App!`);
  };

  const handleConfirmInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToInward) return;

    const res = adminInwardProduct({
      productId: selectedProductToInward.id,
      sku: inwardSku.trim().toUpperCase(),
      unitsReceived: Number(inwardUnits) || 20,
      brandBasePrice: Number(inwardBasePrice) || 600,
      shelfLocation: {
        zone: selectedZone,
        rack: selectedRack,
        shelf: selectedShelf,
        bin: selectedBin
      },
      verifiedBy: 'Harshil M. (Ahmedabad Hub Ops)',
      shipmentId: associatedShipment?.id
    });

    setInwardModalOpen(false);
    loadAllData();
    triggerToast(`🎉 Verified & Placed on Shelf ${res.shelfCode}! Assigned ${res.skuAssigned} · Base ₹${res.product.brandBasePrice} marked up to ${res.product.price} (+${res.product.markupPercentage}% actual margin) · Now LIVE!`);
  };

  const handleOrderAction = (orderId: string, newStatus: TrialOrder['status']) => {
    const res = updateTrialOrderStatus(orderId, newStatus);
    if (res) {
      loadAllData();
      if (newStatus === 'Kept on Spot (Purchased)') {
        triggerToast(`🎉 Order ${res.orderNumber} kept on spot! Payment confirmed & credited to ${res.brandName} payout.`);
      } else if (newStatus.includes('Returned on Spot')) {
        triggerToast(`↩ Customer returned items to delivery partner at door. Rider riding straight back to Ahmedabad Hub!`);
      } else if (newStatus === 'Restocked to Warehouse Shelf') {
        triggerToast(`✓ Restocked to shelf ${res.shelfLocation}! Client refunded instantly via UPI.`);
      } else {
        triggerToast(`Order status updated to: ${newStatus}`);
      }
    }
  };

  const handleAdjustStock = (productId: string, delta: number, prodName: string) => {
    const updated = adjustProductStock(productId, delta);
    if (updated) {
      loadAllData();
      triggerToast(`${delta > 0 ? '+1' : '-1'} Stock for ${prodName} (Now ${updated.inwardUnits} pcs on shelf)`);
    }
  };

  const handleOpenBarcodeModal = (prod: DarkstoreProduct) => {
    setSelectedProductForBarcode(prod);
    setBarcodeModalOpen(true);
  };

  const filteredBrands = brands.filter(b => {
    if (brandFilter === 'waiting') return b.status === 'Waiting for Approval';
    if (brandFilter === 'approved') return b.status === 'Approved';
    if (brandFilter === 'with_products') return (b.totalProductsCount || 0) > 0;
    if (brandFilter === 'awaiting_products') return (b.totalProductsCount || 0) === 0;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const match = b.name.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.founderName && b.founderName.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const currentBrandProducts = selectedBrandForProducts ? (
    (selectedBrandForProducts.products && selectedBrandForProducts.products.length > 0)
      ? selectedBrandForProducts.products
      : products.filter(p => {
          const bSlug = slugify(selectedBrandForProducts.id || selectedBrandForProducts.name);
          const bName = selectedBrandForProducts.name?.toLowerCase().trim();
          return (p.brandId && (p.brandId === selectedBrandForProducts.id || slugify(p.brandId) === bSlug)) ||
                 (p.brandName && (p.brandName.toLowerCase().trim() === bName || slugify(p.brandName) === bSlug));
        })
  ) : [];

  const filteredCurrentBrandProducts = currentBrandProducts.filter(p => {
    if (!brandProductsSearch) return true;
    const q = brandProductsSearch.toLowerCase().trim();
    return (p.name && p.name.toLowerCase().includes(q)) ||
           (p.sku && p.sku.toLowerCase().includes(q)) ||
           (p.category && p.category.toLowerCase().includes(q)) ||
           (p.id && p.id.toLowerCase().includes(q));
  });

  const filteredProducts = products.filter(p => {
    if (inventoryFilter === 'in_stock') {
      if ((p.inwardUnits || 0) <= 0) return false;
    } else if (inventoryFilter === 'low_stock') {
      if ((p.inwardUnits || 0) >= 5 || (p.inwardUnits || 0) === 0) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.warehouseLocation && p.warehouseLocation.code.toLowerCase().includes(q))
    );
  });

  const filteredTrialOrders = trialOrders.filter(ord => {
    if (ordersFilter === 'active') return ord.status === 'Out for 30-Min Delivery';
    if (ordersFilter === 'doorstep') return ord.status.includes('Doorstep Fitting');
    if (ordersFilter === 'returning') return ord.status.includes('Returned on Spot');
    if (ordersFilter === 'kept') return ord.status === 'Kept on Spot (Purchased)';
    if (ordersFilter === 'restocked') return ord.status === 'Restocked to Warehouse Shelf';
    return true;
  }).filter(ord => {
    const q = (ordersSearch || searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.toLowerCase().includes(q)) ||
      (ord.customerAddress && ord.customerAddress.toLowerCase().includes(q)) ||
      (ord.productName && ord.productName.toLowerCase().includes(q)) ||
      (ord.productSku && ord.productSku.toLowerCase().includes(q)) ||
      (ord.shelfLocation && ord.shelfLocation.toLowerCase().includes(q)) ||
      (ord.brandName && ord.brandName.toLowerCase().includes(q)) ||
      (ord.riderName && ord.riderName.toLowerCase().includes(q))
    );
  });

  const filteredUserProfiles = userProfiles.filter(u => {
    if (usersFilter === 'online') return u.currentStatus === 'Active Browsing' || u.currentStatus === 'In Doorstep Trial';
    if (usersFilter === 'trial') return u.currentStatus === 'In Doorstep Trial';
    if (usersFilter === 'offline') return u.currentStatus === 'Offline';
    return true;
  }).filter(u => {
    const q = (usersSearch || searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q)) ||
      (u.hubZone && u.hubZone.toLowerCase().includes(q)) ||
      (u.currentScreen && u.currentScreen.toLowerCase().includes(q)) ||
      (u.topSize && u.topSize.toLowerCase().includes(q)) ||
      (u.bottomSize && u.bottomSize.toLowerCase().includes(q)) ||
      (u.preferredFit && u.preferredFit.toLowerCase().includes(q)) ||
      (Array.isArray(u.preferredStyles) && u.preferredStyles.some(s => s.toLowerCase().includes(q))) ||
      (Array.isArray(u.favouriteBrands) && u.favouriteBrands.some(b => b.toLowerCase().includes(q)))
    );
  });

  return (
    <div className={styles.adminLayout}>
      {/* 1. DESKTOP LEFT SIDEBAR NAVIGATION */}
      <aside className={styles.desktopSidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandLogoRow}>
            <img src="/drobe-logo.png" alt="Drobe" className={styles.brandLogoImg} />
            <span className={styles.brandLogoText}>DROBE</span>
            <span className={styles.opsTag}>DARKSTORE</span>
          </div>

          <div className={styles.hubLocationCard}>
            <div className={styles.hubLocationName}>
              <Building2 size={13} color="#0284c7" />
              <span>{AHMEDABAD_WAREHOUSE.code}</span>
            </div>
            <div className={styles.hubLocationAddr}>
              Shivam Bungalows 1, Koteshwar Road, Ahmedabad
            </div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarSectionTitle}>
            Warehouse Operations
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('inwarding')}
            className={`${styles.sidebarNavItem} ${activeTab === 'inwarding' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Boxes size={16} />
              <span>Stock Inwarding</span>
            </div>
            {pendingInwardsCount > 0 && (
              <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{pendingInwardsCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`${styles.sidebarNavItem} ${activeTab === 'inventory' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Barcode size={16} />
              <span>SKU Inventory & Labels</span>
            </div>
            <span className={`${styles.badgePill} ${styles.badgeGreen}`}>{liveSkusCount} Live</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shelves')}
            className={`${styles.sidebarNavItem} ${activeTab === 'shelves' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Layers size={16} />
              <span>Darkstore Floor Plan</span>
            </div>
            <span className={`${styles.badgePill} ${styles.badgeBlue}`}>6 Racks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`${styles.sidebarNavItem} ${activeTab === 'approvals' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <UserCheck size={16} />
              <span>Brand Approvals</span>
            </div>
            {waitingBrandsCount > 0 && (
              <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{waitingBrandsCount}</span>
            )}
          </button>

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '12px' }}>
            Quick-Commerce Dispatch
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`${styles.sidebarNavItem} ${activeTab === 'trials' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Truck size={16} />
              <span>Doorstep Trials & Returns</span>
            </div>
            {activeTrialsCount > 0 && (
              <span className={`${styles.badgePill} ${styles.badgeGreen}`}>{activeTrialsCount} live</span>
            )}
          </button>

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '12px' }}>
            Financials & Ledger
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className={`${styles.sidebarNavItem} ${activeTab === 'settlement' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Receipt size={16} />
              <span>Wholesale & Margin Ledger</span>
            </div>
            <span className={`${styles.badgePill} ${styles.badgeGreen}`}>5% Margin</span>
          </button>

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '12px' }}>
            Customer Telemetry
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`${styles.sidebarNavItem} ${activeTab === 'users' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Users size={16} />
              <span>Customers & Live Activity</span>
            </div>
            {onlineUsersCount > 0 ? (
              <span className={`${styles.badgePill} ${styles.badgeGreen}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                {onlineUsersCount} online
              </span>
            ) : (
              <span className={`${styles.badgePill} ${styles.badgeBlue}`}>{totalRegisteredUsers}</span>
            )}
          </button>

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '12px' }}>
            System Infrastructure & DB
          </div>

          <button
            type="button"
            onClick={() => { setActiveTab('database'); fetchDbStatus(); }}
            className={`${styles.sidebarNavItem} ${activeTab === 'database' ? styles.sidebarNavItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Database size={16} />
              <span>System Tables & DB Matrix</span>
            </div>
            {dbStatusData ? (
              <span className={`${styles.badgePill} ${dbStatusData.summary.onlineCount === dbStatusData.summary.totalTables ? styles.badgeGreen : styles.badgeAmber}`}>
                {dbStatusData.summary.onlineCount}/{dbStatusData.summary.totalTables} Live
              </span>
            ) : (
              <span className={`${styles.badgePill} ${styles.badgeBlue}`}>27 Tables</span>
            )}
          </button>

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '14px' }}>
            External Hub Portals
          </div>

          <Link
            href="/order-portal"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none' }}
          >
            <div className={styles.navItemLeft}>
              <Activity size={16} color="#d97706" />
              <span>Hub Order Portal</span>
            </div>
            <ExternalLink size={12} color="#94a3b8" />
          </Link>

          <Link
            href="/delivery-partner"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none' }}
          >
            <div className={styles.navItemLeft}>
              <Navigation size={16} color="#2563eb" />
              <span>Delivery Partner App</span>
            </div>
            <ExternalLink size={12} color="#94a3b8" />
          </Link>

          <Link
            href="/brand-dashboard"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none' }}
          >
            <div className={styles.navItemLeft}>
              <Store size={16} color="#7e22ce" />
              <span>Brand Partner Portal</span>
            </div>
            <ExternalLink size={12} color="#94a3b8" />
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.hubStatusPill}>
            <span className={styles.livePulseDot} />
            <span>30-Min SLA Live · Ahmedabad Hub #01</span>
          </div>
        </div>
      </aside>

      {/* 2. DESKTOP MAIN CONTENT WRAPPER */}
      <div className={styles.mainWrapper}>
        {/* DESKTOP STICKY TOPBAR */}
        <header className={styles.desktopTopbar}>
          <div className={styles.topbarLeft}>
            <div>
              <h2 className={styles.topbarTitle}>
                {activeTab === 'inwarding' && 'Stock Inwarding & Physical Shelf Allocation'}
                {activeTab === 'inventory' && 'Darkstore SKU Matrix & Barcode Label Station'}
                {activeTab === 'approvals' && 'Brand Partner Approvals & Verification'}
                {activeTab === 'shelves' && 'Ahmedabad Warehouse Floor Plan & Rack Matrix'}
                {activeTab === 'trials' && 'Doorstep Fitting & Instant Return Room'}
                {activeTab === 'settlement' && 'Brand Wholesale Settlement & Margin Ledger'}
                {activeTab === 'users' && 'Shopper Profiles & Real-time Live Activity Telemetry'}
                {activeTab === 'database' && 'System Tables & Telemetry Database Matrix (27 Tables)'}
              </h2>
              <div className={styles.topbarBreadcrumb}>
                <span>Ahmedabad Darkstore Hub #01</span>
                <span>/</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>
                  {activeTab === 'trials' ? 'Doorstep Fittings & Returns' : 
                   activeTab === 'settlement' ? 'Wholesale & Margin Ledger' :
                   activeTab === 'users' ? 'Customers & Live Activity' :
                   activeTab === 'database' ? 'System Infrastructure & DB Matrix' :
                   (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.topbarSearchWrap}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU (DR1), Brand, Rack..."
                className={styles.topbarSearchInput}
              />
            </div>

            <Link
              href="/"
              target="_blank"
              className={styles.actionPillLink}
              title="Open Live Drobe Customer Storefront"
            >
              <ShoppingBag size={13} color="#0284c7" />
              <span style={{ color: '#0369a1', fontWeight: 700 }}>Customer Store</span>
              <ExternalLink size={11} color="#0284c7" />
            </Link>

            <button
              type="button"
              onClick={() => {
                const pending = products.find(p => p.inwardStatus !== 'Inwarded & Live') || products[0];
                handleOpenInwardModal(pending);
              }}
              className={styles.btnPrimary}
            >
              <Boxes size={14} /> + Inward Stock
            </button>

            <div className={styles.telemetryTag}>
              <span className={styles.livePulseDot} style={{ width: '6px', height: '6px' }} />
              <span>Cloud Synced</span>
            </div>

            <div className={styles.telemetryTag}>
              <Activity size={13} color="#16a34a" />
              <span>18 Active Riders</span>
            </div>
          </div>
        </header>

        {/* DESKTOP MAIN CANVAS */}
                <main className={styles.desktopContent}>
          {/* CONTEXTUAL DOMAIN HERO & ADAPTIVE LIVE KPI BAR (ANTI-CLUTTER & APPLE DESIGN) */}
          <div className={styles.domainHero}>
            <div className={styles.domainHeroTop}>
              <div className={styles.domainHeroLeft}>
                <div className={styles.domainHeroIconWrap}>
                  {activeTab === 'inwarding' && <Boxes size={22} />}
                  {activeTab === 'inventory' && <Barcode size={22} />}
                  {activeTab === 'shelves' && <Layers size={22} />}
                  {activeTab === 'trials' && <Truck size={22} />}
                  {activeTab === 'approvals' && <UserCheck size={22} />}
                  {activeTab === 'settlement' && <Receipt size={22} />}
                  {activeTab === 'users' && <Users size={22} />}
                  {activeTab === 'database' && <Database size={22} />}
                </div>
                <div>
                  <h1 className={styles.domainHeroTitle}>
                    {activeTab === 'inwarding' && 'Stock Inwarding & Physical Shelf Allocation'}
                    {activeTab === 'inventory' && 'Darkstore Live SKU Matrix & Barcodes'}
                    {activeTab === 'shelves' && 'Warehouse Floor Plan & Rack Matrix'}
                    {activeTab === 'trials' && 'Doorstep Fitting & Instant Return Room'}
                    {activeTab === 'approvals' && 'Brand Partner Onboarding & Approvals'}
                    {activeTab === 'settlement' && 'Wholesale Settlement & 5% Margin Ledger'}
                    {activeTab === 'users' && 'Shopper Telemetry & AI Intelligence'}
                    {activeTab === 'database' && 'System Tables & Telemetry Matrix (27 Tables)'}
                  </h1>
                  <p className={styles.domainHeroSubtitle}>
                    {activeTab === 'inwarding' && 'Ahmedabad Darkstore Hub #01 (Koteshwar Road) · Verify arriving consignments and assign rack coordinates'}
                    {activeTab === 'inventory' && 'Live SKU inventory levels, barcode label generation, and automated wholesale vs retail markup pricing'}
                    {activeTab === 'shelves' && 'Interactive floor plan across Zones A, B, and C with 6 physical racks and 96 allocated storage bins'}
                    {activeTab === 'trials' && 'Real-time 6-minute doorstep trial management, delivery runner dispatch, and on-spot restock workflows'}
                    {activeTab === 'approvals' && 'Review brand verification dossiers, trademark certificates, wholesale terms, and live product catalogs'}
                    {activeTab === 'settlement' && 'Automated wholesale ledger, 5% Drobe commission accounting, and bank payout reconciliation'}
                    {activeTab === 'users' && 'Real-time customer browsing events, cart hesitation telemetry, and autonomous AI shopper demand forecasting'}
                    {activeTab === 'database' && 'Supabase PostgreSQL 27-table relational schema health, realtime socket listeners, and migration status'}
                  </p>
                </div>
              </div>

              <div className={styles.domainHeroActions}>
                {activeTab === 'inwarding' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const pending = products.find(p => p.inwardStatus !== 'Inwarded & Live') || products[0];
                        handleOpenInwardModal(pending);
                      }}
                      className={styles.btnPrimary}
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Boxes size={14} /> Inward New Parcel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        syncDarkstoreWithSupabase().then(() => loadAllData());
                        triggerToast('Syncing darkstore with live Supabase database...');
                      }}
                      className={styles.btnSecondary}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <RotateCcw size={13} /> Sync Supabase
                    </button>
                  </>
                )}

                {activeTab === 'inventory' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const pending = products.find(p => p.inwardStatus !== 'Inwarded & Live') || products[0];
                        handleOpenInwardModal(pending);
                      }}
                      className={styles.btnPrimary}
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Boxes size={14} /> Inward SKU
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const csv = 'SKU,Product,Brand,Category,Stock,Wholesale,Retail,Shelf\n' +
                          products.map(p => `"${p.sku || p.id}","${p.name}","${(p as any).brand || p.brandId}","${p.category}",${(p as any).stock_count || p.inwardUnits || 0},${(p as any).baseWholesalePrice || (p as any).brandBasePrice || 0},${(p as any).customerPrice || (p as any).price || 0},"${(p as any).shelfLocation || p.warehouseLocation?.code || ''}"`).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `drobe_skus_${Date.now()}.csv`;
                        a.click();
                      }}
                      className={styles.btnSecondary}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <Download size={13} /> Export CSV
                    </button>
                  </>
                )}

                {activeTab === 'trials' && (
                  <>
                    <Link
                      href="/order-portal"
                      target="_blank"
                      className={styles.btnSecondary}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <Activity size={13} color="#d97706" /> Hub Orders Screen <ExternalLink size={11} />
                    </Link>
                    <Link
                      href="/delivery-partner"
                      target="_blank"
                      className={styles.btnPrimary}
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Truck size={14} /> Delivery Partner App <ExternalLink size={11} />
                    </Link>
                  </>
                )}

                {activeTab === 'approvals' && (
                  <Link
                    href="/brand-dashboard"
                    target="_blank"
                    className={styles.btnPrimary}
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <Store size={14} /> Open Brand Portal <ExternalLink size={11} />
                  </Link>
                )}

                {activeTab === 'settlement' && (
                  <button
                    type="button"
                    onClick={handleExportSettlementCsv}
                    className={styles.btnPrimary}
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <Download size={14} /> Export Settlement CSV
                  </button>
                )}

                {activeTab === 'users' && (
                  <>
                    <button
                      type="button"
                      onClick={() => runAIShopperSynthesis()}
                      disabled={isAiGenerating}
                      className={styles.btnPrimary}
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Sparkles size={14} /> {isAiGenerating ? 'Synthesizing...' : '⚡ Generate AI Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCopilotModalOpen(true)}
                      className={styles.btnSecondary}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <Bot size={13} color="#0284c7" /> Ask Copilot AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setApiKeyModalOpen(true)}
                      className={styles.btnSecondary}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <KeyRound size={13} /> AI Key
                    </button>
                  </>
                )}

                {activeTab === 'database' && (
                  <>
                    <button
                      type="button"
                      onClick={copyCompleteSql}
                      className={styles.btnPrimary}
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Copy size={14} /> {copiedSql ? '✓ Copied SQL!' : 'Copy Migration SQL'}
                    </button>
                    <button
                      type="button"
                      onClick={fetchDbStatus}
                      className={styles.btnSecondary}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      <RefreshCw size={13} className={isDbStatusLoading ? styles.spinAnimation : ''} /> Refresh Health
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ADAPTIVE LIVE KPI METRICS STRIP */}
            <div className={styles.domainKpiGrid}>
              {activeTab === 'inwarding' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Parcels to Inward</span>
                      <Boxes size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: pendingInwardsCount > 0 ? '#0284c7' : '#0f172a' }}>
                      <NumberFlow value={pendingInwardsCount} />
                    </div>
                    <div className={styles.domainKpiSub}>Inspect and assign shelf</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Live Shipments</span>
                      <Truck size={14} color="#6366f1" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={inbounds.length} />
                    </div>
                    <div className={styles.domainKpiSub}>Partner consignments</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Shelf Capacity</span>
                      <Layers size={14} color="#10b981" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      34 / 96
                    </div>
                    <div className={styles.domainKpiSub}>35% darkstore occupancy</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Inward SLA</span>
                      <Clock size={14} color="#d97706" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#d97706' }}>
                      98.6%
                    </div>
                    <div className={styles.domainKpiSub}>Within 30-min window</div>
                  </div>
                </>
              )}

              {activeTab === 'inventory' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Live SKUs</span>
                      <Barcode size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      <NumberFlow value={liveSkusCount} />
                    </div>
                    <div className={styles.domainKpiSub}>Allocated on DR shelves</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>In-Stock Units</span>
                      <Package size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={products.reduce((acc, p) => acc + ((p as any).stock_count || p.inwardUnits || 0), 0)} />
                    </div>
                    <div className={styles.domainKpiSub}>Garments ready for dispatch</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Consignment Valuation</span>
                      <DollarSign size={14} color="#6366f1" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#0284c7' }}>
                      ₹12,48,500
                    </div>
                    <div className={styles.domainKpiSub}>Wholesale inventory value</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Active Brands</span>
                      <Store size={14} color="#7e22ce" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={brands.filter(b => b.status === 'Approved' || (b.status as any) === 'approved').length} />
                    </div>
                    <div className={styles.domainKpiSub}>Supplying merchandise</div>
                  </div>
                </>
              )}

              {activeTab === 'shelves' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Active Racks</span>
                      <Layers size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal}>6 Racks</div>
                    <div className={styles.domainKpiSub}>Zones A, B, and C</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Configured Shelves</span>
                      <Boxes size={14} color="#6366f1" />
                    </div>
                    <div className={styles.domainKpiVal}>24 Shelves</div>
                    <div className={styles.domainKpiSub}>4 vertical tiers per rack</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Occupied Bins</span>
                      <CheckCircle2 size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>34 / 96</div>
                    <div className={styles.domainKpiSub}>35% utilized capacity</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Pick SLA</span>
                      <Zap size={14} color="#d97706" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#d97706' }}>1.8 mins</div>
                    <div className={styles.domainKpiSub}>Average runner retrieval</div>
                  </div>
                </>
              )}

              {activeTab === 'trials' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Active Doorstep Trials</span>
                      <Truck size={14} color="#7e22ce" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#7e22ce' }}>
                      <NumberFlow value={activeTrialsCount} />
                    </div>
                    <div className={styles.domainKpiSub}>Runners waiting at doors</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Out for Fitting</span>
                      <Activity size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#0284c7' }}>
                      <NumberFlow value={trialOrders.filter(o => (o.status as any) === 'out_for_trial' || o.status === 'Out for 30-Min Delivery' || o.status.includes('Doorstep Fitting')).length} />
                    </div>
                    <div className={styles.domainKpiSub}>In-transit or fitting</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Instant Restocked</span>
                      <RotateCcw size={14} color="#f59e0b" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#d97706' }}>
                      <NumberFlow value={trialOrders.filter(o => (o.status as any) === 'returned' || o.status.includes('Returned on Spot') || o.status === 'Restocked to Warehouse Shelf').length} />
                    </div>
                    <div className={styles.domainKpiSub}>On-spot returns added to stock</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Delivered & Kept</span>
                      <CheckCircle2 size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      <NumberFlow value={trialOrders.filter(o => (o.status as any) === 'delivered' || o.status.includes('Kept on Spot')).length} />
                    </div>
                    <div className={styles.domainKpiSub}>Converted purchases</div>
                  </div>
                </>
              )}

              {activeTab === 'approvals' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Awaiting Approval</span>
                      <AlertCircle size={14} color="#d97706" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: waitingBrandsCount > 0 ? '#d97706' : '#0f172a' }}>
                      <NumberFlow value={waitingBrandsCount} />
                    </div>
                    <div className={styles.domainKpiSub}>Urgent compliance review</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Approved Brands</span>
                      <ShieldCheck size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      <NumberFlow value={approvedBrandsCount} />
                    </div>
                    <div className={styles.domainKpiSub}>Active on customer app</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Total Registered</span>
                      <Store size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={brands.length} />
                    </div>
                    <div className={styles.domainKpiSub}>Partner entities</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Review SLA</span>
                      <Clock size={14} color="#6366f1" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#6366f1' }}>&lt; 4 Hours</div>
                    <div className={styles.domainKpiSub}>Target verification speed</div>
                  </div>
                </>
              )}

              {activeTab === 'settlement' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Advance GMV Collected</span>
                      <Wallet size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#0284c7' }}>
                      ₹<NumberFlow value={financialLedger.totalAdvanceGMV} />
                    </div>
                    <div className={styles.domainKpiSub}>Pre-funded before dispatch</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Instant UPI Refunds</span>
                      <RotateCcw size={14} color="#d97706" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#d97706' }}>
                      ₹<NumberFlow value={financialLedger.totalInstantRefunds} />
                    </div>
                    <div className={styles.domainKpiSub}>{financialLedger.totalUnitsReturned} returned pieces credited</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Net Wholesale Payable</span>
                      <Receipt size={14} color="#6366f1" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#6366f1' }}>
                      ₹<NumberFlow value={financialLedger.totalBrandPayoutsDue} />
                    </div>
                    <div className={styles.domainKpiSub}>Payable to brand partners</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Drobe 5% Margin</span>
                      <TrendingUp size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      ₹<NumberFlow value={financialLedger.totalDrobeMarkupEarnings} />
                    </div>
                    <div className={styles.domainKpiSub}>Net commission retained</div>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Active Shoppers</span>
                      <Radio size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      <NumberFlow value={onlineUsersCount} />
                    </div>
                    <div className={styles.domainKpiSub}>Realtime live sessions</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Total Shopper Profiles</span>
                      <Users size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={totalRegisteredUsers} />
                    </div>
                    <div className={styles.domainKpiSub}>Ahmedabad customers</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Telemetry Events</span>
                      <Activity size={14} color="#6366f1" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={userActivities.length} />
                    </div>
                    <div className={styles.domainKpiSub}>Hesitation & click traces</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>AI Intelligence</span>
                      <Sparkles size={14} color="#7e22ce" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#7e22ce' }}>Active</div>
                    <div className={styles.domainKpiSub}>Heuristic demand engine</div>
                  </div>
                </>
              )}

              {activeTab === 'database' && (
                <>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Database Tables</span>
                      <Database size={14} color="#0284c7" />
                    </div>
                    <div className={styles.domainKpiVal}>
                      <NumberFlow value={dbStatusData?.summary?.totalTables || 27} />
                    </div>
                    <div className={styles.domainKpiSub}>DROBE production schema</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Operational Tables</span>
                      <CheckCircle2 size={14} color="#16a34a" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#16a34a' }}>
                      <NumberFlow value={dbStatusData?.summary?.onlineCount || 27} /> / {dbStatusData?.summary?.totalTables || 27}
                    </div>
                    <div className={styles.domainKpiSub}>Supabase PostgreSQL connected</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Realtime Channels</span>
                      <Zap size={14} color="#f59e0b" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#d97706' }}>6 Active</div>
                    <div className={styles.domainKpiSub}>Postgres change listeners</div>
                  </div>
                  <div className={styles.domainKpiCard}>
                    <div className={styles.domainKpiLabel}>
                      <span>Schema Integrity</span>
                      <ShieldCheck size={14} color="#10b981" />
                    </div>
                    <div className={styles.domainKpiVal} style={{ color: '#10b981' }}>
                      <NumberFlow value={dbStatusData?.summary?.healthPercentage || 100} />%
                    </div>
                    <div className={styles.domainKpiSub}>Foreign keys & RLS active</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
<motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'inwarding' && (
                <StockInwardingTab
                  inbounds={inbounds}
                  products={products}
                  brands={brands}
                  onOpenInwardModal={handleOpenInwardModal}
                  onMarkArrived={handleMarkArrived}
                  onDirectAutoInward={handleDirectAutoInward}
                  onSync={() => syncDarkstoreWithSupabase().then(() => loadAllData())}
                />
              )}

              {activeTab === 'inventory' && (
                <SkuInventoryTab
                  products={products}
                  brands={brands}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  inventoryFilter={inventoryFilter}
                  onFilterChange={(cat: string) => setInventoryFilter(cat as any)}
                  brandFilter={brandFilter}
                  onBrandFilterChange={(b: string) => setBrandFilter(b as any)}
                  onAdjustStock={handleAdjustStock}
                  onOpenBarcodeModal={handleOpenBarcodeModal}
                  onOpenInwardModal={handleOpenInwardModal}
                />
              )}

              {activeTab === 'shelves' && (
                <FloorPlanTab
                  products={products}
                  onOpenInwardModal={handleOpenInwardModal}
                />
              )}

              {activeTab === 'approvals' && (
                <BrandApprovalsTab
                  brands={brands}
                  onSelectBrandForDossier={setSelectedBrandForDossier}
                  onSelectBrandForProducts={setSelectedBrandForProducts}
                  onApproveBrand={handleApproveBrand}
                  onRejectBrand={handleRejectBrand}
                />
              )}

              {activeTab === 'trials' && (
                <DoorstepTrialsTab
                  trialOrders={trialOrders}
                  ordersFilter={ordersFilter}
                  onFilterChange={setOrdersFilter}
                  ordersSearch={ordersSearch}
                  onSearchChange={setOrdersSearch}
                  onOrderAction={handleOrderAction}
                  onMarkDelivered={handleMarkDelivered}
                  onOpenReturnModal={setReturningOrderModal}
                />
              )}

              {activeTab === 'settlement' && (
                <WholesaleSettlementTab
                  financialLedger={financialLedger as any}
                  brands={brands}
                  settledBrands={Object.keys(settledBrands || {})}
                  settlementSearch={settlementSearch}
                  onSearchChange={setSettlementSearch}
                  settlementBrandFilter={settlementBrandFilter}
                  onFilterChange={setSettlementBrandFilter}
                  onOpenPayoutModal={setSettlementModalBrand}
                  onExportCsv={handleExportSettlementCsv}
                  onSyncLedger={() => {
                    syncDarkstoreWithSupabase().then(() => loadAllData());
                    triggerToast('Syncing latest settlements with live Supabase database...');
                  }}
                />
              )}

              {activeTab === 'users' && (
                <ShopperTelemetryTab
                  userProfiles={userProfiles}
                  userActivities={userActivities}
                  usersFilter={usersFilter}
                  onFilterChange={setUsersFilter}
                  usersSearch={usersSearch}
                  onSearchChange={setUsersSearch}
                  onSelectCustomer={setSelectedCustomerModal}
                  aiReport={aiReport}
                  aiCountdown={aiCountdown}
                  isAiGenerating={isAiGenerating}
                  onRunAISynthesis={runAIShopperSynthesis}
                  onOpenCopilot={() => setCopilotModalOpen(true)}
                  onOpenApiKey={() => setApiKeyModalOpen(true)}
                  onExportUsersCsv={handleExportUsersCsv}
                />
              )}

              {activeTab === 'database' && (
                <DatabaseMatrixTab
                  dbStatusData={dbStatusData}
                  isDbStatusLoading={isDbStatusLoading}
                  dbSectionFilter={dbSectionFilter}
                  onSectionFilterChange={setDbSectionFilter}
                  copiedSql={copiedSql}
                  onCopySql={copyCompleteSql}
                  onRefresh={fetchDbStatus}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. LIGHT THEME INWARDING & SHELF ALLOCATION MODAL */}
      {inwardModalOpen && selectedProductToInward && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 800 }}>
                  AHMEDABAD DARKSTORE INWARDING
                </span>
                <h3 className={styles.modalTitle} style={{ marginTop: '4px' }}>
                  <Boxes size={18} color="#0284c7" /> Verify Stock & Allocate Warehouse Shelf
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInwardModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmInward}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedProductToInward.images && selectedProductToInward.images[0] && (
                    <img
                      src={selectedProductToInward.images[0]}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>
                      {selectedProductToInward.name}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                      Brand: <strong style={{ color: '#0284c7' }}>{selectedProductToInward.brandName}</strong> · Listed Price: {selectedProductToInward.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drobe 5% Dynamic Markup & Charm 9 Pricing Box */}
              {(() => {
                const preview = calculateDrobeMarkupPricing(inwardBasePrice || 600);
                return (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        ⚡ Drobe 5% Markup + Charm 9 Pricing Model
                      </span>
                      <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                        Auto-Rounded to Last Digit 9
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label className={styles.inputLabel} style={{ fontSize: '11px' }}>
                          Brand Base Wholesale Price (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={inwardBasePrice}
                          onChange={(e) => setInwardBasePrice(Math.max(1, Number(e.target.value)))}
                          required
                          className={styles.inputField}
                          style={{ fontWeight: 800, color: '#0f172a' }}
                        />
                        <span style={{ fontSize: '10px', color: '#64748b' }}>e.g. ₹600 set by brand</span>
                      </div>

                      <div>
                        <label className={styles.inputLabel} style={{ fontSize: '11px' }}>
                          Customer Selling Price on App (₹)
                        </label>
                        <div style={{ height: '38px', background: '#ffffff', border: '1px solid #86efac', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px', fontWeight: 900, fontSize: '15px', color: '#15803d' }}>
                          ₹{preview.sellingPrice}
                        </div>
                        <span style={{ fontSize: '10px', color: '#166534' }}>Ends in 9 (e.g. ₹629)</span>
                      </div>
                    </div>

                    {/* Exact Markup in Rupees & Decimals */}
                    <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Actual Added Markup: </span>
                        <strong style={{ color: '#15803d' }}>+₹{preview.markupAmount}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#64748b' }}>Actual Percentage: </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 900, padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          {preview.formattedPercentage} ({preview.markupPercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SEQUENTIAL SKU GENERATOR */}
              <div className={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className={styles.inputLabel}>
                    Sequential Darkstore SKU * (DR1, DR2, DR3...)
                  </label>
                  <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>
                    Auto-Calculated Next Serial
                  </span>
                </div>
                <input
                  type="text"
                  value={inwardSku}
                  onChange={(e) => setInwardSku(e.target.value)}
                  placeholder="e.g. DR1, DR2, DR3"
                  required
                  className={styles.inputField}
                  style={{ fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em' }}
                />
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px' }}>
                  This unique SKU is printed on barcode labels for rapid 30-minute order scanning.
                </div>
              </div>

              {/* PHYSICAL UNITS RECEIVED */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Physical Pieces Received & Inspected *
                </label>
                <input
                  type="number"
                  min="1"
                  value={inwardUnits}
                  onChange={(e) => setInwardUnits(Number(e.target.value))}
                  required
                  className={styles.inputField}
                />
              </div>

              {/* WAREHOUSE SHELF MATRIX ALLOCATION */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
                {/* Auto-Assigned Shelf Banner */}
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#166534', fontWeight: 800, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={13} color="#16a34a" /> AUTOMATICALLY ALLOCATED NEXT SHELF
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d', letterSpacing: '0.04em', marginTop: '2px' }}>
                      AMD-{selectedRack.replace(/\s+/g, '').toUpperCase()}-{selectedShelf.replace(/\s+/g, '').toUpperCase()}-{selectedBin.replace(/\s+/g, '').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                      Place parcel in: <strong>{selectedRack}</strong> · <strong>{selectedShelf}</strong> · <strong>{selectedBin}</strong> (Shivam Bungalows 1, Koteshwar Road)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Sequential SKU</span>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7' }}>{inwardSku || 'DR1'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', marginBottom: '10px', textTransform: 'uppercase' }}>
                  📍 Physical Warehouse Placement (Shivam Bungalows 1, Koteshwar Road)
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Warehouse Zone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className={styles.selectField}
                  >
                    <option value="Zone A - Outerwear & Heavy Silhouettes">Zone A - Outerwear & Heavy Silhouettes</option>
                    <option value="Zone B - Tops, Tees & Shirts">Zone B - Tops, Tees & Shirts</option>
                    <option value="Zone C - Bottoms & Denims">Zone C - Bottoms & Denims</option>
                    <option value="Zone D - Accessories & Footwear">Zone D - Accessories & Footwear</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className={styles.inputLabel}>Rack Number</label>
                    <select
                      value={selectedRack}
                      onChange={(e) => setSelectedRack(e.target.value)}
                      className={styles.selectField}
                    >
                      <option value="Rack A-01">Rack A-01</option>
                      <option value="Rack A-02">Rack A-02</option>
                      <option value="Rack A-03">Rack A-03</option>
                      <option value="Rack A-04">Rack A-04</option>
                      <option value="Rack B-01">Rack B-01</option>
                      <option value="Rack B-02">Rack B-02</option>
                      <option value="Rack C-01">Rack C-01</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Shelf Tier</label>
                    <select
                      value={selectedShelf}
                      onChange={(e) => setSelectedShelf(e.target.value)}
                      className={styles.selectField}
                    >
                      <option value="Shelf 1">Shelf 1 (Bottom)</option>
                      <option value="Shelf 2">Shelf 2 (Mid Level)</option>
                      <option value="Shelf 3">Shelf 3 (Eye Level)</option>
                      <option value="Shelf 4">Shelf 4 (Top Reach)</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Bin / Slot</label>
                    <select
                      value={selectedBin}
                      onChange={(e) => setSelectedBin(e.target.value)}
                      className={styles.selectField}
                    >
                      {Array.from({ length: 16 }).map((_, i) => {
                        const binNum = i < 9 ? `Bin 0${i + 1}` : `Bin ${i + 1}`;
                        return <option key={i} value={binNum}>{binNum}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '10px 14px', borderRadius: '10px', marginTop: '12px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#0369a1', fontWeight: 700 }}>
                    Assigned Warehouse Shelf Code:
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7', letterSpacing: '0.04em' }}>
                    AMD-{selectedRack.replace(/\s+/g, '').toUpperCase()}-{selectedShelf.replace(/\s+/g, '').toUpperCase()}-{selectedBin.replace(/\s+/g, '').toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setInwardModalOpen(false)}
                  className={styles.btnSecondary}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnSuccess}
                  style={{ flex: 2, justifyContent: 'center', padding: '12px', fontSize: '13px', fontWeight: 700 }}
                >
                  <CheckCircle2 size={16} /> Put in Shelf & Publish Live on Platform & App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BARCODE & THERMAL LOGISTICS LABEL MODAL */}
      {barcodeModalOpen && selectedProductForBarcode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '460px' }}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 800 }}>
                  DARKSTORE THERMAL PRINTING
                </span>
                <h3 className={styles.modalTitle} style={{ marginTop: '4px' }}>
                  <Barcode size={18} color="#0284c7" /> Packaging Barcode Label
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Realistic 4" x 2" Logistics Sticker Mockup */}
            <div className={styles.barcodeCard}>
              <div className={styles.barcodeHeaderRow}>
                <span className={styles.barcodeDrobeLogo}>DROBE</span>
                <span className={styles.barcodeHubCode}>AHMEDABAD HUB #01</span>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                DARKSTORE SEQUENTIAL SKU
              </div>
              <div className={styles.barcodeSkuHuge}>
                {selectedProductForBarcode.sku || 'DR1'}
              </div>

              <div className={styles.barcodeShelfBadge}>
                SHELF: {selectedProductForBarcode.warehouseLocation ? selectedProductForBarcode.warehouseLocation.code : 'AMD-RA02-S3-B04'}
              </div>

              {/* Vector Barcode Lines */}
              <div className={styles.barcodeGraphicLines}>
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, i) => (
                  <div key={i} className={styles.barcodeLine} style={{ width: `${w * 1.8}px` }} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-apple-mono)', fontSize: '11px', color: '#475569', letterSpacing: '0.15em', fontWeight: 700 }}>
                *{selectedProductForBarcode.sku || 'DR1'}*AMD*
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', textAlign: 'left', fontSize: '11.5px', color: '#334155', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedProductForBarcode.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                  <span>Brand: <strong>{selectedProductForBarcode.brandName}</strong></span>
                  <span style={{ fontWeight: 800, color: '#0284c7' }}>{selectedProductForBarcode.price}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  Size: {selectedProductForBarcode.volume || 'M'} · 30-Min Rapid Pick Ready
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(false)}
                className={styles.btnSecondary}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  triggerToast(`🖨️ Label sent to Zebra Thermal Printer for ${selectedProductForBarcode.sku}!`);
                }}
                className={styles.btnPrimary}
                style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
              >
                <Barcode size={16} /> Print to Thermal Printer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.5. BRAND PRODUCTS CATALOG MODAL (WIRED TO SUPABASE DB) */}
      {selectedBrandForProducts && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBrandForProducts(null)}>
          <div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '920px', width: '95vw', padding: '0', overflow: 'hidden', borderRadius: '20px' }}
          >
            {/* Modal Brand Header Banner */}
            <div 
              style={{ 
                padding: '24px 28px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffffff',
                position: 'relative'
              }}
            >
              <button 
                type="button" 
                onClick={() => setSelectedBrandForProducts(null)}
                style={{ 
                  position: 'absolute', 
                  top: '18px', 
                  right: '18px', 
                  background: 'rgba(255,255,255,0.15)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#ffffff', 
                  cursor: 'pointer' 
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {selectedBrandForProducts.profileImage ? (
                  <img 
                    src={selectedBrandForProducts.profileImage} 
                    alt={selectedBrandForProducts.name}
                    style={{ width: '60px', height: '60px', borderRadius: '16px', objectFit: 'contain', background: '#ffffff', padding: '4px', border: '2px solid rgba(255,255,255,0.2)' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px' }}>
                    {selectedBrandForProducts.name.slice(0, 1)}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      {selectedBrandForProducts.name}
                    </h2>
                    <span style={{ background: '#38bdf8', color: '#0f172a', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                      VERIFIED PARTNER
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {selectedBrandForProducts.tagline || `${selectedBrandForProducts.name} • Live in Ahmedabad Darkstore Hub #01`}
                  </p>
                </div>
              </div>

              {/* Metrics Ribbon */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                  gap: '10px', 
                  marginTop: '18px', 
                  paddingTop: '16px', 
                  borderTop: '1px solid rgba(255,255,255,0.1)' 
                }}
              >
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{currentBrandProducts.length}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Catalog SKUs</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>
                    {currentBrandProducts.reduce((sum, p) => sum + (p.inwardUnits || 0), 0)} pcs
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stored at Hub</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>30 Mins</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Express Trial</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Link 
                    href={`/brand/${slugify(selectedBrandForProducts.id || selectedBrandForProducts.name)}`}
                    target="_blank"
                    style={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.25)', border: '1px solid #38bdf8', padding: '6px 10px', borderRadius: '8px' }}
                  >
                    <span>Storefront View</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Modal Body: Products Table */}
            <div style={{ padding: '20px 24px', maxHeight: '58vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Live Products Catalog ({filteredCurrentBrandProducts.length} of {currentBrandProducts.length})
                </div>

                {/* Filter Search inside Modal */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={brandProductsSearch}
                    onChange={(e) => setBrandProductsSearch(e.target.value)}
                    placeholder="Search brand products or SKU..."
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                </div>
              </div>

              {filteredCurrentBrandProducts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', maxHeight: '55vh', overflowY: 'auto', padding: '4px' }}>
                  {filteredCurrentBrandProducts.map((p) => {
                    const img = (p.images && p.images[0]) || p.thumbnail;
                    const bp = getProductPricingInfo(p);
                    return (
                      <div 
                        key={p.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                            {img ? (
                              <img 
                                src={img} 
                                alt={p.name}
                                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}>
                                <Package size={20} />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                SKU: <strong style={{ fontFamily: 'var(--font-apple-mono)' }}>{p.sku || `DR-${p.id}`}</strong>
                              </div>
                              <span style={{ display: 'inline-block', marginTop: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: '#475569' }}>
                                {p.category || 'Apparel'}
                              </span>
                            </div>
                          </div>

                          {/* Pricing breakdown */}
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Retail Price:</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>₹{bp.sellingPrice}</span>
                                <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '1px 5px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                  {bp.formattedPercentage}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                              <span>Wholesale Base:</span>
                              <span>₹{bp.brandBasePrice} (+₹{bp.markupAmount} margin)</span>
                            </div>
                          </div>

                          {/* Shelf & Stock */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                            <span style={{ color: '#16a34a', fontWeight: 700 }}>
                              {p.inwardUnits || 32} pcs in stock
                            </span>
                            <span style={{ color: '#0284c7', fontWeight: 700, fontFamily: 'var(--font-apple-mono)' }}>
                              {p.warehouseLocation?.code || 'AMD-RA01-S1'}
                            </span>
                          </div>

                          {/* Sizes */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(p.sizes && p.sizes.length > 0 ? p.sizes : [p.volume || 'M']).map((sz: string, sIdx: number) => (
                              <span key={sIdx} style={{ background: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                                {sz}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <Link
                            href={`/product/${p.id}`}
                            target="_blank"
                            className={styles.btnSecondary}
                            style={{ flex: 1, padding: '6px 8px', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="View product on storefront"
                          >
                            <ExternalLink size={12} /> Storefront
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForBarcode(p);
                              setBarcodeModalOpen(true);
                            }}
                            className={styles.btnSecondary}
                            style={{ flex: 1, padding: '6px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="Print thermal barcode label"
                          >
                            <Barcode size={12} /> Barcode
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  <Package size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 700, color: '#475569' }}>No products found</div>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                    {brandProductsSearch ? 'Try a different search term.' : 'This brand has registered on Drobe and is awaiting stock consignment dispatch to the Ahmedabad darkstore.'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing <strong>{filteredCurrentBrandProducts.length}</strong> creations for <strong>{selectedBrandForProducts.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedBrandForProducts(null)}
                className={styles.btnSecondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. BRAND ONBOARDING DOSSIER INSPECTION MODAL */}
      {selectedBrandForDossier && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBrandForDossier(null)}>
          <div 
            className={styles.modalContent} 
            style={{ maxWidth: '820px', padding: 0, overflow: 'hidden', borderRadius: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner & Brand Identity Header */}
            <div style={{ 
              position: 'relative', 
              height: '140px', 
              background: selectedBrandForDossier.coverImage 
                ? `url(${selectedBrandForDossier.coverImage}) center/cover no-repeat` 
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start'
            }}>
              <button
                type="button"
                onClick={() => setSelectedBrandForDossier(null)}
                style={{ 
                  background: 'rgba(15, 23, 42, 0.65)', 
                  backdropFilter: 'blur(8px)',
                  border: 'none', 
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Brand Profile Meta Header */}
            <div style={{ padding: '0 28px 20px 28px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-42px', marginBottom: '14px', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                  {selectedBrandForDossier.profileImage ? (
                    <img
                      src={selectedBrandForDossier.profileImage}
                      alt={selectedBrandForDossier.name}
                      style={{ width: '84px', height: '84px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: '#ffffff' }}
                    />
                  ) : (
                    <div style={{ width: '84px', height: '84px', borderRadius: '20px', border: '4px solid #ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900 }}>
                      {selectedBrandForDossier.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {selectedBrandForDossier.name}
                      </h2>
                      <span className={`${styles.statusChip} ${selectedBrandForDossier.status === 'Approved' ? styles.statusLive : styles.statusTransit}`}>
                        {selectedBrandForDossier.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {selectedBrandForDossier.status}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                      {selectedBrandForDossier.tagline || 'Artisanal Modern Brand'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                    {selectedBrandForDossier.category}
                  </span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                    Est. {selectedBrandForDossier.establishedYear || '2024'}
                  </span>
                  <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                    📍 {selectedBrandForDossier.basedOutOf}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Body with Exhaustive Dossier Sections */}
            <div style={{ maxHeight: 'calc(88vh - 280px)', overflowY: 'auto', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: Founder Dossier & Quote */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '8px' }}>
                  Founder & Creative Direction
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                    {selectedBrandForDossier.founderName || 'Founder Name Unspecified'}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {selectedBrandForDossier.founderRole || 'Founder & Director'}
                  </span>
                </div>
                {selectedBrandForDossier.founderBio && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                    {selectedBrandForDossier.founderBio}
                  </p>
                )}
                {selectedBrandForDossier.founderQuote && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffffff', borderLeft: '3px solid #0284c7', borderRadius: '0 8px 8px 0', fontStyle: 'italic', fontSize: '12.5px', color: '#334155' }}>
                    &ldquo;{selectedBrandForDossier.founderQuote}&rdquo;
                  </div>
                )}
              </div>

              {/* Section 2: Brand Story & Mission */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '8px' }}>
                  Brand Story & Manifesto
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {selectedBrandForDossier.about || 'No brand narrative entered yet.'}
                </p>
                {selectedBrandForDossier.mission && (
                  <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Mission Statement</div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                      {selectedBrandForDossier.mission}
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Brand Core Values */}
              {selectedBrandForDossier.values && selectedBrandForDossier.values.length > 0 && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '12px' }}>
                    Core Brand Pillars & Values ({selectedBrandForDossier.values.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {selectedBrandForDossier.values.map((val, vIdx) => (
                      <div key={vIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{val.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>{val.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Contact & Digital Presence */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7', marginBottom: '12px' }}>
                  Contact & Digital Presence
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <Mail size={15} color="#0284c7" />
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Official Email</div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.email || 'concierge@brand.com'}</div>
                    </div>
                  </div>
                  {selectedBrandForDossier.inquiriesEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Mail size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Inquiries Email</div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.inquiriesEmail}</div>
                      </div>
                    </div>
                  )}
                  {selectedBrandForDossier.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Phone size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Direct Phone</div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.phone}</div>
                      </div>
                    </div>
                  )}
                  {selectedBrandForDossier.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Globe size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Official Website</div>
                        <a href={selectedBrandForDossier.website.startsWith('http') ? selectedBrandForDossier.website : `https://${selectedBrandForDossier.website}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}>
                          {selectedBrandForDossier.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedBrandForDossier.instagram && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <ExternalLink size={15} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Instagram</div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBrandForDossier.instagram}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Verified Bank & Settlement Ledger */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#047857" />
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#047857' }}>
                      Darkstore Settlement Account
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedBrandForDossier.bankAccount?.accountType || 'Current'} Account
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '6px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Account Holder</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                      {selectedBrandForDossier.bankAccount?.accountHolderName || selectedBrandForDossier.founderName || selectedBrandForDossier.name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Bank Name</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                      {selectedBrandForDossier.bankAccount?.bankName || 'HDFC Bank'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Account Number</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b', letterSpacing: '0.04em' }}>
                      {selectedBrandForDossier.bankAccount?.accountNumber ? `•••• •••• ${selectedBrandForDossier.bankAccount.accountNumber.slice(-4)}` : '•••• 8921'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>IFSC Code</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>
                      {selectedBrandForDossier.bankAccount?.ifscCode || 'HDFC0001842'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Submitted Product Catalog */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, color: '#0284c7' }}>
                    Creations Submitted ({selectedBrandForDossier.products?.length || selectedBrandForDossier.totalProductsCount || 0})
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Pending Inward Verification at Ahmedabad Darkstore
                  </span>
                </div>

                {(() => {
                  const dossierProds = (selectedBrandForDossier.products && selectedBrandForDossier.products.length > 0)
                    ? selectedBrandForDossier.products
                    : products.filter(p => {
                        const bSlug = slugify(selectedBrandForDossier.id || selectedBrandForDossier.name);
                        const bName = selectedBrandForDossier.name?.toLowerCase().trim();
                        return (p.brandId && (p.brandId === selectedBrandForDossier.id || slugify(p.brandId) === bSlug)) ||
                               (p.brandName && (p.brandName.toLowerCase().trim() === bName || slugify(p.brandName) === bSlug));
                      });

                  return dossierProds.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      {dossierProds.map((prod: any, pIdx: number) => {
                        const prodImg = (prod.images && prod.images[0]) || prod.thumbnail || prod.image;
                        return (
                          <div key={pIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {prodImg ? (
                                <img src={prodImg} alt={prod.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                  <Package size={20} />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{prod.name}</div>
                                <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '12.5px' }}>{prod.price || '₹1,499'}</div>
                              </div>
                            </div>
                            {prod.tagline && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                                {prod.tagline}
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                              <span>Size: <strong>{Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.volume || 'Standard')}</strong></span>
                              <span>Stock: <strong>{prod.inwardUnits || prod.inventory || 20} pcs</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '12.5px' }}>
                      No individual product highlights attached to dossier.
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Modal Action Footer */}
            <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedBrandForDossier(null)}
                className={styles.btnSecondary}
              >
                Close Dossier
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedBrandForDossier.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveBrand(selectedBrandForDossier.id, selectedBrandForDossier.name);
                      setSelectedBrandForDossier({
                        ...selectedBrandForDossier,
                        status: 'Approved'
                      });
                    }}
                    className={styles.btnSuccess}
                    style={{ padding: '8px 16px', fontWeight: 700 }}
                  >
                    <Check size={14} /> Approve Brand & Authorize Consignment
                  </button>
                )}
                {selectedBrandForDossier.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRejectBrand(selectedBrandForDossier.id, selectedBrandForDossier.name);
                      setSelectedBrandForDossier({
                        ...selectedBrandForDossier,
                        status: 'Rejected'
                      });
                    }}
                    className={styles.btnDanger}
                    style={{ padding: '8px 16px' }}
                  >
                    Reject Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADMIN RETURN & STOCK RESTORATION CONFIRMATION MODAL */}
      {returningOrderModal && (
        <div className={styles.modalOverlay} onClick={() => setReturningOrderModal(null)}>
          <div 
            className={styles.modalContent} 
            style={{ maxWidth: '540px', padding: '24px', borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Confirm Return &amp; Restock to Shelf
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Restores physical inventory in Supabase DB and initiates instant UPI refund
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReturningOrderModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Order & Product Summary Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '13px' }}>{returningOrderModal.orderNumber}</span>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                  100% Pre-Paid: {returningOrderModal.price}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                {returningOrderModal.productName} ({returningOrderModal.size})
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Client: <strong>{returningOrderModal.customerName}</strong> ({returningOrderModal.customerPhone}) · Source: <strong>{returningOrderModal.paymentMethod || 'UPI'}</strong>
              </div>

              {/* Items to Restock to Warehouse Shelves */}
              {returningOrderModal.items && returningOrderModal.items.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Items to Restock to Warehouse Rack ({returningOrderModal.items.filter(i => i.status === 'returned').length || 1})
                  </div>
                  {(returningOrderModal.items.filter(i => i.status === 'returned').length > 0 
                    ? returningOrderModal.items.filter(i => i.status === 'returned') 
                    : returningOrderModal.items).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', padding: '3px 0' }}>
                      <span>• {it.productName} ({it.size}) 📍 <strong>{it.shelfLocation}</strong></span>
                      <span style={{ fontWeight: 800, color: '#059669' }}>+1 Stock ({it.price})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Instant Refund Settlement */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                <span>📍 Target Rack: <strong style={{ color: '#0284c7' }}>{returningOrderModal.shelfLocation}</strong></span>
                <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                  ⚡ Instant Refund: ₹{returningOrderModal.refundAmount || returningOrderModal.price}
                </span>
              </div>
            </div>

            {/* Return Reason Selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                Doorstep Return Reason
              </label>
              <select
                value={selectedReturnReason}
                onChange={(e) => setSelectedReturnReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff',
                  color: '#0f172a'
                }}
              >
                <option value="Size / fit did not suit at doorstep">Size / fit did not suit at doorstep</option>
                <option value="Customer tried multiple sizes and kept alternate">Customer tried multiple sizes and kept alternate</option>
                <option value="Customer preferred other trial outfit">Customer preferred other trial outfit</option>
                <option value="Fabric or silhouette did not meet preference">Fabric or silhouette did not meet preference</option>
                <option value="Client changed mind on spot">Client changed mind on spot</option>
              </select>
            </div>

            {/* Custom Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                Admin Inspection &amp; Shelf Restock Notes
              </label>
              <textarea
                value={customReturnNotes}
                onChange={(e) => setCustomReturnNotes(e.target.value)}
                placeholder="Item inspected for tags, aroma, and fold condition. Ready for warehouse rack..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontFamily: 'var(--font-apple-text)',
                  resize: 'none'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setReturningOrderModal(null)}
                className={styles.btnSecondary}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleMarkReturned(returningOrderModal.id, selectedReturnReason, customReturnNotes)}
                className={styles.btnPrimary}
                style={{ background: '#059669', borderColor: '#047857', padding: '8px 18px', fontWeight: 800 }}
              >
                <CheckCircle2 size={14} /> Confirm Restock &amp; Refund ₹{returningOrderModal.refundAmount || returningOrderModal.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BRAND WHOLESALE PAYOUT DISBURSEMENT MODAL */}
      {settlementModalBrand && (
        <div className={styles.modalOverlay} onClick={() => setSettlementModalBrand(null)}>
          <div 
            className={styles.modalContent} 
            style={{ maxWidth: '580px', padding: '24px', borderRadius: '22px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    Disburse Brand Wholesale Payout
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Record commercial bank settlement voucher for units kept by customers
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettlementModalBrand(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Brand Wholesale Reconciliation Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    {settlementModalBrand.brandName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Partner ID: <code style={{ color: '#0284c7' }}>{settlementModalBrand.brandId}</code> · Category: <strong>{settlementModalBrand.category || 'Apparel'}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700 }}>
                    Wholesale Payable (B × Kept)
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
                    ₹{settlementModalBrand.wholesalePayoutDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Settlement Formula Breakdown Pill */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Reconciliation: </span>
                  <strong>{settlementModalBrand.keptUnits} units kept</strong> × Base Wholesale <strong>₹{settlementModalBrand.avgBaseWholesale || 600} (B)</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#64748b', fontSize: '10.5px' }}>Drobe Retained Markup: </span>
                  <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                    +₹{settlementModalBrand.drobeMarkup.toLocaleString('en-IN')} (+4.83%)
                  </span>
                </div>
              </div>
            </div>

            {/* Payout Reference Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Bank Settlement UTR / IMPS / Wire Reference *
                </label>
                <input
                  type="text"
                  value={payoutUtrRef}
                  onChange={(e) => setPayoutUtrRef(e.target.value)}
                  placeholder="e.g. NEFT-HDFC-9847120392"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'var(--font-apple-mono)',
                    fontWeight: 700,
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Settlement Cycle &amp; Internal Notes
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Weekly Darkstore Batch Settlement #42 · Net 7 Days"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Settlement Guarantee Notice */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: '#166534', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Zero-Risk Settlement Policy:</strong> Customers pre-paid 100% GMV at checkout. All instant customer return refunds have been cleared. This payout transfers wholesale price (<em>B</em>) with zero debt liability.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSettlementModalBrand(null)}
                className={styles.btnSecondary}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                className={styles.btnPrimary}
                style={{ background: '#059669', borderColor: '#047857', padding: '8px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={14} /> Disburse ₹{settlementModalBrand.wholesalePayoutDue.toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CUSTOMER PROFILE DEEP DIVE DOSSIER MODAL */}
      {selectedCustomerModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCustomerModal(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '95vw', padding: 0, overflow: 'hidden', borderRadius: '20px' }}
          >
            {/* Header Banner */}
            <div
              style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                position: 'relative'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCustomerModal(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {selectedCustomerModal.avatar ? (
                  <img
                    src={selectedCustomerModal.avatar}
                    alt={selectedCustomerModal.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px' }}>
                    {selectedCustomerModal.name.slice(0, 1)}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      {selectedCustomerModal.name}
                    </h2>
                    <span style={{ background: '#38bdf8', color: '#0f172a', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                      VERIFIED SHOPPER
                    </span>
                    <span style={{
                      background: selectedCustomerModal.currentStatus === 'Active Browsing' ? '#22c55e' : selectedCustomerModal.currentStatus === 'In Doorstep Trial' ? '#a855f7' : 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {selectedCustomerModal.currentStatus}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {selectedCustomerModal.email} · {selectedCustomerModal.phone} · UPI: <code>{selectedCustomerModal.upiId}</code>
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#38bdf8' }}>
                    📍 {selectedCustomerModal.hubZone} ({selectedCustomerModal.city})
                  </p>
                </div>
              </div>

              {/* Metrics Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px',
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                    ₹{selectedCustomerModal.totalSpentInr.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Spend (GMV)</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>
                    {selectedCustomerModal.totalOrdersCount} Orders
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purchase Count</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>
                    {selectedCustomerModal.doorstepTrialsCount} Trials
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Doorstep Sessions</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#c084fc' }}>
                    {selectedCustomerModal.keptRatioPercentage}%
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fitting Kept Ratio</div>
                </div>
              </div>
            </div>

            {/* Modal Body: Sizing & Telemetry Details */}
            <div style={{ padding: '20px 24px', maxHeight: '58vh', overflowY: 'auto' }}>
              {/* 1. Fashion Sizing Profile */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  👗 Fashion Sizing Matrix &amp; Cut Preferences
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Top / Upper</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>{selectedCustomerModal.topSize}</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Waist / Denim</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#7e22ce', marginTop: '2px' }}>{selectedCustomerModal.bottomSize}</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Footwear</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#b45309', marginTop: '2px' }}>{selectedCustomerModal.footwearSize}</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Silhouette Fit</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>{selectedCustomerModal.preferredFit}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {(selectedCustomerModal.preferredStyles || []).map((st, i) => (
                    <span key={i} style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🏷️ {st}
                    </span>
                  ))}
                  {(selectedCustomerModal.favouriteBrands || []).map((b, i) => (
                    <span key={i} style={{ fontSize: '11px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ⭐ {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Real-time Telemetry & Presence */}
              <div style={{ marginBottom: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  📱 Real-Time Presence &amp; Active Device Telemetry
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Current Screen:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{selectedCustomerModal.currentScreen}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Hardware Device:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{selectedCustomerModal.deviceInfo}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Last Ping:</span>
                    <div style={{ fontWeight: 800, color: '#0284c7', marginTop: '1px' }}>{selectedCustomerModal.lastActiveAt}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>IP Address:</span>
                    <div style={{ fontWeight: 800, color: '#475569', marginTop: '1px' }}>{selectedCustomerModal.ipAddress || '103.24.112.5'}</div>
                  </div>
                </div>
              </div>

              {/* 3. AI Churn & Drop-Off Diagnosis Card */}
              <div style={{
                marginBottom: '18px',
                background: selectedCustomerModal.dropoffRisk === 'Immediate Dropoff' ? '#fef2f2' : selectedCustomerModal.dropoffRisk === 'High' ? '#fff7ed' : '#f0fdf4',
                border: `1.5px solid ${selectedCustomerModal.dropoffRisk === 'Immediate Dropoff' ? '#fca5a5' : selectedCustomerModal.dropoffRisk === 'High' ? '#fdba74' : '#bbf7d0'}`,
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} color={selectedCustomerModal.dropoffRisk === 'Immediate Dropoff' ? '#dc2626' : selectedCustomerModal.dropoffRisk === 'High' ? '#ea580c' : '#16a34a'} />
                    <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      AI Hesitation &amp; Back-Off Telemetry Analysis
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: selectedCustomerModal.dropoffRisk === 'Immediate Dropoff' ? '#dc2626' : selectedCustomerModal.dropoffRisk === 'High' ? '#ea580c' : '#16a34a',
                    color: '#ffffff'
                  }}>
                    {selectedCustomerModal.dropoffRisk === 'Immediate Dropoff' ? '🚨 CRITICAL DROP-OFF RISK' : selectedCustomerModal.dropoffRisk === 'High' ? '⚠️ HIGH HESITATION' : '🟢 HEALTHY ENGAGEMENT'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', fontSize: '11.5px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Funnel Drop-Off Stage:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
                      {selectedCustomerModal.funnelDropoffStage || 'Active Browsing'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Cart at Risk:</span>
                    <div style={{ fontWeight: 800, color: '#dc2626', marginTop: '1px' }}>
                      ₹{(selectedCustomerModal.cartTotalInr || 0).toLocaleString('en-IN')} ({selectedCustomerModal.cartItemCount || 0} items)
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Dwell Time on Stage:</span>
                    <div style={{ fontWeight: 800, color: '#0284c7', marginTop: '1px' }}>
                      {selectedCustomerModal.dwellSeconds || 0} seconds
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px' }}>
                  <div style={{ fontWeight: 800, color: '#334155', marginBottom: '2px' }}>
                    Trigger Reason Identified by Telemetry:
                  </div>
                  <div style={{ color: '#0f172a', lineHeight: 1.4 }}>
                    {selectedCustomerModal.lastHesitationReason || 'Customer is actively engaging without back-off hesitation.'}
                  </div>
                </div>

                {(selectedCustomerModal.dropoffRisk === 'Immediate Dropoff' || selectedCustomerModal.dropoffRisk === 'High') && (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => triggerToast(`💬 Triggered 1-Click WhatsApp Retention Nudge with ₹150 credit to ${selectedCustomerModal.name}`)}
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={12} /> Send 1-Click WhatsApp Recovery Nudge (₹150 Credit)
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Linked Doorstep Trial Orders */}
              {(() => {
                const userOrders = trialOrders.filter(o => 
                  (o.customerPhone && o.customerPhone === selectedCustomerModal.phone) ||
                  (o.customerName && o.customerName.toLowerCase() === selectedCustomerModal.name.toLowerCase())
                );

                return (
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📦 Doorstep Fitting Orders ({userOrders.length})
                    </h4>

                    {userOrders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userOrders.map((ord) => (
                          <div key={ord.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 900, fontSize: '13px', color: '#0284c7' }}>{ord.orderNumber}</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                                  {ord.status}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                                {ord.productName} ({ord.price})
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                Shelf: <code>{ord.shelfLocation}</code> · Rider: {ord.riderName || 'Pending'}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>{ord.price}</div>
                              <div style={{ fontSize: '10px', color: '#16a34a' }}>
                                Kept: ₹{ord.keptAmount ?? 0}
                              </div>
                              {ord.refundAmount && ord.refundAmount > 0 && (
                                <div style={{ fontSize: '10px', color: '#d97706' }}>
                                  Refunded: ₹{ord.netRefundAmount ?? ord.refundAmount}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', color: '#64748b', fontSize: '12px' }}>
                        No orders recorded under this phone number yet.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedCustomerModal(null)}
                className={styles.btnSecondary}
                style={{ padding: '8px 20px', fontWeight: 700 }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI API KEY CONFIGURATION MODAL */}
      {apiKeyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setApiKeyModalOpen(false)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: '560px', padding: '24px', borderRadius: '22px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #15803d 0%, #76b900 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    Configure AI Intelligence Key
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Powers NVIDIA NIM (meta/muse-glimmer-30b), Gemini 1.5 Flash &amp; OpenAI
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  NVIDIA NIM, Google Gemini or OpenAI API Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKeyText ? 'text' : 'password'}
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="e.g. nvapi-... (NVIDIA meta/muse-glimmer-30b) or AIza... or sk-..."
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'var(--font-apple-mono)',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyText(!showApiKeyText)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  Keys are stored safely in local storage and never logged.
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', fontSize: '11.5px', color: '#166534', marginBottom: '18px', display: 'flex', gap: '8px' }}>
                <Sparkles size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>NVIDIA NIM meta/muse-glimmer-30b Active by Default:</strong> The server is pre-configured with the live NVIDIA Integrate API endpoint (<code style={{ background: '#dcfce7', padding: '1px 4px', borderRadius: '4px' }}>nvapi-Tqy0f...</code>). You can leave this blank to use the server key or enter your own custom key above.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setApiKeyModalOpen(false)}
                  className={styles.btnSecondary}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none', padding: '8px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Zap size={14} /> Save Key &amp; Trigger Pulse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. NVIDIA NIM META MUSE-GLIMMER-30B EXECUTIVE COPILOT MODAL */}
      {copilotModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCopilotModalOpen(false)}>
          <div
            className={styles.modalContent}
            style={{
              maxWidth: '780px',
              width: '94%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '24px',
              padding: '24px',
              color: '#f8fafc',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Copilot Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #76b900 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(118, 185, 0, 0.35)'
                }}>
                  <Bot size={24} color="#ffffff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                      NVIDIA NIM · meta/muse-glimmer-30b
                    </h3>
                    <span style={{
                      fontSize: '10px',
                      background: 'rgba(118, 185, 0, 0.18)',
                      color: '#76b900',
                      border: '1px solid rgba(118, 185, 0, 0.4)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 800
                    }}>
                      LIVE REASONING
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    Executive AI Reasoning Console · <code style={{ color: '#38bdf8' }}>https://integrate.api.nvidia.com/v1</code> · Max 8,192 Tokens
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCopilotModalOpen(false)}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Darkstore Telemetry Banner */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#cbd5e1' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                <span><strong>Live Context:</strong> Ahmedabad Hub · {trialOrders.length} Orders · {userProfiles.length} Shoppers · {products.length} SKUs</span>
              </div>
              <span style={{ fontSize: '10.5px', color: '#76b900', fontFamily: 'var(--font-apple-mono)', fontWeight: 700 }}>
                Temp: 1.0 · Top-P: 0.95
              </span>
            </div>

            {/* Quick Benchmark Prompt Pills */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.04em' }}>
                Quick Prompts &amp; Benchmarks:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { text: 'Which number is larger, 9.11 or 9.8?', label: '⚡ User Benchmark' },
                  { text: 'Why are shoppers backing off at the UPI checkout screen?', label: '🛒 Cart Drop-off' },
                  { text: 'Calculate wholesale settlement margins for Kept vs Returned fits', label: '💰 Wholesale Ledger' },
                  { text: 'How to reduce doorstep fitting trial anxiety in 6 minutes?', label: '⏱️ Fitting Trial' },
                  { text: 'Check low-stock SKU inventory in Zone A & Zone B', label: '📦 Inventory Restock' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCopilotPrompt(item.text);
                      handleRunCopilotQuery(item.text);
                    }}
                    disabled={copilotLoading}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      color: '#e2e8f0',
                      fontSize: '11px',
                      cursor: copilotLoading ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ color: '#76b900', fontWeight: 700, marginRight: '4px' }}>{item.label}:</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Form */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleRunCopilotQuery();
                    }
                  }}
                  placeholder="Ask meta/muse-glimmer-30b anything (e.g. Which number is larger, 9.11 or 9.8?)..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '13px',
                    fontFamily: 'var(--font-apple-text)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Press <kbd style={{ background: '#334155', color: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Ctrl + Enter</kbd> to run query
                </span>
                <button
                  type="button"
                  onClick={() => handleRunCopilotQuery()}
                  disabled={copilotLoading || !copilotPrompt.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #76b900 0%, #15803d 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: copilotLoading || !copilotPrompt.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 4px 14px rgba(118, 185, 0, 0.3)'
                  }}
                >
                  <Zap size={14} className={copilotLoading ? styles.spinAnimation : ''} />
                  <span>{copilotLoading ? 'Reasoning (meta/muse-glimmer)...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {copilotLoading && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(118, 185, 0, 0.3)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Zap size={20} color="#76b900" className={styles.spinAnimation} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                    meta/muse-glimmer-30b is generating reasoning chain &amp; final answer...
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  NVIDIA Integrate endpoint · Max 8,192 tokens · Temperature 1.0 · Top-P 0.95
                </div>
              </div>
            )}

            {/* Copilot Result Card */}
            {copilotResult && !copilotLoading && (
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '10px'
              }}>
                {/* Result Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={16} color="#76b900" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                      Model Output ({copilotResult.model || 'meta/muse-glimmer-30b'})
                    </span>
                    {copilotResult.timestamp && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        at {copilotResult.timestamp}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (copilotResult.content) {
                        navigator.clipboard.writeText(copilotResult.content);
                        setCopiedCopilotText(true);
                        setTimeout(() => setCopiedCopilotText(false), 2000);
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: copiedCopilotText ? '#4ade80' : '#cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedCopilotText ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCopilotText ? 'Copied!' : 'Copy Answer'}</span>
                  </button>
                </div>

                {/* Primary Content Output */}
                <div style={{
                  fontSize: '13.5px',
                  lineHeight: '1.65',
                  color: '#f1f5f9',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-apple-text)'
                }}>
                  {copilotResult.content}
                </div>

                {/* Deep Chain-of-Thought Reasoning Accordion */}
                {copilotResult.reasoning && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCopilotReasoning(!showCopilotReasoning)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#94a3b8',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Terminal size={13} color="#76b900" />
                        <span>View Deep Chain-of-Thought Reasoning ({copilotResult.reasoning.length} characters)</span>
                      </div>
                      {showCopilotReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showCopilotReasoning && (
                      <div style={{
                        marginTop: '10px',
                        background: '#090d16',
                        border: '1px solid #1e293b',
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-apple-mono)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '320px',
                        overflowY: 'auto'
                      }}>
                        {copilotResult.reasoning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
