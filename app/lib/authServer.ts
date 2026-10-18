import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eswnhehlnzasiaybjikh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzd25oZWhsbnphc2lheWJqaWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5Njc4MDUsImV4cCI6MjEwNzU0MzgwNX0.9aw2R0ZtRC9Cv-9j05GgrNd0PcnxaTbyw7uf-2x7l0M';

export const supabaseServer: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-Memory Backup Store for active OTPs (ensures fast local verification even if DB connection has high latency)
interface StoredOtpData {
  otp: string;
  purpose: 'signup' | 'forgot_password';
  expiresAt: number; // timestamp
  verified: boolean;
  attempts: number;
}
const LOCAL_OTP_CACHE = new Map<string, StoredOtpData>();

/**
 * Hash password securely using Node.js native PBKDF2 (SHA-512, 100,000 iterations)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    // If legacy plain-text password match fallback
    return password === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * Generate cryptographically secure 6-digit OTP
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Save OTP to Database (drobe_app_configs table) & Local Cache
 */
export async function saveOtpToDb(
  email: string,
  otp: string,
  purpose: 'signup' | 'forgot_password'
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  const otpPayload: StoredOtpData = {
    otp,
    purpose,
    expiresAt,
    verified: false,
    attempts: 0
  };

  // 1. Update in-memory fast cache
  const cacheKey = `${purpose}:${cleanEmail}`;
  LOCAL_OTP_CACHE.set(cacheKey, otpPayload);

  // 2. Persist to Supabase drobe_app_configs table
  try {
    const configKey = `auth:otp:${purpose}:${cleanEmail}`;
    await supabaseServer
      .from('drobe_app_configs')
      .upsert({
        key: configKey,
        value: {
          email: cleanEmail,
          otp,
          purpose,
          expires_at: new Date(expiresAt).toISOString(),
          verified: false,
          created_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      });
    return true;
  } catch (err) {
    console.warn('[Auth] Failed to persist OTP to drobe_app_configs, in-memory cache active:', err);
    return true; // Still true since memory cache is active
  }
}

/**
 * Verify OTP from Database or Local Cache
 */
export async function verifyOtpFromDb(
  email: string,
  inputOtp: string,
  purpose: 'signup' | 'forgot_password'
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanInputOtp = inputOtp.trim();
  const cacheKey = `${purpose}:${cleanEmail}`;
  const now = Date.now();

  let storedData: StoredOtpData | null = null;

  // 1. Check in-memory cache first
  const memoryData = LOCAL_OTP_CACHE.get(cacheKey);
  if (memoryData) {
    storedData = memoryData;
  } else {
    // 2. Fallback to Supabase drobe_app_configs
    try {
      const configKey = `auth:otp:${purpose}:${cleanEmail}`;
      const { data, error } = await supabaseServer
        .from('drobe_app_configs')
        .select('value')
        .eq('key', configKey)
        .single();

      if (!error && data?.value) {
        storedData = {
          otp: data.value.otp,
          purpose: data.value.purpose,
          expiresAt: new Date(data.value.expires_at).getTime(),
          verified: Boolean(data.value.verified),
          attempts: 0
        };
      }
    } catch (err) {
      console.warn('[Auth] Error querying drobe_app_configs for OTP:', err);
    }
  }

  if (!storedData) {
    return {
      success: false,
      error: 'No active verification code found for this email. Please request a new OTP.'
    };
  }

  // Check expiry
  if (now > storedData.expiresAt) {
    LOCAL_OTP_CACHE.delete(cacheKey);
    return {
      success: false,
      error: 'This verification code has expired (10-minute limit). Please request a new code.'
    };
  }

  // Check attempts
  if (storedData.attempts >= 5) {
    LOCAL_OTP_CACHE.delete(cacheKey);
    return {
      success: false,
      error: 'Too many incorrect attempts. Please request a new code.'
    };
  }

  // Check code match
  if (storedData.otp !== cleanInputOtp) {
    storedData.attempts += 1;
    LOCAL_OTP_CACHE.set(cacheKey, storedData);
    return {
      success: false,
      error: 'Incorrect 6-digit code. Please verify the code sent to your inbox.'
    };
  }

  // Valid! Mark as verified
  storedData.verified = true;
  LOCAL_OTP_CACHE.set(cacheKey, storedData);

  // Update in Supabase
  try {
    const configKey = `auth:otp:${purpose}:${cleanEmail}`;
    await supabaseServer
      .from('drobe_app_configs')
      .update({
        value: {
          ...storedData,
          verified: true,
          verified_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('key', configKey);
  } catch {}

  return { success: true };
}

/**
 * Check if a Brand Email Already Exists in Database
 */
export async function checkEmailExistsInDb(email: string): Promise<{ exists: boolean; brand?: any }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { exists: false };
  }

  try {
    // 1. Check email column in drobe_brands
    const { data: byEmail, error: errEmail } = await supabaseServer
      .from('drobe_brands')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (!errEmail && byEmail && byEmail.length > 0) {
      return { exists: true, brand: byEmail[0] };
    }

    // 2. Check inquiries_email column in drobe_brands
    const { data: byInq, error: errInq } = await supabaseServer
      .from('drobe_brands')
      .select('*')
      .ilike('inquiries_email', cleanEmail)
      .limit(1);

    if (!errInq && byInq && byInq.length > 0) {
      return { exists: true, brand: byInq[0] };
    }

    // 3. Check dossier_data JSONB for email
    const { data: byDossier, error: errDossier } = await supabaseServer
      .from('drobe_brands')
      .select('*')
      .filter('dossier_data->>email', 'ilike', cleanEmail)
      .limit(1);

    if (!errDossier && byDossier && byDossier.length > 0) {
      return { exists: true, brand: byDossier[0] };
    }

    return { exists: false };
  } catch (err) {
    console.warn('[Auth] checkEmailExistsInDb exception:', err);
    return { exists: false };
  }
}

/**
 * Update Brand Password in Database
 */
export async function updateBrandPasswordInDb(email: string, newPassword: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(newPassword);

  try {
    // First find the brand by email
    const { exists, brand } = await checkEmailExistsInDb(cleanEmail);
    if (!exists || !brand) {
      return false;
    }

    const updatedDossier = {
      ...(brand.dossier_data || {}),
      passwordHash,
      emailVerified: true,
      passwordUpdatedAt: new Date().toISOString()
    };

    const { error } = await supabaseServer
      .from('drobe_brands')
      .update({
        dossier_data: updatedDossier,
        updated_at: new Date().toISOString()
      })
      .eq('id', brand.id);

    return !error;
  } catch (err) {
    console.warn('[Auth] updateBrandPasswordInDb exception:', err);
    return false;
  }
}

/**
 * Verify Brand Credentials (Login)
 */
export async function authenticateBrand(email: string, password: string): Promise<{ success: boolean; brand?: any; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const { exists, brand } = await checkEmailExistsInDb(cleanEmail);

  if (!exists || !brand) {
    return { success: false, error: 'No brand account found with this email. Please register first.' };
  }

  const storedHash = brand.dossier_data?.passwordHash || brand.dossier_data?.password;
  if (!storedHash) {
    // Brand was pre-seeded without password, allow setting password via OTP
    return { 
      success: false, 
      error: 'Account exists but requires password initialization. Please use "Forgot Password" to set your password.' 
    };
  }

  const isMatch = verifyPassword(password, storedHash);
  if (!isMatch) {
    return { success: false, error: 'Incorrect password. Please try again or click "Forgot Password".' };
  }

  return { success: true, brand };
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Persist Verified Brand Account in drobe_brands Database
 */
export async function saveVerifiedBrandAccount(
  email: string,
  password?: string,
  brandData?: any
): Promise<{ success: boolean; brand?: any; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = password ? hashPassword(password) : undefined;

  try {
    const { exists, brand: existingBrand } = await checkEmailExistsInDb(cleanEmail);

    if (exists && existingBrand) {
      const updatedDossier = {
        ...(existingBrand.dossier_data || {}),
        ...(brandData || {}),
        email: cleanEmail,
        emailVerified: true,
        ...(passwordHash ? { passwordHash, passwordUpdatedAt: new Date().toISOString() } : {})
      };

      const { data, error } = await supabaseServer
        .from('drobe_brands')
        .update({
          email: cleanEmail,
          dossier_data: updatedDossier,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBrand.id)
        .select()
        .single();

      if (error) {
        console.warn('[Auth] Error updating verified brand:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, brand: data || existingBrand };
    } else {
      const brandName = brandData?.name?.trim() || cleanEmail.split('@')[0];
      const brandId = brandData?.id || slugify(brandName) || `brand-${Date.now()}`;
      const founderName = brandData?.founderName || brandData?.founder_name || brandName;
      const basedOutOf = brandData?.basedOutOf || brandData?.based_out_of || 'Ahmedabad · India';

      const newDossier = {
        ...(brandData || {}),
        id: brandId,
        name: brandName,
        founderName,
        basedOutOf,
        email: cleanEmail,
        emailVerified: true,
        ...(passwordHash ? { passwordHash, passwordUpdatedAt: new Date().toISOString() } : {}),
        registeredAt: new Date().toISOString()
      };

      const recordToSave = {
        id: brandId,
        name: brandName,
        founder_name: founderName,
        email: cleanEmail,
        based_out_of: basedOutOf,
        status: brandData?.status || 'Draft',
        dossier_data: newDossier,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseServer
        .from('drobe_brands')
        .insert(recordToSave)
        .select()
        .single();

      if (error) {
        // Upsert fallback
        const { data: upsertData, error: upsertErr } = await supabaseServer
          .from('drobe_brands')
          .upsert(recordToSave)
          .select()
          .single();

        if (upsertErr) {
          console.warn('[Auth] Error upserting new brand:', upsertErr.message);
          return { success: false, error: upsertErr.message };
        }
        return { success: true, brand: upsertData };
      }

      return { success: true, brand: data };
    }
  } catch (err: any) {
    console.warn('[Auth] saveVerifiedBrandAccount exception:', err);
    return { success: false, error: err?.message || 'Failed to save brand account' };
  }
}
