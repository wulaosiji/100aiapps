import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 直接读取静态JSON文件
    const jsonPath = path.join(process.cwd(), 'temp', 'excel-data.json');
    console.log('尝试读取JSON文件路径:', jsonPath);
    
    // 检查文件是否存在
    try {
      await fs.access(jsonPath);
      console.log('文件存在，开始读取');
    } catch (error: any) {
      console.error('文件不存在:', jsonPath);
      return NextResponse.json({ error: '数据文件不存在', path: jsonPath }, { status: 404 });
    }
    
    try {
      // 读取JSON文件
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      console.log('文件读取成功，正在解析JSON');
      
      // 验证JSON格式
      const data = JSON.parse(jsonData);
      console.log('JSON解析成功，返回数据');
      
      return NextResponse.json(data);
    } catch (fileError: any) {
      console.error('读取JSON文件失败:', fileError);
      return NextResponse.json({ error: '读取数据失败', message: fileError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('加载Excel数据错误:', error);
    return NextResponse.json({ error: '加载Excel数据失败', message: error.message }, { status: 500 });
  }
} 