'use client';

import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/dataStore';
import { AIApp } from '@/lib/excelParser';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Scatter, Bar, Pie } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
    backgroundColor: colors[0],
    backgroundImage: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  };
};

// 格式化货币显示，不进行万亿转换，仅添加美元符号和万单位
const formatCurrencyDashboard = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  return `$${value}万`;
};

// 格式化ARPU值
const formatArpu = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  return `$${value.toFixed(2)}`;
};

export default function DashboardPage() {
  const { aiApps, setAIApps } = useDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dataType, setDataType] = useState<'Web' | 'App'>('Web'); // 数据类型切换
  const [categoryDistribution, setCategoryDistribution] = useState<{[key: string]: number}>({});
  const [topCategories, setTopCategories] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<string[]>([]);
  
  // 过滤当前选定类型的数据
  const filteredApps = aiApps.filter(app => app.listType === dataType);
  
  // 在客户端加载Excel数据
  useEffect(() => {
    async function loadData() {
      try {
        // 使用window.location.origin获取当前域名
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001');
          
        const fullUrl = `${baseUrl}/data/excel-data.json`;
        console.log('正在获取仪表盘数据，URL:', fullUrl);
        
        const response = await fetch(fullUrl, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error(`请求失败，状态码: ${response.status}`);
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const allData = await response.json() as {
          Web: AIApp[];
          App: AIApp[];
          all: AIApp[];
        };
        
        // 根据当前选定的数据类型获取相应的数据
        const data = allData[dataType] || [];
        console.log(`获取到 ${data.length} 条数据`);
        
        setAIApps(data as AIApp[]);
        
        // 根据当前选定的数据类型计算分类分布
        calculateDistribution(data as AIApp[]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [setAIApps, dataType]);
  
  // 当数据类型改变时重新计算分类分布
  useEffect(() => {
    if (aiApps.length > 0) {
      // 直接使用aiApps数据，因为它已经是过滤后的数据
      calculateDistribution(aiApps);
    }
  }, [aiApps]);
  
  // 计算分类分布的函数
  const calculateDistribution = (apps: AIApp[]) => {
    const distribution: {[key: string]: number} = {};
    apps.forEach((app: AIApp) => {
      if (distribution[app.category]) {
        distribution[app.category]++;
      } else {
        distribution[app.category] = 1;
      }
    });
    setCategoryDistribution(distribution);
    
    // 获取前5个最多的分类
    const sortedCategories = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
    setTopCategories(sortedCategories);
    
    // 生成随机颜色
    const colors = sortedCategories.map(() => 
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
    );
    setCategoryColors(colors);
  };
  
  // 准备散点图数据 (MRR vs 环比变化)
  const scatterDataGrowth = {
    datasets: filteredApps.reduce<any[]>((datasets, app, index) => {
      // 查找该分类是否已存在
      const existingDataset = datasets.find(ds => ds.label === app.category);
      
      if (existingDataset) {
        // 如果该分类已存在，添加数据点
        existingDataset.data.push({
          x: app.mrr || 0,
          y: (app.growthRate || 0) * 100,
          name: app.product,
          category: app.category,
          arr: app.arr || 0
        });
      } else {
        // 如果是新分类，创建新的数据集
        const colorIndex = datasets.length % 5; // 循环使用5种颜色
        const colorSet = [
          themeColors.primary,
          themeColors.secondary,
          themeColors.tertiary,
          themeColors.quaternary,
          themeColors.accent
        ][colorIndex];
        
        datasets.push({
          label: app.category,
          data: [{
            x: app.mrr || 0,
            y: (app.growthRate || 0) * 100,
            name: app.product,
            category: app.category,
            arr: app.arr || 0
          }],
          backgroundColor: colorSet[0],
          borderColor: colorSet[1],
          pointHoverBackgroundColor: colorSet[1],
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 2,
          pointHoverRadius: 8,
        });
      }
      
      return datasets;
    }, []),
  };
  
  // 散点图配置 (MRR vs 环比变化)
  const scatterOptionsGrowth = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
      axis: 'xy' as const,
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
      delay: (context: any) => context.dataIndex * 10,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'MRR',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: 'rgba(156, 163, 175, 1)',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value + '万';
          },
          font: {
            size: 11,
          },
          color: 'rgba(107, 114, 128, 0.8)',
        }
      },
      y: {
        title: {
          display: true,
          text: '环比变化 (%)',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: 'rgba(156, 163, 175, 1)',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
          font: {
            size: 11,
          },
          color: 'rgba(107, 114, 128, 0.8)',
        }
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            if (context.length > 1) {
              return '附近的产品';
            }
            return context[0].raw.name;
          },
          label: function(context: any) {
            const point = context.raw;
            return [
              `产品: ${point.name}`,
              `分类: ${point.category}`,
              `MRR: ${formatCurrencyDashboard(point.x)}`,
              `环比变化: ${point.y.toFixed(2)}%`,
              `ARR: ${formatCurrencyDashboard(point.arr)}`
            ];
          }
        }
      },
      legend: {
        display: false,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11,
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      }
    }
  } as any;
  
  // 准备散点图数据 (MRR vs ARPU)
  const scatterDataArpu = {
    datasets: filteredApps.reduce<any[]>((datasets, app, index) => {
      // 查找该分类是否已存在
      const existingDataset = datasets.find(ds => ds.label === app.category);
      
      if (existingDataset) {
        // 如果该分类已存在，添加数据点
        existingDataset.data.push({
          x: app.mrr || 0,
          y: app.arpu || 0,
          name: app.product,
          category: app.category,
          arr: app.arr || 0
        });
      } else {
        // 如果是新分类，创建新的数据集
        const colorIndex = datasets.length % 5; // 循环使用5种颜色
        const colorSet = [
          themeColors.primary,
          themeColors.secondary,
          themeColors.tertiary,
          themeColors.quaternary,
          themeColors.accent
        ][colorIndex];
        
        datasets.push({
          label: app.category,
          data: [{
            x: app.mrr || 0,
            y: app.arpu || 0,
            name: app.product,
            category: app.category,
            arr: app.arr || 0
          }],
          backgroundColor: colorSet[0],
          borderColor: colorSet[1],
          pointHoverBackgroundColor: colorSet[1],
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 2,
          pointHoverRadius: 8,
        });
      }
      
      return datasets;
    }, []),
  };
  
  // 散点图配置 (MRR vs ARPU)
  const scatterOptionsArpu = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
      axis: 'xy' as const,
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
      delay: (context: any) => context.dataIndex * 10,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'MRR',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: 'rgba(156, 163, 175, 1)',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value + '万';
          },
          font: {
            size: 11,
          },
          color: 'rgba(107, 114, 128, 0.8)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'ARPU',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: 'rgba(156, 163, 175, 1)',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          },
          font: {
            size: 11,
          },
          color: 'rgba(107, 114, 128, 0.8)',
        }
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            if (context.length > 1) {
              return '附近的产品';
            }
            return context[0].raw.name;
          },
          label: function(context: any) {
            const point = context.raw;
            return [
              `产品: ${point.name}`,
              `分类: ${point.category}`,
              `MRR: ${formatCurrencyDashboard(point.x)}`,
              `ARPU: ${formatArpu(point.y)}`,
              `ARR: ${formatCurrencyDashboard(point.arr)}`
            ];
          }
        }
      },
      legend: {
        display: false,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11,
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      }
    }
  } as any;
  
  // 生成更美观的颜色阵列
  const generateGradientColors = (count: number) => {
    const baseColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.tertiary,
      themeColors.quaternary,
      themeColors.accent,
    ];
    
    // 确保有足够的颜色
    let colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  };
  
  // 准备柱状图数据 (前10名产品的MRR)
  const barData = {
    labels: filteredApps.slice(0, 10).map(app => app.product),
    datasets: [
      {
        label: 'MRR',
        data: filteredApps.slice(0, 10).map(app => app.mrr || 0),
        backgroundColor: filteredApps.slice(0, 10).map((_, i) => themeColors.tertiary[0]),
        borderColor: filteredApps.slice(0, 10).map((_, i) => themeColors.tertiary[1]),
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: themeColors.tertiary[1],
      },
    ],
  };
  
  // 柱状图配置
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
      delay: (context: any) => context.dataIndex * 50,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'MRR',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: 'rgba(156, 163, 175, 1)',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value + '万';
          },
          font: {
            size: 11,
          },
          color: 'rgba(107, 114, 128, 0.8)',
        }
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
          color: 'rgba(107, 114, 128, 0.8)',
        },
        grid: {
          display: false,
        }
      }
    },
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `MRR: ${formatCurrencyDashboard(context.raw || 0)}`;
          }
        }
      },
      legend: {
        display: false,
      }
    },
  } as any;
  
  // 准备饼图数据 (分类分布)
  const pieColors = generateGradientColors(topCategories.length);
  const pieData = {
    labels: topCategories,
    datasets: [
      {
        data: topCategories.map(category => categoryDistribution[category]),
        backgroundColor: pieColors.map(color => color[0]),
        borderColor: pieColors.map(color => color[1]),
        borderWidth: 2,
        hoverBackgroundColor: pieColors.map(color => color[1]),
        hoverBorderColor: 'white',
        hoverBorderWidth: 3,
      },
    ],
  };
  
  // 饼图配置
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11,
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
    },
  } as any;
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 sm:text-4xl">
              数据仪表盘
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              可视化分析AI {dataType}产品的市场表现和趋势
            </p>
            
            {/* 数据类型切换 */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-md shadow-lg overflow-hidden" role="group">
                <button
                  type="button"
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    dataType === 'Web' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md transform scale-105' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-indigo-400'
                  }`}
                  onClick={() => setDataType('Web')}
                >
                  Web数据
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    dataType === 'App' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md transform scale-105' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-indigo-400'
                  }`}
                  onClick={() => setDataType('App')}
                >
                  App数据
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent border-b-indigo-700"></div>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">加载数据中，请稍候...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">没有找到{dataType}类型的数据</p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">请尝试切换数据类型或刷新页面</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 散点图：MRR vs 环比变化 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl transform transition-transform duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-l-4 border-indigo-500 pl-3">
                  MRR vs 环比变化
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">气泡颜色代表不同分类</p>
                <div className="h-[350px]">
                  <Scatter data={scatterDataGrowth} options={scatterOptionsGrowth} />
                </div>
              </div>
              
              {/* 散点图：MRR vs ARPU */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl transform transition-transform duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-l-4 border-purple-500 pl-3">
                  MRR vs ARPU
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">气泡颜色代表不同分类</p>
                <div className="h-[350px]">
                  <Scatter data={scatterDataArpu} options={scatterOptionsArpu} />
                </div>
              </div>
              
              {/* 柱状图：前10名产品的MRR */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl transform transition-transform duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-l-4 border-green-500 pl-3">
                  前10名AI {dataType}产品的月收入(MRR)
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">按MRR从高到低排序</p>
                <div className="h-[350px]">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
              
              {/* 饼图：分类分布 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl transform transition-transform duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-l-4 border-amber-500 pl-3">
                  AI {dataType}产品分类分布
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">显示前5个最大分类</p>
                <div className="h-[350px]">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
              
              {/* 数据摘要 - 跨越两列 */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl col-span-1 lg:col-span-2 transform transition-transform duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 border-l-4 border-red-500 pl-3">
                  数据摘要 (AI {dataType}产品)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg shadow border border-indigo-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">总产品数</h3>
                    <p className="mt-3 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{filteredApps.length}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      在榜产品总数
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg shadow border border-purple-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">分类数</h3>
                    <p className="mt-3 text-3xl font-bold text-purple-600 dark:text-purple-400">{Object.keys(categoryDistribution).length}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      不同产品分类
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg shadow border border-green-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">平均MRR</h3>
                    <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400">
                      {filteredApps.length > 0 ? formatCurrencyDashboard(filteredApps.reduce((sum, app) => sum + (app.mrr || 0), 0) / filteredApps.length) : '-'}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      平均月收入
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg shadow border border-amber-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">平均ARPU</h3>
                    <p className="mt-3 text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {filteredApps.length > 0 ? formatArpu(filteredApps.reduce((sum, app) => sum + (app.arpu || 0), 0) / filteredApps.length) : '-'}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      平均用户收入
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
