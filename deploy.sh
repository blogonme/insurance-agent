#!/bin/bash

# =================================================================
# InsurePro v2.0 自动部署脚本
# =================================================================

# 配置项
WEB_ROOT="/var/www/insurance-agent"
NGINX_CONF="/etc/nginx/sites-available/insurance-agent"
NGINX_LINK="/etc/nginx/sites-enabled/insurance-agent"

echo "🚀 开始部署 InsurePro v2.0..."

# 1. 安装依赖
echo "📦 正在安装依赖..."
npm install

# 2. 执行构建
echo "🏗️ 正在构建项目 (Production)..."
npm run build

# 3. 准备 Web 根目录
echo "📂 准备目标目录: $WEB_ROOT"
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:$USER $WEB_ROOT

# 4. 同步文件
echo "🚚 同步构建产物..."
cp -r dist/* $WEB_ROOT/

# 5. 配置 Nginx
echo "⚙️ 更新 Nginx 配置..."
sudo cp nginx.conf $NGINX_CONF
if [ ! -L "$NGINX_LINK" ]; then
    echo "🔗 创建 Nginx 软链接..."
    sudo ln -s $NGINX_CONF $NGINX_LINK
fi

# 6. 检查 Nginx 语法并重启
echo "🔄 重启 Nginx 服务..."
sudo nginx -t && sudo systemctl restart nginx

echo "✅ 部署完成！访问地址: http:// your-server-ip"
