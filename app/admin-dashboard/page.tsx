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
          setToastMessage('✅ Complete 27-Table SQL Schema copied! Paste in Supabase SQL editor & click Run.');
          setTimeout(() => {
            setCopiedSql(false);
            setToastMessage(null);
          }, 4500);
        }
      }
    } catch {
      setToastMessage('❌ Failed to copy SQL to clipboard.');
      setTimeout(() => setToastMessage(null), 3000);
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
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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

          <div className={styles.sidebarSectionTitle} style={{ marginTop: '12px' }}>
            External Hub Portals
          </div>

          <Link
            href="/order-portal"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}
          >
            <div className={styles.navItemLeft}>
              <Activity size={16} color="#d97706" />
              <span style={{ color: '#d97706', fontWeight: 700 }}>Hub Order Portal</span>
            </div>
            <ExternalLink size={12} color="#d97706" />
          </Link>

          <Link
            href="/delivery-partner"
            target="_blank"
            className={styles.sidebarNavItem}
            style={{ textDecoration: 'none', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}
          >
            <div className={styles.navItemLeft}>
              <Navigation size={16} color="#2563eb" />
              <span style={{ color: '#2563eb', fontWeight: 700 }}>Delivery Partner App</span>
            </div>
            <ExternalLink size={12} color="#2563eb" />
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.hubStatusPill}>
            <span className={styles.livePulseDot} />
            <span>30-Min Network Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link href="/order-portal" target="_blank" className={styles.switchBrandLink} style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
              <Package size={13} color="#d97706" />
              <span style={{ color: '#92400e', fontWeight: 700 }}>Open Hub Order Portal</span>
              <ExternalLink size={11} color="#d97706" />
            </Link>

            <Link href="/delivery-partner" target="_blank" className={styles.switchBrandLink} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <Truck size={13} color="#2563eb" />
              <span style={{ color: '#1e40af', fontWeight: 700 }}>Open Delivery App</span>
              <ExternalLink size={11} color="#2563eb" />
            </Link>

            <Link href="/brand-dashboard" target="_blank" className={styles.switchBrandLink}>
              <Store size={13} />
              <span>Open Brand Portal</span>
              <ExternalLink size={11} color="#64748b" />
            </Link>
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
              href="/order-portal"
              target="_blank"
              style={{
                textDecoration: 'none',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontWeight: 700,
                fontSize: '12px',
                padding: '7px 11px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>⚡</span>
              <span>Hub Order Portal</span>
            </Link>

            <Link
              href="/delivery-partner"
              target="_blank"
              style={{
                textDecoration: 'none',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                fontWeight: 700,
                fontSize: '12px',
                padding: '7px 11px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>🛵</span>
              <span>Delivery App</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const pending = products.find(p => p.inwardStatus !== 'Inwarded & Live') || products[0];
                handleOpenInwardModal(pending);
              }}
              className={styles.btnPrimary}
              style={{ padding: '8px 14px', fontSize: '12px', gap: '6px' }}
            >
              <Boxes size={14} /> + Inward Stock
            </button>

            <div className={styles.telemetryTag} style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>Supabase Cloud Synced</span>
            </div>

            <div className={styles.telemetryTag}>
              <Activity size={13} color="#16a34a" />
              <span>18 Delivery Partners Active · SG Highway</span>
            </div>
          </div>
        </header>

        {/* DESKTOP MAIN CANVAS */}
        <main className={styles.desktopContent}>
          {/* KPI STATS TILES (LIGHT THEME) */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Brands Awaiting Approval</div>
                <div className={styles.kpiVal} style={{ color: waitingBrandsCount > 0 ? '#d97706' : '#0f172a' }}>
                  {waitingBrandsCount}
                </div>
                <div className={styles.kpiSub}>{approvedBrandsCount} approved & listed</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
                <UserCheck size={22} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Parcels to Inward</div>
                <div className={styles.kpiVal} style={{ color: pendingInwardsCount > 0 ? '#0284c7' : '#0f172a' }}>
                  {pendingInwardsCount}
                </div>
                <div className={styles.kpiSub}>Inspect & assign shelf</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Boxes size={22} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Live SKUs on Shelves</div>
                <div className={styles.kpiVal} style={{ color: '#16a34a' }}>
                  {liveSkusCount}
                </div>
                <div className={styles.kpiSub}>Assigned DR1, DR2... on racks</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Barcode size={22} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div>
                <div className={styles.kpiLabel}>Active Doorstep Trials</div>
                <div className={styles.kpiVal} style={{ color: '#7e22ce' }}>
                  {activeTrialsCount}
                </div>
                <div className={styles.kpiSub}>Delivery partner waiting at door · On-spot return</div>
              </div>
              <div className={styles.kpiIconWrap} style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <Truck size={22} />
              </div>
            </div>
          </div>

          {/* HUB TELEMETRY RIBBON */}
          <div className={styles.hubRibbon}>
            <div className={styles.hubRibbonLeft}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.hubStatusLiveDot} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  Koteshwar Hub #01 Online
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>· Express 30-Min Radius Active</span>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

              <div className={styles.hubMetricItem}>
                <span className={styles.hubMetricLabel}>Shelf Capacity</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.hubMetricVal}>34 / 96 Shelves</span>
                  <div className={styles.capacityProgressBar}>
                    <div className={styles.capacityProgressFill} style={{ width: '35%' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>35%</span>
                </div>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

              <div className={styles.hubMetricItem}>
                <span className={styles.hubMetricLabel}>Live Consignment Value</span>
                <span className={styles.hubMetricVal} style={{ color: '#0284c7' }}>₹12,48,500</span>
              </div>

              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

              <div className={styles.hubMetricItem}>
                <span className={styles.hubMetricLabel}>30-Min SLA Rate</span>
                <span className={styles.hubMetricVal} style={{ color: '#16a34a' }}>98.6%</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={styles.btnSecondary}
                style={{ padding: '6px 12px', fontSize: '11.5px', gap: '5px' }}
              >
                <Barcode size={13} /> View Barcode Matrix
              </button>
            </div>
          </div>

          {/* TAB 1: STOCK INWARDING & PHYSICAL SHELF ALLOCATION */}
          {activeTab === 'inwarding' && (
            <div>
              {/* Inbound Parcels from Brands */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Truck size={17} color="#0284c7" />
                      Inbound Consignments Sent by Brands
                    </h3>
                    <p className={styles.sectionDesc}>
                      Physical parcels arriving at Ahmedabad Darkstore Hub #01 (Shivam Bungalows 1, Koteshwar Road). Verify parcel count and allocate shelf to publish live.
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Consignment ID</th>
                        <th>Brand Name</th>
                        <th>Creation</th>
                        <th>Units</th>
                        <th>Logistics / Courier</th>
                        <th>Dispatched</th>
                        <th>Hub Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inbounds.map((ship) => {
                        const relatedProduct = products.find(p => p.id === ship.productId || p.name === ship.productName);
                        const isVerified = ship.status === 'Verified & Shelved';

                        return (
                          <tr key={ship.id}>
                            <td style={{ fontWeight: 800, color: '#0284c7' }}>{ship.id}</td>
                            <td style={{ fontWeight: 700 }}>{ship.brandName}</td>
                            <td style={{ fontWeight: 600 }}>{ship.productName}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{ship.units} pcs</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{ship.courierPartner}</div>
                              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>{ship.trackingNumber}</div>
                            </td>
                            <td>{ship.dispatchDate}</td>
                            <td>
                              {isVerified ? (
                                <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                  <CheckCircle2 size={11} /> Shelved ({ship.assignedSku})
                                </span>
                              ) : (
                                <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                                  <Clock size={11} /> {ship.status}
                                </span>
                              )}
                            </td>
                            <td>
                              {isVerified ? (
                                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={13} /> {ship.assignedShelf}
                                </span>
                              ) : (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  {ship.status === 'In Transit' && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkArrived(ship.id, ship.productName)}
                                      className={styles.btnSecondary}
                                      style={{ padding: '5px 8px', fontSize: '11px', gap: '4px' }}
                                      title="Mark arrived at Shivam Bungalows 1, Koteshwar Road"
                                    >
                                      <Building2 size={12} color="#0284c7" /> Mark Arrived
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDirectAutoInward(ship, relatedProduct)}
                                    className={styles.btnSuccess}
                                    style={{ padding: '5px 9px', fontSize: '11px', gap: '4px', fontWeight: 700 }}
                                    title="Automatically assign next available shelf and publish live"
                                  >
                                    <Sparkles size={12} /> Auto-Assign Shelf & Live
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInwardModal(relatedProduct || {
                                      id: ship.productId,
                                      name: ship.productName,
                                      brandId: ship.brandId,
                                      brandName: ship.brandName,
                                      price: '₹1200',
                                      inventory: ship.units,
                                      inwardUnits: 0,
                                      unitsInTrial: 0,
                                      unitsSold: 0,
                                      images: [],
                                      inwardStatus: 'Received & Verifying at Hub',
                                      isLive: false
                                    }, ship)}
                                    className={styles.btnSecondary}
                                    style={{ padding: '5px 8px', fontSize: '11px', gap: '4px' }}
                                    title="Open shelf allocation details"
                                  >
                                    <CheckCircle2 size={12} /> Inspect
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Unverified Creations Awaiting Stock Arrival */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Boxes size={17} color="#0284c7" />
                      Products Awaiting Stock Inwarding
                    </h3>
                    <p className={styles.sectionDesc}>
                      Creations added by listed brands. Once physical pieces are verified at Ahmedabad Darkstore, assign sequential SKU (DR1, DR2...) and shelf location.
                    </p>
                  </div>
                </div>

                {/* DROBE 5% PLATFORM MARKUP & CHARM 9 PRICING MODEL BANNER */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                        Drobe 5% Dynamic Markup &amp; Charm 9 Pricing Model
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', maxWidth: '640px', lineHeight: 1.5 }}>
                        Brands list products at base wholesale price (e.g. ₹600). The platform adds a <strong>5% markup fee</strong> and rounds to the nearest figure ending in <strong>9</strong> (e.g. ₹600 + 5% = ₹630 → <strong>₹629</strong>, ₹621 → <strong>₹619</strong>, ₹626 → <strong>₹629</strong>). Below, admin can inspect the actual added markup and decimal percentage.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Model Rule</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#0284c7' }}>+5% → Ends in 9</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Avg Margin</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#15803d' }}>+4.88%</div>
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Product & Photos</th>
                        <th>Brand Name</th>
                        <th>Wholesale vs Selling Price (Markup)</th>
                        <th>Inward Status</th>
                        <th>Assigned SKU</th>
                        <th>Stored Warehouse Shelf</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((prod) => {
                        const isLive = prod.isLive;
                        const pricing = getProductPricingInfo(prod);

                        return (
                          <tr key={prod.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {prod.images && prod.images[0] ? (
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.name}
                                    style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                  />
                                ) : (
                                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <Package size={20} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>{prod.tagline || 'Signature Brand Item'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{prod.brandName}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '13px' }}>
                                  ₹{pricing.sellingPrice}
                                </span>
                                <span style={{ fontSize: '10px', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                  {pricing.formattedPercentage}
                                </span>
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                                Brand: <strong>₹{pricing.brandBasePrice}</strong> (+₹{pricing.markupAmount})
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Size: {prod.volume || 'Standard'}</div>
                            </td>
                            <td>
                              {isLive ? (
                                <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                  <CheckCircle2 size={11} /> Live ({prod.inwardUnits} units)
                                </span>
                              ) : (
                                <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                                  <Clock size={11} /> {prod.inwardStatus}
                                </span>
                              )}
                            </td>
                            <td>
                              {prod.sku ? (
                                <span style={{ fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>
                                  {prod.sku}
                                </span>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Pending Inward</span>
                              )}
                            </td>
                            <td>
                              {prod.warehouseLocation ? (
                                <div>
                                  <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '12px' }}>
                                    {prod.warehouseLocation.code}
                                  </span>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                                    {prod.warehouseLocation.rack} · {prod.warehouseLocation.shelf}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Not on shelf yet</span>
                              )}
                            </td>
                            <td>
                              {isLive ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInwardModal(prod)}
                                  className={styles.btnSecondary}
                                >
                                  Edit Shelf
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInwardModal(prod)}
                                  className={styles.btnSuccess}
                                >
                                  <CheckCircle2 size={13} /> Verify & Assign Shelf
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DARKSTORE SKU INVENTORY MATRIX & BARCODE STATION */}
          {activeTab === 'inventory' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <Barcode size={17} color="#0284c7" />
                    Ahmedabad Darkstore SKU Inventory & Barcode Station
                  </h3>
                  <p className={styles.sectionDesc}>
                    Live physical stock stationed on SG Highway darkstore racks. Manage sequential SKUs (DR1, DR2...), print thermal barcodes for delivery partner bags, and adjust shelf stock in real-time.
                  </p>
                </div>

                <div className={styles.filterPillGroup}>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('all')}
                    className={`${styles.filterPill} ${inventoryFilter === 'all' ? styles.filterPillActive : ''}`}
                  >
                    All SKUs ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('in_stock')}
                    className={`${styles.filterPill} ${inventoryFilter === 'in_stock' ? styles.filterPillActive : ''}`}
                  >
                    In Stock ({products.filter(p => (p.inwardUnits || 0) > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryFilter('low_stock')}
                    className={`${styles.filterPill} ${inventoryFilter === 'low_stock' ? styles.filterPillActive : ''}`}
                  >
                    Low Stock &lt; 5 pcs ({products.filter(p => (p.inwardUnits || 0) < 5 && (p.inwardUnits || 0) > 0).length})
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className={styles.lightTable}>
                  <thead>
                    <tr>
                      <th>Sequential SKU</th>
                      <th>Product Creation</th>
                      <th>Brand Partner</th>
                      <th>Warehouse Location</th>
                      <th>Stock on Shelf</th>
                      <th>Doorstep Trials</th>
                      <th>Units Sold</th>
                      <th>Barcode & Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const isLive = prod.inwardStatus === 'Inwarded & Live' || Boolean(prod.sku);
                      const isLowStock = (prod.inwardUnits || 0) < 5 && (prod.inwardUnits || 0) > 0;

                      return (
                        <tr key={prod.id}>
                          <td>
                            {prod.sku ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontWeight: 900, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', letterSpacing: '0.04em' }}>
                                  {prod.sku}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Pending SKU</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {prod.images && prod.images[0] ? (
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                />
                              ) : (
                                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={18} color="#94a3b8" />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{prod.name}</div>
                                {(() => {
                                  const pPricing = getProductPricingInfo(prod);
                                  return (
                                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                      <span>Size: {prod.volume || 'Standard'}</span>
                                      <span>·</span>
                                      <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{pPricing.sellingPrice}</span>
                                      <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                        +{pPricing.markupAmount} ({pPricing.formattedPercentage})
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#334155' }}>
                            {prod.brandName}
                          </td>
                          <td>
                            {prod.warehouseLocation ? (
                              <div>
                                <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '12px', letterSpacing: '0.03em' }}>
                                  {prod.warehouseLocation.code}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {prod.warehouseLocation.rack} · {prod.warehouseLocation.shelf} · {prod.warehouseLocation.bin}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Unallocated</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className={styles.stockAdjustWrap}>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(prod.id, -1, prod.name)}
                                  className={styles.stockAdjustBtn}
                                  title="Reduce 1 unit (shelf audit)"
                                >
                                  -
                                </button>
                                <span className={styles.stockAdjustCount}>
                                  {prod.inwardUnits || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(prod.id, 1, prod.name)}
                                  className={styles.stockAdjustBtn}
                                  title="Add 1 unit to shelf"
                                >
                                  +
                                </button>
                              </div>
                              {isLowStock && (
                                <span style={{ fontSize: '10px', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: prod.unitsInTrial ? '#7e22ce' : '#64748b', background: prod.unitsInTrial ? '#f3e8ff' : '#f8fafc', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px' }}>
                              {prod.unitsInTrial || 0} in trial
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '12px' }}>
                              {prod.unitsSold || 0} sold
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleOpenBarcodeModal(prod)}
                              className={styles.btnSecondary}
                              style={{ padding: '6px 10px', fontSize: '11.5px', gap: '5px' }}
                              title="Generate and print thermal barcode sticker"
                            >
                              <Barcode size={13} color="#0284c7" /> Print Label
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND APPROVALS */}
          {activeTab === 'approvals' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <UserCheck size={17} color="#0284c7" />
                    Brand Applications & Verification
                  </h3>
                  <p className={styles.sectionDesc}>
                    Review newly submitted brand registrations. Once approved, the brand is listed on Drobe and authorized to dispatch physical inventory to the Ahmedabad hub.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('all')}
                    className={brandFilter === 'all' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    All Brands ({brands.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('with_products')}
                    className={brandFilter === 'with_products' ? styles.btnPrimary : styles.btnSecondary}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Package size={13} /> With Products in DB ({brandsWithProductsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('awaiting_products')}
                    className={brandFilter === 'awaiting_products' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    Awaiting Stock ({brandsAwaitingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('waiting')}
                    className={brandFilter === 'waiting' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    Waiting Approval ({waitingBrandsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFilter('approved')}
                    className={brandFilter === 'approved' ? styles.btnPrimary : styles.btnSecondary}
                  >
                    Approved & Listed ({approvedBrandsCount})
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className={styles.lightTable}>
                  <thead>
                    <tr>
                      <th>Brand Name</th>
                      <th>Category</th>
                      <th>Founder & Contact</th>
                      <th>Application Date</th>
                      <th>Inventory Overview</th>
                      <th>Approval Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.map((brand) => {
                      const isApproved = brand.status === 'Approved';
                      const isWaiting = brand.status === 'Waiting for Approval';

                      return (
                        <tr key={brand.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {brand.profileImage ? (
                                <img
                                  src={brand.profileImage}
                                  alt={brand.name}
                                  style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #e2e8f0', background: '#ffffff', padding: '3px' }}
                                />
                              ) : (
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                  {brand.name.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{brand.name}</span>
                                  {brand.status === 'Approved' && (
                                    <span style={{ color: '#0284c7', fontSize: '11px' }} title="Verified Partner">✓</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {brand.basedOutOf} · ID: <code>{brand.id}</code>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                              {brand.category}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{brand.founderName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{brand.email}</div>
                          </td>
                          <td>{brand.appliedDate}</td>
                          <td>
                            <div>
                              {brand.totalProductsCount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBrandForProducts(brand);
                                    setBrandProductsSearch('');
                                  }}
                                  style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '8px',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer'
                                  }}
                                  title={`Click to inspect all ${brand.totalProductsCount} products for ${brand.name}`}
                                >
                                  <Package size={13} color="#0284c7" />
                                  <span>{brand.totalProductsCount} Products in DB</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                                  0 products (Awaiting Dispatch)
                                </span>
                              )}
                              <div style={{ fontSize: '11px', color: brand.inwardedUnitsCount > 0 ? '#16a34a' : '#64748b', fontWeight: 600, marginTop: '4px' }}>
                                {brand.inwardedUnitsCount > 0 
                                  ? `${brand.inwardedUnitsCount} pcs stored in Ahmedabad hub` 
                                  : 'No consignment on shelves yet'}
                              </div>
                            </div>
                          </td>
                          <td>
                            {isApproved ? (
                              <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                <CheckCircle2 size={11} /> Approved & Listed
                              </span>
                            ) : isWaiting ? (
                              <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                                <Clock size={11} /> Waiting for Approval
                              </span>
                            ) : (
                              <span className={`${styles.statusChip} ${styles.statusPending}`}>
                                <AlertCircle size={11} /> {brand.status}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {brand.totalProductsCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBrandForProducts(brand);
                                    setBrandProductsSearch('');
                                  }}
                                  className={styles.btnPrimary}
                                  style={{ padding: '5px 9px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: '#0284c7' }}
                                  title="View full list of live products for this brand"
                                >
                                  <Package size={12} color="#ffffff" /> View Products ({brand.totalProductsCount})
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedBrandForDossier(brand)}
                                className={styles.btnSecondary}
                                style={{ padding: '5px 9px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="View full brand dossier, founder, bank details and products"
                              >
                                <Eye size={12} color="#0284c7" /> View Dossier
                              </button>
                              <Link
                                href={`/brand/${slugify(brand.id || brand.name)}`}
                                target="_blank"
                                className={styles.btnSecondary}
                                style={{ padding: '5px 9px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                                title="Open live Brand Page on storefront"
                              >
                                <ExternalLink size={11} color="#475569" /> Storefront
                              </Link>
                              {isWaiting && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveBrand(brand.id, brand.name)}
                                    className={styles.btnSuccess}
                                    style={{ padding: '5px 9px', fontSize: '11px' }}
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectBrand(brand.id, brand.name)}
                                    className={styles.btnDanger}
                                    style={{ padding: '5px 9px', fontSize: '11px' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredBrands.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                    <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>No Brand Submissions Yet</div>
                    <p style={{ fontSize: '13px', maxWidth: '440px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
                      When brands onboard at <code>/brand-dashboard</code> and upload their company dossier, their profile, founder details, verified bank account, and creation catalog will appear here live from Supabase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WAREHOUSE FLOOR PLAN & SHELF MATRIX */}
          {activeTab === 'shelves' && (
            <div>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      <Layers size={17} color="#0284c7" />
                      Ahmedabad Central Darkstore Floor Plan & Shelf Matrix
                    </h3>
                    <p className={styles.sectionDesc}>
                      Visual matrix of designated racks at SG Highway Hub. Darkstore pickers and delivery partners can pinpoint exact shelves for 30-minute rapid pick-and-pack.
                    </p>
                  </div>
                </div>

                <div className={styles.floorGrid}>
                  {['Rack A-01', 'Rack A-02', 'Rack A-03', 'Rack B-01', 'Rack B-02', 'Rack C-01'].map((rackId, rIdx) => {
                    const rackProducts = filteredProducts.filter(p => p.warehouseLocation?.rack === rackId);

                    return (
                      <div key={rIdx} className={styles.rackCard}>
                        <div className={styles.rackHeader}>
                          <div>
                            <span className={styles.rackBadge}>{rackId}</span>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              {rackId.startsWith('Rack A') ? 'Zone A · Outerwear & Jackets' : rackId.startsWith('Rack B') ? 'Zone B · Tops & Tees' : 'Zone C · Bottoms & Denims'}
                            </div>
                          </div>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: rackProducts.length > 0 ? '#16a34a' : '#94a3b8' }}>
                            {rackProducts.length} Assigned
                          </span>
                        </div>

                        {rackProducts.length > 0 ? (
                          <div>
                            {rackProducts.map((p) => (
                              <div key={p.id} className={styles.shelfRow}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '11.5px' }}>{p.sku}</span>
                                    <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{p.name}</span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                    {p.brandName} · {p.warehouseLocation?.shelf} · {p.warehouseLocation?.bin}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0284c7' }}>
                                    {p.inwardUnits} pcs
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBarcodeModal(p)}
                                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="View Barcode"
                                  >
                                    <Barcode size={12} color="#0284c7" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                            Empty Rack Tier Available
                          </div>
                        )}

                        {/* Interactive Bin Slots (Visual Darkstore Matrix) */}
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                              Physical Shelf Slots
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 600 }}>
                              {rackProducts.length} occupied · {8 - rackProducts.length} free
                            </span>
                          </div>

                          <div className={styles.binGrid}>
                            {Array.from({ length: 8 }).map((_, bIdx) => {
                              const binName = bIdx < 9 ? `Bin 0${bIdx + 1}` : `Bin ${bIdx + 1}`;
                              const occupant = rackProducts.find(p => p.warehouseLocation?.bin === binName);
                              return (
                                <div
                                  key={bIdx}
                                  onClick={() => {
                                    if (occupant) {
                                      handleOpenBarcodeModal(occupant);
                                    } else {
                                      const unassigned = products.find(p => !p.warehouseLocation) || products[0];
                                      setSelectedRack(rackId);
                                      setSelectedBin(binName);
                                      handleOpenInwardModal(unassigned);
                                    }
                                  }}
                                  className={`${styles.binSlot} ${occupant ? styles.binSlotOccupied : ''}`}
                                  title={occupant ? `${occupant.sku}: ${occupant.name} (${occupant.inwardUnits} pcs) · Click for Barcode` : `Empty slot ${binName} · Click to allocate`}
                                >
                                  <div>{binName}</div>
                                  {occupant ? (
                                    <div style={{ fontWeight: 800, fontSize: '9.5px', color: '#047857', marginTop: '2px' }}>
                                      {occupant.sku}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                                      Free
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & RETURNS MANAGEMENT (Auto Stock Deduction & Addition) */}
          {activeTab === 'trials' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <Truck size={17} color="#0284c7" />
                    Orders & Returns Management · Live DB Auto Stock Sync
                  </h3>
                  <p className={styles.sectionDesc}>
                    Quick-commerce orders in Ahmedabad darkstore. When an order is placed or leaves the store, 1 stock unit is <strong>automatically deducted from DB inventory</strong>. If delivered &amp; kept, stock remains permanently deducted. When marked returned, <strong>+1 stock is immediately added back to the shelf in Supabase DB</strong>.
                  </p>
                </div>
              </div>

              {/* REAL-TIME DIVERTER & PORTAL SHORTCUTS */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.12))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Auto Stock Sync &amp; Doorstep Returns Active
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Orders placed by customers immediately deduct physical units from warehouse shelves. Mark returns below to instantly restore stock to the database and issue refunds.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href="/order-portal"
                    target="_blank"
                    style={{
                      background: '#d97706',
                      color: '#fff',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>📦 Hub Order Portal</span>
                  </Link>

                  <Link
                    href="/delivery-partner"
                    target="_blank"
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>🚴 Delivery Partner App</span>
                  </Link>
                </div>
              </div>

              {/* STOCK & ORDERS TELEMETRY METRICS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Orders in DB</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{trialOrders.length}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Live synchronized</div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Out / Doorstep</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>{orderCountActive + orderCountDoorstep}</div>
                  <div style={{ fontSize: '10.5px', color: '#60a5fa' }}>⚠️ Stock deducted (-1)</div>
                </div>

                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>Return In-Transit</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>{orderCountReturning}</div>
                  <div style={{ fontSize: '10.5px', color: '#a855f7' }}>↩ Heading back to hub</div>
                </div>

                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Delivered &amp; Kept</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>{orderCountKept}</div>
                  <div style={{ fontSize: '10.5px', color: '#34d399' }}>✓ Kept deducted in DB</div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Restocked to Shelf</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{orderCountRestocked}</div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e' }}>✓ +1 Stock added to DB</div>
                </div>
              </div>

              {/* FILTER BUTTONS & SEARCH BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('all')}
                    className={ordersFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    All Orders ({trialOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('active')}
                    className={ordersFilter === 'active' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Out for Delivery ({orderCountActive})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('doorstep')}
                    className={ordersFilter === 'doorstep' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Doorstep Fitting ({orderCountDoorstep})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('returning')}
                    className={ordersFilter === 'returning' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Return In-Transit ({orderCountReturning})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('kept')}
                    className={ordersFilter === 'kept' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Delivered &amp; Kept ({orderCountKept})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersFilter('restocked')}
                    className={ordersFilter === 'restocked' ? styles.filterBtnActive : styles.filterBtn}
                  >
                    Restocked ({orderCountRestocked})
                  </button>
                </div>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    placeholder="Search Order #, customer, SKU..."
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              {/* ORDERS LIST */}
              {filteredTrialOrders.length > 0 ? (
                <div className={styles.trialGrid}>
                  {filteredTrialOrders.map((ord) => {
                    const isDoorstepFitting = ord.status.includes('Doorstep Fitting');
                    const isOut = ord.status === 'Out for 30-Min Delivery';
                    const isKept = ord.status === 'Kept on Spot (Purchased)';
                    const isRiderHeadingBack = ord.status.includes('Returned on Spot');
                    const isRestocked = ord.status === 'Restocked to Warehouse Shelf';

                    const matchedProduct = products.find(p => p.id === ord.productId || p.sku === ord.productSku);
                    const prodImage = matchedProduct?.images?.[0] || matchedProduct?.thumbnail;

                    return (
                      <div key={ord.id} className={styles.trialCard} style={{ border: isRestocked ? '1px solid #bbf7d0' : isKept ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
                        {/* Card Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '14px' }}>
                              {ord.orderNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                              {ord.receivedAt || 'Today'}
                            </span>
                          </div>

                          {isDoorstepFitting ? (
                            <span className={`${styles.statusChip} ${styles.statusTrial}`}>
                              <Clock size={11} /> Partner Waiting Outside ({ord.doorstepTimerMinutesLeft || 7}m)
                            </span>
                          ) : isOut ? (
                            <span className={`${styles.statusChip} ${styles.statusTransit}`}>
                              <Truck size={11} /> Out for 30-Min Delivery
                            </span>
                          ) : isKept ? (
                            <span className={`${styles.statusChip} ${styles.statusLive}`}>
                              <CheckCircle2 size={11} /> Kept on Spot (Purchased)
                            </span>
                          ) : isRiderHeadingBack ? (
                            <span className={`${styles.statusChip} ${styles.statusPending}`}>
                              <RotateCcw size={11} /> Return In-Transit
                            </span>
                          ) : (
                            <span className={`${styles.statusChip} ${styles.statusLive}`} style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                              <CheckCircle2 size={11} /> Restocked to Shelf &amp; Refunded
                            </span>
                          )}
                        </div>

                        {/* Advance Payment & Split Decision Badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                            ⚡ 100% Pre-Paid: {ord.price}
                          </span>
                          {(ord.keptAmount !== undefined && ord.keptAmount > 0) && (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              Kept: ₹{ord.keptAmount}
                            </span>
                          )}
                          {(ord.refundAmount !== undefined && ord.refundAmount > 0) && (
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              background: ord.refundStatus === 'Refund Processed Instantly' ? '#ecfdf5' : '#fffbeb',
                              color: ord.refundStatus === 'Refund Processed Instantly' ? '#047857' : '#b45309',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: ord.refundStatus === 'Refund Processed Instantly' ? '1px solid #a7f3d0' : '1px solid #fde68a'
                            }}>
                              Refund: ₹{ord.refundAmount} {ord.refundStatus === 'Refund Processed Instantly' ? '(Credited ✓)' : '(Pending Hub)'}
                            </span>
                          )}
                        </div>

                        {/* Product & SKU Box */}
                        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {prodImage ? (
                              <img
                                src={prodImage}
                                alt={ord.productName}
                                style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                              />
                            ) : (
                              <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <Package size={22} />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ord.productName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                Brand: <strong>{ord.brandName}</strong> · Size: <strong>{ord.size}</strong> · SKU: <strong style={{ color: '#16a34a' }}>{ord.productSku}</strong>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '13.5px' }}>
                                {ord.price}
                              </div>
                            </div>
                          </div>

                          {/* Multi-Item Breakdown inside Trial Bag */}
                          {ord.items && ord.items.length > 1 && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                                Bag Outfits ({ord.items.length} Fits)
                              </div>
                              {ord.items.map((it, iIdx) => (
                                <div key={iIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{it.productName}</span>
                                    <span style={{ color: '#64748b' }}>({it.size})</span>
                                    <span style={{ color: '#0284c7', fontSize: '10px' }}>📍 {it.shelfLocation}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{it.price}</span>
                                    <span style={{
                                      fontSize: '9.5px',
                                      fontWeight: 800,
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      background: it.status === 'kept' ? '#ecfdf5' : it.status === 'returned' ? '#fef2f2' : '#f1f5f9',
                                      color: it.status === 'kept' ? '#059669' : it.status === 'returned' ? '#dc2626' : '#64748b'
                                    }}>
                                      {it.status === 'kept' ? '✓ Kept' : it.status === 'returned' ? '↩ Return' : 'In Trial'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Shelf & Location Bar */}
                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <span>📍 Shelf: <strong style={{ color: '#0284c7' }}>{ord.shelfLocation}</strong></span>
                            <span style={{ color: '#475569' }}>
                              📦 DB Stock: <strong style={{ color: (matchedProduct?.inwardUnits || 0) > 0 ? '#16a34a' : '#ef4444' }}>{matchedProduct?.inwardUnits ?? '—'} pcs</strong> on shelf
                            </span>
                          </div>
                        </div>

                        {/* LIVE STOCK STATUS BANNER */}
                        <div style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isRestocked 
                            ? '#ecfdf5' 
                            : isKept 
                            ? '#f0fdf4' 
                            : isRiderHeadingBack 
                            ? '#faf5ff' 
                            : '#eff6ff',
                          color: isRestocked 
                            ? '#047857' 
                            : isKept 
                            ? '#15803d' 
                            : isRiderHeadingBack 
                            ? '#7e22ce' 
                            : '#1d4ed8',
                          border: isRestocked 
                            ? '1px solid #a7f3d0' 
                            : isKept 
                            ? '1px solid #bbf7d0' 
                            : isRiderHeadingBack 
                            ? '1px solid #e9d5ff' 
                            : '1px solid #bfdbfe'
                        }}>
                          {isRestocked ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>✓ Stock Added Back (+1 Unit to DB) · Restored to shelf {ord.shelfLocation}</span>
                            </>
                          ) : isKept ? (
                            <>
                              <Check size={13} />
                              <span>✓ Stock Kept Deducted · Purchase finalized in Supabase DB</span>
                            </>
                          ) : isRiderHeadingBack ? (
                            <>
                              <RotateCcw size={13} />
                              <span>↩ Return In-Transit · Sealed in tamper bag, awaiting hub shelf restock</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={13} />
                              <span>⚠️ Stock Deducted (-1 Unit) · Physically leaves warehouse with delivery partner</span>
                            </>
                          )}
                        </div>

                        {/* Customer & Delivery Partner Details */}
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px', lineHeight: 1.5 }}>
                          <div><strong>Client:</strong> {ord.customerName} ({ord.customerPhone || '+91 98250 88123'})</div>
                          <div style={{ color: '#475569', fontSize: '11px' }}>{ord.customerAddress}</div>
                          <div style={{ marginTop: '4px' }}><strong>Delivery Partner:</strong> {ord.riderName || 'Meet Dave'} ({ord.riderVehicle || 'Ather 450X'})</div>
                        </div>

                        {/* Refund status badge */}
                        {ord.instantRefundStatus && (
                          <div style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                            ⚡ <strong>Refund:</strong> {ord.instantRefundStatus}
                          </div>
                        )}

                        {ord.returnReason && (
                          <div style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', marginBottom: '10px' }}>
                            <strong>Return Reason:</strong> {ord.returnReason}
                          </div>
                        )}

                        {/* ADMIN ORDER ACTION BUTTONS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          {/* If not restocked yet, give Admin option to mark Returned & Restock */}
                          {!isRestocked && (
                            <button
                              type="button"
                              onClick={() => {
                                setReturningOrderModal(ord);
                                setSelectedReturnReason(ord.returnReason || 'Size / fit did not suit at doorstep');
                                setCustomReturnNotes('');
                              }}
                              className={styles.btnPrimary}
                              style={{
                                background: '#059669',
                                borderColor: '#047857',
                                justifyContent: 'center',
                                padding: '8px 12px',
                                fontSize: '11.5px',
                                fontWeight: 800
                              }}
                              title="Mark as Returned, issue refund, and add +1 stock back to darkstore shelf in DB"
                            >
                              <RotateCcw size={13} />
                              <span>Mark as Returned &amp; Restock (+1 Stock to DB)</span>
                            </button>
                          )}

                          {/* Quick delivery / kept button if order is active or doorstep */}
                          {(isDoorstepFitting || isOut) && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleMarkDelivered(ord.id)}
                                className={styles.btnSuccess}
                                style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
                                title="Client completes doorstep trial and keeps garment. Keeps stock deducted."
                              >
                                <Check size={12} /> Mark Delivered &amp; Kept
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOrderAction(ord.id, 'Returned on Spot (Delivery Partner Heading to Hub)')}
                                className={styles.btnDanger}
                                style={{ flex: 1, justifyContent: 'center', fontSize: '11px' }}
                                title="Handed back to delivery partner at doorstep"
                              >
                                <RotateCcw size={12} /> Return to Partner
                              </button>
                            </div>
                          )}

                          {/* If delivery partner is heading back, direct 1-click restock & instant refund */}
                          {isRiderHeadingBack && (
                            <button
                              type="button"
                              onClick={() => handleMarkReturned(ord.id, ord.returnReason || 'Doorstep return', 'Delivery partner reached hub dispatch bay')}
                              className={styles.btnPrimary}
                              style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', fontWeight: 800, background: '#059669', borderColor: '#047857' }}
                            >
                              <CheckCircle2 size={13} /> Partner Reached Hub · Restock &amp; Refund ₹{ord.refundAmount || ord.price} Instantly
                            </button>
                          )}

                          {/* Footer links: Storefront & Barcode */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <Link
                              href={`/product/${ord.productId}`}
                              target="_blank"
                              style={{ fontSize: '11px', color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              <ExternalLink size={11} /> View on Storefront
                            </Link>
                            {matchedProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductForBarcode(matchedProduct);
                                  setBarcodeModalOpen(true);
                                }}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Barcode size={11} /> Barcode
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Package size={36} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 700, color: '#475569' }}>No orders found matching filter</div>
                  <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                    {ordersSearch ? 'Try a different search query or clear the filter.' : 'All incoming orders from customer checkout will appear here with automated stock sync.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BRAND WHOLESALE SETTLEMENT & MARGIN LEDGER */}
          {activeTab === 'settlement' && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader} style={{ flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                  <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={18} color="#059669" />
                    Brand Wholesale Settlement &amp; Platform Margin Ledger
                  </h3>
                  <p className={styles.sectionDesc}>
                    Dual-entry accounting view for Drobe hub administrators. Reconciles 100% upfront pre-paid GMV, instant customer return refunds, net wholesale payouts due to brand partners (<em>B</em> × units kept), and Drobe&apos;s retained 5% dynamic markup fee (+4.83% avg net margin).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleExportSettlementCsv}
                    className={styles.btnSecondary}
                    style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 800, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={13} color="#0284c7" /> Export Settlement CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      syncDarkstoreWithSupabase().then(() => loadAllData());
                      triggerToast('Syncing latest settlements with live Supabase database...');
                    }}
                    className={styles.btnSecondary}
                    style={{ fontSize: '11.5px', padding: '7px 12px' }}
                  >
                    <RotateCcw size={12} /> Sync DB Ledger
                  </button>
                </div>
              </div>

              {/* 1. TOP 4 EXECUTIVE KPI CARDS */}
              <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '20px' }}>
                {/* KPI 1: Advance GMV */}
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #0284c7' }}>
                  <div>
                    <div className={styles.kpiLabel}>Total Advance GMV Collected</div>
                    <div className={styles.kpiVal} style={{ color: '#0284c7' }}>
                      ₹{financialLedger.totalAdvanceGMV.toLocaleString('en-IN')}
                    </div>
                    <div className={styles.kpiSub}>100% Pre-funded prior to dispatch</div>
                  </div>
                  <div className={styles.kpiIconWrap} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <Wallet size={20} />
                  </div>
                </div>

                {/* KPI 2: Instant Refunds */}
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div>
                    <div className={styles.kpiLabel}>Instant Customer Refunds</div>
                    <div className={styles.kpiVal} style={{ color: '#d97706' }}>
                      ₹{financialLedger.totalInstantRefunds.toLocaleString('en-IN')}
                    </div>
                    <div className={styles.kpiSub}>{financialLedger.totalUnitsReturned} returned pieces credited to UPI</div>
                  </div>
                  <div className={styles.kpiIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
                    <RotateCcw size={20} />
                  </div>
                </div>

                {/* KPI 3: Net Brand Payouts Due (B x kept) */}
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #6366f1' }}>
                  <div>
                    <div className={styles.kpiLabel}>Net Brand Payouts Due</div>
                    <div className={styles.kpiVal} style={{ color: '#4f46e5' }}>
                      ₹{financialLedger.totalBrandPayoutsDue.toLocaleString('en-IN')}
                    </div>
                    <div className={styles.kpiSub}>Formula: B × {financialLedger.totalUnitsKept} kept units</div>
                  </div>
                  <div className={styles.kpiIconWrap} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                    <Building2 size={20} />
                  </div>
                </div>

                {/* KPI 4: Drobe Net Platform Earnings */}
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #10b981', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
                  <div>
                    <div className={styles.kpiLabel} style={{ color: '#166534', fontWeight: 800 }}>
                      ⚡ Net Platform Earnings
                    </div>
                    <div className={styles.kpiVal} style={{ color: '#15803d' }}>
                      +₹{financialLedger.netPlatformEarnings.toLocaleString('en-IN')}
                    </div>
                    <div className={styles.kpiSub} style={{ color: '#166534', fontWeight: 700 }}>
                      +{financialLedger.avgMarkupPct}% Markup (+₹{financialLedger.totalDrobeMarkupEarnings}) {financialLedger.totalOvertimeFees > 0 ? `+ ₹${financialLedger.totalOvertimeFees} OT` : ''}
                    </div>
                  </div>
                  <div className={styles.kpiIconWrap} style={{ background: '#dcfce7', color: '#15803d' }}>
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              {/* 2. DROBE BUSINESS & PRICING MODEL BANNER */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                      Drobe 5% Platform Markup &amp; Wholesale Payout Architecture
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: '16px' }}>
                      Brands sell garments at Base Wholesale <strong>B</strong> (e.g. ₹600). Drobe adds 5% markup rounded to Charm 9 (Retail: <strong>₹629</strong>).
                      When a garment is kept, <strong>₹600</strong> is disbursed to the brand partner while Drobe retains <strong>+₹29 (+4.83%)</strong> as net service revenue.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', border: '1px solid #86efac' }}>
                    Conversion: {financialLedger.conversionRate}% Kept
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', border: '1px solid #7dd3fc' }}>
                    {financialLedger.totalUnitsKept} Kept / {financialLedger.totalUnitsDispatched} Dispatched
                  </span>
                </div>
              </div>

              {/* 3. BRAND WHOLESALE SETTLEMENT TABLE */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      Brand Partner Payout Ledger ({financialLedger.brandLedgerRows.length} Brands)
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                      Wholesale base disbursements due to partner labels calculated per kept SKU on doorstep fittings.
                    </p>
                  </div>

                  {/* Search within brands */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={settlementSearch}
                        onChange={(e) => setSettlementSearch(e.target.value)}
                        placeholder="Filter brand label..."
                        style={{
                          padding: '6px 10px 6px 30px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '11.5px',
                          width: '180px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Brand Label</th>
                        <th>Trial Dispatches</th>
                        <th>Kept vs Returned (Ratio)</th>
                        <th>Base Wholesale (B)</th>
                        <th>Net Brand Payout Due (B × Kept)</th>
                        <th>Drobe 5% Markup Retained</th>
                        <th>Settlement Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialLedger.brandLedgerRows
                        .filter(b => !settlementSearch || b.brandName.toLowerCase().includes(settlementSearch.toLowerCase()) || b.brandId.includes(settlementSearch.toLowerCase()))
                        .map((b) => {
                          const isSettled = !!settledBrands[b.brandId];
                          const keptRatio = b.dispatchedUnits > 0 ? Math.round((b.keptUnits / b.dispatchedUnits) * 100) : 0;

                          return (
                            <tr key={b.brandId}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px' }}>
                                    {b.brandName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>
                                      {b.brandName}
                                    </div>
                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                      {b.category || 'Apparel'} · ID: <span style={{ fontFamily: 'monospace' }}>{b.brandId}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                                  {b.dispatchedUnits} units
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                  Gross GMV: ₹{b.grossGmv.toLocaleString('en-IN')}
                                </div>
                              </td>

                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px' }}>
                                    {b.keptUnits} Kept
                                  </span>
                                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px' }}>
                                    {b.returnedUnits} Ret
                                  </span>
                                </div>
                                <div style={{ width: '100px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${keptRatio}%`, height: '100%', background: '#10b981' }} />
                                </div>
                              </td>

                              <td>
                                <div style={{ fontWeight: 700, color: '#334155', fontSize: '12px' }}>
                                  ₹{b.avgBaseWholesale}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                  per kept garment
                                </div>
                              </td>

                              <td>
                                <div style={{ fontWeight: 900, fontSize: '13.5px', color: b.wholesalePayoutDue > 0 ? (isSettled ? '#059669' : '#1e40af') : '#64748b' }}>
                                  ₹{b.wholesalePayoutDue.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                  {b.keptUnits} units × ₹{b.avgBaseWholesale}
                                </div>
                              </td>

                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ fontWeight: 800, color: '#047857', fontSize: '12px' }}>
                                    +₹{b.drobeMarkup.toLocaleString('en-IN')}
                                  </span>
                                  <span style={{ fontSize: '9px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', border: '1px solid #86efac' }}>
                                    +4.83%
                                  </span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                  Drobe Retained Fee
                                </div>
                              </td>

                              <td>
                                {isSettled ? (
                                  <div>
                                    <span style={{ fontSize: '10px', fontWeight: 900, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <span>✓ Disbursed</span>
                                    </span>
                                    <div style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                                      {settledBrands[b.brandId].utr}
                                    </div>
                                  </div>
                                ) : b.wholesalePayoutDue > 0 ? (
                                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
                                    <span>Ready for Transfer</span>
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
                                    Zero Balance Due
                                  </span>
                                )}
                              </td>

                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  {b.wholesalePayoutDue > 0 && !isSettled ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSettlementModalBrand(b);
                                        setPayoutUtrRef(`NEFT-DRB-${Date.now().toString().slice(-6)}`);
                                      }}
                                      className={styles.btnPrimary}
                                      style={{ padding: '5px 10px', fontSize: '11px', background: '#0284c7', borderColor: '#0369a1', fontWeight: 800 }}
                                    >
                                      Disburse ₹{b.wholesalePayoutDue.toLocaleString('en-IN')}
                                    </button>
                                  ) : isSettled ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerToast(`Settlement Record: ₹${settledBrands[b.brandId].amount} transferred on ${settledBrands[b.brandId].date} (Ref: ${settledBrands[b.brandId].utr})`);
                                      }}
                                      className={styles.btnSecondary}
                                      style={{ padding: '5px 8px', fontSize: '10.5px' }}
                                    >
                                      View Voucher
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. ITEMIZED ORDER-BY-ORDER SETTLEMENT AUDIT LOG */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      Itemized Order Settlement Audit Log ({trialOrders.length} Orders)
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                      Transaction ledger displaying exact GMV pre-paid, customer refund disbursed, brand wholesale share, and Drobe platform markup for each doorstep fitting session.
                    </p>
                  </div>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Order &amp; Customer</th>
                        <th>Trial Items &amp; Split Decision</th>
                        <th>Advance Pre-Paid (GMV)</th>
                        <th>Instant Refund Disbursed</th>
                        <th>Overtime Fee</th>
                        <th>Brand Wholesale Due (B)</th>
                        <th>Drobe Platform Markup</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialOrders.map((ord) => {
                        const items = ord.items && ord.items.length > 0 ? ord.items : [];
                        const advance = ord.advancePaidAmount ?? (parseFloat(ord.price.replace(/[^0-9.]/g, '')) || 0);
                        const refund = ord.netRefundAmount ?? ord.refundAmount ?? 0;
                        const otFee = ord.overtimeFee || 0;
                        const keptItems = items.filter(it => it.status === 'kept');
                        const brandWholesale = keptItems.reduce((acc, it) => {
                          const p = getProductPricingInfo(it);
                          return acc + (p.brandBasePrice || Math.round(it.priceNum / 1.05));
                        }, 0);
                        const drobeMarkup = keptItems.reduce((acc, it) => {
                          const p = getProductPricingInfo(it);
                          return acc + (p.markupAmount || (it.priceNum - Math.round(it.priceNum / 1.05)));
                        }, 0);

                        return (
                          <tr key={ord.id}>
                            <td>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '12.5px' }}>
                                {ord.orderNumber}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {ord.customerName} · <span style={{ color: '#0284c7' }}>{ord.customerPhone}</span>
                              </div>
                            </td>

                            <td>
                              {items.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  {items.map((it, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px' }}>
                                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{it.productName}</span>
                                      <span style={{ color: '#64748b' }}>({it.price})</span>
                                      <span style={{
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        padding: '1px 5px',
                                        borderRadius: '3px',
                                        background: it.status === 'kept' ? '#ecfdf5' : it.status === 'returned' ? '#fef2f2' : '#f1f5f9',
                                        color: it.status === 'kept' ? '#059669' : it.status === 'returned' ? '#dc2626' : '#64748b'
                                      }}>
                                        {it.status === 'kept' ? '✓ Kept' : it.status === 'returned' ? '↩ Return' : 'In Trial'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#0f172a' }}>
                                  {ord.productName} ({ord.price})
                                </div>
                              )}
                            </td>

                            <td>
                              <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '12.5px' }}>
                                ₹{advance}
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                                100% Upfront Deposit
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 800, color: refund > 0 ? '#d97706' : '#94a3b8', fontSize: '12px' }}>
                                {refund > 0 ? `₹${refund}` : '₹0'}
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                                {ord.refundStatus || 'No Refund'}
                              </div>
                            </td>

                            <td>
                              {otFee > 0 ? (
                                <div style={{ color: '#dc2626', fontWeight: 800, fontSize: '11.5px' }}>
                                  +₹{otFee} ({ord.overtimeMinutes || 1}m)
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>₹0</span>
                              )}
                            </td>

                            <td>
                              <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '12.5px' }}>
                                ₹{brandWholesale}
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                                {keptItems.length} kept × B
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 800, color: '#059669', fontSize: '12px' }}>
                                  +₹{drobeMarkup}
                                </span>
                                {drobeMarkup > 0 && (
                                  <span style={{ fontSize: '9px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 4px', borderRadius: '3px' }}>
                                    +4.83%
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: ord.status === 'Restocked to Warehouse Shelf' ? '#ecfdf5' : '#f0f9ff',
                                color: ord.status === 'Restocked to Warehouse Shelf' ? '#047857' : '#0369a1',
                                border: '1px solid',
                                borderColor: ord.status === 'Restocked to Warehouse Shelf' ? '#a7f3d0' : '#bae6fd'
                              }}>
                                {ord.status === 'Restocked to Warehouse Shelf' ? 'Settled & Restocked' : ord.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOMER PROFILES & REAL-TIME LIVE ACTIVITY TELEMETRY */}
          {activeTab === 'users' && (
            <div>
              {/* Header Ribbon & Control Bar */}
              <div className={styles.sectionCard} style={{ marginBottom: '16px' }}>
                <div className={styles.sectionHeader} style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.hubStatusLiveDot} />
                      <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
                        <Users size={18} color="#0284c7" />
                        Customer Intelligence & Live Activity Telemetry
                      </h3>
                      <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                        Live Supabase Sync
                      </span>
                    </div>
                    <p className={styles.sectionDesc} style={{ marginTop: '4px' }}>
                      Real-time database monitor of registered shoppers on DROBE, sizing profiles, doorstep trial conversion metrics, live screen presence, and real-time activity stream.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setCopilotModalOpen(true)}
                      className={styles.btnSecondary}
                      style={{
                        padding: '7px 13px',
                        fontSize: '11.5px',
                        gap: '6px',
                        background: '#0f172a',
                        borderColor: '#334155',
                        color: '#76b900',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(118, 185, 0, 0.25)'
                      }}
                      title="Open NVIDIA Meta Muse-Glimmer AI Reasoning Console"
                    >
                      <Bot size={14} color="#76b900" />
                      <span>NVIDIA AI Copilot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setApiKeyModalOpen(true)}
                      className={styles.btnSecondary}
                      style={{ padding: '7px 12px', fontSize: '11.5px', gap: '6px', background: aiApiKey ? '#f0fdf4' : '#fffbeb', borderColor: aiApiKey ? '#86efac' : '#fde68a', color: aiApiKey ? '#15803d' : '#92400e', fontWeight: 800 }}
                      title="Configure AI API Key for 2-Minute Drop-off Intelligence"
                    >
                      <KeyRound size={14} color={aiApiKey ? '#16a34a' : '#d97706'} />
                      <span>{aiApiKey ? 'AI Key Active' : 'Provide AI Key'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => runAIShopperSynthesis()}
                      disabled={isAiGenerating}
                      className={styles.btnPrimary}
                      style={{ padding: '7px 14px', fontSize: '11.5px', gap: '6px', fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
                      title="Run on-demand AI analysis of why shoppers are dropping off"
                    >
                      <Zap size={14} className={isAiGenerating ? styles.spinAnimation : ''} />
                      <span>{isAiGenerating ? 'Synthesizing...' : 'Run AI Pulse Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportUsersCsv}
                      className={styles.btnSecondary}
                      style={{ padding: '7px 12px', fontSize: '11.5px', gap: '6px', fontWeight: 700 }}
                    >
                      <Download size={14} />
                      <span>Export Shoppers CSV</span>
                    </button>
                  </div>
                </div>

                {/* 4 Dedicated Telemetry KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginTop: '16px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Total Registered Shoppers
                      </span>
                      <Users size={16} color="#0284c7" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                      {totalRegisteredUsers}
                    </div>
                    <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                      Ahmedabad Hub Network
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                        Active Online Now
                      </span>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
                      {onlineUsersCount}
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                      Browsing catalog or in fitting
                    </div>
                  </div>

                  <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>
                        In Doorstep Trial Window
                      </span>
                      <Truck size={16} color="#9333ea" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#7e22ce', marginTop: '4px' }}>
                      {doorstepUsersCount}
                    </div>
                    <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 600, marginTop: '2px' }}>
                      6-min fitting trial with delivery partner waiting outside
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>
                        Platform Kept Ratio
                      </span>
                      <TrendingUp size={16} color="#d97706" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
                      {(userProfiles.reduce((acc, u) => acc + (u.keptRatioPercentage || 0), 0) / (userProfiles.length || 1)).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                      ₹{userProfiles.reduce((acc, u) => acc + (u.totalSpentInr || 0), 0).toLocaleString('en-IN')} cumulative spend
                    </div>
                  </div>
                </div>
              </div>

              {/* AI SHOPPER INTELLIGENCE COMMAND CENTER: 2-MINUTE HEARTBEAT PULSE & DROP-OFF DIAGNOSIS */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e1b4b 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  marginBottom: '18px',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 900,
                        padding: '3px 9px',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        letterSpacing: '0.04em'
                      }}>
                        <Sparkles size={12} /> AI BEHAVIORAL INTELLIGENCE
                      </span>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                        Shopper Drop-Off &amp; Hesitation Radar
                      </h3>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      Synthesizing why shoppers are backing off, out-of-stock friction points, and doorstep trial hesitation every 2 minutes.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* 2-Min Live Countdown Ticker */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: '12px',
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em' }}>
                          Next 2-Min AI Pulse
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                          {formatCountdown(aiCountdown)}
                        </span>
                      </div>
                    </div>

                    {/* NVIDIA Copilot Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setCopilotModalOpen(true)}
                      style={{
                        background: 'rgba(118, 185, 0, 0.15)',
                        border: '1px solid rgba(118, 185, 0, 0.45)',
                        color: '#76b900',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 10px rgba(118, 185, 0, 0.15)'
                      }}
                      title="Open NVIDIA Meta Muse-Glimmer Reasoning Copilot"
                    >
                      <Bot size={13} color="#76b900" />
                      <span>NVIDIA AI Copilot</span>
                    </button>

                    {/* Configure Key Button */}
                    <button
                      type="button"
                      onClick={() => setApiKeyModalOpen(true)}
                      style={{
                        background: aiApiKey ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        border: `1px solid ${aiApiKey ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                        color: aiApiKey ? '#4ade80' : '#e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <KeyRound size={13} />
                      <span>{aiApiKey ? 'AI Key Active' : 'Provide AI Key'}</span>
                    </button>

                    {/* Run Now Trigger Button */}
                    <button
                      type="button"
                      onClick={() => runAIShopperSynthesis()}
                      disabled={isAiGenerating}
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                        opacity: isAiGenerating ? 0.7 : 1
                      }}
                    >
                      <RefreshCw size={13} className={isAiGenerating ? styles.spinAnimation : ''} />
                      <span>{isAiGenerating ? 'Analyzing Telemetry...' : '⚡ Run AI Pulse Now'}</span>
                    </button>
                  </div>
                </div>

                {/* Executive Summary Banner */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bot size={15} color="#818cf8" />
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#818cf8', fontWeight: 800 }}>
                        Executive Diagnostic Briefing
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b', background: 'rgba(0, 0, 0, 0.3)', padding: '2px 8px', borderRadius: '10px' }}>
                      Model: <span style={{ color: '#38bdf8' }}>{aiReport.modelUsed}</span> · Synced {aiReport.timestamp}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.55, color: '#e2e8f0', fontWeight: 500 }}>
                    {aiReport.executiveSummary}
                  </p>
                </div>

                {/* 3-Column Diagnostic Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {/* Panel 1: Why Shoppers Back Off (Root Causes) */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={15} color="#f87171" />
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Why Shoppers Back Off
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
                        {aiReport.dropoffRootCauses.length} Bottlenecks
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {aiReport.dropoffRootCauses.map((rc, idx) => (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#ffffff' }}>
                              {rc.user}
                            </span>
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: rc.riskLevel === 'Critical' ? '#7f1d1d' : rc.riskLevel === 'High' ? '#7c2d12' : '#713f12',
                              color: rc.riskLevel === 'Critical' ? '#fecaca' : rc.riskLevel === 'High' ? '#fed7aa' : '#fef08a'
                            }}>
                              {rc.riskLevel}
                            </span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, marginBottom: '2px' }}>
                            📍 Funnel Stage: {rc.stage}
                          </div>
                          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.35 }}>
                            {rc.trigger}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 2: Recommended Tactical Actions */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={15} color="#4ade80" />
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Tactical Interventions
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
                        {aiReport.recommendedActions.length} Suggested
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {aiReport.recommendedActions.map((act, idx) => (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 10px' }}>
                          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#4ade80', marginBottom: '2px' }}>
                            🎯 Target: {act.target}
                          </div>
                          <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600, lineHeight: 1.35 }}>
                            {act.action}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                            ⚡ Impact: {act.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 3: Live Shopper Intent Radar */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(129, 140, 248, 0.25)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={15} color="#818cf8" />
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Shopper Intent Radar
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(129, 140, 248, 0.2)', color: '#c7d2fe', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
                        {aiReport.liveTrafficCount} Monitored
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                          <span style={{ color: '#4ade80' }}>🟢 High Purchase Intent</span>
                          <span>{aiReport.shopperIntentBreakdown.highIntentCount} shoppers ({aiReport.shopperIntentBreakdown.highIntentPct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${aiReport.shopperIntentBreakdown.highIntentPct}%`, height: '100%', background: '#22c55e' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                          <span style={{ color: '#f87171' }}>🔴 At-Risk of Dropping Off</span>
                          <span>{aiReport.shopperIntentBreakdown.atRiskDropoffCount} shoppers ({aiReport.shopperIntentBreakdown.atRiskPct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${aiReport.shopperIntentBreakdown.atRiskPct}%`, height: '100%', background: '#ef4444' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                          <span style={{ color: '#38bdf8' }}>🔵 Window / Casual Browsing</span>
                          <span>{aiReport.shopperIntentBreakdown.windowShoppersCount} shoppers</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(10, 100 - aiReport.shopperIntentBreakdown.highIntentPct - aiReport.shopperIntentBreakdown.atRiskPct)}%`, height: '100%', background: '#38bdf8' }} />
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: '#c084fc' }}>{aiReport.activeDoorstepTrials}</div>
                          <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>Doorstep Trials Active</div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: '#fbbf24' }}>
                            ₹{userProfiles.filter(u => u.dropoffRisk === 'High' || u.dropoffRisk === 'Immediate Dropoff').reduce((acc, u) => acc + (u.cartTotalInr || 0), 0).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>Cart Value at Risk</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Column Split Layout: Shoppers Directory Table (Left) + Live Telemetry Stream (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(360px, 1.2fr)', gap: '16px', alignItems: 'start' }}>
                {/* LEFT: Customer Profiles Directory */}
                <div className={styles.sectionCard} style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setUsersFilter('all')}
                        className={`${styles.filterBtn} ${usersFilter === 'all' ? styles.filterBtnActive : ''}`}
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                      >
                        All Shoppers ({userProfiles.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsersFilter('online')}
                        className={`${styles.filterBtn} ${usersFilter === 'online' ? styles.filterBtnActive : ''}`}
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                        Online Now ({onlineUsersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsersFilter('trial')}
                        className={`${styles.filterBtn} ${usersFilter === 'trial' ? styles.filterBtnActive : ''}`}
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                      >
                        In Fitting Trial ({doorstepUsersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsersFilter('offline')}
                        className={`${styles.filterBtn} ${usersFilter === 'offline' ? styles.filterBtnActive : ''}`}
                        style={{ padding: '5px 10px', fontSize: '11.5px' }}
                      >
                        Offline ({userProfiles.filter(u => u.currentStatus === 'Offline').length})
                      </button>
                    </div>

                    {/* Filter Search Input */}
                    <div style={{ position: 'relative', width: '240px' }}>
                      <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        placeholder="Search name, phone, size..."
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 30px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '11.5px',
                          outline: 'none',
                          background: '#f8fafc'
                        }}
                      />
                    </div>
                  </div>

                  {/* Customer Profiles Directory Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.lightTable}>
                      <thead>
                        <tr>
                          <th>Shopper Profile</th>
                          <th>Fashion Sizing</th>
                          <th>⚠️ Drop-Off Risk &amp; Reason</th>
                          <th>Live Status &amp; Screen</th>
                          <th>Spend &amp; Kept Ratio</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUserProfiles.map((u) => {
                          const isOnline = u.currentStatus === 'Active Browsing';
                          const isInTrial = u.currentStatus === 'In Doorstep Trial';

                          return (
                            <tr key={u.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {u.avatar ? (
                                    <img
                                      src={u.avatar}
                                      alt={u.name}
                                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                                    />
                                  ) : (
                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                                      {u.name.slice(0, 1)}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                                      {u.name}
                                    </div>
                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                      {u.phone} · <span style={{ color: '#0284c7' }}>{u.email}</span>
                                    </div>
                                    <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '2px' }}>
                                      📍 {u.hubZone}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#eff6ff', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                      Top: {u.topSize}
                                    </span>
                                    <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#f5f3ff', color: '#6b21a8', padding: '1px 6px', borderRadius: '4px', border: '1px solid #ddd6fe' }}>
                                      Bottom: {u.bottomSize}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                                      Shoes: {u.footwearSize}
                                    </span>
                                    <span style={{ fontSize: '9px', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px' }}>
                                      Fit: {u.preferredFit}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                    <span style={{
                                      fontSize: '9.5px',
                                      fontWeight: 800,
                                      padding: '2px 7px',
                                      borderRadius: '12px',
                                      background: u.dropoffRisk === 'Immediate Dropoff' ? '#fee2e2' : u.dropoffRisk === 'High' ? '#ffedd5' : u.dropoffRisk === 'Medium' ? '#fef9c3' : '#dcfce7',
                                      color: u.dropoffRisk === 'Immediate Dropoff' ? '#991b1b' : u.dropoffRisk === 'High' ? '#9a3412' : u.dropoffRisk === 'Medium' ? '#854d0e' : '#166534',
                                      border: `1px solid ${u.dropoffRisk === 'Immediate Dropoff' ? '#fca5a5' : u.dropoffRisk === 'High' ? '#fdba74' : u.dropoffRisk === 'Medium' ? '#fde047' : '#86efac'}`
                                    }}>
                                      {u.dropoffRisk === 'Immediate Dropoff' ? '🚨 Immediate Back-Off' : u.dropoffRisk === 'High' ? '⚠️ High Risk' : u.dropoffRisk === 'Medium' ? '🟡 Moderate Risk' : '🟢 Low Risk'}
                                    </span>
                                    <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 700 }}>
                                      {u.funnelDropoffStage || 'Active'}
                                    </span>
                                  </div>
                                  {u.cartTotalInr && u.cartTotalInr > 0 ? (
                                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#dc2626' }}>
                                      Cart: ₹{u.cartTotalInr.toLocaleString('en-IN')} ({u.cartItemCount || 1} items)
                                    </div>
                                  ) : null}
                                  <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.3, maxWidth: '210px', marginTop: '2px' }}>
                                    {u.lastHesitationReason || 'Active browsing with zero back-off friction.'}
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {isOnline ? (
                                      <span className={`${styles.statusChip} ${styles.statusLive}`} style={{ padding: '2px 7px', fontSize: '10px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                        Active Browsing
                                      </span>
                                    ) : isInTrial ? (
                                      <span style={{ background: '#faf5ff', color: '#7e22ce', border: '1px solid #d8b4fe', padding: '2px 7px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Truck size={10} /> In Doorstep Trial
                                      </span>
                                    ) : (
                                      <span style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '2px 7px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>
                                        Offline
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                                    {u.currentScreen}
                                  </div>
                                  <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                                    {u.deviceInfo} · <span style={{ color: '#0284c7' }}>{u.lastActiveAt}</span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>
                                    ₹{u.totalSpentInr.toLocaleString('en-IN')}
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                                    {u.totalOrdersCount} Orders · {u.doorstepTrialsCount} Trials
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <div style={{ width: '50px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ width: `${u.keptRatioPercentage}%`, height: '100%', background: u.keptRatioPercentage >= 80 ? '#10b981' : '#f59e0b' }} />
                                    </div>
                                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: u.keptRatioPercentage >= 80 ? '#047857' : '#d97706' }}>
                                      {u.keptRatioPercentage}% Kept
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCustomerModal(u)}
                                  className={styles.btnSecondary}
                                  style={{ padding: '5px 10px', fontSize: '11px', gap: '4px', fontWeight: 700 }}
                                >
                                  <Eye size={12} /> Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT: Real-time Live Activity Telemetry Radar */}
                <div className={styles.sectionCard} style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={styles.hubStatusLiveDot} />
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                          Live Activity Stream
                        </h4>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        Realtime Supabase Telemetry Broadcast
                      </div>
                    </div>

                    {/* Drop-Off Filter Toggle */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setActivityFilter('all')}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid',
                          background: activityFilter === 'all' ? '#0284c7' : '#ffffff',
                          color: activityFilter === 'all' ? '#ffffff' : '#475569',
                          borderColor: activityFilter === 'all' ? '#0284c7' : '#cbd5e1',
                          cursor: 'pointer'
                        }}
                      >
                        All ({userActivities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityFilter('dropoffs')}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid',
                          background: activityFilter === 'dropoffs' ? '#ef4444' : '#ffffff',
                          color: activityFilter === 'dropoffs' ? '#ffffff' : '#b91c1c',
                          borderColor: activityFilter === 'dropoffs' ? '#ef4444' : '#fca5a5',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <AlertTriangle size={11} />
                        Drop-Offs ({userActivities.filter(a => a.isDropoffSignal || a.activityType === 'CHECKOUT_BACKOUT' || a.activityType === 'CART_ABANDON' || a.activityType === 'PRICE_HESITATION' || a.activityType === 'SIZE_UNAVAILABLE').length})
                      </button>
                    </div>
                  </div>

                  {/* Activity List Container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
                    {userActivities
                      .filter(act => activityFilter === 'all' || act.isDropoffSignal || act.activityType === 'CHECKOUT_BACKOUT' || act.activityType === 'CART_ABANDON' || act.activityType === 'PRICE_HESITATION' || act.activityType === 'SIZE_UNAVAILABLE')
                      .map((act) => {
                      const isDropoff = act.isDropoffSignal || 
                        act.activityType === 'CHECKOUT_BACKOUT' || 
                        act.activityType === 'CART_ABANDON' || 
                        act.activityType === 'PRICE_HESITATION' || 
                        act.activityType === 'SIZE_UNAVAILABLE';

                      let typeBg = '#eff6ff';
                      let typeColor = '#1d4ed8';
                      let typeLabel = 'Activity';

                      if (isDropoff) {
                        typeBg = '#fee2e2';
                        typeColor = '#991b1b';
                        typeLabel = act.activityType === 'CHECKOUT_BACKOUT' ? 'Checkout Backout' : 
                                    act.activityType === 'SIZE_UNAVAILABLE' ? 'Size OOS Bounce' : 
                                    act.activityType === 'PRICE_HESITATION' ? 'Price Hesitation' : 'Drop-off Signal';
                      } else if (act.activityType === 'PRODUCT_CLICK') {
                        typeBg = '#fff7ed';
                        typeColor = '#c2410c';
                        typeLabel = 'Product Click';
                      } else if (act.activityType === 'DOORSTEP_TRIAL_START') {
                        typeBg = '#faf5ff';
                        typeColor = '#7e22ce';
                        typeLabel = 'Doorstep Fitting';
                      } else if (act.activityType === 'WISHLIST_ADD') {
                        typeBg = '#fdf2f8';
                        typeColor = '#be185d';
                        typeLabel = 'Wishlist';
                      } else if (act.activityType === 'PROFILE_EDIT') {
                        typeBg = '#f0fdf4';
                        typeColor = '#15803d';
                        typeLabel = 'Profile Edit';
                      } else if (act.activityType === 'PAGE_VIEW') {
                        typeBg = '#ecfeff';
                        typeColor = '#0e7490';
                        typeLabel = 'Browse View';
                      }

                      return (
                        <div
                          key={act.id}
                          style={{
                            background: isDropoff ? '#fff5f5' : '#ffffff',
                            border: `1px solid ${isDropoff ? '#fca5a5' : '#e2e8f0'}`,
                            borderRadius: '10px',
                            padding: '10px 12px',
                            boxShadow: isDropoff ? '0 2px 6px rgba(239, 68, 68, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '9.5px', fontWeight: 800, background: typeBg, color: typeColor, padding: '1px 6px', borderRadius: '4px' }}>
                                {typeLabel}
                              </span>
                              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                                {act.userName}
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                              {act.timestamp}
                            </span>
                          </div>

                          <div style={{ fontSize: '11.5px', color: isDropoff ? '#991b1b' : '#334155', fontWeight: 700, lineHeight: 1.4 }}>
                            {act.title}
                          </div>

                          {/* Drop-off Diagnosis Callout */}
                          {isDropoff && (act.hesitationReason || act.aiRiskScore) && (
                            <div style={{
                              background: '#fef2f2',
                              borderLeft: '3px solid #ef4444',
                              padding: '6px 8px',
                              borderRadius: '0 6px 6px 0',
                              marginTop: '6px',
                              fontSize: '10.5px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 800, color: '#b91c1c' }}>
                                  🚨 Back-Off Reason:
                                </span>
                                {act.aiRiskScore ? (
                                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '3px' }}>
                                    Risk: {act.aiRiskScore}/100
                                  </span>
                                ) : null}
                              </div>
                              <div style={{ color: '#7f1d1d', lineHeight: 1.35 }}>
                                {act.hesitationReason}
                              </div>
                              {act.dwellSeconds ? (
                                <div style={{ fontSize: '9.5px', color: '#991b1b', marginTop: '3px', fontWeight: 600 }}>
                                  ⏱️ Dwell time on screen: {act.dwellSeconds}s (Stage: {act.dropoffStage || 'Checkout'})
                                </div>
                              ) : null}
                            </div>
                          )}

                          {act.details && Object.keys(act.details).length > 0 && !isDropoff && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                              {Object.entries(act.details).map(([k, v]) => (
                                <span key={k} style={{ fontSize: '9.5px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#475569' }}>
                                  <strong>{k}:</strong> {String(v)}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '10px', color: '#64748b' }}>
                            <span>📱 {act.device || 'Mobile App'}</span>
                            <span style={{ color: isDropoff ? '#b91c1c' : '#0284c7', fontWeight: 600 }}>{act.screen || 'App'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MASTER DATABASE MATRIX & TRACKING TABLES (27 TABLES) */}
          {activeTab === 'database' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Database Hero Summary Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: '18px',
                  padding: '24px 28px',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ maxWidth: '640px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#38bdf8', color: '#0f172a', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '6px' }}>
                        PostgreSQL · Supabase Realtime
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Project: <code>eswnhehlnzasiaybjikh</code> · Hub: AMD-DARKSTORE-01
                      </span>
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Database size={24} color="#38bdf8" /> Master System Database &amp; Tracking Tables Matrix
                    </h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                      Comprehensive audit and live synchronization status of all 27 PostgreSQL database tables covering darkstore physical racks, wholesale settlements, margin ledgers, customer sizing profiles, hesitation signals, and AI pulse diagnostics.
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={fetchDbStatus}
                      disabled={isDbStatusLoading}
                      className={styles.btnSecondary}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontWeight: 700
                      }}
                    >
                      <RefreshCw size={14} className={isDbStatusLoading ? 'animate-spin' : ''} />
                      {isDbStatusLoading ? 'Scanning Tables...' : 'Re-Scan DB Live'}
                    </button>

                    <button
                      type="button"
                      onClick={copyCompleteSql}
                      className={styles.btnPrimary}
                      style={{
                        background: copiedSql ? '#16a34a' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        fontWeight: 800,
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                      }}
                    >
                      {copiedSql ? <Check size={16} /> : <Copy size={16} />}
                      {copiedSql ? 'Schema Copied!' : 'Copy Master SQL Schema'}
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/eswnhehlnzasiaybjikh/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <ExternalLink size={16} /> Open Supabase SQL Editor
                    </a>
                  </div>
                </div>

                {/* Database Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginTop: '22px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.12)'
                  }}
                >
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#38bdf8' }}>
                      {dbStatusData?.summary.totalTables ?? 27}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Defined Tables
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#4ade80' }}>
                      {dbStatusData?.summary.onlineCount ?? '...'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Live in Supabase
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: (dbStatusData?.summary.missingCount ?? 0) > 0 ? '#f87171' : '#4ade80' }}>
                      {dbStatusData?.summary.missingCount ?? '...'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Pending Creation
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#fbbf24' }}>
                      {dbStatusData?.summary.healthPercentage ? `${dbStatusData.summary.healthPercentage}%` : '...'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                      Schema Coverage
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Guidance Notice */}
              {dbStatusData && dbStatusData.summary.missingCount > 0 && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                >
                  <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, color: '#92400e' }}>
                      {dbStatusData.summary.missingCount} Tables Awaiting 1-Time SQL Execution in Supabase
                    </h4>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#b45309', lineHeight: 1.5 }}>
                      The frontend uses automatic local fallback caching for all operations, but to persist tracking, settlements, and hesitation logs permanently on your live Postgres cluster:
                      <strong> Click &apos;Copy Master SQL Schema&apos;</strong>, click <strong>&apos;Open Supabase SQL Editor&apos;</strong>, paste the SQL, and click <strong>&apos;Run&apos;</strong>. Then hit &apos;Re-Scan DB Live&apos; to verify!
                    </p>
                  </div>
                </div>
              )}

              {/* Section Filters */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Filter by Domain:</span>
                {[
                  'all',
                  'Darkstore Operations',
                  'Brand Ecosystem',
                  'Catalog & Inventory',
                  'Fleet & Dispatch',
                  '30-Min Fitting Trial',
                  'Customer Profiles & Tracking',
                  'AI Telemetry & Diagnostics',
                  'Wholesale & Financials',
                  'CRM & Operations'
                ].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDbSectionFilter(sec)}
                    style={{
                      background: dbSectionFilter === sec ? '#0f172a' : '#f1f5f9',
                      color: dbSectionFilter === sec ? '#ffffff' : '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {sec === 'all' ? 'All (27 Tables)' : sec}
                  </button>
                ))}
              </div>

              {/* Tables Matrix List */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    PostgreSQL Tables Specification &amp; Telemetry Status
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    PostgREST REST API v1 · Public RLS Enabled
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Table Name</th>
                        <th>Domain / Section</th>
                        <th>Description &amp; Purpose</th>
                        <th>Remote Status</th>
                        <th>Rows in DB</th>
                        <th>RLS &amp; Realtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbStatusData?.tables || [])
                        .filter(t => dbSectionFilter === 'all' || t.section === dbSectionFilter)
                        .map((tbl) => (
                          <tr key={tbl.table}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Database size={15} color={tbl.exists ? '#0284c7' : '#94a3b8'} />
                                <code style={{ fontSize: '12.5px', fontWeight: 800, color: tbl.exists ? '#0f172a' : '#64748b' }}>
                                  {tbl.table}
                                </code>
                              </div>
                            </td>

                            <td>
                              <span style={{ fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px' }}>
                                {tbl.section}
                              </span>
                            </td>

                            <td style={{ fontSize: '11.5px', color: '#64748b', maxWidth: '320px' }}>
                              {tbl.description}
                            </td>

                            <td>
                              {tbl.exists ? (
                                <span className={`${styles.badgePill} ${styles.badgeGreen}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={12} color="#16a34a" /> Online
                                </span>
                              ) : (
                                <span className={`${styles.badgePill} ${styles.badgeAmber}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} color="#d97706" /> Pending SQL Run
                                </span>
                              )}
                            </td>

                            <td>
                              <strong style={{ fontSize: '12px', color: tbl.exists ? '#0f172a' : '#94a3b8' }}>
                                {tbl.exists ? `${tbl.rowCount} rows` : '—'}
                              </strong>
                            </td>

                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  🛡️ RLS Public
                                </span>
                                {[
                                  'drobe_trial_orders',
                                  'drobe_products',
                                  'drobe_brands',
                                  'drobe_runners',
                                  'drobe_user_profiles',
                                  'drobe_user_activities',
                                  'drobe_user_hesitation_logs',
                                  'drobe_ai_telemetry_reports'
                                ].includes(tbl.table) && (
                                  <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    ⚡ Realtime
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', letterSpacing: '0.15em', fontWeight: 700 }}>
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
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.lightTable}>
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Category</th>
                        <th>Wholesale vs Selling Price (Markup)</th>
                        <th>Sizes Available</th>
                        <th>Inward Stock</th>
                        <th>Shelf Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCurrentBrandProducts.map((p) => {
                        const img = (p.images && p.images[0]) || p.thumbnail;
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {img ? (
                                  <img 
                                    src={img} 
                                    alt={p.name}
                                    style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                  />
                                ) : (
                                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <Package size={18} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{p.name}</div>
                                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                    ID: <code>{p.id}</code> · SKU: <strong>{p.sku || `DR-${p.id}`}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                                {p.category || 'Apparel'}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const bp = getProductPricingInfo(p);
                                return (
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                                        ₹{bp.sellingPrice}
                                      </span>
                                      <span style={{ fontSize: '9.5px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '1px 5px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                        {bp.formattedPercentage}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                      Base: <strong>₹{bp.brandBasePrice}</strong> (+₹{bp.markupAmount})
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {(p.sizes && p.sizes.length > 0 ? p.sizes : [p.volume || 'M']).map((sz: string, sIdx: number) => (
                                  <span key={sIdx} style={{ background: '#e2e8f0', color: '#334155', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '12px', color: '#16a34a' }}>
                                {p.inwardUnits || 32} pcs inwarded
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {p.inventory || 40} pcs declared
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '11.5px' }}>
                                {p.warehouseLocation?.code || 'AMD-RA01-S1-B01'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                {p.warehouseLocation?.rack || 'Rack A-01'}
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.statusChip} ${styles.statusLive}`}>
                                <CheckCircle2 size={11} /> Inwarded & Live
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <Link
                                  href={`/product/${p.id}`}
                                  target="_blank"
                                  className={styles.btnSecondary}
                                  style={{ padding: '4px 8px', fontSize: '10.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  title="View product on storefront"
                                >
                                  <ExternalLink size={11} /> Store
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductForBarcode(p);
                                    setBarcodeModalOpen(true);
                                  }}
                                  className={styles.btnSecondary}
                                  style={{ padding: '4px 8px', fontSize: '10.5px' }}
                                  title="Print thermal barcode label"
                                >
                                  <Barcode size={11} /> Barcode
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                  fontFamily: 'inherit',
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
                    fontFamily: 'monospace',
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
                      fontFamily: 'monospace',
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
              <span style={{ fontSize: '10.5px', color: '#76b900', fontFamily: 'monospace', fontWeight: 700 }}>
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
                    fontFamily: 'system-ui, -apple-system, sans-serif',
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
                  fontFamily: 'system-ui, -apple-system, sans-serif'
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
                        fontFamily: 'monospace',
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

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={styles.adminToast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
