"""
应用配置文件
"""
import os

# 文件上传配置
ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# CORS配置
CORS_ORIGINS = '*'

# 应用配置
# 开发环境：使用环境变量 FLASK_DEBUG，默认 False
# 生产环境：服务器上不设置此变量，保持 False
DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
HOST = os.getenv('FLASK_HOST', '0.0.0.0')

# 端口配置：
# - 如果设置了 FLASK_PORT 环境变量，优先使用该值
# - 否则，默认使用 5000（与 nginx.conf 中的生产环境配置一致）
# - 开发环境可以通过设置 FLASK_PORT=5001 来避免 macOS AirPlay Receiver 冲突
PORT = int(os.getenv('FLASK_PORT', '5000'))
