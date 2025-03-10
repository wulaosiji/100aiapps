// 格式化货币显示，根据数值大小自动选择单位（万或亿）
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  
  // 如果数值大于等于1万，转换为亿为单位
  if (value >= 10000) {
    const inBillion = value / 10000;
    return `$${inBillion.toFixed(2)}亿`;
  }
  
  // 否则使用万为单位
  return `$${value}万`;
};

// 格式化ARPU值（不带单位"万"）
export const formatArpu = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  return `$${value.toFixed(2)}`;
}; 