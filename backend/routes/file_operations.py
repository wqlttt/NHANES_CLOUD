"""
文件操作相关路由
"""
from flask import Blueprint, request, jsonify
import os
from utils.file_utils import allowed_file, download_file
from services.csv_service import CSVService
from config import MAX_FILE_SIZE

file_bp = Blueprint('file_operations', __name__)


@file_bp.route('/download', methods=['GET'])
def download():
    """文件下载接口"""
    directory = request.args.get('directory', '')
    file_name = request.args.get('fileName', '')
    file_suffix = request.args.get('fileSuffix', '')
    
    return download_file(directory, file_name, file_suffix)


@file_bp.route('/get_csvfile', methods=['POST'])
def get_csvfile():
    """
    CSV文件上传和解析接口
    支持文件上传、格式验证、大小检查、数据解析和统计分析
    """
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "error": "没有上传文件",
            "error_code": "NO_FILE"
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "没有选择文件",
            "error_code": "NO_FILENAME"
        }), 400

    # Check file extension
    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "error": "只支持CSV文件格式",
            "error_code": "INVALID_FORMAT",
            "allowed_formats": ["csv"]
        }), 400

    # Check file size
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    if file_length > MAX_FILE_SIZE:
        return jsonify({
            "success": False,
            "error": f"文件大小超过限制，最大支持{MAX_FILE_SIZE / (1024 * 1024):.0f}MB",
            "error_code": "FILE_TOO_LARGE",
            "file_size": file_length,
            "max_size": MAX_FILE_SIZE
        }), 400

    try:
        result = CSVService.parse_csv_file(file, file_length)
        
        return jsonify({
            "success": True,
            "filename": file.filename,
            **result,
            "message": f"成功解析CSV文件，包含{result['total_rows']}行数据，{result['total_columns']}列"
        })
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve),
            "error_code": "EMPTY_FILE"
        }), 400
    except Exception as e:
        import traceback
        import pandas as pd
        
        # 处理特定的pandas错误
        if isinstance(e, pd.errors.EmptyDataError):
            return jsonify({
                "success": False,
                "error": "CSV文件为空或格式不正确",
                "error_code": "EMPTY_DATA"
            }), 400
        elif isinstance(e, pd.errors.ParserError):
            return jsonify({
                "success": False,
                "error": f"CSV文件解析失败：{str(e)}",
                "error_code": "PARSE_ERROR"
            }), 400
        elif isinstance(e, UnicodeDecodeError):
            return jsonify({
                "success": False,
                "error": "文件编码格式不支持，请使用UTF-8编码",
                "error_code": "ENCODING_ERROR"
            }), 400
        else:
            print("CSV文件处理错误:")
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": f"文件处理失败：{str(e)}",
                "error_code": "PROCESSING_ERROR"
            }), 500


@file_bp.route('/get_csv_info', methods=['POST'])
def get_csv_info():
    """简化版本的CSV文件信息获取，专门用于调试工具"""
    if 'csv_file' not in request.files:
        return jsonify({
            "success": False,
            "error": "没有上传文件"
        }), 400

    file = request.files['csv_file']
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "没有选择文件"
        }), 400

    try:
        result = CSVService.get_csv_info_simple(file)
        return jsonify({
            "success": True,
            **result
        })
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"文件处理失败：{str(e)}"
        }), 500


@file_bp.route('/get_file_columns', methods=['POST'])
def get_file_columns():
    """获取已上传CSV文件的列信息，用于前端变量选择下拉框"""
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "error": "没有上传文件",
            "error_code": "NO_FILE"
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "没有选择文件",
            "error_code": "NO_FILENAME"
        }), 400

    try:
        result = CSVService.get_file_columns(file)
        return jsonify({
            "success": True,
            **result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"获取列信息失败：{str(e)}",
            "error_code": "COLUMN_INFO_ERROR"
        }), 500
