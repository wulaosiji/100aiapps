'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AIApp } from '@/lib/excelParser';
import { formatCurrency, formatArpu } from '@/lib/formatters';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { motion } from 'framer-motion';

// 自定义配色方案 - 使用渐变色与高对比度的专业色彩
const themeColors = {
  primary: ['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 1)'],  // 渐变靛蓝色
  secondary: ['rgba(139, 92, 246, 0.8)', 'rgba(124, 58, 237, 1)'],  // 渐变紫色
  tertiary: ['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 1)'],  // 渐变绿色
  quaternary: ['rgba(245, 158, 11, 0.8)', 'rgba(217, 119, 6, 1)'],  // 渐变琥珀色
  accent: ['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 1)'],  // 渐变红色
  background: 'rgba(255, 255, 255, 0.9)',
  backgroundDark: 'rgba(30, 41, 59, 0.9)',
  text: '#1e293b',
  textDark: '#f8fafc',
};

// 创建渐变背景的函数
const createGradient = (colors: string[]) => {
  return {
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  };
};

export default function AppDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const appId = params.id as string;
  const listType = searchParams.get('list') || 'Web';
  
  const [app, setApp] = useState<AIApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [description, setDescription] = useState<string>('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [appStoreUrl, setAppStoreUrl] = useState<string | null>(null);
  const [isDirectLink, setIsDirectLink] = useState<boolean>(false);
  const [descriptionSource, setDescriptionSource] = useState<string>('default');
  
  // 创建应用在App Store的搜索链接
  const getAppStoreSearchUrl = (productName: string) => {
    const encodedProductName = encodeURIComponent(productName);
    return `https://apps.apple.com/search?term=${encodedProductName}`;
  };
  
  // 添加新函数，异步获取App Store链接
  const getAppStoreDirectUrl = async (appName: string): Promise<{url: string | null, isDirectLink: boolean}> => {
    try {
      const response = await fetch(`/api/app-store?name=${encodeURIComponent(appName)}`);
      
      if (!response.ok) {
        return { url: null, isDirectLink: false };
      }
      
      interface AppStoreResponse {
        url: string | null;
        isDirectLink: boolean;
        error?: string;
      }
      
      const data = await response.json() as AppStoreResponse;
      return { 
        url: data.url || null, 
        isDirectLink: data.isDirectLink || false 
      };
    } catch (error) {
      console.error('获取App Store链接失败:', error);
      return { url: null, isDirectLink: false };
    }
  };
  
  // 加载应用数据
  useEffect(() => {
    async function loadData() {
      try {
        // 从特定榜单加载数据
        const response = await fetch(`/api/excel-list/${listType}`);
        const data = await response.json() as AIApp[];
        const foundApp = data.find((a: AIApp) => a.rank.toString() === appId);
        
        if (foundApp) {
          setApp(foundApp);
          // 尝试加载已生成的描述
          try {
            // 使用榜单类型和ID组合作为描述的唯一标识
            const descId = `${listType}-${appId}`;
            const descResponse = await fetch(`/api/description/${descId}`);
            if (descResponse.ok) {
              const descData = await descResponse.json() as { description: string };
              setDescription(descData.description);
              
              // 根据描述内容判断来源
              if (descData.description.includes('Contrary Research')) {
                setDescriptionSource('contrary');
              } else if (descData.description.includes('Growjo')) {
                setDescriptionSource('growjo');
              } else {
                setDescriptionSource('default');
              }
            }
          } catch (error) {
            console.error('Error loading description:', error);
          }
          
          // 如果是App类型应用，获取App Store直接链接
          if (foundApp.listType === 'App' && foundApp.product) {
            const appStoreResult = await getAppStoreDirectUrl(foundApp.product);
            setAppStoreUrl(appStoreResult.url);
            setIsDirectLink(appStoreResult.isDirectLink);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [appId, listType]);
  
  // 生成描述
  const generateDescription = async () => {
    if (!app) return;
    
    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `${listType}-${appId}`, // 使用榜单类型和ID组合作为描述的唯一标识
          product: app.product,
          category: app.category,
          website: app.website,
          mrr: app.mrr,
          growthRate: app.growthRate,
          arr: app.arr,
          listType: app.listType || listType
        }),
      });
      
      if (response.ok) {
        const data = await response.json() as { description: string; source?: string };
        setDescription(data.description);
        setDescriptionSource(data.source || 'default');
      } else {
        console.error('Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };
  
  // 强制重新生成描述
  const regenerateDescription = async () => {
    if (!app) return;
    
    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `${listType}-${appId}`, // 使用榜单类型和ID组合作为描述的唯一标识
          product: app.product,
          category: app.category,
          website: app.website,
          mrr: app.mrr,
          growthRate: app.growthRate,
          arr: app.arr,
          listType: app.listType || listType,
          force: true // 强制重新生成
        }),
      });
      
      if (response.ok) {
        const data = await response.json() as { description: string; source?: string };
        setDescription(data.description);
        setDescriptionSource(data.source || 'default');
      } else {
        console.error('Failed to regenerate description');
      }
    } catch (error) {
      console.error('Error regenerating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };
  
  // 动画变量
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!app) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-10 max-w-lg mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">未找到产品</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              抱歉，我们在{listType}榜单中找不到排名为{appId}的产品信息。
            </p>
            <div className="mt-8">
              <a 
                href="/apps" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white"
                style={createGradient(themeColors.primary)}
              >
                返回产品列表
              </a>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <a 
              href="/apps" 
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-300 hover:translate-x-[-4px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              返回产品列表
            </a>
          </motion.div>
          
          {/* 产品标题和基本信息 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border-l-4"
            style={{ borderLeftColor: themeColors.primary[1] }}
          >
            <div className="px-6 py-6 sm:px-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {app.product}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {app.category} · {app.market || '-'} · {listType}榜单 · 排名 #{app.rank}
                </p>
              </div>
              {app.listType === 'Web' && app.website ? (
                <a 
                  href={app.website.startsWith('http') ? app.website : `https://${app.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-lg text-white transition-transform duration-300 hover:scale-105"
                  style={createGradient(themeColors.primary)}
                >
                  访问网站
                </a>
              ) : app.listType === 'App' && app.product ? (
                <a 
                  href={appStoreUrl || getAppStoreSearchUrl(app.product)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-lg text-white transition-transform duration-300 hover:scale-105"
                  style={createGradient(themeColors.primary)}
                >
                  {isDirectLink ? '在App Store下载' : '在App Store搜索'}
                </a>
              ) : null}
            </div>
            
            {/* 产品详细数据 */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6 sm:p-8">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6 sm:grid-cols-3"
              >
                <motion.div 
                  variants={item}
                  className="overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
                  style={createGradient(themeColors.primary)}
                >
                  <div className="px-6 py-6">
                    <dt className="text-sm font-medium text-white truncate opacity-90">
                      月收入 (MRR)
                    </dt>
                    <dd className="mt-2 text-3xl font-bold text-white">
                      {formatCurrency(app.mrr)}
                    </dd>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={item}
                  className="overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
                  style={app.growthRate >= 0 ? createGradient(themeColors.tertiary) : createGradient(themeColors.accent)}
                >
                  <div className="px-6 py-6">
                    <dt className="text-sm font-medium text-white truncate opacity-90">
                      环比变化
                    </dt>
                    <dd className="mt-2 text-3xl font-bold text-white">
                      {(app.growthRate * 100).toFixed(2)}%
                    </dd>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={item}
                  className="overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
                  style={createGradient(themeColors.secondary)}
                >
                  <div className="px-6 py-6">
                    <dt className="text-sm font-medium text-white truncate opacity-90">
                      年收入 (ARR)
                    </dt>
                    <dd className="mt-2 text-3xl font-bold text-white">
                      {formatCurrency(app.arr)}
                    </dd>
                  </div>
                </motion.div>

                <motion.div 
                  variants={item}
                  className="overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
                  style={createGradient(themeColors.quaternary)}
                >
                  <div className="px-6 py-6">
                    <dt className="text-sm font-medium text-white truncate opacity-90">
                      月活用户数 (MAU)
                    </dt>
                    <dd className="mt-2 text-3xl font-bold text-white">
                      {app.monthlyActiveUsers ? `${app.monthlyActiveUsers}万` : '-'}
                    </dd>
                  </div>
                </motion.div>

                <motion.div 
                  variants={item}
                  className="overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
                  style={createGradient(themeColors.secondary)}
                >
                  <div className="px-6 py-6">
                    <dt className="text-sm font-medium text-white truncate opacity-90">
                      平均用户收入 (ARPU)
                    </dt>
                    <dd className="mt-2 text-3xl font-bold text-white">
                      {app.arpu ? formatArpu(app.arpu) : '-'}
                    </dd>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* 产品描述 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border-l-4"
            style={{ borderLeftColor: themeColors.secondary[1] }}
          >
            <div className="px-6 py-6 sm:px-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={createGradient(themeColors.secondary)}></span>
                  产品描述
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {descriptionSource === 'contrary' && '数据来源: Contrary Research'}
                  {descriptionSource === 'growjo' && '数据来源: Growjo'}
                  {descriptionSource === 'default' && '由AI自动生成的产品详细介绍'}
                </p>
              </div>
              {description && (
                <button
                  onClick={regenerateDescription}
                  disabled={isGeneratingDescription}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-md text-white transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={createGradient(themeColors.quaternary)}
                >
                  {isGeneratingDescription ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      重新生成中...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      重新生成描述
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6 sm:px-8">
              {description ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="prose dark:prose-invert max-w-none"
                >
                  {description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    尚未生成产品描述
                  </p>
                  <button
                    onClick={generateDescription}
                    disabled={isGeneratingDescription}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={createGradient(themeColors.secondary)}
                  >
                    {isGeneratingDescription ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </>
                    ) : (
                      '生成产品描述'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
