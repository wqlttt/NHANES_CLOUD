# NHANES Cloud Platform (云上 NHANES 数据分析平台)

这是一个基于 Web 的现代化综合数据分析平台，专门设计用于处理、分析和可视化 NHANES (National Health and Nutrition Examination Survey) 数据。项目采用前沿的前后端分离架构，结合了 "Liquid Glass" 现代设计语言，为医学研究人员提供强大且直观的数据挖掘工具。

## 🌟 核心功能 (Key Features)

### 1. 📊 高级数据分析 (Advanced Data Analysis)
集成多种统计模型，支持自动生成可视化图表和关键统计指标，结果可直接用于学术报告。
*   **回归分析**:
    *   **线性回归 (Linear Regression)**: 支持单变量和多变量分析，自动转化为数值型变量。
    *   **逻辑回归 (Logistic Regression)**: 支持二分类结局分析，自动处理非标准二元标签，提供预测曲线及置信区间。
    *   **Cox 回归 (Cox Proportional Hazards)**: 用于生存分析，提供风险比 (HR)森林图。
    *   **多分类逻辑回归**: 针对 3+ 类别的结局变量。
*   **非线性关系探索**:
    *   **限制性立方样条 (RCS)**: 强大的非线性关系可视化工具，支持 Linear, Logistic, Cox 三种模式，自动计算节点 (Knots) 和 AIC。
*   **假设检验**:
    *   T 检验、卡方检验 (Chi-square)、方差分析 (ANOVA)、秩和检验 (Rank-Sum/Mann-Whitney U)。

### 2. 🧹 智能数据处理 (Data Processing)
提供完整的数据清洗工作流，无需编写代码即可拥有高质量数据集。
*   **缺失值插补 (Imputation)**:
    *   支持简单插补 (均值/中位数)。
    *   **MICE (多重插补)**: 基于机器学习的高级插补，保留数据分布特征。
    *   **可视化反馈**: 实时展示插补前后数据分布对比。
*   **队列筛选 (Cohort Selection)**:
    *   可视化构建筛选漏斗。
    *   支持复杂的逻辑组合 (AND/OR, >, <, Contains)。
    *   实时预览筛选后的样本量变化。
*   **变量计算**: 自定义公式生成新变量（如 BMI = Weight / Height^2）。

### 3. 📈 交互式可视化 (Data Visualization)
*   集成 **Ant Design Charts** 和 **VTable**。
*   支持箱线图、直方图、热力图、散点图等多种图表。
*   全动态交互，支持缩放、筛选和导出图片。

### 4. 🎨 现代 UI 设计 (Liquid Glass Design)
*   **玻璃拟态 (Glassmorphism)**: 采用磨砂玻璃效果、渐变背景和悬浮卡片，提供沉浸式用户体验。
*   **响应式布局**: 完美适配桌面端、平板和移动端操作。
*   **国际化**: 深度支持中英文一键切换。

## 🛠 技术栈 (Tech Stack)

### 后端 (Backend)
*   **Core**: Python 3.10+, Flask
*   **Data Science**: Pandas, NumPy, Statsmodels, Scipy, Patsy
*   **Environment**: Docker, Gunicorn

### 前端 (Frontend)
*   **Core**: React 18, TypeScript, Vite (Migrated context)
*   **UI/UX**: Ant Design 5.0, Framer Motion (Animations)
*   **State Management**: React Hooks
*   **Network**: Axios (with Interceptors)

### 部署与运维 (DevOps)
*   **Infrastructure**: Docker, Docker Compose
*   **Gateway**: Nginx (Reverse Proxy, Static Serving)
*   **CI/CD**: Shell Scripts (deploy.sh)

## ⚡️ 快速开始 (Quick Start)

### 选项 A: 使用 Docker 启动 (推荐)

最简单的方式，无需配置本地环境。

1.  **克隆项目**:
    ```bash
    git clone https://github.com/wqlttt/NHANES_CLOUD.git
    cd NHANES_CLOUD
    ```

2.  **启动服务**:
    ```bash
    docker-compose up --build -d
    ```

3.  **访问应用**:
    *   Web 界面: `http://localhost` (或服务器 IP)
    *   API 文档/测试: `http://localhost:5001`

### 选项 B: 本地开发模式

适合需要修改代码的开发者。

#### 1. 后端环境
```bash
cd backend
# 建议创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
pip install -e .  # 安装本地包

# 启动服务
python get.py
```

#### 2. 前端环境
```bash
cd frontend
npm install
npm start
```

## 📂 项目结构概览

```
NHANES_CLOUD/
├── backend/                # Python 后端
│   ├── DataAnalysis/       # 核心统计分析模块 (rcsAnalysis.py, regression.py...)
│   ├── DataProcessing/     # 数据清洗模块 (impute.py, filter.py...)
│   ├── get_nhanes/         # NHANES 数据提取逻辑
│   ├── routes/             # API 路由
│   └── get.py              # 入口文件
├── frontend/               # React 前端
│   ├── src/
│   │   ├── pages/          # 主要页面 (DataAnalysis, DataProcessing...)
│   │   ├── components/     # UI 组件
│   │   ├── i18n/           # 国际化翻译文件
│   │   └── styles/         # 全局样式
├── docker-compose.yml      # 容器编排
└── README.md               # 项目文档
```

## 📝 最近更新 (Changelog)

*   **Fix(RCS)**: 修复了 Logistic 回归中置信区间计算的形状不匹配问题，增加了非标准二元标签的自动纠正功能。
*   **Feat(UI)**: 全面升级为 "Liquid Glass" 设计风格，优化了移动端导航栏体验。
*   **Feat(Processing)**: 新增了基于 MICE 的多重插补功能和可视化的队列筛选器。
