import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { AppLists } from '@/lib/excelParser';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体JSON数据
    const data = await request.json() as AppLists;
    
    // 验证数据结构
    if (!data || !data.Web || !data.App || !data.all) {
      return NextResponse.json(
        { error: '无效的数据格式，必须包含Web、App和all属性' }, 
        { status: 400 }
      );
    }
    
    // 构建文件路径
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'excel-data.json');
    
    // 创建备份
    try {
      const backupPath = path.join(
        process.cwd(), 
        'public', 
        'data', 
        `excel-data-backup-${new Date().toISOString().replace(/:/g, '-')}.json`
      );
      await fs.copyFile(jsonPath, backupPath);
      console.log(`已创建数据备份: ${backupPath}`);
    } catch (backupError) {
      console.error('创建备份失败，但将继续保存新数据:', backupError);
    }
    
    // 将数据写入JSON文件
    await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
    
    // 返回成功响应
    return NextResponse.json({ 
      success: true, 
      message: '数据已成功保存到服务器',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('保存数据错误:', error);
    return NextResponse.json(
      { error: '保存数据失败', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 