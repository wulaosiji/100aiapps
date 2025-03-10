import { NextResponse } from 'next/server';

export async function GET(
  request: Request, 
  context: { params: { type: string } }
) {
  try {
    // 正确等待动态路由参数
    if (!context.params || typeof context.params !== 'object') {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }
    
    const type = String(context.params.type || '');
    
    if (!['Web', 'App', 'all'].includes(type)) {
      return NextResponse.json({ error: 'Invalid list type' }, { status: 400 });
    }
    
    // 从主API获取数据
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/excel-data`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from excel-data endpoint');
    }
    
    const allData: Record<string, any> = await response.json();
    
    // 根据type参数返回相应榜单数据
    return NextResponse.json(allData[type]);
  } catch (error) {
    console.error('Error loading list data:', error);
    return NextResponse.json({ error: 'Failed to load list data' }, { status: 500 });
  }
} 