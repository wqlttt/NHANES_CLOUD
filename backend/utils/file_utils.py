"""
文件处理工具函数
"""
import os
from flask import Response, abort
from config import ALLOWED_EXTENSIONS


def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def download_file(directory, file_name, file_suffix=""):
    """
    下载文件的通用函数
    
    Args:
        directory: 文件所在目录
        file_name: 文件名（不含后缀）
        file_suffix: 文件后缀（可选）
    
    Returns:
        Flask Response对象或错误信息
    """
    try:
        # 构造文件路径
        file_path = os.path.join(directory, f'{file_name}{file_suffix}.csv')
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            abort(404, description="Resource not found")
            
        # 打开文件并读取内容
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # 创建带有文件内容的响应对象
        response = Response(file_content, mimetype='text/csv')
        response.headers['Content-Disposition'] = f'attachment; filename={file_name}{file_suffix}.csv'
        return response
    except Exception as e:
        print(f"Error: {str(e)}")
        return str(e), 500
