# 使用官方 Python 运行时作为父镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
# 防止 Python 生成pyc文件
ENV PYTHONDONTWRITEBYTECODE=1
# 防止 Python 缓冲 stdout 和 stderr
ENV PYTHONUNBUFFERED=1

# 安装系统依赖
# 如果需要编译某些 Python 包（如 pandas, numpy），可能需要 gcc 等工具
# 这里先安装基本工具，根据实际情况添加
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY . .

# 暴露端口 (Flask 默认 5000)
EXPOSE 5000

# 启动命令
# 假设 get.py 是入口文件
CMD ["python", "get.py"]
