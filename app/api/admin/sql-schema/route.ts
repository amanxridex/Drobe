import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'supabase_schema.sql');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'supabase_schema.sql file not found' }, { status: 404 });
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json({
      sql,
      lineCount: sql.split('\n').length,
      byteSize: Buffer.byteLength(sql, 'utf8'),
      projectRef: 'eswnhehlnzasiaybjikh',
      runnerUrl: 'https://supabase.com/dashboard/project/eswnhehlnzasiaybjikh/sql/new'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to read schema file' }, { status: 500 });
  }
}
