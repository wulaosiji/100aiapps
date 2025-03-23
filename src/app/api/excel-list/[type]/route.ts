import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// @ts-ignore 忽略接下来的类型错误
export async function GET(
  request: Request, 
  { params }: { params: { type: string } }
) {
  try {
    // 正确等待动态路由参数
    if (!params || typeof params !== 'object') {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }
    
    const type = String(params.type || '');
    
    if (!['Web', 'App', 'all'].includes(type)) {
      return NextResponse.json({ error: 'Invalid list type' }, { status: 400 });
    }
    
    // 直接从文件系统读取JSON数据
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'excel-data.json');
    const fileData = await fs.readFile(jsonPath, 'utf8');
    const allData = JSON.parse(fileData);
    
    // 根据type参数返回相应榜单数据
    const listData = allData[type];
    
    // 确保返回的数据是数组
    if (!Array.isArray(listData)) {
      console.error(`类型 ${type} 的数据不是数组:`, listData);
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(listData);
  } catch (error) {
    console.error('Error loading list data:', error);
    return NextResponse.json({ error: 'Failed to load list data' }, { status: 500 });
  }
} 