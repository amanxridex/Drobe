'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LocationModal() {
  const { isLocationOpen, setIsLocationOpen, location, setLocation } = useApp();
  const [pincode, setPincode] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [showHubs, setShowHubs] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  if (!isLocationOpen) return null;

  const popularLocations = [
    { name: 'Shreepal Complex, Suren Rd, Mumbai', area: 'Andheri East, Mumbai - 400093', eta: '60 mins' },
    { name: 'Bandra Linking Road, Mumbai', area: 'Bandra West, Mumbai - 400050', eta: '60 mins' },
    { name: 'Juhu Tara Road, Mumbai', area: 'Juhu, Mumbai - 400049', eta: '60 mins' },
    { name: 'Koramangala 4th Block, Bangalore', area: 'Koramangala, Bangalore - 560034', eta: '60 mins' },
    { name: 'Indiranagar 100ft Road, Bangalore', area: 'Indiranagar, Bangalore - 560038', eta: '60 mins' },
    { name: 'Vesu Main Road, Surat', area: 'Vesu, Surat - 395007', eta: '60 mins' }
  ];

  const handleSetDeliveryLocation = () => {
    setDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation('Andheri East, Mumbai (Current GPS)');
          setDetectingGps(false);
          setIsLocationOpen(false);
        },
        () => {
          setLocation('Shreepal Complex, Suren Rd, Mumbai');
          setDetectingGps(false);
          setIsLocationOpen(false);
        },
        { timeout: 3500 }
      );
    } else {
      setLocation('Shreepal Complex, Suren Rd, Mumbai');
      setDetectingGps(false);
      setIsLocationOpen(false);
    }
  };

  const handleContinuePincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      if (pincode === '400093') {
        setLocation('Shreepal Complex, Mumbai - 400093');
      } else if (pincode === '400050') {
        setLocation('Bandra West, Mumbai - 400050');
      } else if (pincode === '560034') {
        setLocation('Koramangala, Bangalore - 560034');
      } else {
        setLocation(`Mumbai Area - ${pincode}`);
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

        {/* Primary Action Button: "Set delivery location" */}
        <button
          onClick={handleSetDeliveryLocation}
          disabled={detectingGps}
          style={{
            width: '100%',
            background: '#5865f2',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            boxSizing: 'border-box',
            transition: 'opacity 0.2s ease, transform 0.1s ease',
            opacity: detectingGps ? 0.7 : 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Paper Airplane / Navigation pointer icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
              {detectingGps ? 'Detecting coordinates...' : 'Set delivery location'}
            </span>
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
                    setLocation(loc.name);
                    setIsLocationOpen(false);
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
