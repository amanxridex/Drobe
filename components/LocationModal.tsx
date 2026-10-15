'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LocationModal() {
  const {
    isLocationOpen,
    setIsLocationOpen,
    location,
    setLocation,
    setLocationWithCoords,
    userCoords,
    deliveryMinutes,
    deliveryDistanceKm,
    isLocating,
    locationError,
    requestExactLocation
  } = useApp();

  const [pincode, setPincode] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [showHubs, setShowHubs] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  if (!isLocationOpen) return null;

  const popularLocations = [
    { name: 'Koteshwar / Motera, Ahmedabad', area: 'Shivam Bungalows 1, Koteshwar Rd - 380005', eta: '12 mins', lat: 23.1100, lng: 72.5920 },
    { name: 'SG Highway (Iskcon), Ahmedabad', area: 'Shaligram Plus, SG Highway - 380054', eta: '18 mins', lat: 23.0280, lng: 72.5070 },
    { name: 'Bodakdev (Sindhu Bhavan Rd), Ahmedabad', area: 'Sunrise Park, Bodakdev - 380054', eta: '20 mins', lat: 23.0450, lng: 72.5180 },
    { name: 'Prahlad Nagar, Ahmedabad', area: 'Dev Aurum, Anandnagar Rd - 380015', eta: '22 mins', lat: 23.0120, lng: 72.5100 },
    { name: 'Navrangpura / CG Road, Ahmedabad', area: 'Shivalik Plaza, CG Road - 380009', eta: '16 mins', lat: 23.0360, lng: 72.5610 },
    { name: 'Vastrapur (IIM Road), Ahmedabad', area: 'Near IIM Campus, Vastrapur - 380015', eta: '19 mins', lat: 23.0340, lng: 72.5310 },
    { name: 'Bandra West, Mumbai', area: 'Linking Road, Mumbai - 400050', eta: '30 mins', lat: 19.0596, lng: 72.8295 },
    { name: 'Indiranagar 100ft Road, Bangalore', area: 'Indiranagar, Bangalore - 560038', eta: '30 mins', lat: 12.9784, lng: 77.6408 }
  ];

  const handleSetDeliveryLocation = async () => {
    setGpsStatus('Requesting device GPS coordinates...');
    const result = await requestExactLocation();
    if (result.success) {
      setGpsStatus(`✓ Exact location detected! ETA: ${result.minutes}m`);
      setTimeout(() => {
        setIsLocationOpen(false);
      }, 700);
    } else {
      setGpsStatus(result.error || 'Could not access GPS');
    }
  };

  const handleSelectPopular = (loc: typeof popularLocations[0]) => {
    setLocationWithCoords(loc.name, { lat: loc.lat, lng: loc.lng });
    setIsLocationOpen(false);
  };

  const handleContinuePincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      if (pincode === '380005') {
        setLocationWithCoords('Koteshwar / Motera, Ahmedabad - 380005', { lat: 23.1100, lng: 72.5920 });
      } else if (pincode === '380054') {
        setLocationWithCoords('Bodakdev / SG Highway, Ahmedabad - 380054', { lat: 23.0450, lng: 72.5180 });
      } else if (pincode === '380015') {
        setLocationWithCoords('Prahlad Nagar / Vastrapur, Ahmedabad - 380015', { lat: 23.0120, lng: 72.5100 });
      } else if (pincode === '400050') {
        setLocationWithCoords('Bandra West, Mumbai - 400050', { lat: 19.0596, lng: 72.8295 });
      } else {
        setLocation(`Ahmedabad Delivery Zone - ${pincode}`);
      }
      setIsLocationOpen(false);
    }
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.trim()) {
      setLocation(newAddress.trim());
      setShowAddressInput(false);
      setIsLocationOpen(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden'
      }}
      onClick={() => setIsLocationOpen(false)}
    >
      <div
        className="animate-slide-up"
        style={{
          background: '#151518',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: '1px solid #24242c',
          borderBottom: 'none',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '12px 18px 28px',
          boxSizing: 'border-box',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Centered Drag Handle Pill */}
        <div
          style={{
            width: 38,
            height: 4,
            background: '#44444d',
            borderRadius: 99,
            margin: '0 auto 16px'
          }}
        />

        {/* Modal Header */}
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 20
          }}
        >
          Select Location
        </h3>

        {/* Primary Action Button: "Detect Exact GPS Location" */}
        <button
          onClick={handleSetDeliveryLocation}
          disabled={isLocating}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            boxSizing: 'border-box',
            boxShadow: '0 4px 18px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.2s ease',
            opacity: isLocating ? 0.75 : 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
                {isLocating ? 'Detecting Exact GPS...' : 'Detect Exact GPS Location'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2 }}>
                {gpsStatus || (locationError ? locationError : 'Real-time road routing & express ETA calculation')}
              </div>
            </div>
          </div>

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Current Coordinates & Delivery Info Pill */}
        {userCoords && (
          <div
            style={{
              marginTop: 10,
              background: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>📍</span>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>
                  Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  {userCoords.accuracy ? ` (±${userCoords.accuracy}m)` : ''}
                </div>
                <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 1 }}>
                  From Ahmedabad Central Hub #01 ({deliveryDistanceKm} km road distance)
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 900, color: '#38bdf8' }}>
              ⚡ {deliveryMinutes}m ETA
            </div>
          </div>
        )}

        {/* Secondary Action Button: "Add new address" */}
        <button
          onClick={() => setShowAddressInput((prev) => !prev)}
          style={{
            width: '100%',
            background: '#222227',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            marginTop: 12,
            boxSizing: 'border-box',
            transition: 'background 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Plus icon in vibrant periwinkle blue */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5865f2"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
              Add new address
            </span>
          </div>

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Optional Expandable Add Address Form */}
        {showAddressInput && (
          <form
            onSubmit={handleSaveNewAddress}
            style={{
              marginTop: 12,
              background: '#1d1d23',
              border: '1px solid #30303b',
              borderRadius: 16,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <input
              type="text"
              placeholder="Flat / Building / Street address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              autoFocus
              style={{
                background: '#15151a',
                border: '1px solid #3d3d4b',
                borderRadius: 10,
                padding: '10px 12px',
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!newAddress.trim()}
              style={{
                background: newAddress.trim() ? '#5865f2' : '#2b2b34',
                color: newAddress.trim() ? '#fff' : '#686875',
                border: 'none',
                borderRadius: 10,
                padding: '10px',
                fontSize: 14,
                fontWeight: 700,
                cursor: newAddress.trim() ? 'pointer' : 'default'
              }}
            >
              Save Address
            </button>
          </form>
        )}

        {/* Separator "or" */}
        <div
          style={{
            textAlign: 'center',
            color: '#ffffff',
            fontSize: 15,
            fontWeight: 700,
            margin: '22px 0 18px'
          }}
        >
          or
        </div>

        {/* Section Label: "Your Pincode" */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: 12,
            textAlign: 'left'
          }}
        >
          Your Pincode
        </div>

        {/* Pincode Input Box with Integrated Continue Button */}
        <form
          onSubmit={handleContinuePincode}
          style={{
            background: '#1c1c21',
            border: '1.5px solid #5865f2',
            borderRadius: 14,
            padding: '7px 8px 7px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            {/* Map Pin Icon in blue */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5865f2"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <input
              type="text"
              inputMode="numeric"
              placeholder="4000XX"
              value={pincode}
              maxLength={6}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPincode(val);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: pincode ? '1px' : '0.5px',
                width: '100%'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={pincode.length !== 6}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              background: pincode.length === 6 ? '#5865f2' : '#2b2b34',
              color: pincode.length === 6 ? '#ffffff' : '#686875',
              cursor: pincode.length === 6 ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            Continue
          </button>
        </form>

        {/* Helper Footer Link: "Don't remember your pincode? Click here" */}
        <div
          style={{
            marginTop: 14,
            fontSize: 13,
            color: '#8e8e93',
            textAlign: 'left',
            fontWeight: 500
          }}
        >
          Don’t remember your pincode?{' '}
          <span
            onClick={() => setShowHubs((prev) => !prev)}
            style={{
              color: '#5865f2',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Click here
          </span>
        </div>

        {/* Expandable Hubs List when "Click here" is tapped */}
        {showHubs && (
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid #272733',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Select Nearest Delivery Hub
            </div>

            {popularLocations.map((loc) => {
              const isSelected = location.includes(loc.name.split(',')[0]);
              return (
                <div
                  key={loc.name}
                  onClick={() => {
                    handleSelectPopular(loc);
                  }}
                  style={{
                    background: isSelected ? 'rgba(88, 101, 242, 0.15)' : '#1e1e25',
                    border: isSelected ? '1px solid #5865f2' : '1px solid #2c2c38',
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5865f2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{loc.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{loc.area}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>⚡ {loc.eta}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
