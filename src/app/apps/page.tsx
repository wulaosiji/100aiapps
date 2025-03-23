'use client';

import { useState, useEffect } from 'react';
import { AIApp } from '@/lib/excelParser';
import { formatCurrency, formatArpu } from '@/lib/formatters';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

// 修改为纯客户端实现，使用预生成的静态数据
export default function AppsPage() {
  const [aiApps, setAIApps] = useState<AIApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<AIApp[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [markets, setMarkets] = useState<string[]>(['全部']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedMarket, setSelectedMarket] = useState('全部');
  const [activeListType, setActiveListType] = useState<'Web' | 'App' | 'all'>('Web');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AIApp | null;
    direction: 'asc' | 'desc';
  }>({
    key: 'rank',
    direction: 'asc',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [appStoreLinks, setAppStoreLinks] = useState<{[key: string]: {url: string | null, isDirectLink: boolean}}>({});
  
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
  
  // 获取特定榜单数据
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // 使用静态JSON文件
        const response = await fetch(`/data/excel-data.json`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const allData = await response.json() as { 
          Web: AIApp[], 
          App: AIApp[], 
          all: AIApp[] 
        };
        const data = allData[activeListType];
        setAIApps(data);
        
        // 提取所有唯一的分类
        const uniqueCategories = ['全部', ...Array.from(new Set(data.map((app: AIApp) => app.category)))];
        setCategories(uniqueCategories);
        
        // 提取所有唯一的市场
        const uniqueMarkets = ['全部', ...Array.from(new Set(data
          .map((app: AIApp) => app.market || '未知')
          .filter((market: string | undefined) => market !== undefined)
        ))];
        setMarkets(uniqueMarkets);
        
        setFilteredApps(data);
        
        // 预加载App类应用的App Store链接
        const appLinks: {[key: string]: {url: string | null, isDirectLink: boolean}} = {};
        const appTypeApps = data.filter((app: AIApp) => app.listType === 'App' && app.product);
        
        // 创建一个Promise数组来并行处理所有请求
        const linkPromises = appTypeApps.map(async (app: AIApp) => {
          if (app.product) {
            const result = await getAppStoreDirectUrl(app.product);
            return { appId: `${app.listType}-${app.rank}`, result };
          }
          return null;
        });
        
        // 等待所有请求完成
        const results = await Promise.all(linkPromises);
        
        // 处理结果
        results.forEach(item => {
          if (item) {
            appLinks[item.appId] = item.result;
          }
        });
        
        setAppStoreLinks(appLinks);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [activeListType]);
  
  // 处理搜索
  useEffect(() => {
    let filtered = aiApps;
    
    // 应用搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 应用分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    // 应用市场过滤
    if (selectedMarket !== '全部') {
      filtered = filtered.filter(app => (app.market || '未知') === selectedMarket);
    }
    
    // 应用排序
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        // 确保安全地访问排序属性
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        // 处理undefined值
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1; // undefined值排在后面
        if (bValue === undefined) return -1;
        
        // 正常比较
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredApps(filtered);
  }, [aiApps, searchTerm, selectedCategory, selectedMarket, sortConfig]);
  
  // 处理排序
  const handleSort = (key: keyof AIApp) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  // 获取排序图标
  const getSortIcon = (key: keyof AIApp) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              AI产品榜单
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              浏览和探索顶尖AI产品的详细数据和市场表现。
            </p>
            
            {/* 榜单类型选择 */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveListType('Web')}
                className={`px-4 py-2 rounded-md ${
                  activeListType === 'Web'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                ARR100榜单
              </button>
              <button
                onClick={() => setActiveListType('App')}
                className={`px-4 py-2 rounded-md ${
                  activeListType === 'App'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                IAP100榜单
              </button>
              <button
                onClick={() => setActiveListType('all')}
                className={`px-4 py-2 rounded-md ${
                  activeListType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                所有榜单
              </button>
            </div>
          </div>
          
          {/* 过滤和搜索区域 */}
          <div className="mb-8 flex flex-col space-y-4">
            {/* 搜索框 */}
            <div className="w-full flex justify-center">
              <div className="w-full md:w-96">
                <input
                  type="text"
                  placeholder="搜索产品名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            {/* 市场筛选 */}
            <div className="w-full">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">市场筛选:</h3>
              <div className="flex flex-wrap gap-2">
                {markets.map((market) => (
                  <button
                    key={`market-${market}`}
                    onClick={() => setSelectedMarket(market)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedMarket === market
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 分类筛选 */}
            <div className="w-full">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类筛选:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={`category-${category}`}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 数据表格 */}
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">没有找到匹配的产品</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('rank')}
                    >
                      排名 {getSortIcon('rank')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('product')}
                    >
                      产品 {getSortIcon('product')}
                    </th>
                    {activeListType === 'all' && (
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        榜单类型
                      </th>
                    )}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('mrr')}
                    >
                      MRR {getSortIcon('mrr')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('growthRate')}
                    >
                      环比变化 {getSortIcon('growthRate')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('arr')}
                    >
                      ARR {getSortIcon('arr')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('arpu')}
                    >
                      ARPU {getSortIcon('arpu')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredApps.map((app) => (
                    <tr key={`${app.listType || 'unknown'}-${app.product}-${app.rank}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {app.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {app.product}
                      </td>
                      {activeListType === 'all' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {app.listType || 'Web'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(app.mrr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${
                          app.growthRate >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {(app.growthRate * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(app.arr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatArpu(app.arpu)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <a 
                          href={`/apps/${app.rank}?list=${app.listType || 'Web'}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          详情
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 添加显示总记录数的信息 */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                显示 {filteredApps.length} 条记录 (共 {aiApps.length} 条)
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
