'use client';

import { AIApp } from '@/lib/excelParser';
import { formatCurrency, formatArpu } from '@/lib/formatters';
import { useState, useEffect } from 'react';

interface FeaturedAppCardProps {
  app: AIApp;
  rank: number;
}

export default function FeaturedAppCard({ app, rank }: FeaturedAppCardProps) {
  const [appStoreUrl, setAppStoreUrl] = useState<string | null>(null);
  const [isDirectLink, setIsDirectLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * 创建应用在App Store的搜索链接
   * @param productName 产品名称
   * @returns App Store搜索链接
   */
  const getAppStoreSearchUrl = (productName: string) => {
    // 对产品名称进行URL编码
    const encodedProductName = encodeURIComponent(productName);
    return `https://apps.apple.com/search?term=${encodedProductName}`;
  };

  /**
   * 异步获取App Store链接
   * @param productName 产品名称
   */
  const getAppStoreDirectUrl = async (productName: string): Promise<{url: string | null, isDirectLink: boolean}> => {
    try {
      const response = await fetch(`/api/app-store?name=${encodeURIComponent(productName)}`);
      
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

  // 页面加载时获取App Store链接
  useEffect(() => {
    async function loadAppStoreUrl() {
      if (app.listType === 'App' && app.product) {
        setIsLoading(true);
        const result = await getAppStoreDirectUrl(app.product);
        setAppStoreUrl(result.url);
        setIsDirectLink(result.isDirectLink);
        setIsLoading(false);
      }
    }
    
    loadAppStoreUrl();
  }, [app]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-lg">
            {rank}
          </span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            {app.category}
          </span>
        </div>
        
        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          {app.product}
        </h3>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">月收入 (MRR)</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{formatCurrency(app.mrr)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">环比变化</p>
            <p className={`text-lg font-medium ${app.growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {(app.growthRate * 100).toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          {app.listType === 'Web' && app.website ? (
            <a 
              href={app.website.startsWith('http') ? app.website : `https://${app.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
            >
              访问网站 →
            </a>
          ) : app.listType === 'App' && app.product ? (
            isLoading ? (
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                加载中...
              </span>
            ) : (
              <a 
                href={appStoreUrl || getAppStoreSearchUrl(app.product)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                {isDirectLink ? '在App Store下载 →' : '在App Store搜索 →'}
              </a>
            )
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              无可用链接
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
