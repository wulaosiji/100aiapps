'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          <span className="block">全球顶尖</span>
          <span className="block">AI产品排行榜</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-100 sm:max-w-3xl">
          追踪100个最具影响力的AI产品，了解它们的市场表现、用户增长和收入数据。
        </p>
        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
            <Link href="/apps" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8">
              浏览榜单
            </Link>
            <Link href="/dashboard" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8">
              查看数据分析
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
