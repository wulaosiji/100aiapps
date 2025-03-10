import * as XLSX from 'xlsx';

/**
 * AI应用数据接口
 * 
 * 包含Web榜单和App榜单的所有字段
 */
export interface AIApp {
  /** 应用排名 */
  rank: number;
  /** 产品名称 */
  product: string;
  /** 市场（国内/海外/出海） */
  market?: string;
  /** 应用分类 */
  category: string;
  /** 网站地址，仅Web榜单 */
  website?: string;
  /** 应用名称，仅App榜单 */
  app?: string;
  /** 月度经常性收入（万美金） */
  mrr?: number;
  /** 环比增长率（正数为增长，负数为下降） */
  growthRate: number;
  /** 年度经常性收入（万美金） */
  arr?: number;
  /** 月活用户数（万人） */
  monthlyActiveUsers?: number;
  /** 平均用户收入（美金） */
  arpu?: number;
  /** 榜单类型: 'Web', 'App' */
  listType?: string;
}

export interface AppLists {
  Web: AIApp[];
  App: AIApp[];
  all: AIApp[]; // 包含所有榜单的所有应用
}

/**
 * 解析Web榜单数据
 * @param jsonData 工作表JSON数据
 * @returns AIApp数组
 */
function parseWebData(jsonData: any[]): AIApp[] {
  return jsonData.map((row: any) => ({
    rank: row['排名'],
    product: row['产品'],
    market: row['市场'],
    category: row['分类'],
    website: row['网址'],
    mrr: row['MRR\n(万美金)'],
    growthRate: row['环比变化'],
    arr: row['ARR\n(万美金)'],
    monthlyActiveUsers: row['月活\n（万人）'],
    arpu: row['ARPU\n(美金)'],
    listType: 'Web'
  }));
}

/**
 * 解析App榜单数据
 * @param jsonData 工作表JSON数据
 * @returns AIApp数组
 */
function parseAppData(jsonData: any[]): AIApp[] {
  return jsonData.map((row: any) => ({
    rank: row['排名'],
    product: row['产品'],
    market: row['市场'],
    category: row['分类'],
    app: row['应用'],
    mrr: row['MRR\n(万美金)'],
    growthRate: row['环比变化'],
    arr: row['ARR\n(万美金)'],
    monthlyActiveUsers: row['月活\n（万人）'],
    arpu: row['ARPU\n(美金)'],
    listType: 'App'
  }));
}

/**
 * 解析Excel文件并返回AI应用数据
 * @param file Excel文件对象
 * @returns 解析后的AI应用数据
 */
export async function parseExcelFile(file: File): Promise<AppLists> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log("工作表列表:", workbook.SheetNames);
        
        const result: AppLists = {
          Web: [],
          App: [],
          all: []
        };
        
        // 遍历所有工作表
        for (const sheetName of workbook.SheetNames) {
          console.log("处理工作表:", sheetName);
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // 打印工作表的第一行数据，用于调试
          if (jsonData.length > 0) {
            console.log("第一行数据示例:", JSON.stringify(jsonData[0], null, 2));
          } else {
            console.log("工作表为空");
            continue;
          }
          
          // 直接使用工作表名称
          if (sheetName === 'Web') {
            result.Web = parseWebData(jsonData);
            result.all = [...result.all, ...result.Web];
            console.log(`已解析Web榜单，包含 ${result.Web.length} 条记录`);
          } else if (sheetName === 'App') {
            result.App = parseAppData(jsonData);
            result.all = [...result.all, ...result.App];
            console.log(`已解析App榜单，包含 ${result.App.length} 条记录`);
          } else {
            console.log(`跳过工作表 ${sheetName}`);
          }
        }
        
        console.log("总记录数:", result.all.length);
        console.log("Web榜单记录数:", result.Web.length);
        console.log("App榜单记录数:", result.App.length);
        
        resolve(result);
      } catch (error) {
        console.error("Excel解析错误:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    // 读取文件为ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 从本地路径加载Excel文件（用于开发测试）
 * @param filePath 本地Excel文件路径
 * @returns 解析后的AI应用数据
 */
export async function loadExcelFromPath(filePath: string): Promise<AppLists> {
  // 这个函数只在服务器端运行
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used on the server side');
  }
  
  try {
    console.log("正在加载Excel文件:", filePath);
    
    // 使用Node.js的fs模块读取文件
    const fs = require('fs');
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`文件不存在: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }
    
    const data = fs.readFileSync(filePath);
    console.log("文件大小:", data.length, "字节");
    
    // 解析Excel文件
    const workbook = XLSX.read(data, { type: 'buffer' });
    console.log("工作表列表:", workbook.SheetNames);
    
    const result: AppLists = {
      Web: [],
      App: [],
      all: []
    };
    
    // 遍历所有工作表
    for (const sheetName of workbook.SheetNames) {
      console.log("处理工作表:", sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // 打印工作表的第一行数据，用于调试
      if (jsonData.length > 0) {
        console.log("第一行数据示例:", JSON.stringify(jsonData[0], null, 2));
      } else {
        console.log("工作表为空");
        continue;
      }
      
      // 直接使用工作表名称
      if (sheetName === 'Web') {
        result.Web = parseWebData(jsonData);
        result.all = [...result.all, ...result.Web];
        console.log(`已解析Web榜单，包含 ${result.Web.length} 条记录`);
      } else if (sheetName === 'App') {
        result.App = parseAppData(jsonData);
        result.all = [...result.all, ...result.App];
        console.log(`已解析App榜单，包含 ${result.App.length} 条记录`);
      } else {
        console.log(`跳过工作表 ${sheetName}`);
      }
    }
    
    console.log("总记录数:", result.all.length);
    console.log("Web榜单记录数:", result.Web.length);
    console.log("App榜单记录数:", result.App.length);
    
    return result;
  } catch (error) {
    console.error("Excel加载错误:", error);
    throw error;
  }
}
