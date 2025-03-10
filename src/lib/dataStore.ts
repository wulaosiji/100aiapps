import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIApp } from './excelParser';

interface DataState {
  aiApps: AIApp[];
  categories: string[];
  filteredApps: AIApp[];
  searchTerm: string;
  selectedCategory: string;
  sortConfig: {
    key: keyof AIApp | null;
    direction: 'asc' | 'desc';
  };
  
  // 操作方法
  setAIApps: (apps: AIApp[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortConfig: (key: keyof AIApp, direction: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      aiApps: [],
      categories: [],
      filteredApps: [],
      searchTerm: '',
      selectedCategory: '全部',
      sortConfig: {
        key: 'rank',
        direction: 'asc',
      },
      
      setAIApps: (apps: AIApp[]) => {
        // 提取所有唯一的分类
        const categories = ['全部', ...Array.from(new Set(apps.map(app => app.category)))];
        
        set({ 
          aiApps: apps,
          categories,
          filteredApps: apps,
        });
      },
      
      setSearchTerm: (term: string) => {
        const { aiApps, selectedCategory } = get();
        let filtered = aiApps;
        
        // 应用搜索过滤
        if (term) {
          filtered = filtered.filter(app => 
            app.product.toLowerCase().includes(term.toLowerCase())
          );
        }
        
        // 应用分类过滤
        if (selectedCategory !== '全部') {
          filtered = filtered.filter(app => app.category === selectedCategory);
        }
        
        set({ 
          searchTerm: term,
          filteredApps: filtered,
        });
      },
      
      setSelectedCategory: (category: string) => {
        const { aiApps, searchTerm } = get();
        let filtered = aiApps;
        
        // 应用分类过滤
        if (category !== '全部') {
          filtered = filtered.filter(app => app.category === category);
        }
        
        // 应用搜索过滤
        if (searchTerm) {
          filtered = filtered.filter(app => 
            app.product.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        set({ 
          selectedCategory: category,
          filteredApps: filtered,
        });
      },
      
      setSortConfig: (key: keyof AIApp, direction: 'asc' | 'desc') => {
        const { filteredApps } = get();
        
        // 对过滤后的应用进行排序
        const sorted = [...filteredApps].sort((a, b) => {
          if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
          if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
          return 0;
        });
        
        set({ 
          sortConfig: { key, direction },
          filteredApps: sorted,
        });
      },
      
      resetFilters: () => {
        const { aiApps } = get();
        
        set({
          searchTerm: '',
          selectedCategory: '全部',
          sortConfig: {
            key: 'rank',
            direction: 'asc',
          },
          filteredApps: aiApps,
        });
      },
    }),
    {
      name: '100aiapps-storage',
    }
  )
);
