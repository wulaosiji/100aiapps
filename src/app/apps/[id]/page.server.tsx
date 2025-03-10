// 创建一个服务器组件来处理静态参数生成
export function generateStaticParams() {
  // 为前5个产品ID生成静态路由
  return [1, 2, 3, 4, 5].map(id => ({
    id: id.toString(),
  }));
}

// 导出一个默认的空组件，实际内容由客户端组件提供
export default function AppDetailPageStatic() {
  return null;
}
