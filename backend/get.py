import numpy as np
from flask import Flask, request, jsonify,Response, abort
from flask_cors import CORS
import pandas as pd
import os
import math
import json

# JSON序列化辅助函数
def convert_to_serializable(obj):
    """将pandas/numpy数据类型转换为JSON可序列化的Python原生类型"""
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        val = float(obj)
        # 处理无穷大和NaN值
        if np.isinf(val):
            return None  # 或者返回一个大数值，如 999999
        elif np.isnan(val):
            return None
        return val
    elif isinstance(obj, np.ndarray):
        return [convert_to_serializable(item) for item in obj.tolist()]
    elif pd.isna(obj) or obj != obj:  # 检查NaN
        return None
    elif obj == float('inf') or obj == float('-inf'):
        return None  # 处理Python的无穷大
    return obj

from DataAnalysis.coxRegression import cox_regression_analysis
# from rdkit.ML.Cluster.Standardize import methods

from DataAnalysis.logisticRegression import logistic_regression_analysis, multinomial_logistic_regression_analysis
from DataAnalysis.linearRegression import linear_regression_analysis, multiple_linear_regression_analysis
from DataVisualization.heatmap import generate_heatmap
from DataVisualization.histogram import generate_histogram
from DataVisualization.scatterplot import generate_scatterplot

from GetNhanes.coreCalculated import *

# Configuration
ALLOWED_EXTENSIONS = {'csv'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB - 匹配前端显示的限制

app = Flask(__name__)
CORS(app)

print("Starting the NHANES data processing server...")

def download_file(directory, file_name, file_suffix=""):
    try:
        # 构造文件路径
        file_path = os.path.join(directory, f'{file_name}{file_suffix}.csv')
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")  # 添加调试日志
            abort(404, description="Resource not found")
            
        # 打开文件并读取内容
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # 创建带有文件内容的响应对象
        response = Response(file_content, mimetype='text/csv')
        response.headers['Content-Disposition'] = f'attachment; filename={file_name}{file_suffix}.csv'
        return response
    except Exception as e:
        print(f"Error: {str(e)}")  # 添加调试日志
        return str(e), 500

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# 自定义提取
@app.route('/process_nhanes', methods=['POST'])
def process_nhanes():
    try:
        data = request.json
        items = data.get('items', [])
        
        results = []
        for item in items:
            years = [item['year']]
            features = [f.strip() for f in item['indicator'].split(',')]
            metricName = item['file']
            
            result = get_nhanes_data(
                years=years,
                features=features,
                metric_prefix=metricName,
                merge_output=True,
                save_each_file=True
            )
            # Convert result to CSV
            csv_data = result.to_csv(index=False) if hasattr(result, 'to_csv') else str(result)
            results.append({
                'year': item['year'],
                'file': item['file'],
                'indicator': item['indicator'],
                'result': csv_data
            })
        
        return jsonify({
            'success': True, 
            'results': results,
            'csv_data': '\n'.join([r['result'] for r in results])
        })
    
    except Exception as e:
        import traceback
        print("Error occurred:")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})


# 二级指标提取
@app.route('/download/<indicator>_results.csv', methods=['GET'])
def download_result_data(indicator):
    directory = r'E:\\NHANES_WQLT\\backend\\Dataresource\\ResultData'
    return download_file(directory, indicator, '_results')

# 死亡指标提取
@app.route('/download/<selectedIndicator2>.csv', methods=['GET'])
def download_mort_data(selectedIndicator2):
    directory = os.path.join(os.path.dirname(__file__), 'Dataresource', 'MortData')
    return download_file(directory, selectedIndicator2)

# 获取死亡数据API
@app.route('/api/mortality/<mortality_year>', methods=['GET'])
def get_mortality_data(mortality_year):
    try:
        # 构建CSV文件路径
        directory = os.path.join(os.path.dirname(__file__), 'Dataresource', 'MortData')
        csv_file = f"{mortality_year}_mort.csv"
        file_path = os.path.join(directory, csv_file)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': f'死亡数据文件 {csv_file} 不存在'
            }), 404
        
        # 获取分页参数
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        export_all = request.args.get('export_all', 'false').lower() == 'true'
        
        # 读取CSV文件
        df = pd.read_csv(file_path)
        
        # 如果是导出全部数据，则返回所有数据
        if export_all:
            page_data = df
            pagination_info = {
                'page': 1,
                'limit': len(df),
                'total': len(df),
                'total_pages': 1
            }
        else:
            # 计算分页
            total_records = len(df)
            total_pages = (total_records + limit - 1) // limit  # 向上取整
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            
            # 获取当前页数据
            page_data = df.iloc[start_idx:end_idx]
            pagination_info = {
                'page': page,
                'limit': limit,
                'total': total_records,
                'total_pages': total_pages
            }
        
        # 转换为字典格式，处理NaN值
        page_data = page_data.replace([np.nan, pd.NaT], None)
        
        # 构建列信息
        columns = []
        for col in df.columns:
            columns.append({
                'field': col,
                'title': col.upper(),  # 列标题大写
                'width': 'auto'
            })
        
        return jsonify({
            'success': True,
            'columns': columns,
            'records': page_data.to_dict(orient='records'),
            'pagination': pagination_info
        })
        
    except Exception as e:
        print(f"Error reading mortality data: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'读取死亡数据失败: {str(e)}'
        }), 500

# 协变量指标提取
@app.route('/download/<selectedIndicator3>_covariates.csv', methods=['GET'])
def download_covariates_data(selectedIndicator3):
    directory = r'E:\\NHANES_WQLT\\backend\\Dataresource\\covariatesData'
    return download_file(directory, selectedIndicator3, '_covariates')

# 获取CSV文件 - 数据可视化上传接口
@app.route('/get_csvfile', methods=["POST"])
def get_csvfile():
    """
    处理CSV文件上传，用于数据可视化界面
    返回文件数据、列信息、基本统计信息等
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
    file.seek(0, os.SEEK_END)  # Move cursor to end of file
    file_length = file.tell()  # Get file size
    file.seek(0)  # Reset cursor position
    if file_length > MAX_FILE_SIZE:
        return jsonify({
            "success": False,
            "error": f"文件大小超过限制，最大支持{MAX_FILE_SIZE / (1024 * 1024):.0f}MB",
            "error_code": "FILE_TOO_LARGE",
            "file_size": file_length,
            "max_size": MAX_FILE_SIZE
        }), 400

    try:
        # Read the CSV file into a DataFrame while preserving NA values
        df = pd.read_csv(file, keep_default_na=True)
        
        # 基本信息检查
        if df.empty:
            return jsonify({
                "success": False,
                "error": "CSV文件为空",
                "error_code": "EMPTY_FILE"
            }), 400
        
        # 获取数值类型的列
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
        datetime_columns = df.select_dtypes(include=['datetime64']).columns.tolist()
        
        # 计算基本统计信息
        file_stats = {
            "total_rows": int(len(df)),
            "total_columns": int(len(df.columns)),
            "numeric_columns_count": int(len(numeric_columns)),
            "categorical_columns_count": int(len(categorical_columns)),
            "datetime_columns_count": int(len(datetime_columns)),
            "missing_values_total": int(df.isnull().sum().sum()),
            "file_size": int(file_length)
        }
        
        # 列信息详细分析
        columns_info = []
        for col in df.columns:
            col_info = {
                "name": col,
                "type": str(df[col].dtype),
                "non_null_count": int(df[col].count()),
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
            }
            
            # 如果是数值列，添加统计信息
            if col in numeric_columns:
                col_info.update({
                    "data_type": "numeric",
                    "min_value": convert_to_serializable(df[col].min()),
                    "max_value": convert_to_serializable(df[col].max()),
                    "mean_value": convert_to_serializable(df[col].mean()),
                    "std_value": convert_to_serializable(df[col].std()),
                })
            elif col in categorical_columns:
                top_values_dict = {}
                if not df[col].empty:
                    value_counts = df[col].value_counts().head(5)
                    top_values_dict = {str(k): convert_to_serializable(v) for k, v in value_counts.items()}
                
                col_info.update({
                    "data_type": "categorical",
                    "top_values": top_values_dict
                })
            elif col in datetime_columns:
                col_info.update({
                    "data_type": "datetime"
                })
            else:
                col_info.update({
                    "data_type": "other"
                })
            
            columns_info.append(col_info)
        
        # 数据预览（前100行）
        preview_df = df.head(100)
        # Convert all NaN/NaT values to None in the preview DataFrame
        cleaned_preview_df = preview_df.replace([np.nan, pd.NaT], None)
        
        # 如果数据量太大，只返回预览数据
        if len(df) > 1000:
            # 只返回前1000行的完整数据
            full_df = df.head(1000)
            cleaned_full_df = full_df.replace([np.nan, pd.NaT], None)
            data_truncated = True
        else:
            # 返回完整数据
            cleaned_full_df = df.replace([np.nan, pd.NaT], None)
            data_truncated = False
        
        return jsonify({
            "success": True,
            "filename": file.filename,
            "file_stats": file_stats,
            "columns": df.columns.tolist(),
            "columns_info": columns_info,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "datetime_columns": datetime_columns,
            "preview_data": cleaned_preview_df.to_dict(orient='records'),
            "full_data": cleaned_full_df.to_dict(orient='records'),
            "data_truncated": data_truncated,
            "message": f"成功解析CSV文件，包含{len(df)}行数据，{len(df.columns)}列"
        })
        
    except pd.errors.EmptyDataError:
        return jsonify({
            "success": False,
            "error": "CSV文件为空或格式不正确",
            "error_code": "EMPTY_DATA"
        }), 400
    except pd.errors.ParserError as e:
        return jsonify({
            "success": False,
            "error": f"CSV文件解析失败：{str(e)}",
            "error_code": "PARSE_ERROR"
        }), 400
    except UnicodeDecodeError:
        return jsonify({
            "success": False,
            "error": "文件编码格式不支持，请使用UTF-8编码",
            "error_code": "ENCODING_ERROR"
        }), 400
    except Exception as e:
        import traceback
        print("CSV文件处理错误:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"文件处理失败：{str(e)}",
            "error_code": "PROCESSING_ERROR"
        }), 500

# 简化的CSV文件信息获取 - 用于调试工具
@app.route('/get_csv_info', methods=['POST'])
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
        # 读取CSV文件
        df = pd.read_csv(file)
        
        if df.empty:
            return jsonify({
                "success": False,
                "error": "CSV文件为空"
            }), 400
        
        # 获取列信息
        columns = df.columns.tolist()
        dtypes = [str(dtype) for dtype in df.dtypes]
        unique_counts = [int(df[col].nunique()) for col in columns]
        
        # 获取样本值
        sample_values = []
        for col in columns:
            unique_vals = df[col].dropna().unique()
            if len(unique_vals) > 5:
                sample_vals = unique_vals[:5].tolist()
            else:
                sample_vals = unique_vals.tolist()
            sample_values.append([str(v) for v in sample_vals])
        
        # 预览数据
        preview = df.head(5).to_dict(orient='records')
        
        return jsonify({
            "success": True,
            "columns": columns,
            "dtypes": dtypes,
            "unique_counts": unique_counts,
            "sample_values": sample_values,
            "rows_count": len(df),
            "preview": preview
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"文件处理失败：{str(e)}"
        }), 500

# 获取上传文件的列信息 - 用于变量选择
@app.route('/get_file_columns', methods=['POST'])
def get_file_columns():
    """
    获取已上传CSV文件的列信息，用于前端变量选择下拉框
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

    try:
        # 只读取文件的前几行来获取列信息，提高性能
        df = pd.read_csv(file, nrows=10)
        
        # 获取不同类型的列
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
        datetime_columns = df.select_dtypes(include=['datetime64']).columns.tolist()
        all_columns = df.columns.tolist()
        
        # 为前端下拉框准备选项格式
        column_options = []
        for col in all_columns:
            col_type = "other"
            if col in numeric_columns:
                col_type = "numeric"
            elif col in categorical_columns:
                col_type = "categorical"
            elif col in datetime_columns:
                col_type = "datetime"
            
            column_options.append({
                "value": col,
                "label": col,
                "type": col_type,
                "description": f"{col} ({col_type})"
            })
        
        return jsonify({
            "success": True,
            "columns": all_columns,
            "column_options": column_options,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "datetime_columns": datetime_columns,
            "total_columns": len(all_columns)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"获取列信息失败：{str(e)}",
            "error_code": "COLUMN_INFO_ERROR"
        }), 500

# 数据可视化统一接口
@app.route('/generate_visualization', methods=['POST'])
def generate_visualization():
    """
    统一的数据可视化接口，支持多种图表类型
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

    # 获取图表配置参数
    chart_type = request.form.get('chart_type', 'histogram')
    x_var = request.form.get('x_var')
    y_var = request.form.get('y_var')
    color = request.form.get('color', '#1890ff')
    title = request.form.get('title', '')

    try:
        # 根据图表类型调用相应的生成函数
        if chart_type == 'histogram':
            if not x_var:
                return jsonify({
                    "success": False,
                    "error": "直方图需要选择X轴变量",
                    "error_code": "MISSING_X_VAR"
                }), 400
            result = generate_histogram(file, x_var, color, title)
            
        elif chart_type == 'heatmap':
            if not x_var or not y_var:
                return jsonify({
                    "success": False,
                    "error": "热力图需要选择X轴和Y轴变量",
                    "error_code": "MISSING_VARS"
                }), 400
            result = generate_heatmap(file, x_var, y_var, color, title)
            
        elif chart_type == 'scatter':
            if not x_var or not y_var:
                return jsonify({
                    "success": False,
                    "error": "散点图需要选择X轴和Y轴变量",
                    "error_code": "MISSING_VARS"
                }), 400
            result = generate_scatterplot(file, x_var, y_var, color, title)
            
        elif chart_type == 'boxplot':
            if not x_var:
                return jsonify({
                    "success": False,
                    "error": "箱型图需要选择要分析的变量",
                    "error_code": "MISSING_X_VAR"
                }), 400
            
            # 对于箱型图，直接在这里实现，避免重复代码
            try:
                import matplotlib.pyplot as plt
                import seaborn as sns
                import io
                import base64
                from matplotlib import rcParams
                
                # 设置中文字体
                rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
                rcParams['axes.unicode_minus'] = False
                
                # 读取CSV文件
                df = pd.read_csv(file)
                
                if x_var not in df.columns:
                    return jsonify({
                        "success": False,
                        "error": f"列 '{x_var}' 不存在",
                        "error_code": "COLUMN_NOT_FOUND"
                    }), 400
                
                # 检查是否是数值类型
                if not pd.api.types.is_numeric_dtype(df[x_var]):
                    return jsonify({
                        "success": False,
                        "error": f"列 '{x_var}' 不是数值类型，无法绘制箱型图",
                        "error_code": "NON_NUMERIC_COLUMN"
                    }), 400
                
                # 创建图形
                plt.figure(figsize=(10, 6))
                
                if y_var and y_var in df.columns:
                    # 分组箱型图
                    sns.boxplot(data=df, x=y_var, y=x_var)
                    chart_title = title if title else f'{x_var} 按 {y_var} 分组的箱型图'
                    plt.title(chart_title)
                    plt.xticks(rotation=45)
                else:
                    # 单列箱型图
                    sns.boxplot(y=df[x_var])
                    chart_title = title if title else f'{x_var} 的箱型图'
                    plt.title(chart_title)
                
                plt.ylabel(x_var)
                plt.tight_layout()
                
                # 保存图片到内存
                img_buffer = io.BytesIO()
                plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
                img_buffer.seek(0)
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
                plt.close()
                
                result = {
                    'plot': img_base64,
                    'column_used': x_var,
                    'group_by': y_var
                }
                
            except Exception as e:
                return jsonify({
                    "success": False,
                    "error": f"箱型图生成失败：{str(e)}",
                    "error_code": "BOXPLOT_ERROR"
                }), 400
            
        else:
            return jsonify({
                "success": False,
                "error": f"不支持的图表类型: {chart_type}",
                "error_code": "UNSUPPORTED_CHART_TYPE",
                "supported_types": ["histogram", "heatmap", "scatter", "boxplot"]
            }), 400

        # 统一返回格式
        response_data = {
            "success": True,
            "chart_type": chart_type,
            "plot": f"data:image/png;base64,{result['plot']}",
            "filename": file.filename,
            "variables_used": {
                "x_var": x_var,
                "y_var": y_var
            },
            "chart_config": {
                "color": color,
                "title": title
            },
            "message": f"成功生成{chart_type}图表"
        }
        
        # 添加图表特定的信息
        if 'column_used' in result:
            response_data['column_used'] = result['column_used']
        if 'x_column' in result:
            response_data['x_column'] = result['x_column']
        if 'y_column' in result:
            response_data['y_column'] = result['y_column']
        if 'x_var' in result:
            response_data['variables_used']['x_var'] = result['x_var']
        if 'y_var' in result:
            response_data['variables_used']['y_var'] = result['y_var']

        return jsonify(response_data)

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "error_code": "CHART_GENERATION_ERROR"
        }), 400
    except Exception as e:
        import traceback
        print("图表生成错误:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"图表生成失败：{str(e)}",
            "error_code": "PROCESSING_ERROR"
        }), 500

# 箱型图
@app.route('/draw_boxplot', methods=['POST'])
def draw_boxplot():
    """
    生成箱型图，用于显示数据分布
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

    # 获取参数
    column = request.form.get('column')
    group_by = request.form.get('group_by')  # 可选的分组列
    
    if not column:
        return jsonify({
            "success": False,
            "error": "请选择要分析的列",
            "error_code": "NO_COLUMN"
        }), 400

    try:
        import matplotlib.pyplot as plt
        import seaborn as sns
        import io
        import base64
        from matplotlib import rcParams
        
        # 设置中文字体
        rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
        rcParams['axes.unicode_minus'] = False
        
        # 读取CSV文件
        df = pd.read_csv(file)
        
        if column not in df.columns:
            return jsonify({
                "success": False,
                "error": f"列 '{column}' 不存在",
                "error_code": "COLUMN_NOT_FOUND"
            }), 400
        
        # 检查是否是数值类型
        if not pd.api.types.is_numeric_dtype(df[column]):
            return jsonify({
                "success": False,
                "error": f"列 '{column}' 不是数值类型，无法绘制箱型图",
                "error_code": "NON_NUMERIC_COLUMN"
            }), 400
        
        # 创建图形
        plt.figure(figsize=(10, 6))
        
        if group_by and group_by in df.columns:
            # 分组箱型图
            sns.boxplot(data=df, x=group_by, y=column)
            plt.title(f'{column} 按 {group_by} 分组的箱型图')
            plt.xticks(rotation=45)
        else:
            # 单列箱型图
            sns.boxplot(y=df[column])
            plt.title(f'{column} 的箱型图')
        
        plt.ylabel(column)
        plt.tight_layout()
        
        # 保存图片到内存
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()
        
        # 计算统计信息
        stats = {
            "count": convert_to_serializable(df[column].count()),
            "mean": convert_to_serializable(df[column].mean()),
            "std": convert_to_serializable(df[column].std()),
            "min": convert_to_serializable(df[column].min()),
            "25%": convert_to_serializable(df[column].quantile(0.25)),
            "50%": convert_to_serializable(df[column].quantile(0.5)),
            "75%": convert_to_serializable(df[column].quantile(0.75)),
            "max": convert_to_serializable(df[column].max()),
        }
        
        return jsonify({
            "success": True,
            "plot": img_base64,
            "column_used": column,
            "group_by": group_by,
            "statistics": stats,
            "message": f"成功生成 {column} 的箱型图"
        })

    except Exception as e:
        import traceback
        print("箱型图生成错误:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"箱型图生成失败：{str(e)}",
            "error_code": "BOXPLOT_ERROR"
        }), 500

# 直方图
@app.route('/draw_histogram', methods=['POST'])
def draw_histogram():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Get the selected column from the form data
    column = request.form.get('column')
    if not column:
        return jsonify({"error": "No column selected"}), 400

    try:
        # Delegate plotting to the external utility with the selected column
        result = generate_histogram(file, column)
        # Ensure all values are JSON serializable
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "column_used": str(result['column_used'])  # Convert to string to ensure serialization
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Plotting failed: {str(e)}"}), 500

# 热图
@app.route('/draw_heatmap',methods=["POST"])
def draw_heatmap():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Get the selected column from the form data
    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"error": "No column selected"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"error": "No column selected"}), 400

    try:
        # Get color from form data
        color = request.form.get('color', '#3b82f6')  # Default to blue if not provided
        # Delegate plotting to the external utility with the selected column
        result = generate_heatmap(file, x_var, y_var, color)
        # Ensure all values are JSON serializable
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_var": str(result['x_var']),  # Convert to string to ensure serialization
            "y_var": str(result['y_var'])   # Convert to string to ensure serialization
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
            return jsonify({"error": f"Plotting failed: {str(e)}"}), 500

# 散点图
@app.route('/draw_scatterplot', methods=['POST'])
def draw_scatterplot():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Get the selected columns from the form data
    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"error": "No x column selected"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"error": "No y column selected"}), 400

    try:
        # Delegate plotting to the scatterplot utility
        result = generate_scatterplot(file, x_var, y_var)
        # Ensure all values are JSON serializable
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_var": str(result['x_column']),
            "y_var": str(result['y_column'])
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Plotting failed: {str(e)}"}), 500


# 逻辑回归
@app.route('/logisticRegression',methods=["POST"])
def logisticRegression():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有上传文件"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "没有选择文件"}), 400
    # Get the selected column from the form data
    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"success": False, "error": "请选择自变量"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"success": False, "error": "请选择因变量"}), 400
    try:
        # Delegate plotting to the external utility with the selected column
        result = logistic_regression_analysis(file, x_var, y_var)
        # Ensure all values are JSON serializable
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_var": str(result['x_var']),
            "y_var": str(result['y_var']),
            "accuracy": convert_to_serializable(result["accuracy"]),
            "coefficients": [convert_to_serializable(coef) for coef in result["coefficients"]],
            "intercept": convert_to_serializable(result["intercept"]),
            "regression_type": "logistic"
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("逻辑回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500

# 多分类逻辑回归
@app.route('/multinomialLogisticRegression', methods=["POST"])
def multinomialLogisticRegression():
    """
    多分类逻辑回归分析接口，适用于CKMStage这样的多分类因变量
    """
    try:
        print("=== 多分类逻辑回归分析请求开始 ===")
        print("Files:", list(request.files.keys()))
        print("Form data:", dict(request.form))
        
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "没有选择文件"}), 400
        
        # 获取变量信息
        x_vars = request.form.getlist('x_vars')  # 自变量列表，支持多变量
        y_var = request.form.get('y_var')  # 因变量

        # 如果只有一个自变量，也接受x_var参数（向后兼容）
        if not x_vars:
            x_var = request.form.get('x_var')
            if x_var:
                x_vars = [x_var]
        
        # 去除重复值和空值
        x_vars = [x for x in x_vars if x]
        x_vars = list(dict.fromkeys(x_vars))  # 去重但保持顺序
        
        if not x_vars:
            return jsonify({"success": False, "error": "请选择至少一个自变量"}), 400
        if not y_var:
            return jsonify({"success": False, "error": "请选择因变量"}), 400
        
        print(f"自变量: {x_vars}")
        print(f"因变量: {y_var}")
        
        # 调用多分类逻辑回归分析
        result = multinomial_logistic_regression_analysis(file, x_vars, y_var)
        
        # 确保所有值都是JSON可序列化的
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_vars": result['x_vars'],
            "y_var": result['y_var'],
            "accuracy": convert_to_serializable(result['accuracy']),
            "n_classes": convert_to_serializable(result['n_classes']),
            "class_labels": result['class_labels'],
            "coefficients": [[convert_to_serializable(coef) for coef in row] for row in result['coefficients']],
            "intercept": [convert_to_serializable(val) for val in result['intercept']],
            "sample_size": result['sample_size'],
            "regression_type": "multinomial_logistic"
        }
        
        print("=== 多分类逻辑回归分析请求成功 ===")
        return jsonify(response_data)
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("多分类逻辑回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500

# 线性回归
@app.route('/linearRegression', methods=["POST"])
def linearRegression():
    """
    线性回归分析接口，支持单变量和多变量
    """
    try:
        print("=== 线性回归分析请求开始 ===")
        print("Files:", list(request.files.keys()))
        print("Form data:", dict(request.form))
        
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "没有选择文件"}), 400
        
        # 获取变量信息
        x_vars = request.form.getlist('x_vars')  # 自变量列表，支持多变量
        y_var = request.form.get('y_var')  # 因变量

        # 如果只有一个自变量，也接受x_var参数（向后兼容）
        if not x_vars:
            x_var = request.form.get('x_var')
            if x_var:
                x_vars = [x_var]
        
        # 去除重复值和空值
        x_vars = [x for x in x_vars if x]
        x_vars = list(dict.fromkeys(x_vars))  # 去重但保持顺序
        
        if not x_vars:
            return jsonify({"success": False, "error": "请选择至少一个自变量"}), 400
        if not y_var:
            return jsonify({"success": False, "error": "请选择因变量"}), 400
        
        print(f"自变量: {x_vars}")
        print(f"因变量: {y_var}")
        
        # 添加数据预览和类型检查
        try:
            # 确保文件指针在开始位置
            file.seek(0)
            df_preview = pd.read_csv(file, nrows=5)
            print(f"数据预览 - 列名: {df_preview.columns.tolist()}")
            print(f"数据类型: {df_preview.dtypes.to_dict()}")
            if y_var in df_preview.columns:
                print(f"因变量 {y_var} 的数据类型: {df_preview[y_var].dtype}")
            if x_vars:
                available_x_vars = [col for col in x_vars if col in df_preview.columns]
                print(f"自变量 {available_x_vars} 的数据类型: {[df_preview[col].dtype for col in available_x_vars]}")
            
            # 重置文件指针到开始位置，确保后续读取正常
            file.seek(0)
        except Exception as e:
            print(f"数据预览失败: {e}")
            # 即使预览失败，也要确保文件指针重置
            try:
                file.seek(0)
            except:
                pass
        
        # 根据自变量数量选择分析方法
        if len(x_vars) == 1:
            # 单变量线性回归
            result = linear_regression_analysis(file, x_vars[0], y_var)
            response_data = {
                "success": True,
                "plot": f"data:image/png;base64,{result['plot']}",
                "x_var": result['x_var'],
                "y_var": result['y_var'],
                "r2_score": convert_to_serializable(result['r2_score']),
                "mse": convert_to_serializable(result['mse']),
                "correlation": convert_to_serializable(result['correlation']),
                "coefficients": [convert_to_serializable(coef) for coef in result['coefficients']],
                "intercept": convert_to_serializable(result['intercept']),
                "equation": result['equation'],
                "sample_size": result['sample_size'],
                "regression_type": "linear_simple"
            }
        else:
            # 多变量线性回归
            result = multiple_linear_regression_analysis(file, x_vars, y_var)
            response_data = {
                "success": True,
                "plot": f"data:image/png;base64,{result['plot']}",
                "x_vars": result['x_vars'],
                "y_var": result['y_var'],
                "r2_score": convert_to_serializable(result['r2_score']),
                "mse": convert_to_serializable(result['mse']),
                "coefficients": [convert_to_serializable(coef) for coef in result['coefficients']],
                "intercept": convert_to_serializable(result['intercept']),
                "equation": result['equation'],
                "sample_size": result['sample_size'],
                "regression_type": "linear_multiple"
            }
        
        print("=== 线性回归分析请求成功 ===")
        return jsonify(response_data)
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("线性回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500


# Cox比例风险模型
@app.route('/CoxRegression',methods = ["POST"])
def CoxRegression():
    try:
        print("=== Cox回归分析请求开始 ===")
        print("Files:", list(request.files.keys()))
        print("Form data:", dict(request.form))
        
        if 'file' not in request.files:
            print("错误: 没有上传文件")
            return jsonify({"success": False, "error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("错误: 文件名为空")
            return jsonify({"success": False, "error": "没有选择文件"}), 400
        
        # Get the selected column from the form data
        covariate_cols = request.form.getlist('covariate_cols')  # Using getlist() to accept multiple values
        print("协变量:", covariate_cols)
        if not covariate_cols:
            print("错误: 没有选择协变量")
            return jsonify({"success": False, "error": "请选择协变量"}), 400

        time_col = request.form.get('time_col')
        print("时间变量:", time_col)
        if not time_col:
            print("错误: 没有选择时间变量")
            return jsonify({"success": False, "error": "请选择时间变量"}), 400

        event_col = request.form.get('event_col')
        print("事件变量:", event_col)
        if not event_col:
            print("错误: 没有选择事件变量")
            return jsonify({"success": False, "error": "请选择事件变量"}), 400

        print("开始Cox回归分析...")
        # Delegate plotting to the external utility with the selected column
        result = cox_regression_analysis(file, covariate_cols, time_col, event_col)
        print("Cox回归分析完成")
        
        # Ensure all values are JSON serializable
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "covariates": result['covariates'],
            "hazard_ratios": [convert_to_serializable(x) for x in result['hazard_ratios']],
            "ci_lower": [convert_to_serializable(x) for x in result["ci_lower"]],
            "ci_upper": [convert_to_serializable(x) for x in result["ci_upper"]]
        }
        print("=== Cox回归分析请求成功 ===")
        return jsonify(response_data)
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("Cox回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500

# 新增：获取指标数据的API接口 - 用于前端表格显示
@app.route('/api/indicators/<indicator_name>', methods=['GET'])
def get_indicator_data(indicator_name):
    try:
        # 获取查询参数
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        export_all = request.args.get('export_all', 'false').lower() == 'true'
        
        # 确保参数合理
        if page < 1:
            page = 1
        if limit < 1 or limit > 1000:  # 限制每页最大1000条
            limit = 100
            
        # 构造文件路径 - 根据您的目录结构调整
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, 'Dataresource', 'ResultData', f'{indicator_name}_results.csv')
        
        # 检查文件路径是否正确
        print(f"Looking for file: {file_path}")
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return jsonify({
                'error': f'指标文件不存在: {indicator_name}',
                'available_indicators': get_available_indicators()
            }), 404
        
        # 读取CSV文件
        df = pd.read_csv(file_path)
        
        # 替换NaN值为None以便JSON序列化
        df = df.replace([np.nan, pd.NaT], None)
        
        # 如果是导出全部数据，则返回所有数据
        if export_all:
            page_data = df
            pagination_info = {
                'total': len(df),
                'page': 1,
                'limit': len(df),
                'total_pages': 1,
                'has_next': False,
                'has_prev': False
            }
        else:
            # 计算分页信息
            total_records = len(df)
            total_pages = math.ceil(total_records / limit)
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            
            # 获取当前页数据
            page_data = df.iloc[start_idx:end_idx]
            pagination_info = {
                'total': total_records,
                'page': page,
                'limit': limit,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        
        # 生成列配置
        columns = []
        for col in df.columns:
            columns.append({
                'field': col,
                'title': col,
                'width': 'auto'
            })
        
        # 转换为记录格式
        records = page_data.to_dict(orient='records')
        
        return jsonify({
            'success': True,
            'indicator': indicator_name,
            'columns': columns,
            'records': records,
            'pagination': pagination_info
        })
        
    except Exception as e:
        import traceback
        print("Error in get_indicator_data:")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'读取数据失败: {str(e)}'
        }), 500

# 获取可用指标列表的辅助函数
def get_available_indicators():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        result_data_dir = os.path.join(current_dir, 'Dataresource', 'ResultData')
        
        if not os.path.exists(result_data_dir):
            return []
        
        indicators = []
        for filename in os.listdir(result_data_dir):
            if filename.endswith('_results.csv'):
                indicator_name = filename.replace('_results.csv', '')
                indicators.append(indicator_name)
        
        return sorted(indicators)
    except Exception as e:
        print(f"Error getting available indicators: {e}")
        return []

# 新增：获取可用指标列表的API
@app.route('/api/indicators', methods=['GET'])
def list_available_indicators():
    try:
        indicators = get_available_indicators()
        return jsonify({
            'success': True,
            'indicators': indicators,
            'count': len(indicators)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'获取指标列表失败: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(port=5000)
