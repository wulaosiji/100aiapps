'use client';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">100aiapps</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              追踪和分析全球顶尖AI产品的数据平台，为您提供最新的AI产品排名和市场趋势。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">快速链接</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  首页
                </a>
              </li>
              <li>
                <a href="/apps" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  AI产品榜单
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  数据仪表盘
                </a>
              </li>
              <li>
                <a href="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  管理界面
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">关于我们</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              100aiapps致力于为用户提供最全面、最准确的AI产品数据，帮助用户了解AI产品市场动态。
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} 100aiapps.com. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
}
