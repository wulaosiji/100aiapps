const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// 获取Excel文件路径
const filePath = path.join(process.cwd(), 'public', 'data', '100aiapps-ranking.xlsx');

try {
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }

  // 读取文件
  const data = fs.readFileSync(filePath);
  console.log(`文件大小: ${data.length} 字节`);

  // 解析Excel文件
  const workbook = XLSX.read(data, { type: 'buffer' });
  console.log('工作表列表:', workbook.SheetNames);

  // 遍历所有工作表
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n检查工作表: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`  记录数: ${jsonData.length}`);
    
    if (jsonData.length > 0) {
      console.log('  字段列表:', Object.keys(jsonData[0]).join(', '));
      console.log('  第一条记录:', JSON.stringify(jsonData[0], null, 2));
    } else {
      console.log('  工作表为空');
    }
  }

} catch (error) {
  console.error('错误:', error);
} 