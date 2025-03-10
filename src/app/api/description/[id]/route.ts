export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// @ts-ignore 忽略接下来的类型错误
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const descriptionsDir = path.join(process.cwd(), 'public', 'data', 'descriptions');
    
    // 检查描述文件是否存在
    try {
      // 尝试创建目录（如果不存在）
      await fs.mkdir(descriptionsDir, { recursive: true });
      
      const descriptionPath = path.join(descriptionsDir, `${id}.txt`);
      
      try {
        // 尝试读取已存在的描述文件
        const description = await fs.readFile(descriptionPath, 'utf8');
        return NextResponse.json({ description });
      } catch (fileError) {
        // 文件不存在，返回空描述
        return NextResponse.json({ description: '' });
      }
    } catch (dirError) {
      console.error('Error creating descriptions directory:', dirError);
      return NextResponse.json({ description: '' });
    }
  } catch (error) {
    console.error('Error loading description:', error);
    return NextResponse.json({ error: 'Failed to load description' }, { status: 500 });
  }
}

// @ts-ignore 忽略接下来的类型错误
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // 在静态导出模式下，我们简单返回成功
    // 在实际部署时，这个API会被替换为客户端数据处理
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving description:', error);
    return NextResponse.json({ error: 'Failed to save description' }, { status: 500 });
  }
}
