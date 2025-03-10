const { exec } = require('child_process');

console.log('Starting build without type checking...');

// 设置环境变量并运行构建
const buildProcess = exec('NEXT_DISABLE_TYPE_CHECKING=1 NEXT_DISABLE_ESLINT=1 npx next build', 
  { env: { ...process.env, NEXT_DISABLE_TYPE_CHECKING: '1', NEXT_DISABLE_ESLINT: '1' } });

// 输出构建日志
buildProcess.stdout.on('data', (data) => {
  console.log(data);
});

buildProcess.stderr.on('data', (data) => {
  console.error(data);
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
  } else {
    console.error(`Build failed with code ${code}`);
  }
}); 