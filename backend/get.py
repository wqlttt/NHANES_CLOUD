"""
NHANES数据处理服务器 - 主入口文件（重构版）
"""
from flask import Flask
from flask_cors import CORS

# 导入配置
from config import CORS_ORIGINS, DEBUG, HOST, PORT

# 延迟导入GetNhanes模块，避免启动时的路径错误
try:
    from GetNhanes.coreCalculated import *
    print("成功导入GetNhanes核心计算模块")
except Exception as e:
    print(f"警告: 无法导入GetNhanes核心计算模块: {e}")
    print("数据提取功能可能不可用，但其他功能仍然正常")

# 导入数据提取功能
try:
    from GetNhanes.utils.getMetricsConvenient import get_nhanes_data
    try:
        from GetNhanes import config
        base_path = config.get_base_path()
        print(f"成功导入NHANES数据提取功能，基础路径: {base_path}")
    except Exception as config_e:
        print(f"成功导入NHANES数据提取功能，但配置检查失败: {config_e}")
except Exception as e:
    print(f"警告: 无法导入NHANES数据提取功能: {e}")
    print("自定义数据提取功能将不可用")

# 创建Flask应用
app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

print("Starting the NHANES data processing server...")

# 注册路由蓝图
from routes.file_operations import file_bp
from routes.data_visualization import visualization_bp
from routes.data_analysis import analysis_bp
from routes.data_extraction import extraction_bp

app.register_blueprint(file_bp)
app.register_blueprint(visualization_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(extraction_bp)

# 健康检查端点
@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return {"status": "healthy", "message": "NHANES服务运行正常"}

# 主程序入口
if __name__ == '__main__':
    app.run(host=HOST, port=PORT, debug=DEBUG)
