// 导入所需模块
const path = require('path');
const fs = require('fs');

// 由于excelParser可能使用了ES模块语法，我们需要一个兼容的方式来导入
async function runTest() {
  try {
    // 首先检查文件是否存在
    const filePath = path.join(process.cwd(), 'public', 'data', '100aiapps-ranking.xlsx');
    
    if (fs.existsSync(filePath)) {
      console.log('✅ 文件存在于路径:', filePath);
      console.log('文件大小:', fs.statSync(filePath).size, '字节');
    } else {
      console.error('❌ 文件不存在于路径:', filePath);
      return;
    }
    
    // 尝试动态导入excelParser
    // 注意：这种方式可能在普通Node环境中不起作用，因为它依赖于Next.js的导入机制
    // 我们可能需要使用babel或其他方法来处理ES模块
    
    console.log('尝试解析Excel文件...');
    
    // 由于无法直接导入Next.js模块，我们将使用一个简单的xlsx库来解析
    const xlsx = require('xlsx');
    
    // 读取工作簿
    const workbook = xlsx.readFile(filePath);
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('✅ Excel解析成功!');
    console.log('数据条目数量:', data.length);
    console.log('数据结构示例 (第一条):');
    console.log(JSON.stringify(data[0], null, 2));
    
    // 检查数据结构是否符合预期
    console.log('\n数据字段验证:');
    const firstRow = data[0];
    const expectedFields = ['rank', 'product', 'category', 'website', 'mrr', 'growthRate', 'arr'];
    
    for (const field of expectedFields) {
      if (field in firstRow) {
        console.log(`✅ 字段 '${field}' 存在`);
      } else {
        console.log(`❌ 缺少字段 '${field}'`);
      }
    }
    
    console.log('\n所有可用字段:');
    console.log(Object.keys(firstRow).join(', '));
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 确保xlsx库已安装
try {
  require.resolve('xlsx');
  runTest();
} catch (e) {
  console.log('xlsx库未安装，正在安装...');
  const { execSync } = require('child_process');
  execSync('npm install xlsx --no-save');
  console.log('xlsx库安装完成，开始测试...');
  runTest();
}
