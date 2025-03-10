import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let productName = url.searchParams.get('name');
    
    // 确保productName存在且为字符串
    if (!productName) {
      return NextResponse.json(
        { error: '缺少产品名称参数' }, 
        { status: 400 }
      );
    }
    
    // 解码URL编码的参数
    try {
      productName = decodeURIComponent(productName);
    } catch (e) {
      console.error('解码产品名称失败:', e);
      // 如果解码失败，继续使用原始值
    }
    
    console.log(`正在搜索产品: ${productName}`);
    
    // 针对一些常见产品直接返回已知ID
    const knownProducts: Record<string, string> = {
      'ChatGPT': '6447795913',
      'Claude': '1648466641',
      '微信': '414478124',
      'WeChat': '414478124',
      'QQ': '444934666',
      '支付宝': '333206289',
      'Alipay': '333206289',
      '淘宝': '387682726',
      'Taobao': '387682726',
      '京东': '414245413',
      'JD': '414245413',
      '抖音': '1142110895',
      'TikTok': '835599320',
      '快手': '440948110',
      'Duolingo': '570060128',
      'Canva': '897446215',
      'FaceApp': '1180884341',
      'Facetune': '606310581',
      '美图秀秀': '416048305',
      'Picsart': '587366035',
      'Lightroom': '878783582',
      '夸克': '1160172628',
      'Remini': '1470373330'
    };
    
    // 检查是否是已知产品
    if (knownProducts[productName]) {
      const appId = knownProducts[productName];
      const directUrl = `https://apps.apple.com/app/id${appId}`;
      console.log(`找到已知产品ID: ${appId}`);
      return NextResponse.json({ url: directUrl, isDirectLink: true });
    }
    
    // 对于未知产品，返回搜索链接
    const searchLink = `https://apps.apple.com/cn/search?term=${encodeURIComponent(productName)}`;
    console.log(`使用搜索URL: ${searchLink}`);
    return NextResponse.json({ url: searchLink, isDirectLink: false });
  } catch (error) {
    console.error('获取App Store链接出错:', error);
    return NextResponse.json(
      { error: '获取App Store链接时出错', details: String(error) }, 
      { status: 500 }
    );
  }
} 