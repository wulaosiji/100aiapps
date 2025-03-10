'use client';

import { useState } from 'react';
import { useDataStore } from '@/lib/dataStore';
import { parseExcelFile } from '@/lib/excelParser';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { useDropzone } from 'react-dropzone';

export default function AdminPage() {
  const { setAIApps } = useDataStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [uploadedData, setUploadedData] = useState<{
    fileName: string;
    rowCount: number;
    timestamp: string;
  } | null>(null);

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

    try {
      // 解析Excel文件
      const data = await parseExcelFile(file);
      
      // 更新数据存储
      setAIApps(data);
      
      // 记录上传信息
      setUploadedData({
        fileName: file.name,
        rowCount: data.length,
        timestamp: new Date().toLocaleString('zh-CN'),
      });
      
      setUploadStatus({
        success: true,
        message: `成功上传并解析Excel文件，共${data.length}条记录`,
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
