# NHANES Cloud Platform (云上 NHANES 数据分析平台)

这是一个基于 Web 的综合数据分析平台，专门设计用于处理、分析和可视化 NHANES (National Health and Nutrition Examination Survey) 数据。该项目采用前后端分离架构，支持云端部署，为研究人员提供便捷的数据提取和分析工具。

## 🚀 主要功能

该平台集成了以下核心模块：

*   **数据提取 (Data Extraction)**: 能够从 NHANES 数据库中提取特定变量和数据集。
*   **数据分析 (Data Analysis)**: 提供统计分析功能（如线性回归等），与 R 语言分析流程集成。
*   **数据可视化 (Data Visualization)**: 基于 Ant Design Charts 和 VTable 提供丰富的交互式图表和表格展示。
*   **文件操作 (File Operations)**: 支持数据文件的上传、管理和处理。

## 🛠 技术栈

### 后端 (Backend)
*   **框架**: Flask (Python)
*   **语言**: Python 3.8+
*   **数据处理**: Pandas, NumPy
*   **API**: RESTful API, Flask-CORS
*   **配置**: Python-dotenv

### 前端 (Frontend)
*   **框架**: React (TypeScript)
*   **UI 组件库**: Ant Design (antd)
*   **图表库**: @ant-design/charts, @visactor/vtable
*   **HTTP 客户端**: Axios
*   **国际化**: i18next

### 部署与运维 (DevOps)
*   **容器化**: Docker, Docker Compose
*   **Web 服务器**: Nginx (作为反向代理和静态资源服务器)
*   **脚本**: Shell Scripts (deploy.sh)

## 📂 项目结构

```
NHANES_CLOUD/
├── backend/                # Python Flask 后端代码
│   ├── get_nhanes/         # 核心数据处理包
│   ├── routes/             # API 路由定义 (分析, 为了, 可视化等)
│   ├── services/           # 业务逻辑层
│   ├── utils/              # 工具函数
│   ├── get.py              # Flask 应用入口
│   └── Dockerfile          # 后端容器配置
├── frontend/               # React 前端代码
│   ├── src/                # 源代码
│   ├── public/             # 静态资源
│   ├── package.json        # 依赖管理
│   └── Dockerfile          # 前端容器配置
├── deployment/             # 部署配置文件
├── docker-compose.yml      # Docker 编排文件
└── deploy.sh               # 自动化部署脚本
```

## ⚡️ 快速开始

### 前置要求
*   Docker & Docker Compose
*   Python 3.8+ (用于本地开发)
*   Node.js 16+ (用于本地开发)

### 使用 Docker 启动（推荐）

1.  克隆项目到本地。
2.  在项目根目录下运行：
    ```bash
    docker-compose up --build -d
    ```
3.  访问应用：
    *   前端页面: `http://localhost` (或 `https://localhost`)
    *   后端 API: `http://localhost:5001`

### 本地开发模式

#### 后端
1.  进入 `backend` 目录：
    ```bash
    cd backend
    ```
2.  安装依赖（建议使用虚拟环境）：
    ```bash
    pip install -r requirements.txt
    pip install -e .
    ```
3.  启动 Flask 服务：
    ```bash
    python get.py
    ```

#### 前端
1.  进入 `frontend` 目录：
    ```bash
    cd frontend
    ```
2.  安装依赖：
    ```bash
    npm install
    ```
3.  启动开发服务器：
    ```bash
    npm start
    ```

## 🔧 配置说明

*   **后端配置**: 主要在 `backend/config.py` 和 `.env` 文件中设置。
    *   `NHANES_DATA_PATH`: NHANES 数据存储路径。
*   **Docker 配置**: `docker-compose.yml` 定义了端口映射和卷挂载。
    *   默认后端端口映射: `5001:5000`
    *   默认前端端口映射: `80:80`, `443:443`
    *   **注意**: 生产环境部署时，请检查 `deploy.sh` 中的特定配置。

## 📝 开发指南

*   **添加新 API**: 在 `backend/routes/` 下创建新的蓝图，并在 `backend/get.py` 中注册。
*   **数据路径**: 确保 `NHANES_DATA_PATH` 环境变量指向正确的 NHANES 数据目录，Docker 部署时通过 `docker-compose.yml` 挂载。

## 📄 许可证

[License Information]
