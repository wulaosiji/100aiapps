#!/bin/bash

# 部署配置
SERVER_USER="root"  # 阿里云ECS用户名，通常是root或ubuntu
SERVER_IP="your-server-ip"  # 替换为您的阿里云ECS公网IP
SERVER_PATH="/var/www/100aiapps"  # 服务器上的部署路径

# 显示信息
echo "开始部署100aiapps项目到阿里云..."

# 创建远程目录
echo "创建远程目录..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH"

# 将项目文件传输到服务器(排除node_modules和.next)
echo "传输项目文件到服务器..."
rsync -avz --exclude='node_modules' --exclude='.next' ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# 在远程服务器上安装依赖并启动应用
echo "在服务器上安装依赖..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm install"

# 在远程服务器上配置pm2并启动应用
echo "配置PM2并启动应用..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && npm install -g pm2 && pm2 delete 100aiapps || true && NEXT_PUBLIC_BASE_URL=http://your-server-ip pm2 start npm --name '100aiapps' -- run dev"

echo "部署完成！应用已在服务器上启动。"
echo "可以通过以下地址访问：http://$SERVER_IP:3000" 