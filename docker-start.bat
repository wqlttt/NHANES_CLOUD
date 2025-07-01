@echo off
chcp 65001 >nul
echo 🚀 启动 NHANES Web 应用...
echo.

REM 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: Docker未运行，请先启动Docker
    pause
    exit /b 1
)

REM 检查docker-compose是否存在
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: docker-compose未安装
    pause
    exit /b 1
)

REM 选择部署模式
echo 📋 请选择部署模式:
echo   1. 本地生产环境 (挂载E盘NHANES数据)
echo   2. 本地开发环境 (代码热重载)
echo   3. 云端部署环境 (仅使用项目内数据)
echo.
set /p mode="请输入选项 (1-3): "

if "%mode%"=="1" (
    set COMPOSE_FILE=docker-compose.yml
    echo 🏭 使用本地生产环境配置
) else if "%mode%"=="2" (
    set COMPOSE_FILE=docker-compose.dev.yml
    echo 🛠️ 使用本地开发环境配置
) else if "%mode%"=="3" (
    set COMPOSE_FILE=docker-compose.cloud.yml
    echo ☁️ 使用云端部署环境配置
) else (
    echo ❌ 无效选项，使用默认的本地生产环境
    set COMPOSE_FILE=docker-compose.yml
)

echo.
echo 📦 构建Docker镜像...
docker-compose -f %COMPOSE_FILE% build --no-cache
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo 🏃 启动服务...
docker-compose -f %COMPOSE_FILE% up -d
if %errorlevel% neq 0 (
    echo ❌ 启动失败
    pause
    exit /b 1
)

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker-compose -f %COMPOSE_FILE% ps

REM 检查健康状态
echo 🩺 检查服务健康状态...
timeout /t 5 /nobreak >nul

REM 显示访问信息
echo.
echo ✅ NHANES Web 应用启动成功！
if "%mode%"=="2" (
    echo 🌐 前端地址: http://localhost:3000 (开发模式)
    echo 🔧 后端API: http://localhost:5000 (开发模式)
) else (
    echo 🌐 访问地址: http://localhost
    echo 🔧 后端API: http://localhost/api
)
echo 💊 健康检查: http://localhost/health
echo.
echo 📊 服务监控:
echo   - 查看日志: docker-compose -f %COMPOSE_FILE% logs -f
echo   - 停止服务: docker-compose -f %COMPOSE_FILE% down
echo   - 重启服务: docker-compose -f %COMPOSE_FILE% restart
echo.
echo 按任意键退出...
pause >nul 