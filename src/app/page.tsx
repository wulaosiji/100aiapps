import { Suspense } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import HeroSection from '@/components/ui/HeroSection';
import FeaturedApps from '@/components/ui/FeaturedApps';
import { AppLists } from '@/lib/excelParser';
import path from 'path';
import fs from 'fs/promises';

export default async function Home() {
  // 获取Excel数据
  let appData: AppLists;
  try {
    // 使用服务器端文件系统直接读取数据
    console.log('开始获取数据...');
    
    // 构建JSON文件路径
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'excel-data.json');
    console.log('数据文件路径:', jsonPath);
    
    // 直接从文件系统读取JSON数据
    const fileData = await fs.readFile(jsonPath, 'utf8');
    appData = JSON.parse(fileData) as AppLists;
    console.log('数据获取成功');
  } catch (error) {
    console.error('Error loading Excel data:', error);
    // 提供一些默认数据，避免页面崩溃
    appData = {
      Web: [
        {
          rank: 1,
          product: "ChatGPT",
          category: "语言模型",
          website: "https://chat.openai.com",
          mrr: 1000,
          growthRate: 0.15,
          arr: 12000,
          listType: 'Web'
        }
      ],
      App: [
        {
          rank: 1,
          product: "Claude",
          category: "语言模型",
          app: "Claude",
          mrr: 600,
          growthRate: 0.20,
          arr: 7200,
          listType: 'App'
        }
      ],
      all: []
    };
    // 填充all数组
    appData.all = [...appData.Web, ...appData.App];
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                关于100aiapps
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                100aiapps是一个专注于追踪和分析全球顶尖AI产品的数据平台。我们提供最新的AI产品排名、市场趋势和详细分析，帮助您了解AI产品市场的最新动态。
              </p>
            </div>
            
            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">实时排名</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    基于最新数据的AI产品排名，帮助您了解市场领导者和新兴产品。
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">数据分析</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    深入的数据分析和可视化，帮助您理解AI产品的增长趋势和市场表现。
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">AI生成内容</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    利用GenAI技术自动生成AI产品的详细介绍和分析报告。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Suspense fallback={<div>加载中...</div>}>
          <FeaturedApps apps={appData} />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}
