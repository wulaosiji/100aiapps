import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 直接读取静态JSON文件
    const jsonPath = path.join(process.cwd(), 'temp', 'excel-data.json');
    
    try {
      // 读取JSON文件
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(jsonData);
      
      return NextResponse.json(data);
    } catch (fileError) {
      console.error('读取JSON文件失败:', fileError);
      return NextResponse.json({ error: '读取数据失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('加载Excel数据错误:', error);
    return NextResponse.json({ error: '加载Excel数据失败' }, { status: 500 });
  }
} 