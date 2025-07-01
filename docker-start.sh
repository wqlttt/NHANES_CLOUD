#!/bin/bash

# NHANES Web App Docker 启动脚本
echo "🚀 启动 NHANES Web 应用..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker未运行，请先启动Docker"
    exit 1
fi

# 检查docker-compose是否存在
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: docker-compose未安装"
    exit 1
fi

# 构建并启动服务
echo "📦 构建Docker镜像..."
docker-compose build --no-cache

echo "🏃 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 检查健康状态
echo "🩺 检查服务健康状态..."
sleep 5

# 显示访问信息
echo ""
echo "✅ NHANES Web 应用启动成功！"
echo "🌐 访问地址: http://localhost"
echo "🔧 后端API: http://localhost/api"
echo "💊 健康检查: http://localhost/health"
echo ""
echo "📊 服务监控:"
echo "  - 查看日志: docker-compose logs -f"
echo "  - 停止服务: docker-compose down"
echo "  - 重启服务: docker-compose restart"
echo "" 