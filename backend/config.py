"""
应用配置文件
"""

# 文件上传配置
ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# CORS配置
CORS_ORIGINS = '*'

# 应用配置
DEBUG = False
HOST = '0.0.0.0'
PORT = 5000
