# NHANES CLOUD 项目文档

## Docker 部署指南

### 1. 启动服务
在后台启动某有服务：
```bash
docker-compose up -d
```
> **注意**：如果是第一次运行，或者您修改了 `requirements.txt` / `package.json`，Docker 会自动进行构建。

### 2. 停止服务
停止并移除容器：
```bash
docker-compose down
```

### 3. 重新构建
如果您修改了代码（尤其是 Python 依赖或前端代码），需要强制重新构建镜像：
```bash
docker-compose up -d --build
```

### 4. 查看日志
如果遇到问题，可以查看后台服务的日志：
```bash
docker-compose logs -f backend
```
或者前端日志：
```bash
docker-compose logs -f frontend
```

### 5. 访问地址

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| **前端页面** | [http://localhost](http://localhost) | 用户主入口 |
| **后端 API** | [http://localhost:5001](http://localhost:5001) | 开发调试用 (已解决 5000 端口冲突) |

---
## 常见问题

**Q: 为什么端口是 5001？**
A: macOS 的 AirPlay 接收器默认占用 5000 端口。为了避免冲突，我们将本地访问后端的端口改为了 5001。但是在 Docker 内部，Nginx 仍然通过 5000 端口连接后端，这是自动配置好的，您无需操心。
