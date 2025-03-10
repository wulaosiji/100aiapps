'use client';

import { AIApp, AppLists } from '@/lib/excelParser';
import FeaturedAppCard from './FeaturedAppCard';
import { useState } from 'react';

interface FeaturedAppsProps {
  apps: AppLists;
}

export default function FeaturedApps({ apps }: FeaturedAppsProps) {
  const [activeList, setActiveList] = useState<'Web' | 'App'>('Web');
  
  // 获取当前活动榜单的应用
  const currentListApps = apps[activeList];
  
  // 只展示前8名的应用
  const topApps = currentListApps.slice(0, 8);
  
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            顶尖AI产品
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            探索当前市场上最受欢迎的AI产品，了解它们的收入和增长情况。
          </p>
          
          {/* 榜单切换按钮 */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              key="Web"
              onClick={() => setActiveList('Web')}
              className={`px-4 py-2 rounded-md ${
                activeList === 'Web'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              ARR100榜单
            </button>
            <button
              key="App"
              onClick={() => setActiveList('App')}
              className={`px-4 py-2 rounded-md ${
                activeList === 'App'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              IAP100榜单
            </button>
          </div>
        </div>
        
        <div className="mt-12 grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {topApps.map((app, index) => (
            <FeaturedAppCard key={`${activeList}-${app.rank}`} app={app} rank={index + 1} />
          ))}
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex items-center justify-center">
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white">
                查看更多AI产品
              </h3>
              <p className="mt-2 text-indigo-100">
                浏览完整的100个AI产品榜单
              </p>
              <div className="mt-6">
                <a 
                  href="/apps" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  查看完整榜单
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
