# 100aiapps - AI产品榜单网站

100aiapps是一个交互式AI产品榜单网站，展示100个顶尖AI产品的排名、收入和增长数据。网站支持从Excel导入数据，并提供丰富的交互功能，包括过滤、排序、搜索和数据可视化。

## 功能特点

### 数据集成
- 自动解析Excel文件，导入AI产品数据
- 支持通过管理界面重新上传Excel更新数据
- 每次导入Excel文件将重新更新所有数据

### 核心功能
- **首页**：展示网站介绍和顶级AI产品
- **产品列表页**：
  - 动态过滤（按分类/市场区间）
  - 交互式排序（数字序/字母序）
  - 即时搜索（产品名称）
- **数据仪表盘**：可视化展示AI产品数据，包括散点图、柱状图和饼图
- **公司详情页**：展示AI产品详细信息，包括GenAI自动生成的产品描述

### 设计风格
- 简洁现代的界面设计，以卡片式布局为主
- 清晰的导航结构和标签页设计
- 支持深色模式切换
- 响应式设计（适配桌面页面/移动页面）

## 技术栈

- **前端框架**：Next.js 15
- **样式系统**：Tailwind CSS
- **状态管理**：Zustand
- **数据解析**：xlsx
- **数据可视化**：Chart.js, react-chartjs-2
- **文件上传**：react-dropzone
- **图标库**：@heroicons/react

## 项目结构

```
100aiapps/
├── src/
│   ├── app/                # Next.js页面
│   │   ├── page.tsx        # 首页
│   │   ├── apps/           # 产品列表页
│   │   │   ├── page.tsx
│   │   │   └── [id]/       # 产品详情页
│   │   ├── dashboard/      # 数据仪表盘
│   │   ├── admin/          # 管理界面
│   │   └── api/            # API路由
│   ├── components/         # 可复用组件
│   │   └── ui/             # UI组件
│   └── lib/                # 工具库
│       ├── excelParser.ts  # Excel解析器
│       └── dataStore.ts    # 数据存储
├── public/                 # 静态资源
└── descriptions/           # 存储生成的产品描述
```

## 安装与运行

### 前提条件
- Node.js 20+
- npm 或 pnpm

### 安装依赖
```bash
cd 100aiapps
npm install
# 或
pnpm install
```

### 开发模式运行
```bash
npm run dev
# 或
pnpm dev
```

### 构建项目
```bash
npm run build
# 或
pnpm build
```

## 数据导入

网站支持从Excel文件导入数据。Excel文件应包含以下列：
- 排名
- 产品
- 分类
- 网址
- MRR(万美金)
- 环比变化
- ARR(万美金)

导入步骤：
1. 访问管理界面（/admin）
2. 上传符合格式的Excel文件
3. 等待解析完成，系统会自动更新数据

## 部署说明

### 本地部署
项目可以通过Next.js的开发服务器在本地运行：
```bash
npm run dev
```

### 静态导出
项目配置了静态导出模式，但由于包含API路由，需要特殊处理：

1. 修改API路由，添加必要的静态导出配置：
```typescript
// 在每个API路由文件中添加
export const dynamic = 'force-static';
```

2. 或者使用Cloudflare Pages、Vercel等服务进行部署，它们原生支持Next.js的API路由

## 注意事项

- 网站完全在前端实现，不需要后端和数据库
- 数据存储在前端状态中，通过Excel文件更新
- GenAI描述生成功能使用模拟数据，可以替换为真实的AI服务
