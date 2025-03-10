const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 定义文件路径
const excelFilePath = path.join(__dirname, '../public/data/100aiapps-ranking.xlsx');
const jsonFilePath = path.join(__dirname, '../public/data/apps.json');

// 确保输出目录存在
const outputDir = path.dirname(jsonFilePath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // 读取Excel文件
  console.log(`读取Excel文件: ${excelFilePath}`);
  const workbook = XLSX.readFile(excelFilePath);
  
  // 获取第一个工作表
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // 将工作表转换为JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  // 映射数据到我们的AIApp接口
  const aiApps = jsonData.map(row => ({
    rank: row['排名'],
    product: row['产品'],
    category: row['分类'],
    website: row['网址'],
    mrr: row['MRR\n(万美金)'],
    growthRate: row['环比变化'],
    arr: row['ARR\n(万美金)']
  }));
  
  // 保存为JSON文件
  fs.writeFileSync(jsonFilePath, JSON.stringify(aiApps, null, 2));
  
  console.log(`成功转换Excel到JSON: ${jsonFilePath}`);
  console.log(`共转换了 ${aiApps.length} 条记录`);
} catch (error) {
  console.error('转换过程中出错:', error);
} 