export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { loadExcelFromPath } from '@/lib/excelParser';

export async function GET() {
  try {
    // 直接从Excel文件加载数据
    const excelFilePath = path.join(process.cwd(), 'public', 'data', '100aiapps-ranking.xlsx');
    const appLists = await loadExcelFromPath(excelFilePath);
    
    return NextResponse.json(appLists.all);
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
