'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandBankAccount } from './types';
import styles from './brand-dashboard.module.css';

interface AddBankAccountModalProps {
  currentAccount?: BrandBankAccount;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: BrandBankAccount) => void;
}

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'IndusInd Bank'
];

export default function AddBankAccountModal({
  currentAccount,
  isOpen,
  onClose,
  onSave
}: AddBankAccountModalProps) {
  const [holderName, setHolderName] = useState(currentAccount?.accountHolderName || '');
  const [bankName, setBankName] = useState(currentAccount?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(currentAccount?.accountNumber || '');
  const [confirmNumber, setConfirmNumber] = useState(currentAccount?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(currentAccount?.ifscCode || '');
  const [accountType, setAccountType] = useState<'Current' | 'Savings'>(currentAccount?.accountType || 'Current');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  React.useEffect(() => {
    if (isOpen && currentAccount) {
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

    const nameTrimmed = holderName.trim();
    if (!nameTrimmed || nameTrimmed.length < 3) {
      setErrorMsg('Please enter the full legal Account Holder Name.');
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
        accountHolderName: nameTrimmed,
        bankName: bankName.trim(),
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
        >
          {/* Header */}
          <div className={styles.bankModalHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={styles.bankModalPill}>T+1 SETTLEMENT ACCOUNT</span>
                <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <ShieldCheck size={12} /> IMPS Ready
                </span>
              </div>
              <h3 className={styles.bankModalTitle}>
                {currentAccount ? 'Update Bank Account' : 'Add Payout Bank Account'}
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
            {/* Account Holder Name */}
            <div className={styles.bankFieldGroup}>
              <label className={styles.bankFieldLabel}>Account Holder Name (as per Bank)</label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="e.g. Atelier Luxury Creations Pvt Ltd"
                className={styles.bankInput}
                autoFocus
              />
            </div>

            {/* Bank Name Selector */}
            <div className={styles.bankFieldGroup}>
              <label className={styles.bankFieldLabel}>Select Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className={styles.bankSelect}
              >
                {POPULAR_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className={styles.bankFieldGroup}>
              <label className={styles.bankFieldLabel}>Bank Account Number</label>
              <input
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className={styles.bankInput}
              />
            </div>

            {/* Confirm Account Number */}
            <div className={styles.bankFieldGroup}>
              <label className={styles.bankFieldLabel}>Re-enter Account Number</label>
              <input
                type="text"
                value={confirmNumber}
                onChange={(e) => setConfirmNumber(e.target.value)}
                placeholder="Re-enter account number to confirm"
                className={styles.bankInput}
              />
            </div>

            {/* IFSC Code & Account Type in two columns */}
            <div className={styles.bankTwoColRow}>
              <div className={styles.bankFieldGroup}>
                <label className={styles.bankFieldLabel}>IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
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

            {/* Security note */}
            <div className={styles.bankSecurityCallout}>
              <Building2 size={16} color="#0284c7" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                Settlement funds are automatically disbursed via IMPS directly into this account within <strong>T+1 business days</strong> following client acceptance.
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
                  <span>Verifying via Penny Drop...</span>
                ) : (
                  <>
                    <Check size={15} strokeWidth={2.6} />
                    <span>Verify & Link Bank</span>
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
