@echo off
chcp 65001 >nul
echo 🛑 停止 NHANES Web 应用...
echo.

REM 检查运行中的NHANES容器
docker ps --filter "name=nhanes" --format "table {{.Names}}\t{{.Status}}" >nul 2>&1
if %errorlevel% equ 0 (
    echo 📋 检测到以下NHANES服务正在运行:
    docker ps --filter "name=nhanes" --format "table {{.Names}}\t{{.Status}}"
    echo.
)

REM 停止所有可能的配置
echo 📦 停止所有NHANES服务...
docker-compose -f docker-compose.yml down 2>nul
docker-compose -f docker-compose.dev.yml down 2>nul
docker-compose -f docker-compose.cloud.yml down 2>nul

REM 确保所有NHANES容器都已停止
echo 🔍 确保所有相关容器已停止...
docker stop nhanes-backend nhanes-frontend nhanes-nginx 2>nul
docker rm nhanes-backend nhanes-frontend nhanes-nginx 2>nul

REM 清理未使用的镜像和容器（可选）
echo.
set /p cleanup="是否清理未使用的Docker资源？(y/N): "
if /i "%cleanup%"=="y" (
    echo 🧹 清理Docker资源...
    docker system prune -f
    echo ✅ 清理完成
) else (
    echo ⏭️ 跳过清理
)

echo.
echo ✅ NHANES Web 应用已完全停止
echo.
echo 💡 提示:
echo   - 重新启动: docker-start.bat
echo   - 查看状态: docker ps --filter "name=nhanes"
echo   - 完全清理: docker-compose down -v --rmi all
echo.
echo 按任意键退出...
pause >nul 