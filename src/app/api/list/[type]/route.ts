export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import path from 'path';
import { loadExcelFromPath } from '@/lib/excelParser';

// @ts-ignore 忽略接下来的类型错误
export async function GET(
  request: Request, 
  { params }: { params: { type: string } }
) {
  try {
    const listType = params.type;
    
    // 正确等待动态路由参数
    if (!listType || typeof listType !== 'string') {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }
    
    if (!['Web', 'App', 'all'].includes(listType)) {
      return NextResponse.json({ error: 'Invalid list type' }, { status: 400 });
    }
    
    // 从Excel文件加载数据
    const excelFilePath = path.join(process.cwd(), 'public', 'data', '100aiapps-ranking.xlsx');
    const appLists = await loadExcelFromPath(excelFilePath);
    
    // 根据type参数返回相应榜单数据
    return NextResponse.json(appLists[listType as keyof typeof appLists]);
  } catch (error) {
    console.error('Error loading list data:', error);
    return NextResponse.json({ error: 'Failed to load list data' }, { status: 500 });
  }
} 