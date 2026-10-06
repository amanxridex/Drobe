'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';
import { PRODUCTS, SECTIONS_MANIFEST, CATEGORIES_GRID_MANIFEST } from '@/data/catalog';
import { motion, AnimatePresence } from 'framer-motion';
import WishlistButton from '@/components/WishlistButton';

export default function HomePage() {
  const { wishlist, toggleWishlist, setIsCouponOpen } = useApp();
  const router = useRouter();

  const [activeSlide, setActiveSlide] = useState(0);
  const [showGuaranteeBanner, setShowGuaranteeBanner] = useState(true);

  // Auto-advance Lookbook carousel every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 5);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Exact real lookbook banners downloaded from Knot's live ImageKit CDN
  const lookbookCards = [
    {
      id: 'banana-club',
      img: '/assets/real/lookbook_banner_2.webp',
      route: '/product/29393'
    },
    {
      id: 'fkn-casanova',
      img: '/assets/real/lookbook_banner_1.webp',
      route: '/product/36440'
    },
    {
      id: 'powerlook',
      img: '/assets/real/lookbook_banner_4.webp',
      route: '/product/37600'
    },
    {
      id: 'on3mile',
      img: '/assets/real/lookbook_banner_9.webp',
      route: '/product/31561'
    },
    {
      id: 'brand-spotlight',
      img: '/assets/real/lookbook_banner_6.webp',
      route: '/product/12671'
    }
  ];

  const prevSlideIndex = (activeSlide - 1 + lookbookCards.length) % lookbookCards.length;
  const nextSlideIndex = (activeSlide + 1) % lookbookCards.length;

  // Authentic Category Row 1 from Knot's grid 2882
  const mainCategories = (CATEGORIES_GRID_MANIFEST['2'] || []).slice(0, 8);

  // Authentic Brand Partners Row from Section 8
  const brandPartners = SECTIONS_MANIFEST['8'] || [];

  // Authentic Curated Sections
  const iconicLooks = SECTIONS_MANIFEST['15'] || [];
  const latestDrops = SECTIONS_MANIFEST['16'] || [];
  const offersList = SECTIONS_MANIFEST['17'] || [];

  // Brand strip banners
  const snitchBanner = SECTIONS_MANIFEST['10']?.[0];
  const tigcBanner = SECTIONS_MANIFEST['12']?.[0];
  const bearHouseBanner = SECTIONS_MANIFEST['14']?.[0];

  // Curated product subsets
  const snitchProducts = PRODUCTS.filter((p) => p.brand.toLowerCase().includes('snitch')).slice(0, 8);
  const tigcProducts = PRODUCTS.filter((p) => p.brand.toLowerCase().includes('indian garage')).slice(0, 8);
  const trendingProducts = PRODUCTS.slice(0, 20);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#171717', overflow: 'hidden', position: 'relative' }}>
      <TopHeader />

      {/* Main Scrollable Content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 85 }}>
        {/* ========================================================
            UPPER HERO SECTION: CATEGORY RAIL + LOOKBOOK CAROUSEL
            Continuous authentic purple pattern wallpaper (1:1 with Knot)
            Eliminates all black background behind carousel cards & corners
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: "url('/assets/real/hero_slice_01_header.webp') top center / 100% auto repeat, #200416",
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Authentic 5 Category Cards Rail */}
          <div
            style={{
              width: '100%',
              background: "url('/assets/real/hero_slice_03_cats.webp') top center / 100% 100% no-repeat",
              padding: '2px 10px 14px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 6
              }}
            >
              {[
                { name: 'Ethnic Wear', img: '/assets/real/cat_ethnic.webp', route: '/collection/ethnic' },
                { name: 'Bottom Wear', img: '/assets/real/cat_bottom.webp', route: '/collection/bottom' },
                { name: 'Top Wear', img: '/assets/real/cat_top.webp', route: '/collection/top' },
                { name: 'Foot Wear', img: '/assets/real/cat_footwear.webp', route: '/collection/footwear' },
                { name: 'Accessories', img: '/assets/real/cat_accessories.webp', route: '/collection/accessories' }
              ].map((cat) => (
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
                      aspectRatio: '1 / 1.06',
                      borderRadius: 12,
                      background: 'rgba(24, 2, 19, 0.88)',
                      border: '1px solid rgba(255, 60, 150, 0.32)',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      boxSizing: 'border-box'
                    }}
                  >
                    <img
                      src={cat.img}
                      alt={cat.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
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
                      letterSpacing: -0.2
                    }}
                  >
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Authentic Lookbook Carousel (F/KN, POWERLOOK, ON3MILE) */}
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
                {/* Left Peek Card (Full 340px card peeking naturally) */}
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
                  key={activeSlide}
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

                {/* Right Peek Card (Full 340px card peeking naturally) */}
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

            {/* Authentic Home Page End Curve from Knot (Behind the carousel cards) */}
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
            ROW 3: AUTHENTIC CATEGORY GRID (Downloaded from Knot API)
            ======================================================== */}
        <section style={{ padding: '4px 0 16px' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              padding: '0 12px',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none'
            }}
          >
            {mainCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => router.push('/collection/ethnic')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: 70,
                  scrollSnapAlign: 'start'
                }}
              >
                <div
                  style={{
                    width: 66,
                    height: 72,
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#1a1a22'
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#ffffff',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 68
                  }}
                >
                  {cat.alt}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            ROW 4: BRAND PARTNERS CAROUSEL (Section 8)
            ======================================================== */}
        {brandPartners.length > 0 && (
          <section style={{ padding: '0 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Featured Brands</h2>
              <span onClick={() => router.push('/categories')} style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', cursor: 'pointer' }}>
                All Brands →
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                padding: '0 12px',
                scrollbarWidth: 'none'
              }}
            >
              {brandPartners.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/categories')}
                  style={{
                    flexShrink: 0,
                    width: 110,
                    height: 140,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#1c1c24',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <img
                    src={b.img}
                    alt={b.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================
            ROW 5: "What's your next iconic look?" (Section 15)
            ======================================================== */}
        {iconicLooks.length > 0 && (
          <section style={{ padding: '0 0 18px' }}>
            <div style={{ padding: '0 14px', marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>What's your next iconic look?</h2>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                padding: '0 12px',
                scrollbarWidth: 'none'
              }}
            >
              {iconicLooks.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/collection/top')}
                  style={{
                    flexShrink: 0,
                    width: 78,
                    height: 124,
                    borderRadius: 14,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#1a1a24'
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
            ROW 6: SNITCH STRIP BANNER & PRODUCTS (Section 10 & 11)
            ======================================================== */}
        {snitchBanner && (
          <section style={{ padding: '0 12px 18px' }}>
            <div
              onClick={() => router.push('/categories')}
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
                src={snitchBanner.img}
                alt="SNITCH"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* SNITCH horizontal product rail */}
            {snitchProducts.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}
              >
                {snitchProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => router.push(`/product/${prod.id}`)}
                    style={{
                      flexShrink: 0,
                      width: 140,
                      background: '#1d1d25',
                      borderRadius: 14,
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: '100%', aspectRatio: '1/1.25', position: 'relative', background: '#121217' }}>
                      <img
                        src={prod.thumbnail}
                        alt={prod.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'rgba(0, 0, 0, 0.75)',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#38bdf8'
                        }}
                      >
                        ⚡ 60 Mins
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#9090a0', textTransform: 'uppercase' }}>
                        {prod.brand}
                      </span>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                        {prod.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>₹{prod.price}</span>
                        <span style={{ fontSize: 10, color: '#707080', textDecoration: 'line-through' }}>₹{prod.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================
            ROW 7: "Latest Drops" (Section 16)
            ======================================================== */}
        {latestDrops.length > 0 && (
          <section style={{ padding: '0 0 18px' }}>
            <div style={{ padding: '0 14px', marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Latest Drops</h2>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                padding: '0 12px',
                scrollbarWidth: 'none'
              }}
            >
              {latestDrops.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/collection/bottom')}
                  style={{
                    flexShrink: 0,
                    width: 100,
                    height: 140,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#1c1c24'
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
            ROW 8: THE INDIAN GARAGE CO BANNER (Section 12)
            ======================================================== */}
        {tigcBanner && (
          <section style={{ padding: '0 12px 18px' }}>
            <div
              onClick={() => router.push('/categories')}
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
                src={tigcBanner.img}
                alt="The Indian Garage Co"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* TIGC horizontal product rail */}
            {tigcProducts.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}
              >
                {tigcProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => router.push(`/product/${prod.id}`)}
                    style={{
                      flexShrink: 0,
                      width: 140,
                      background: '#1d1d25',
                      borderRadius: 14,
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: '100%', aspectRatio: '1/1.25', position: 'relative', background: '#121217' }}>
                      <img
                        src={prod.thumbnail}
                        alt={prod.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          background: 'rgba(0, 0, 0, 0.75)',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#38bdf8'
                        }}
                      >
                        ⚡ 60 Mins
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#9090a0', textTransform: 'uppercase' }}>
                        {prod.brand}
                      </span>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                        {prod.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>₹{prod.price}</span>
                        <span style={{ fontSize: 10, color: '#707080', textDecoration: 'line-through' }}>₹{prod.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================
            ROW 9: "Offers" (Section 17)
            ======================================================== */}
        {offersList.length > 0 && (
          <section style={{ padding: '0 0 18px' }}>
            <div style={{ padding: '0 14px', marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Offers</h2>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                padding: '0 12px',
                scrollbarWidth: 'none'
              }}
            >
              {offersList.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/collection/ethnic')}
                  style={{
                    flexShrink: 0,
                    width: 105,
                    height: 140,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#1c1c24'
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
            ROW 10: TRENDING IN 60 MINS (All Real Products)
            ======================================================== */}
        <section style={{ padding: '0 12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Trending In 60 Mins</h2>
            <Link
              href="/categories"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#6678ff',
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
              <div
                key={prod.id}
                onClick={() => router.push(`/product/${prod.id}`)}
                style={{
                  background: '#1d1d25',
                  borderRadius: 14,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Product Thumbnail */}
                <div style={{ width: '100%', aspectRatio: '1/1.25', position: 'relative', background: '#121217', overflow: 'hidden' }}>
                  <img
                    src={prod.thumbnail}
                    alt={prod.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Delivery Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '3px 7px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <span>⚡</span> {prod.deliveryMinutes} Mins
                  </div>

                  {/* Try & Buy Badge */}
                  {prod.tryAndBuyEligible && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: '#0f382c',
                        border: '1px solid #10b981',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 9,
                        fontWeight: 800,
                        color: '#34d399'
                      }}
                    >
                      TRY & BUY
                    </div>
                  )}

                  {/* Wishlist Heart with Pop Animation */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3
                    }}
                  >
                    <WishlistButton
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggle={() => toggleWishlist(prod.id)}
                      size={14}
                    />
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#9090a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {prod.brand}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: '15px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {prod.title}
                  </span>

                  {/* Knot's Promo Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#ff2a85', background: 'rgba(255,42,133,0.1)', padding: '2px 4px', borderRadius: 4 }}>
                      {prod.couponPromo || 'Coupon: KNOTFESTIVE999'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>₹{prod.price}</span>
                    <span style={{ fontSize: 11, color: '#707080', textDecoration: 'line-through' }}>₹{prod.originalPrice}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{prod.discountPercentage}% OFF</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================
          EXACT FLOATING RIDER GUARANTEE PILL
          "We bet ₹250 this reaches you in time"
          Directly from Knot's CDN (late_delivery_floater.webp)
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

      {/* Docked Authentic Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
