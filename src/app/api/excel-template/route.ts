import { NextRequest, NextResponse } from 'next/server';
import { generateExcelTemplate } from '@/lib/excelParser';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数中的type
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'Web' | 'App' | 'All' || 'All';
    
    // 生成Excel模板
    const excelData = generateExcelTemplate(type);
    
    // 根据类型设置文件名
    let fileName = 'excel-template';
    if (type === 'Web') {
      fileName = 'web-template';
    } else if (type === 'App') {
      fileName = 'app-template';
    } else {
      fileName = 'all-templates';
    }
    
    // 返回Excel文件
    return new NextResponse(excelData, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('生成Excel模板错误:', error);
    return NextResponse.json({ error: '生成Excel模板失败' }, { status: 500 });
  }
} 