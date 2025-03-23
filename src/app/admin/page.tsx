'use client';

import { useState } from 'react';
import { useDataStore } from '@/lib/dataStore';
import { parseExcelFile } from '@/lib/excelParser';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { useDropzone } from 'react-dropzone';

export default function AdminPage() {
  const { setAIApps, setRawData, getRawData } = useDataStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [uploadedData, setUploadedData] = useState<{
    fileName: string;
    rowCount: number;
    timestamp: string;
  } | null>(null);

  // 下载Excel模板函数
  const downloadExcelTemplate = (type: 'Web' | 'App' | 'All') => {
    // 构建API请求URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const url = `${baseUrl}/api/excel-template?type=${type}`;
    
    // 使用a标签触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type.toLowerCase()}-template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 保存数据到服务器
  const saveDataToServer = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // 获取当前数据
      const data = getRawData();
      
      // 发送到API端点
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSaveStatus({
          success: true,
          message: `数据已成功保存到服务器 (${new Date().toLocaleString('zh-CN')})`,
        });
      } else {
        const error = await response.json() as { error?: string };
        setSaveStatus({
          success: false,
          message: `保存失败: ${error.error || '未知错误'}`,
        });
      }
    } catch (error) {
      console.error('保存数据错误:', error);
      setSaveStatus({
        success: false,
        message: `保存失败: ${(error as Error).message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理文件上传
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus({
        success: false,
        message: '请上传Excel文件（.xlsx或.xls格式）',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setSaveStatus(null);

    try {
      // 解析Excel文件
      const data = await parseExcelFile(file);
      
      // 更新数据存储 - 使用all数组而不是整个AppLists对象
      setAIApps(data.all);
      
      // 同时保存原始数据结构
      setRawData(data);
      
      // 记录上传信息
      setUploadedData({
        fileName: file.name,
        rowCount: data.all.length,
        timestamp: new Date().toLocaleString('zh-CN'),
      });
      
      setUploadStatus({
        success: true,
        message: `成功上传并解析Excel文件，共${data.all.length}条记录`,
      });
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setUploadStatus({
        success: false,
        message: '解析Excel文件时出错，请检查文件格式',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              管理界面
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              上传Excel文件更新AI产品数据
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div 
                {...getRootProps()} 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-transparent rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>上传Excel文件</span>
                    </label>
                    <p className="pl-1">或拖放文件到此处</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    支持.xlsx和.xls格式
                  </p>
                </div>
              </div>
              
              {isUploading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">正在解析Excel文件...</p>
                </div>
              )}
              
              {uploadStatus && (
                <div className={`mt-4 p-4 rounded-md ${
                  uploadStatus.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  <p>{uploadStatus.message}</p>
                </div>
              )}
            </div>
          </div>
          
          {uploadedData && (
            <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">上传历史</h2>
                <div className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-t-md">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">文件名</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {uploadedData.fileName}
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">记录数</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {uploadedData.rowCount}
                    </dd>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-b-md">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">上传时间</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {uploadedData.timestamp}
                    </dd>
                  </div>
                </div>
                
                {/* 保存到服务器按钮 */}
                <div className="mt-6">
                  <button
                    onClick={saveDataToServer}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-md w-full text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isSaving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        正在保存...
                      </span>
                    ) : (
                      '保存数据到服务器'
                    )}
                  </button>
                  
                  {saveStatus && (
                    <div className={`mt-4 p-4 rounded-md ${
                      saveStatus.success 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      <p>{saveStatus.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">使用说明</h2>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">1. 准备Excel文件，确保包含以下列：排名、产品、分类、网址、MRR(万美金)、环比变化、ARR(万美金)</p>
                <p className="mb-2">2. 点击上传区域或将文件拖放到上传区域</p>
                <p className="mb-2">3. 等待文件解析完成，系统会自动更新数据</p>
                <p className="mb-2">4. 上传成功后，可以在产品列表页和数据仪表盘查看更新后的数据</p>
                <p>注意：每次上传将覆盖所有现有数据，请确保Excel文件包含完整的数据集</p>
              </div>
            </div>
          </div>
          
          {/* 模板下载区域 */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">下载Excel模板</h2>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-4">您可以下载预设的Excel模板，然后按照模板格式填写您的数据。</p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => downloadExcelTemplate('Web')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    下载Web榜单模板
                  </button>
                  <button 
                    onClick={() => downloadExcelTemplate('App')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    下载App榜单模板
                  </button>
                  <button 
                    onClick={() => downloadExcelTemplate('All')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    下载完整模板
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
