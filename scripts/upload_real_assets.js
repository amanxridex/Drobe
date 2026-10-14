const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eswnhehlnzasiaybjikh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzd25oZWhsbnphc2lheWJqaWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5Njc4MDUsImV4cCI6MjEwNzU0MzgwNX0.9aw2R0ZtRC9Cv-9j05GgrNd0PcnxaTbyw7uf-2x7l0M';
const BUCKET = 'drobe-media';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif'
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function uploadFile(filePath, rootDir) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const storagePath = `assets/real/${relativePath}`;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

      if (!error) {
        return { success: true, storagePath };
      }

      // If RLS blocked upsert, try upload without upsert
      if (error && error.message && error.message.includes('row-level security')) {
        const fallback = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
          contentType,
          upsert: false
        });
        if (!fallback.error) {
          return { success: true, storagePath };
        }
      }

      if (attempt === 3) {
        return { success: false, storagePath, error: error.message };
      }
      await new Promise(r => setTimeout(r, 300 * attempt));
    } catch (err) {
      if (attempt === 3) {
        return { success: false, storagePath, error: err.message };
      }
      await new Promise(r => setTimeout(r, 300 * attempt));
    }
  }
}

async function runPool(items, limit, fn) {
  const results = [];
  let index = 0;
  let active = 0;
  let completed = 0;

  return new Promise((resolve) => {
    function next() {
      if (index >= items.length && active === 0) {
        return resolve(results);
      }

      while (active < limit && index < items.length) {
        const currentItem = items[index++];
        active++;

        fn(currentItem)
          .then(res => {
            results.push(res);
          })
          .catch(err => {
            results.push({ success: false, error: err.message });
          })
          .finally(() => {
            active--;
            completed++;
            if (completed % 100 === 0 || completed === items.length) {
              const pct = ((completed / items.length) * 100).toFixed(1);
              console.log(`[Progress] ${completed} / ${items.length} files processed (${pct}%)`);
            }
            next();
          });
      }
    }

    next();
  });
}

async function main() {
  const rootDir = path.resolve(__dirname, '../public/assets/real');
  console.log('Scanning files in:', rootDir);
  const files = getAllFiles(rootDir);
  console.log(`Found ${files.length} files to upload to Supabase bucket "${BUCKET}"...`);

  const startTime = Date.now();
  const CONCURRENCY = 25;
  console.log(`Starting upload pool with concurrency = ${CONCURRENCY}...`);

  const results = await runPool(files, CONCURRENCY, (file) => uploadFile(file, rootDir));

  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=============================================');
  console.log(`Upload Complete in ${durationSec}s!`);
  console.log(`Success: ${successes} / ${files.length}`);
  console.log(`Failures: ${failures.length}`);
  if (failures.length > 0) {
    console.log('Sample failure:', failures[0]);
  }
  console.log('Sample Public CDN URL:');
  const sampleUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/assets/real/${path.relative(rootDir, files[0]).replace(/\\/g, '/')}`;
  console.log(sampleUrl);
  console.log('=============================================\n');
}

main().catch(err => {
  console.error('Fatal upload error:', err);
  process.exit(1);
});
