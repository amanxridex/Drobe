'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Check, ShieldCheck, AlertCircle, Zap } from 'lucide-react';
import { BrandBankAccount } from './types';
import { POPULAR_BANKS, ALL_INDIAN_BANKS, POPULAR_UPI_HANDLES } from './indianBanks';
import styles from './brand-dashboard.module.css';

interface AddBankAccountModalProps {
  currentAccount?: BrandBankAccount;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: BrandBankAccount) => void;
}

export default function AddBankAccountModal({
  currentAccount,
  isOpen,
  onClose,
  onSave
}: AddBankAccountModalProps) {
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>(
    currentAccount?.payoutMethod || (currentAccount?.upiId ? 'upi' : 'bank')
  );
  const [upiId, setUpiId] = useState(currentAccount?.upiId || '');
  const [holderName, setHolderName] = useState(currentAccount?.accountHolderName || '');
  const [bankName, setBankName] = useState(currentAccount?.bankName || 'HDFC Bank');
  const [isOtherBank, setIsOtherBank] = useState(false);
  const [customBankName, setCustomBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState(currentAccount?.accountNumber || '');
  const [confirmNumber, setConfirmNumber] = useState(currentAccount?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(currentAccount?.ifscCode || '');
  const [accountType, setAccountType] = useState<'Current' | 'Savings'>(currentAccount?.accountType || 'Current');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  React.useEffect(() => {
    if (isOpen && currentAccount) {
      setPayoutMethod(currentAccount.payoutMethod || (currentAccount.upiId ? 'upi' : 'bank'));
      setUpiId(currentAccount.upiId || '');
      setHolderName(currentAccount.accountHolderName || '');
      setBankName(currentAccount.bankName || 'HDFC Bank');
      setAccountNumber(currentAccount.accountNumber || '');
      setConfirmNumber(currentAccount.accountNumber || '');
      setIfscCode(currentAccount.ifscCode || '');
      setAccountType(currentAccount.accountType || 'Current');
      setErrorMsg(null);
    }
  }, [isOpen, currentAccount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (payoutMethod === 'upi') {
      const nameTrimmed = holderName.trim();
      if (!nameTrimmed || nameTrimmed.length < 3) {
        setErrorMsg('Please enter the Beneficiary / Legal Entity Name registered with your UPI.');
        return;
      }
      const upiTrimmed = upiId.trim().toLowerCase();
      if (!upiTrimmed || !upiTrimmed.includes('@') || upiTrimmed.length < 5) {
        setErrorMsg('Please enter a valid UPI ID (e.g. brand@okhdfcbank or business@upi).');
        return;
      }

      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        onSave({
          payoutMethod: 'upi',
          upiId: upiTrimmed,
          accountHolderName: nameTrimmed,
          bankName: 'UPI Instant Settlement',
          accountNumber: '',
          ifscCode: '',
          accountType: 'Current',
          isVerified: true
        });
        onClose();
      }, 450);
      return;
    }

    // Direct Bank Transfer validation
    const nameTrimmed = holderName.trim();
    if (!nameTrimmed || nameTrimmed.length < 3) {
      setErrorMsg('Please enter the full legal Account Holder Name.');
      return;
    }

    const finalBankName = isOtherBank ? (customBankName.trim() || 'Other Bank') : bankName.trim();
    if (!finalBankName || finalBankName === 'Other Bank (Specify Below)') {
      setErrorMsg('Please select or specify your Bank Name.');
      return;
    }

    const accTrimmed = accountNumber.trim().replace(/\s/g, '');
    if (!accTrimmed || accTrimmed.length < 8) {
      setErrorMsg('Please enter a valid Account Number (min. 8 digits).');
      return;
    }

    const confirmTrimmed = confirmNumber.trim().replace(/\s/g, '');
    if (accTrimmed !== confirmTrimmed) {
      setErrorMsg('Account Numbers do not match. Please verify.');
      return;
    }

    const ifscTrimmed = ifscCode.trim().toUpperCase();
    if (!ifscTrimmed || ifscTrimmed.length !== 11) {
      setErrorMsg('Please enter a valid 11-character IFSC Code (e.g. HDFC0001234).');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onSave({
        payoutMethod: 'bank',
        upiId: '',
        accountHolderName: nameTrimmed,
        bankName: finalBankName,
        accountNumber: accTrimmed,
        ifscCode: ifscTrimmed,
        accountType: accountType,
        isVerified: true
      });
      onClose();
    }, 450);
  };

  return (
    <AnimatePresence>
      <div 
        className={styles.modalOverlayBackdrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          className={styles.bankModalSheet}
          style={{ maxWidth: '540px' }}
        >
          {/* Header */}
          <div className={styles.bankModalHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={styles.bankModalPill}>SETTLEMENT ACCOUNT</span>
                <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <ShieldCheck size={12} /> {payoutMethod === 'upi' ? 'Instant VPA Ready' : 'IMPS / RTGS Ready'}
                </span>
              </div>
              <h3 className={styles.bankModalTitle}>
                {currentAccount ? 'Update Payout Account' : 'Add Settlement Payout Account'}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={styles.bankModalCloseBtn}
            >
              <X size={18} />
            </button>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className={styles.bankErrorNotice}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.bankModalForm}>
            {/* Payout Method Tabs */}
            <div style={{ marginBottom: '16px' }}>
              <label className={styles.bankFieldLabel} style={{ marginBottom: '6px' }}>
                Settlement Payout Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1.5px solid ${payoutMethod !== 'upi' ? '#2563eb' : '#e2e8f0'}`,
                    backgroundColor: payoutMethod !== 'upi' ? '#eff6ff' : '#ffffff',
                    color: payoutMethod !== 'upi' ? '#1d4ed8' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <Building2 size={15} />
                  <span>Bank (NEFT / RTGS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('upi')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1.5px solid ${payoutMethod === 'upi' ? '#7c3aed' : '#e2e8f0'}`,
                    backgroundColor: payoutMethod === 'upi' ? '#f5f3ff' : '#ffffff',
                    color: payoutMethod === 'upi' ? '#6d28d9' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={15} color={payoutMethod === 'upi' ? '#7c3aed' : '#94a3b8'} />
                  <span>UPI ID / VPA (Instant)</span>
                </button>
              </div>
            </div>

            {payoutMethod === 'upi' ? (
              /* UPI VIEW */
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  fontSize: '11.5px',
                  color: '#5b21b6',
                  lineHeight: 1.4
                }}>
                  <Zap size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Instant UPI Settlements:</strong> Daily door-trial sales and retained purchases are credited instantly to your verified UPI VPA handle.
                  </div>
                </div>

                {/* Beneficiary Name */}
                <div className={styles.bankFieldGroup}>
                  <label className={styles.bankFieldLabel}>Beneficiary / Entity Name *</label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="Full legal name or business registered name"
                    className={styles.bankInput}
                    autoFocus
                  />
                </div>

                {/* UPI ID */}
                <div className={styles.bankFieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className={styles.bankFieldLabel} style={{ marginBottom: 0 }}>UPI ID / VPA Handle *</label>
                    {upiId && upiId.includes('@') && (
                      <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={11} /> Valid VPA format
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.trim().toLowerCase())}
                    placeholder="e.g. yourbrand@okhdfcbank or business@upi"
                    className={styles.bankInput}
                  />

                  {/* Handle Suggestions */}
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Quick handles:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {POPULAR_UPI_HANDLES.map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            const prefix = upiId.split('@')[0] || 'brand';
                            setUpiId(`${prefix}${h}`);
                          }}
                          style={{
                            fontSize: '10.5px',
                            padding: '3px 7px',
                            borderRadius: '5px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#6d28d9',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* BANK TRANSFER VIEW */
              <>
                {/* Account Holder Name */}
                <div className={styles.bankFieldGroup}>
                  <label className={styles.bankFieldLabel}>Account Holder Name (as per Bank) *</label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="e.g. Brand Luxury Creations Pvt Ltd"
                    className={styles.bankInput}
                    autoFocus
                  />
                </div>

                {/* Bank Name Selector */}
                <div className={styles.bankFieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className={styles.bankFieldLabel} style={{ marginBottom: 0 }}>Select Bank *</label>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>All Indian Banks supported</span>
                  </div>

                  {/* Popular Bank Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {POPULAR_BANKS.map(b => {
                      const isSelected = bankName === b && !isOtherBank;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setIsOtherBank(false);
                            setBankName(b);
                          }}
                          style={{
                            fontSize: '10.5px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#f8fafc',
                            color: isSelected ? '#2563eb' : '#475569',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          {b}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtherBank(true);
                        setBankName('Other Bank (Specify Below)');
                      }}
                      style={{
                        fontSize: '10.5px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: isOtherBank ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        background: isOtherBank ? '#eff6ff' : '#f8fafc',
                        color: isOtherBank ? '#2563eb' : '#475569',
                        fontWeight: isOtherBank ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      + Other Bank
                    </button>
                  </div>

                  {/* Dropdown */}
                  <select
                    value={isOtherBank ? 'Other Bank (Specify Below)' : bankName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other Bank (Specify Below)') {
                        setIsOtherBank(true);
                        setBankName(val);
                      } else {
                        setIsOtherBank(false);
                        setBankName(val);
                      }
                    }}
                    className={styles.bankSelect}
                  >
                    <option value="" disabled>-- Choose From All Banks in India --</option>
                    {ALL_INDIAN_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  {/* Custom Bank Name Input */}
                  {isOtherBank && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        placeholder="Type your bank name, e.g. Saraswat Bank, Cosmos Bank..."
                        className={styles.bankInput}
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Account Number */}
                <div className={styles.bankFieldGroup}>
                  <label className={styles.bankFieldLabel}>Bank Account Number *</label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter account number"
                    className={styles.bankInput}
                    maxLength={22}
                  />
                </div>

                {/* Confirm Account Number */}
                <div className={styles.bankFieldGroup}>
                  <label className={styles.bankFieldLabel}>Re-enter Account Number *</label>
                  <input
                    type="text"
                    value={confirmNumber}
                    onChange={(e) => setConfirmNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Re-enter account number to confirm"
                    className={styles.bankInput}
                    maxLength={22}
                  />
                  {confirmNumber && accountNumber && (
                    <span style={{
                      fontSize: '11px',
                      marginTop: '4px',
                      fontWeight: 600,
                      color: confirmNumber === accountNumber ? '#16a34a' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {confirmNumber === accountNumber ? (
                        <>✓ Account numbers match</>
                      ) : (
                        <>✕ Numbers do not match</>
                      )}
                    </span>
                  )}
                </div>

                {/* IFSC Code & Account Type in two columns */}
                <div className={styles.bankTwoColRow}>
                  <div className={styles.bankFieldGroup}>
                    <label className={styles.bankFieldLabel}>IFSC Code *</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. HDFC0001234"
                      maxLength={11}
                      className={styles.bankInput}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className={styles.bankFieldGroup}>
                    <label className={styles.bankFieldLabel}>Account Type</label>
                    <div className={styles.bankTypePills}>
                      <button
                        type="button"
                        onClick={() => setAccountType('Current')}
                        className={`${styles.bankTypeBtn} ${accountType === 'Current' ? styles.bankTypeBtnActive : ''}`}
                      >
                        Current
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('Savings')}
                        className={`${styles.bankTypeBtn} ${accountType === 'Savings' ? styles.bankTypeBtnActive : ''}`}
                      >
                        Savings
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Security note */}
            <div className={styles.bankSecurityCallout}>
              <ShieldCheck size={16} color="#0284c7" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                Settlement funds are automatically disbursed directly into this verified destination within <strong>T+1 business days</strong> following door-trial customer acceptance.
              </div>
            </div>

            {/* Actions */}
            <div className={styles.bankActionsRow}>
              <button
                type="button"
                onClick={onClose}
                className={styles.bankCancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className={styles.bankSaveBtn}
              >
                {isVerifying ? (
                  <span>Verifying Destination...</span>
                ) : (
                  <>
                    <Check size={15} strokeWidth={2.6} />
                    <span>{payoutMethod === 'upi' ? 'Verify & Link UPI' : 'Verify & Link Bank'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

