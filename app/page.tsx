'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';
import { 
  PRODUCTS, 
  SECTIONS_MANIFEST, 
  CATEGORIES_GRID_MANIFEST,
  WOMEN_SECTIONS_MANIFEST,
  WOMEN_CATEGORIES_GRID 
} from '@/data/catalog';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import MEN_CURATED_SECTIONS from '@/data/men_curated_sections.json';
import DISCOVER_BRANDS_DATA from '@/data/discover_brands_manifest.json';
import AUTHENTIC_HOME_WIDGETS from '@/data/authentic_home_widgets.json';

export default function HomePage() {
  const { gender, wishlist, toggleWishlist, setIsCouponOpen } = useApp();
  const router = useRouter();

  const [activeSlide, setActiveSlide] = useState(0);
  const [showGuaranteeBanner, setShowGuaranteeBanner] = useState(true);
  const [categorySlideIndex, setCategorySlideIndex] = useState(0);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [selectedBrandCategory, setSelectedBrandCategory] = useState('all');
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Exact authentic lookbook banners downloaded from Knot's ImageKit CDN
  const menLookbookCards = [
    {
      id: 'banana-club',
      title: 'Banana Club',
      img: '/assets/real/lookbook_banner_2.webp',
      route: '/product/29393'
    },
    {
      id: 'fkn-casanova',
      title: 'F/KN Casanova',
      img: '/assets/real/lookbook_banner_1.webp',
      route: '/product/36440'
    },
    {
      id: 'powerlook',
      title: 'Powerlook',
      img: '/assets/real/lookbook_banner_4.webp',
      route: '/product/37600'
    },
    {
      id: 'on3mile',
      title: 'On3Mile',
      img: '/assets/real/lookbook_banner_9.webp',
      route: '/product/31561'
    },
    {
      id: 'brand-spotlight',
      title: 'Brand Spotlight',
      img: '/assets/real/lookbook_banner_6.webp',
      route: '/product/12671'
    }
  ];

  const womenLookbookCards = [
    {
      id: 'dandiya-drops',
      title: 'Dandiya Drops',
      img: '/assets/real/lookbook_women_1_dandiya.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'desi-baddie',
      title: 'Desi Baddie',
      img: '/assets/real/lookbook_women_2_desibaddie.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'chkokko',
      title: 'Chkokko',
      img: '/assets/real/lookbook_women_3_chkokko.webp',
      route: '/collection/top'
    },
    {
      id: 'souled-store',
      title: 'The Souled Store',
      img: '/assets/real/lookbook_women_4_souledstore.webp',
      route: '/collection/dresses'
    },
    {
      id: 'pink-fort',
      title: 'Pink Fort',
      img: '/assets/real/lookbook_women_5_pinkfort.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'nee',
      title: 'नी New Collection',
      img: '/assets/real/lookbook_women_6_nee.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'tequila',
      title: 'Tequila',
      img: '/assets/real/lookbook_women_7_tequila.webp',
      route: '/collection/dresses'
    },
    {
      id: 'tilt',
      title: 'Tilt Bamboo',
      img: '/assets/real/lookbook_women_8_tilt.webp',
      route: '/collection/bottom'
    }
  ];

  const lookbookCards = gender === 'women' ? womenLookbookCards : menLookbookCards;

  // Reset slide index on gender switch
  useEffect(() => {
    setActiveSlide(0);
    setCategorySlideIndex(0);
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft = 0;
    }
  }, [gender]);

  // Auto-advance Lookbook carousel every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % lookbookCards.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [lookbookCards.length]);

  const prevSlideIndex = (activeSlide - 1 + lookbookCards.length) % lookbookCards.length;
  const nextSlideIndex = (activeSlide + 1) % lookbookCards.length;

  // 5 Main Hero Category Cards
  const womenCategories = [
    { name: 'Ethnic Wear', img: '/assets/real/cat_women_ethnic_card.png', route: '/collection/ethnic' },
    { name: 'Dresses', img: '/assets/real/cat_women_dresses_card.png', route: '/collection/dresses' },
    { name: 'Bottom Wear', img: '/assets/real/cat_women_bottom_card.png', route: '/collection/bottom' },
    { name: 'Top Wear', img: '/assets/real/cat_women_top_card.png', route: '/collection/top' },
    { name: 'Foot Wear', img: '/assets/real/cat_women_footwear_card.png', route: '/collection/footwear' }
  ];

  const menCategories = [
    { name: 'Ethnic Wear', img: '/assets/real/cat_ethnic.webp', route: '/collection/ethnic' },
    { name: 'Bottom Wear', img: '/assets/real/cat_bottom.webp', route: '/collection/bottom' },
    { name: 'Top Wear', img: '/assets/real/cat_top.webp', route: '/collection/top' },
    { name: 'Foot Wear', img: '/assets/real/cat_footwear.webp', route: '/collection/footwear' },
    { name: 'Accessories', img: '/assets/real/cat_accessories.webp', route: '/collection/accessories' }
  ];

  const heroCategories = gender === 'women' ? womenCategories : menCategories;

  // Format category text cleanly (e.g. "cargos & parachutes" -> "Cargos & Parachutes")
  const formatCategoryLabel = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((w) => {
        if (!w) return '';
        if (w.toLowerCase() === '&') return '&';
        if (w.includes('-')) {
          return w.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
        }
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  };

  const getCategoryRoute = (alt: string) => {
    const lower = (alt || '').toLowerCase();
    if (lower.includes('kurta') || lower.includes('ethnic') || lower.includes('pyjama') || lower.includes('saree') || lower.includes('suit')) {
      return '/collection/ethnic';
    }
    if (
      lower.includes('ring') ||
      lower.includes('necklace') ||
      lower.includes('bracelet') ||
      lower.includes('perfume') ||
      lower.includes('jewel') ||
      lower.includes('watch') ||
      lower.includes('cap') ||
      lower.includes('sunglass') ||
      lower.includes('bag') ||
      lower.includes('sock') ||
      lower.includes('earring')
    ) {
      return '/collection/accessories';
    }
    if (
      lower.includes('shoe') ||
      lower.includes('slipper') ||
      lower.includes('slide') ||
      lower.includes('loafer') ||
      lower.includes('flat')
    ) {
      return '/collection/footwear';
    }
    if (
      lower.includes('cargo') ||
      lower.includes('short') ||
      lower.includes('jogger') ||
      lower.includes('trackpant') ||
      lower.includes('jean') ||
      lower.includes('trouser') ||
      lower.includes('pant') ||
      lower.includes('chino')
    ) {
      return '/collection/bottom';
    }
    return '/collection/top';
  };

  // Authentic 5-slide category grids (40 categories, 4x2 per slide) from Knot
  const menGridSlides = [
    CATEGORIES_GRID_MANIFEST['2'] || [],
    CATEGORIES_GRID_MANIFEST['4'] || [],
    CATEGORIES_GRID_MANIFEST['5'] || [],
    CATEGORIES_GRID_MANIFEST['6'] || [],
    CATEGORIES_GRID_MANIFEST['7'] || []
  ];

  const womenGridSlides = [
    WOMEN_CATEGORIES_GRID || []
  ];

  const categorySlides = gender === 'women' ? womenGridSlides : menGridSlides;

  const handleCategoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== categorySlideIndex) {
        setCategorySlideIndex(newIndex);
      }
    }
  };

  const scrollToSlide = (idx: number) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({
        left: idx * categoryScrollRef.current.clientWidth,
        behavior: 'smooth'
      });
      setCategorySlideIndex(idx);
    }
  };

  // Brand Wide Banners
  const menWideBrandBanners = [
    {
      name: 'XKIND',
      img: '/assets/real/sections/8_xkind_6.webp',
      deeplink: '/collections/homepage-bbc-XKIND-men'
    },
    {
      name: 'The Souled Store',
      img: '/assets/real/sections/8_the_souled_store_0.webp',
      deeplink: '/collections/homepage-bbc-TheSouledStore-men'
    },
    {
      name: 'Underrated club',
      img: '/assets/real/sections/8_underrated_club_1.webp',
      deeplink: '/collections/home_discover_brand_Underratedclub_men2'
    },
    {
      name: 'Bonkers Corner',
      img: '/assets/real/sections/8_bonkers_corner_2.webp',
      deeplink: '/collections/homepage-brand-banner-carousel-Bonkers-Corner-men'
    },
    {
      name: 'Foul Child',
      img: '/assets/real/sections/8_foul_child_3.webp',
      deeplink: '/collections/home_banner_carousel_Foul_Child_men'
    },
    {
      name: 'Salty Alpha',
      img: '/assets/real/sections/8_salty_alpha_4.webp',
      deeplink: '/collections/home-banner-carousel-SaltyAlpha-men'
    },
    {
      name: 'Bewakoof',
      img: '/assets/real/sections/8_bewakoof_5.webp',
      deeplink: '/collections/homepage-bbc-Bewakoof-men'
    }
  ];
  const womenWideBrandBanners = (WOMEN_SECTIONS_MANIFEST.brandPartners || []).map(b => ({
    name: b.name,
    img: b.img,
    deeplink: '/categories'
  }));
  const wideBrandBanners = gender === 'women' ? womenWideBrandBanners : menWideBrandBanners;

  // Discover Brands Filter
  const activeBrandSlideTiles = DISCOVER_BRANDS_DATA.slides[currentBrandSlide] || [];
  const filteredBrandTiles = selectedBrandCategory === 'all'
    ? activeBrandSlideTiles
    : (activeBrandSlideTiles.filter((t: any) => t.categories && t.categories.includes(selectedBrandCategory)).length > 0
        ? activeBrandSlideTiles.filter((t: any) => t.categories && t.categories.includes(selectedBrandCategory))
        : activeBrandSlideTiles);

  // Curated Brand Showcases (SNITCH, TIGC, Bear House)
  const snitchSection = (MEN_CURATED_SECTIONS as any[]).find((s: any) => s.id === '2966');
  const tigcSection = (MEN_CURATED_SECTIONS as any[]).find((s: any) => s.id === '2988');
  const snitchProductsList = snitchSection && snitchSection.products ? snitchSection.products : PRODUCTS.filter((p) => p.gender === 'men' && p.brand.toLowerCase().includes('snitch')).slice(0, 10);
  const tigcProductsList = tigcSection && tigcSection.products ? tigcSection.products : PRODUCTS.filter((p) => p.gender === 'men' && p.brand.toLowerCase().includes('indian garage')).slice(0, 10);
  const bearHouseProducts = PRODUCTS.filter((p) => p.gender === 'men' && p.brand.toLowerCase().includes('bear house')).slice(0, 10);

  // MEN Curated Sections
  const iconicLooks = SECTIONS_MANIFEST['15'] || [];
  const latestDrops = SECTIONS_MANIFEST['16'] || [];
  const offersList = SECTIONS_MANIFEST['17'] || [];
  const snitchBanner = SECTIONS_MANIFEST['10']?.[0];
  const tigcBanner = SECTIONS_MANIFEST['12']?.[0];
  const bearHouseBanner = SECTIONS_MANIFEST['14']?.[0];

  // WOMEN Curated Sections & Products
  const pinkFortBanner = WOMEN_SECTIONS_MANIFEST.banners.pinkFort;
  const chkokkoBanner = WOMEN_SECTIONS_MANIFEST.banners.chkokko;
  const souledStoreWomenBanner = WOMEN_SECTIONS_MANIFEST.banners.souledStore;
  const desiBaddieBanner = WOMEN_SECTIONS_MANIFEST.banners.desiBaddie;

  const womenEthnicProducts = PRODUCTS.filter((p) => p.gender === 'women' && p.category === 'ethnic').slice(0, 8);
  const pinkFortProducts = PRODUCTS.filter((p) => p.gender === 'women' && (p.brand.toLowerCase().includes('pink fort') || p.brand.toLowerCase().includes('vasavi') || p.brand.toLowerCase().includes('divena') || p.category === 'dresses')).slice(0, 8);
  const chkokkoProducts = PRODUCTS.filter((p) => p.gender === 'women' && (p.brand.toLowerCase().includes('chkokko') || p.category === 'top' || p.category === 'bottom')).slice(0, 8);
  const souledStoreWomenProducts = PRODUCTS.filter((p) => p.gender === 'women' && p.brand.toLowerCase().includes('souled store')).slice(0, 8);

  // Strictly gender-pure trending products
  const trendingProducts = PRODUCTS.filter((p) => p.gender === gender).slice(0, 20);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#171717', overflow: 'hidden', position: 'relative' }}>
      <TopHeader />

      {/* Main Scrollable Content */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 24 }}>
        {/* ========================================================
            SECTION 1: HERO SALE BANNER (MAGENTA WALLPAPER)
            Seamlessly merged with TopHeader background without any visible seam
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: "url('/assets/real/hero_slice_01_header.webp') center -108px / 100% auto repeat, #200416",
            position: 'relative',
            lineHeight: 0
          }}
        >
          {/* Authentic Freakin' Festive Sale Banner */}
          <div
            onClick={() => setIsCouponOpen(true)}
            style={{
              width: '100%',
              cursor: 'pointer',
              display: 'block',
              lineHeight: 0
            }}
          >
            <img
              src="/assets/real/hero_slice_02_sale_merged_tight.png"
              alt="Freakin' Festive Sale - Extra ₹999 Off On All Orders"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </section>

        {/* ========================================================
            SECTION 2: 5 CATEGORY CARDS RAIL (GREY BACKGROUND)
            Clean dark grey background matching Knot's native design
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: '#171717',
            padding: '6px 10px 16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 7
            }}
          >
            {heroCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => router.push(cat.route)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0,
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '75 / 83',
                    borderRadius: 12,
                    background: 'transparent',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 6,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    letterSpacing: -0.2,
                    fontFamily: 'Satoshi, sans-serif'
                  }}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            SECTION 3: LOOKBOOK CAROUSEL (MEN vs WOMEN 1:1)
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: '#171717',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: 0,
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 462,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              {/* Horizontal Track Centering the Active Card with Natural Peeks */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -35) {
                    setActiveSlide(nextSlideIndex);
                  } else if (info.offset.x > 35) {
                    setActiveSlide(prevSlideIndex);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'grab'
                }}
              >
                {/* Left Peek Card */}
                <div
                  onClick={() => setActiveSlide(prevSlideIndex)}
                  style={{
                    width: 340,
                    height: 454,
                    borderRadius: 20,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={lookbookCards[prevSlideIndex].img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                {/* Center Active Card */}
                <motion.div
                  key={`${gender}-${activeSlide}`}
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => router.push(lookbookCards[activeSlide].route)}
                  style={{
                    width: 340,
                    height: 454,
                    borderRadius: 20,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={lookbookCards[activeSlide].img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </motion.div>

                {/* Right Peek Card */}
                <div
                  onClick={() => setActiveSlide(nextSlideIndex)}
                  style={{
                    width: 340,
                    height: 454,
                    borderRadius: 20,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={lookbookCards[nextSlideIndex].img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Authentic Home Page End Curve from Knot */}
            <div
              style={{
                width: '100%',
                position: 'relative',
                marginTop: -42,
                zIndex: 1,
                pointerEvents: 'none'
              }}
            >
              <img
                src="/assets/images/hp_end_curve_dark.webp"
                alt=""
                style={{
                  width: '100%',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            AUTHENTIC CATEGORY GRID CAROUSEL (4x2 Grids, 5 Pages)
            Slide 1: Kurtas, Kurta Sets, Ethnic Jackets, Pyjamas | Rings, Necklaces & Chains, Bracelets, Perfumes
            ...through 5 slides (40 total categories) with 5 pagination dots
            ======================================================== */}
        <section style={{ padding: '0 0 16px', position: 'relative' }}>
          <div
            ref={categoryScrollRef}
            onScroll={handleCategoryScroll}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              width: '100%',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categorySlides.map((slideItems, slideIdx) => (
              <div
                key={slideIdx}
                style={{
                  flex: '0 0 100%',
                  width: '100%',
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box',
                  padding: '0 12px'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    rowGap: 16,
                    columnGap: 8
                  }}
                >
                  {slideItems.map((cat: any, itemIdx: number) => {
                    const rawName = cat.alt || cat.name || 'Category';
                    const displayName = formatCategoryLabel(rawName);
                    const targetRoute = getCategoryRoute(rawName);

                    return (
                      <div
                        key={itemIdx}
                        onClick={() => router.push(targetRoute)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div
                          style={{
                            width: 68,
                            height: 68,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent'
                          }}
                        >
                          <img
                            src={cat.img}
                            alt={displayName}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35))'
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#ffffff',
                            textAlign: 'center',
                            marginTop: 6,
                            lineHeight: 1.22,
                            minHeight: 28,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            wordBreak: 'break-word',
                            maxWidth: 78
                          }}
                        >
                          {displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Indicator Dots (Exact 5 dots matching Knot) */}
          {categorySlides.length > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                marginTop: 14
              }}
            >
              {categorySlides.map((_, dotIdx) => {
                const isActive = dotIdx === categorySlideIndex;
                return (
                  <div
                    key={dotIdx}
                    onClick={() => scrollToSlide(dotIdx)}
                    style={{
                      width: isActive ? 18 : 5,
                      height: 5,
                      borderRadius: isActive ? 3 : '50%',
                      background: isActive ? '#ffffff' : '#44444a',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </div>
          )}
          {/* ========================================================
              AUTHENTIC "SEE ALL CATEGORIES >" BUTTON
              Exact 3 overlapping circular product thumbnails + text + chevron
              ======================================================== */}
          <div style={{ padding: '4px 12px 14px' }}>
            <div
              onClick={() => router.push('/categories')}
              style={{
                width: '100%',
                background: '#202026',
                border: '1px solid #303038',
                borderRadius: 12,
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.15s ease'
              }}
            >
              {/* 3 Overlapping Avatar Thumbnails */}
              <div style={{ position: 'relative', width: 58, height: 28, flexShrink: 0 }}>
                <img
                  src="/assets/real/cat_avatar_1.webp"
                  alt="Category preview 1"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '2px solid #202026',
                    objectFit: 'cover'
                  }}
                />
                <img
                  src="/assets/real/cat_avatar_2.webp"
                  alt="Category preview 2"
                  style={{
                    position: 'absolute',
                    left: 15,
                    top: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '2px solid #202026',
                    objectFit: 'cover'
                  }}
                />
                <img
                  src="/assets/real/cat_avatar_3.webp"
                  alt="Category preview 3"
                  style={{
                    position: 'absolute',
                    left: 30,
                    top: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '2px solid #202026',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f5', letterSpacing: -0.2 }}>
                See all Categories
              </span>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5f5f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </section>

        {/* ========================================================
            ROW 4: BRAND WIDE BANNERS RAIL (Row 2547)
            XKIND "STRAIGHT FORWARD", The Souled Store "WEAR IT LOUD", Underrated Club, etc.
            ======================================================== */}
        <section style={{ padding: '0 0 16px' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              padding: '0 12px',
              scrollbarWidth: 'none',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {wideBrandBanners.map((banner, idx) => (
              <div
                key={idx}
                onClick={() => router.push(banner.deeplink || '/categories')}
                style={{
                  flexShrink: 0,
                  width: 'calc(100% - 46px)',
                  maxWidth: 346,
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)',
                  position: 'relative'
                }}
              >
                <img
                  src={banner.img}
                  alt={banner.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            GENDER SPECIFIC CURATED CONTENT
            ======================================================== */}
        {gender === 'men' ? (
          <>
            {/* ========================================================
                BONKERS CORNER STRIP BANNER (banner_1923_hp_men)
                ======================================================== */}
            <section style={{ padding: '0 12px 14px' }}>
              <div
                onClick={() => router.push(AUTHENTIC_HOME_WIDGETS.bonkersBanner.deeplink || '/categories')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)'
                }}
              >
                <img
                  src={AUTHENTIC_HOME_WIDGETS.bonkersBanner.img}
                  alt={AUTHENTIC_HOME_WIDGETS.bonkersBanner.name}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </section>

            {/* ========================================================
                AUTHENTIC DISCOVER BRANDS SECTION
                Title, Filter Pills, 4x3 Brand Logo Tiles Grid, 16 Pagination Dots
                ======================================================== */}
            <section style={{ padding: '0 0 10px' }}>
              <div style={{ padding: '0 14px', marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: -0.2 }}>
                  Discover Brands
                </h2>
              </div>

              {/* Category Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '0 12px 14px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* All Pill */}
                <button
                  onClick={() => setSelectedBrandCategory('all')}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    borderRadius: 10,
                    border: selectedBrandCategory === 'all' ? '1px solid #ffffff' : '1px solid #2e2f38',
                    background: selectedBrandCategory === 'all' ? '#2a2b34' : '#1c1d24',
                    color: selectedBrandCategory === 'all' ? '#ffffff' : '#a1a1aa',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>

                {/* Category Pills from manifest */}
                {DISCOVER_BRANDS_DATA.categories.slice(0, 10).map((cat) => {
                  const isSelected = selectedBrandCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedBrandCategory(cat.id)}
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        borderRadius: 10,
                        border: isSelected ? '1px solid #ffffff' : '1px solid #2e2f38',
                        background: isSelected ? '#2a2b34' : '#1c1d24',
                        color: isSelected ? '#ffffff' : '#a1a1aa',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat.id === '1' && <span>👔</span>}
                      {cat.id === '3' && <span>🛹</span>}
                      {cat.id === '7' && <span>🍸</span>}
                      {cat.id === '4' && <span>👖</span>}
                      {cat.id === '9' && <span>💍</span>}
                      {cat.id === '13' && <span>💼</span>}
                      {cat.id === '6' && <span>⚡</span>}
                      {cat.id === '5' && <span>👕</span>}
                      {cat.id === '8' && <span>👟</span>}
                      {cat.id === '15' && <span>🌴</span>}
                      <span>{cat.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* 4x3 Brand Tiles Grid with Floating Left & Right Arrows */}
              <div style={{ position: 'relative', padding: '0 12px' }}>
                {/* Left Floating Arrow */}
                {currentBrandSlide > 0 && (
                  <button
                    onClick={() => setCurrentBrandSlide(prev => Math.max(0, prev - 1))}
                    style={{
                      position: 'absolute',
                      left: 2,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'rgba(20, 20, 26, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid #363642',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                )}

                {/* Right Floating Arrow */}
                {currentBrandSlide < 15 && (
                  <button
                    onClick={() => setCurrentBrandSlide(prev => Math.min(15, prev + 1))}
                    style={{
                      position: 'absolute',
                      right: 2,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'rgba(20, 20, 26, 0.85)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid #363642',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8
                  }}
                >
                  {filteredBrandTiles.map((tile: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => router.push(tile.deeplink || '/categories')}
                      style={{
                        background: '#ffffff',
                        borderRadius: 14,
                        width: '100%',
                        aspectRatio: '1 / 1.08',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      {/* Badge Ribbon if present */}
                      {tile.badge === 'NEW' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 14,
                            background: '#581c87',
                            color: '#ffffff',
                            fontSize: 8.5,
                            fontWeight: 900,
                            letterSpacing: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            borderTopLeftRadius: 14,
                            borderTopRightRadius: 14
                          }}
                        >
                          NEW
                        </div>
                      )}
                      {tile.badge === 'ETHNIC' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 14,
                            background: '#991b1c',
                            color: '#ffffff',
                            fontSize: 8.5,
                            fontWeight: 900,
                            letterSpacing: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            borderTopLeftRadius: 14,
                            borderTopRightRadius: 14
                          }}
                        >
                          ETHNIC
                        </div>
                      )}

                      <img
                        src={tile.img}
                        alt={tile.name}
                        style={{
                          maxWidth: '78%',
                          maxHeight: '66%',
                          objectFit: 'contain',
                          marginTop: tile.badge ? 8 : 0
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Indicator Dots (16 dots matching Knot) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 14
                }}
              >
                {Array.from({ length: 16 }).map((_, dotIdx) => {
                  const isActive = dotIdx === currentBrandSlide;
                  return (
                    <div
                      key={dotIdx}
                      onClick={() => setCurrentBrandSlide(dotIdx)}
                      style={{
                        width: isActive ? 18 : 5,
                        height: 5,
                        borderRadius: isActive ? 3 : '50%',
                        background: isActive ? '#ffffff' : '#44444a',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </div>

              {/* "See all Brands >" Button */}
              <div style={{ padding: '14px 12px 16px' }}>
                <div
                  onClick={() => router.push('/categories')}
                  style={{
                    width: '100%',
                    background: '#202026',
                    border: '1px solid #303038',
                    borderRadius: 12,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {/* 3 Overlapping Brand Logos */}
                  <div style={{ position: 'relative', width: 58, height: 28, flexShrink: 0 }}>
                    <img
                      src="/assets/real/brand_avatar_1.webp"
                      alt="Brand preview 1"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '2px solid #202026',
                        objectFit: 'cover'
                      }}
                    />
                    <img
                      src="/assets/real/brand_avatar_2.webp"
                      alt="Brand preview 2"
                      style={{
                        position: 'absolute',
                        left: 15,
                        top: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '2px solid #202026',
                        objectFit: 'cover'
                      }}
                    />
                    <img
                      src="/assets/real/brand_avatar_3.webp"
                      alt="Brand preview 3"
                      style={{
                        position: 'absolute',
                        left: 30,
                        top: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '2px solid #202026',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f5', letterSpacing: -0.2 }}>
                    See all Brands
                  </span>

                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5f5f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </section>

            {/* ========================================================
                SNITCH BRAND SHOWCASE (Exact Banner + Product Slider)
                ======================================================== */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/snitch')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
                }}
              >
                <img
                  src="/assets/real/sections/10_snitch_0.webp"
                  alt="SNITCH - Wear What's Next"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {snitchProductsList.map((prod: any) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={() => toggleWishlist(prod.id)}
                    onClick={() => router.push(`/product/${prod.id}`)}
                    style={{ flexShrink: 0, width: 145 }}
                  />
                ))}
              </div>
            </section>

            {/* ========================================================
                THE INDIAN GARAGE CO (TIGC) SHOWCASE
                ======================================================== */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/indian-garage-co')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
                }}
              >
                <img
                  src="/assets/real/sections/12_the_indian_garage_co_0.webp"
                  alt="The Indian Garage Co - Fit For What's Next"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {tigcProductsList.map((prod: any) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={() => toggleWishlist(prod.id)}
                    onClick={() => router.push(`/product/${prod.id}`)}
                    style={{ flexShrink: 0, width: 145 }}
                  />
                ))}
              </div>
            </section>

            {/* ========================================================
                THE BEAR HOUSE BANNER (banner_2242_hp_men)
                ======================================================== */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/bear-house')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
                }}
              >
                <img
                  src="/assets/real/sections/14_the_bear_house_0.webp"
                  alt="The Bear House"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </section>

            {/* ========================================================
                WHAT'S YOUR NEXT ICONIC LOOK? (grid_858)
                ======================================================== */}
            {AUTHENTIC_HOME_WIDGETS.iconicLooks.length > 0 && (
              <section style={{ padding: '0 0 18px' }}>
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: -0.2 }}>
                    What's your next iconic look?
                  </h2>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    padding: '0 12px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {AUTHENTIC_HOME_WIDGETS.iconicLooks.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push(item.deeplink || '/categories')}
                      style={{
                        flexShrink: 0,
                        width: 78,
                        height: 124,
                        borderRadius: 14,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1a1a24',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================
                COUPON & PROMO CAROUSEL (coupon_carousel)
                Referral & Earn ₹500 Flat Tote Bag Banner + Virtual Try On Banner
                ======================================================== */}
            <section style={{ padding: '0 0 18px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  overflowX: 'auto',
                  padding: '0 12px',
                  scrollbarWidth: 'none',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {/* Slide 0: Referral & Earn ₹500 Tote Bag Banner */}
                <div
                  onClick={() => setIsReferralOpen(true)}
                  style={{
                    flexShrink: 0,
                    width: 'calc(100% - 32px)',
                    maxWidth: 346,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  <img
                    src="/assets/real/500R&EFLAT.png"
                    alt="Invite your friends - Earn ₹500 + Tote Bag"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

                {/* Slide 1: Virtual Try On Banner */}
                <div
                  onClick={() => router.push('/trends')}
                  style={{
                    flexShrink: 0,
                    width: 'calc(100% - 32px)',
                    maxWidth: 346,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  <img
                    src="/assets/real/home_sections/coupon_carousel_vto.png"
                    alt="Virtual Try On"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            </section>

            {/* ========================================================
                LATEST DROPS (row_861)
                ======================================================== */}
            {AUTHENTIC_HOME_WIDGETS.latestDrops.length > 0 && (
              <section style={{ padding: '0 0 18px' }}>
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: -0.2 }}>
                    Latest Drops
                  </h2>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    padding: '0 12px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {AUTHENTIC_HOME_WIDGETS.latestDrops.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push(item.deeplink || '/categories')}
                      style={{
                        flexShrink: 0,
                        width: 136,
                        height: 196,
                        borderRadius: 16,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1c1c24',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================
                OFFERS (grid_1643)
                ======================================================== */}
            {AUTHENTIC_HOME_WIDGETS.offers.length > 0 && (
              <section style={{ padding: '0 0 18px' }}>
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: -0.2 }}>
                    Offers
                  </h2>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    padding: '0 12px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {AUTHENTIC_HOME_WIDGETS.offers.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push(item.deeplink || '/categories')}
                      style={{
                        flexShrink: 0,
                        width: 105,
                        height: 84,
                        borderRadius: 14,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1c1c24',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================
                ALL 27 AUTHENTIC CURATED ROWS WITH REAL DOWNLOADED BACKGROUNDS
                Exact Section-by-Section 1:1 Mirroring of Knot Men's Feed
                ======================================================== */}
            {(MEN_CURATED_SECTIONS as any[])
              .filter((section: any) => section.hasBg)
              .map((section: any) => (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  style={{
                    width: '100%',
                    position: 'relative',
                    marginBottom: 18,
                    backgroundImage: `url("${section.bgImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#121216',
                    paddingTop: 116,
                    paddingBottom: 16,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      overflowX: 'auto',
                      paddingLeft: 12,
                      paddingRight: 12,
                      scrollbarWidth: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {section.products.map((prod: any) => (
                      <div
                        key={prod.id}
                        onClick={() => router.push(`/product/${prod.id}`)}
                        style={{
                          flexShrink: 0,
                          width: 162,
                          borderRadius: 16,
                          overflow: 'hidden',
                          background: '#1d1e24',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Image Box */}
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: 190,
                            background: '#25262e',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={prod.thumbnail || prod.images[0]}
                            alt={prod.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />

                          {/* Wishlist Heart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(prod.id);
                            }}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: 'rgba(0, 0, 0, 0.4)',
                              backdropFilter: 'blur(4px)',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 3
                            }}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill={wishlist.includes(prod.id) ? '#ff3b30' : 'none'}
                              stroke={wishlist.includes(prod.id) ? '#ff3b30' : '#ffffff'}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>

                          {/* Authentic Badge Pill */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              left: 8,
                              background: 'linear-gradient(90deg, #6b21a8, #9333ea)',
                              padding: '2px 7px',
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 800,
                              color: '#ffffff',
                              letterSpacing: 0.2,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            EXTRA ₹999 OFF
                          </div>
                        </div>

                        {/* Card Content */}
                        <div
                          style={{
                            padding: '10px 10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            background: '#1d1e24'
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: '#ffffff',
                              fontFamily: 'Satoshi, sans-serif',
                              letterSpacing: -0.2
                            }}
                          >
                            {prod.brand}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              color: '#a0a0ab',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: 'Satoshi, sans-serif'
                            }}
                          >
                            {prod.title}
                          </div>

                          {/* Price Row */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginTop: 2
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#ffffff',
                                fontFamily: 'Satoshi, sans-serif'
                              }}
                            >
                              {prod.priceFormatted || `₹${prod.price}`}
                            </span>
                            {prod.mrpFormatted && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: '#71717a',
                                  textDecoration: 'line-through'
                                }}
                              >
                                {prod.mrpFormatted}
                              </span>
                            )}
                            {prod.discountPercentage && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#4f7fff'
                                }}
                              >
                                {prod.discountPercentage}
                              </span>
                            )}
                          </div>

                          {/* Best Price */}
                          <div
                            style={{
                              fontSize: 10,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              marginTop: 1
                            }}
                          >
                            <span style={{ color: '#00e676', fontWeight: 700 }}>
                              Best Price {prod.bestPrice || `₹${Math.round(prod.price * 0.75)}`}
                            </span>
                            <span style={{ color: '#9e9ea7', fontWeight: 500 }}>
                              {prod.withCouponText || ' with coupon'}
                            </span>
                          </div>

                          {/* Delivery */}
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 2
                            }}
                          >
                            <span style={{ color: '#00e5ff' }}>⚡</span>
                            <span>{prod.deliveryText || '60 mins delivery'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </>
        ) : (
          <>
            {/* ROW 5 (WOMEN): DESI BADDIE / FESTIVE DROPS */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/ethnic')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                <img
                  src={desiBaddieBanner}
                  alt="Desi Baddie - Festive Glam"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {womenEthnicProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {womenEthnicProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 6 (WOMEN): PINK FORT NEW COLLECTION */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/ethnic')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src={pinkFortBanner}
                  alt="Pink Fort - New Collection"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {pinkFortProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {pinkFortProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 7 (WOMEN): CHKOKKO ACTIVEWEAR & CO-ORDS */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/top')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src={chkokkoBanner}
                  alt="Chkokko - Buy 2 Get 5% Off"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {chkokkoProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {chkokkoProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 8 (WOMEN): THE SOULED STORE WOMEN */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/dresses')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src={souledStoreWomenBanner}
                  alt="The Souled Store Women - Buy 1 Get 1"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {souledStoreWomenProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {souledStoreWomenProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================================
            ROW 10: TRENDING IN 60 MINS (Strictly 100% Current Gender)
            ======================================================== */}
        <section style={{ padding: '0 12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Trending In 60 Mins</h2>
            <Link
              href="/categories"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: gender === 'women' ? '#ff5768' : '#6678ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              See All →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10
            }}
          >
            {trendingProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isWishlisted={wishlist.includes(prod.id)}
                onToggleWishlist={() => toggleWishlist(prod.id)}
                onClick={() => router.push(`/product/${prod.id}`)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================
          EXACT FLOATING RIDER GUARANTEE PILL
          "We bet ₹250 this reaches you in time"
          Directly from Knot's CDN
          ======================================================== */}
      <AnimatePresence>
        {showGuaranteeBanner && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [0, -3, 0], opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{
              y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
              opacity: { duration: 0.3 }
            }}
            style={{
              position: 'absolute',
              bottom: 66,
              left: 10,
              right: 10,
              zIndex: 40,
              cursor: 'pointer',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => alert('⚡ KNOT 60-Minute Guarantee: If your fashion fit takes longer than 60 mins to reach your door, ₹250 is instantly credited to your Knot Wallet!')}
          >
            <img
              src="/assets/real/late_delivery_floater.webp"
              alt="We bet ₹250 this reaches you in time"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/exact/rider_guarantee_pill.webp';
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGuaranteeBanner(false);
              }}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/assets/icons/cross_close.svg" alt="Close" style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          AUTHENTIC REFERRAL BOTTOM SHEET (₹500 + TOTE BAG)
          ======================================================== */}
      <AnimatePresence>
        {isReferralOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReferralOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 110,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 430,
                background: '#18191f',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTop: '1px solid #2e2f38',
                padding: '24px 20px 32px',
                color: '#ffffff',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span
                  style={{
                    background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  🎁 Invite & Earn
                </span>
                <button
                  onClick={() => setIsReferralOpen(false)}
                  style={{
                    background: '#24252e',
                    border: 'none',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    color: '#a1a1aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Title & description */}
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, lineHeight: 1.25 }}>
                Earn ₹500 + Free Tote Bag
              </h2>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, marginBottom: 20 }}>
                Give friends ₹500 off on their first order. You get ₹500 Knot wallet credit + an exclusive KNOT Tote Bag once their order delivers!
              </p>

              {/* Code Box */}
              <div
                style={{
                  background: '#121216',
                  border: '1px dashed #7c3aed',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>
                    Your Referral Code
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1.5, color: '#a78bfa' }}>
                    KNOT-BAG500
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('KNOT-BAG500');
                    setCopiedReferral(true);
                    setTimeout(() => setCopiedReferral(false), 2000);
                  }}
                  style={{
                    background: copiedReferral ? '#10b981' : '#7c3aed',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copiedReferral ? 'COPIED! ✓' : 'COPY'}
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href="https://api.whatsapp.com/send?text=Hey!%20Get%20%E2%82%B9500%20OFF%20your%20first%20fashion%20delivery%20on%20KNOT%20with%20my%20code%20KNOT-BAG500!%20Check%20it%20out:%20https://knotnow.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontWeight: 800,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  💬 Share via WhatsApp
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('https://knotnow.co/?ref=KNOT-BAG500');
                    setCopiedReferral(true);
                    setTimeout(() => setCopiedReferral(false), 2000);
                  }}
                  style={{
                    background: '#24252e',
                    border: '1px solid #383a45',
                    color: '#ffffff',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  🔗 Copy Invite Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docked Authentic Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
