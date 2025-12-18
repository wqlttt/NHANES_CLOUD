#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 错误处理
set -e

# 进入脚本所在目录
cd "$(dirname "$0")"

echo -e "${GREEN}[INFO] 开始部署流程...${NC}"

# 1. 检查必要命令
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] 未找到 Docker，请先安装 Docker。${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}[ERROR] 未找到 Docker Compose，请先安装。${NC}"
    exit 1
fi

# 2. 拉取最新代码
echo -e "${GREEN}[INFO] 拉取最新代码...${NC}"
git fetch origin master
git reset --hard origin/master

# 3. 停止旧的非 Docker 服务 (如果有)
# 为了兼容之前的部署方式，尝试停止系统级服务以防端口冲突
if systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}[WARN] 检测到系统 Nginx 正在运行，正在停止以释放端口...${NC}"
    sudo systemctl stop nginx
fi
if supervisorctl status nhanes-backend | grep -q 'RUNNING'; then
    echo -e "${YELLOW}[WARN] 检测到 Supervisor 后端服务正在运行，正在停止...${NC}"
    sudo supervisorctl stop nhanes-backend
fi

# 4. 重启 Docker 服务
echo -e "${GREEN}[INFO] 正在重构并启动 Docker 容器...${NC}"
docker-compose down
docker-compose up --build -d

# 5. 清理悬空镜像
echo -e "${GREEN}[INFO] 清理未使用的镜像...${NC}"
docker image prune -f

# 6. 检查状态
echo -e "${GREEN}[INFO] 部署完成！服务状态如下：${NC}"
docker-compose ps

echo -e "${GREEN}[INFO] 访问地址: http://localhost (或服务器IP)${NC}"
