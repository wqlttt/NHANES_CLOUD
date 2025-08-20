#!/bin/bash

# 定义颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 定义日志路径
NGINX_ERROR_LOG="/var/log/nginx/error.log"
NGINX_ACCESS_LOG="/var/log/nginx/access.log"
BACKEND_LOG="/var/log/nhanes-backend.log"

# 检查并创建日志文件
create_log_files() {
    # 创建nginx日志文件（如果不存在）
    if [ ! -f "$NGINX_ERROR_LOG" ]; then
        sudo touch "$NGINX_ERROR_LOG"
        sudo chown www-data:adm "$NGINX_ERROR_LOG"
    fi
    if [ ! -f "$NGINX_ACCESS_LOG" ]; then
        sudo touch "$NGINX_ACCESS_LOG"
        sudo chown www-data:adm "$NGINX_ACCESS_LOG"
    fi
    
    # 创建后端日志文件（如果不存在）
    if [ ! -f "$BACKEND_LOG" ]; then
        sudo touch "$BACKEND_LOG"
        sudo chown root:root "$BACKEND_LOG"
        sudo chmod 644 "$BACKEND_LOG"
    fi
}

# 输出带颜色的信息函数
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令执行状态
check_status() {
    if [ $? -eq 0 ]; then
        print_message "$1 成功"
    else
        print_error "$1 失败"
        exit 1
    fi
}

# 检查并显示日志
check_logs() {
    local log_file=$1
    local log_name=$2
    if [ -f "$log_file" ] && [ -r "$log_file" ]; then
        echo "=== $log_name 最后10行 ==="
        sudo tail -n 10 "$log_file"
    else
        print_warning "无法读取 $log_name: $log_file"
        print_warning "请检查文件是否存在并有正确的权限"
    fi
}

# 创建日志文件
create_log_files

# 1. 更新代码
print_message "开始更新代码..."
cd /root/NHANES_WEB
git pull origin master
check_status "代码更新"

# 2. 停止服务
print_message "停止现有服务..."
sudo systemctl stop nginx
sudo supervisorctl stop nhanes-backend
check_status "服务停止"

# 3. 更新前端
print_message "更新前端..."
cd /root/NHANES_WEB/frontend

# 检查是否有package.json的更改
if git diff --quiet HEAD@{1} HEAD -- package.json; then
    print_message "package.json 没有变化，跳过 npm install"
else
    print_warning "检测到 package.json 有更新，执行 npm install..."
    npm install
    check_status "npm install"
fi

# 构建前端
print_message "构建前端..."
npm run build
check_status "前端构建"

# 4. 更新后端
print_message "更新后端..."
cd /root/NHANES_WEB/backend

# 激活虚拟环境
source nhanes/bin/activate
check_status "激活虚拟环境"

# 检查requirements.txt是否有更改
if git diff --quiet HEAD@{1} HEAD -- requirements.txt; then
    print_message "requirements.txt 没有变化，跳过 pip install"
else
    print_warning "检测到 requirements.txt 有更新，执行 pip install..."
    pip install -r requirements.txt
    check_status "pip install"
fi

# 5. 启动服务
print_message "启动服务..."
sudo systemctl start nginx
check_status "nginx 启动"

sudo supervisorctl start nhanes-backend
check_status "后端服务启动"

# 6. 检查服务状态
print_message "检查服务状态..."
echo "Nginx 状态："
sudo systemctl status nginx | grep "Active:"
echo "后端服务状态："
sudo supervisorctl status nhanes-backend

# 7. 显示最新日志
print_message "检查日志文件..."

# 检查并显示nginx错误日志
check_logs "$NGINX_ERROR_LOG" "Nginx错误日志"

# 检查并显示nginx访问日志
check_logs "$NGINX_ACCESS_LOG" "Nginx访问日志"

# 检查并显示后端日志
check_logs "$BACKEND_LOG" "后端服务日志"

print_message "部署完成！"
echo "=== 日志查看命令 ==="
echo "1. 查看supervisor日志："
echo "   sudo supervisorctl tail nhanes-backend"
echo "   sudo supervisorctl tail nhanes-backend stderr"
echo ""
echo "2. 查看nginx日志："
echo "   sudo journalctl -u nginx.service"
echo "   sudo cat /var/log/nginx/error.log"
echo ""
echo "3. 查看系统日志："
echo "   sudo journalctl -f"