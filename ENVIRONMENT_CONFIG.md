# 🌍 NHANES Web 应用环境配置指南

本项目支持多种部署环境，自动适配本地开发和云端部署的不同需求。

## 📋 环境配置概览

| 环境类型         | 配置文件                   | 数据源        | 使用场景         |
| ---------------- | -------------------------- | ------------- | ---------------- |
| **本地生产环境** | `docker-compose.yml`       | E盘NHANES数据 | 本地完整功能测试 |
| **本地开发环境** | `docker-compose.dev.yml`   | E盘NHANES数据 | 代码开发和调试   |
| **云端部署环境** | `docker-compose.cloud.yml` | 项目内数据    | 线上生产部署     |

## 🏠 本地环境配置

### 数据路径说明

您的本地数据路径：
```
E:\NHANES_DATA\2024-08-18完整版\01_NHANES
```

### 环境变量优先级

1. **环境变量** `NHANES_DATA_PATH` (最高优先级)
2. **配置文件** `backend/GetNhanes/nhanes_config.json`
3. **Docker默认路径** `/app/nhanes_data`
4. **项目内路径** `/app/Dataresource`

## 🚀 快速启动

### 方式一：使用自动脚本（推荐）

```bash
# Windows
./docker-start.bat

# 选择部署模式：
# 1. 本地生产环境 (挂载E盘NHANES数据)
# 2. 本地开发环境 (代码热重载)  
# 3. 云端部署环境 (仅使用项目内数据)
```

### 方式二：手动启动

```bash
# 本地生产环境（完整数据功能）
docker-compose -f docker-compose.yml up -d

# 本地开发环境（热重载）
docker-compose -f docker-compose.dev.yml up -d

# 云端部署环境（项目内数据）
docker-compose -f docker-compose.cloud.yml up -d
```

## ⚙️ 环境特性对比

### 1. 本地生产环境 (`docker-compose.yml`)

**特点：**
- ✅ 挂载E盘完整NHANES数据
- ✅ 生产级Nginx配置
- ✅ 完整的数据提取功能
- ✅ 健康检查和监控

**访问地址：**
- 主应用: http://localhost
- 后端API: http://localhost/api
- 健康检查: http://localhost/health

**适用场景：**
- 本地功能测试
- 完整数据分析
- 生产环境验证

### 2. 本地开发环境 (`docker-compose.dev.yml`)

**特点：**
- ✅ 代码热重载
- ✅ 调试模式开启
- ✅ 直接端口访问
- ✅ 开发工具友好

**访问地址：**
- 前端: http://localhost:3000
- 后端: http://localhost:5000
- 热重载支持

**适用场景：**
- 代码开发
- 功能调试
- 快速迭代

### 3. 云端部署环境 (`docker-compose.cloud.yml`)

**特点：**
- ✅ 轻量级部署
- ✅ 仅使用项目内数据
- ✅ 云服务优化
- ✅ 安全配置

**访问地址：**
- 主应用: http://localhost
- 后端API: http://localhost/api

**适用场景：**
- 生产部署
- 云服务器
- 演示环境

## 🔧 高级配置

### 自定义数据路径

如果您的数据在其他位置，可以通过以下方式配置：

#### 方式一：修改Docker Compose

编辑 `docker-compose.yml`：
```yaml
volumes:
  - /您的自定义路径:/app/nhanes_data:ro
```

#### 方式二：使用环境变量

```bash
# 设置环境变量
set NHANES_DATA_PATH=C:\YourCustomPath\NHANES

# 或在docker-compose.yml中添加
environment:
  - NHANES_DATA_PATH=/custom/path
```

#### 方式三：修改配置文件

编辑 `backend/GetNhanes/nhanes_config.json`：
```json
{
  "base_path": "您的自定义路径"
}
```

### 云端部署配置

对于云端部署，建议：

1. **使用云端配置文件**
   ```bash
   docker-compose -f docker-compose.cloud.yml up -d
   ```

2. **设置环境变量**
   ```yaml
   environment:
     - NHANES_DATA_PATH=/app/Dataresource
     - FLASK_ENV=production
   ```

3. **数据持久化**
   ```yaml
   volumes:
     - cloud_data:/app/Dataresource
   ```

## 🛠️ 故障排除

### 常见问题

1. **路径不存在错误**
   ```
   FileNotFoundError: Base path not found: E:\NHANES_DATA\...
   ```
   
   **解决方案：**
   - 检查E盘数据是否存在
   - 使用云端配置：`docker-compose -f docker-compose.cloud.yml up -d`
   - 设置正确的环境变量

2. **权限问题**
   ```
   Permission denied
   ```
   
   **解决方案：**
   - 确保Docker有权限访问E盘
   - 以管理员身份运行Docker
   - 检查文件夹权限设置

3. **端口占用**
   ```
   Port 80 is already in use
   ```
   
   **解决方案：**
   - 停止占用端口的服务
   - 使用开发环境：`docker-compose -f docker-compose.dev.yml up -d`
   - 修改端口映射

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.yml logs backend
docker-compose -f docker-compose.yml logs frontend
docker-compose -f docker-compose.yml logs nginx
```

### 完全重置

```bash
# 停止所有服务
./docker-stop.bat

# 清理所有数据
docker-compose down -v --rmi all
docker system prune -af
```

## 📊 性能优化建议

### 本地环境
- 使用生产环境配置进行性能测试
- 定期清理Docker缓存
- 监控资源使用情况

### 云端环境
- 使用云端专用配置
- 配置适当的资源限制
- 启用日志轮转
- 配置健康检查

## 🔐 安全配置

### 生产环境安全
- 更改默认端口
- 配置HTTPS证书
- 设置访问控制
- 定期更新镜像

### 开发环境安全
- 仅在本地网络使用
- 不要暴露到公网
- 定期备份代码

---

**版本**: 1.0.0  
**更新时间**: 2024年7月  
**维护者**: NHANES Team 