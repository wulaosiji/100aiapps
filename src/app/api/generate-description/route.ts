export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 添加类型接口
interface GenerateDescriptionRequest {
  id?: string; // 用于存储文件的ID
  product: string;
  category: string;
  website?: string;
  mrr?: number;
  growthRate?: number;
  arr?: number;
  listType?: string;
  force?: boolean; // 强制重新生成
}

// 使用内部逻辑生成产品描述
async function generateProductDescription(productInfo: GenerateDescriptionRequest): Promise<{ description: string, source: string }> {
  console.log(`为 ${productInfo.product} 生成描述`);
  
  // 格式化数据
  const mrrFormatted = productInfo.mrr ? `${productInfo.mrr}万美金` : '未知';
  const growthRateFormatted = productInfo.growthRate 
    ? `${(productInfo.growthRate * 100).toFixed(2)}%` 
    : '未知';
  const arrFormatted = productInfo.arr ? `${productInfo.arr}万美金` : '未知';
  const website = productInfo.website || '未知';
  
  // 根据增长率调整描述语气
  let growthDescription = '';
  if (productInfo.growthRate) {
    if (productInfo.growthRate > 0.2) {
      growthDescription = '增长迅猛，处于高速发展阶段';
    } else if (productInfo.growthRate > 0.1) {
      growthDescription = '保持着良好的增长势头';
    } else if (productInfo.growthRate > 0.05) {
      growthDescription = '增长稳健';
    } else if (productInfo.growthRate > 0) {
      growthDescription = '保持着稳定增长';
    } else {
      growthDescription = '正在经历市场调整';
    }
  }
  
  // 根据月收入规模调整描述
  let marketPosition = '';
  if (productInfo.mrr) {
    if (productInfo.mrr > 10000) {
      marketPosition = '在全球市场占据领先地位，是该领域的标杆产品';
    } else if (productInfo.mrr > 5000) {
      marketPosition = '在市场上占据重要位置，是该领域的主要参与者';
    } else if (productInfo.mrr > 1000) {
      marketPosition = '在市场上表现良好，拥有相当的市场份额';
    } else {
      marketPosition = '在市场中稳步发展，拥有自己的用户群体';
    }
  }
  
  // 生成产品描述
  const description = `${productInfo.product}是${productInfo.category}领域的知名产品，${marketPosition}。其官方网站为${website}。

该产品月收入(MRR)约${mrrFormatted}，环比增长率${growthRateFormatted}，年收入(ARR)约${arrFormatted}，${growthDescription}。

${productInfo.product}提供了丰富的功能和直观的用户体验，致力于为用户提供最佳的${productInfo.category}解决方案。产品不断创新和优化，以满足用户不断变化的需求，同时保持高水平的质量和性能。

凭借其专业性和易用性，${productInfo.product}获得了广泛的用户认可，包括个人用户和企业客户，在${productInfo.listType || 'Web'}榜单中表现优异。`;
  
  return {
    description,
    source: '系统生成'
  };
}

// 文件存储相关函数
async function saveDescriptionToFile(id: string, description: string): Promise<void> {
  const descriptionsDir = path.join(process.cwd(), 'public', 'data', 'descriptions');
  
  try {
    await fs.mkdir(descriptionsDir, { recursive: true });
    await fs.writeFile(path.join(descriptionsDir, `${id}.txt`), description);
    console.log(`描述已保存到文件: ${id}.txt`);
  } catch (error) {
    console.error(`保存描述文件时出错:`, error);
    throw error;
  }
}

// 检查描述文件是否存在
async function checkDescriptionExists(id: string): Promise<boolean> {
  const descriptionsDir = path.join(process.cwd(), 'public', 'data', 'descriptions');
  try {
    await fs.access(path.join(descriptionsDir, `${id}.txt`));
    return true;
  } catch {
    return false;
  }
}

// 读取现有描述文件
async function readDescriptionFile(id: string): Promise<string> {
  const descriptionsDir = path.join(process.cwd(), 'public', 'data', 'descriptions');
  try {
    return await fs.readFile(path.join(descriptionsDir, `${id}.txt`), 'utf-8');
  } catch (error) {
    console.error(`读取描述文件时出错:`, error);
    throw error;
  }
}

// API路由处理函数
export async function POST(request: Request) {
  try {
    const data: GenerateDescriptionRequest = await request.json();
    const { id, product, category, website, mrr, growthRate, arr, listType, force } = data;
    
    // 验证必要参数
    if (!product) {
      return NextResponse.json({ 
        error: '缺少必要参数: product' 
      }, { status: 400 });
    }
    
    if (!category) {
      return NextResponse.json({ 
        error: '缺少必要参数: category' 
      }, { status: 400 });
    }
    
    // 生成文件ID（如果未提供）
    const fileId = id || `${listType || 'Web'}-${product}`;
    
    // 检查是否需要强制重新生成
    if (!force) {
      // 检查文件是否已存在
      const exists = await checkDescriptionExists(fileId);
      if (exists) {
        // 如果文件存在，直接返回该文件内容
        const description = await readDescriptionFile(fileId);
        return NextResponse.json({ description, source: '缓存数据' });
      }
    }
    
    // 生成产品描述
    const result = await generateProductDescription({
      product,
      category,
      website,
      mrr,
      growthRate,
      arr,
      listType
    });
    
    // 保存描述到文件
    await saveDescriptionToFile(fileId, result.description);
    
    // 返回响应
    return NextResponse.json({ 
      description: result.description, 
      source: result.source
    });
    
  } catch (error) {
    console.error('处理请求时出错:', error);
    return NextResponse.json({ 
      error: '处理请求时出错', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
