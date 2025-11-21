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

# 导入所有可视化模块
from DataVisualization.jointplot import generate_jointplot
from DataVisualization.histogram import generate_histogram
from DataVisualization.scatterplot import generate_scatterplot
from DataVisualization.boxplot import generate_boxplot
from DataVisualization.violinplot import generate_violinplot
from DataVisualization.barplot import generate_barplot
from DataVisualization.correlation_heatmap import generate_correlation_heatmap
from DataVisualization.qqplot import generate_qqplot

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
    # 尝试检查配置状态
    try:
        from GetNhanes import config
        base_path = config.get_base_path()
        print(f"成功导入NHANES数据提取功能，基础路径: {base_path}")
    except Exception as config_e:
        print(f"成功导入NHANES数据提取功能，但配置检查失败: {config_e}")
except Exception as e:
    print(f"警告: 无法导入NHANES数据提取功能: {e}")
    print("自定义数据提取功能将不可用")

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
        # 检查get_nhanes_data函数是否可用
        if 'get_nhanes_data' not in globals():
            return jsonify({
                'success': False,
                'error': 'NHANES数据提取功能不可用，请检查系统配置'
            }), 500

        # 检查配置状态
        try:
            from GetNhanes import config
            base_path = config.get_base_path()
            if not os.path.exists(base_path):
                return jsonify({
                    'success': False,
                    'error': f'NHANES数据路径不存在: {base_path}，请检查配置'
                }), 500
        except Exception as config_error:
            return jsonify({
                'success': False,
                'error': f'NHANES数据路径配置错误: {config_error}'
            }), 500

        data = request.json
        items = data.get('items', [])

        if not items:
            return jsonify({
                'success': False,
                'error': '没有提供要处理的数据项'
            }), 400

        # 将同一次请求中的年份视作一个整体进行处理
        years = [str(item['year']).strip() for item in items if 'year' in item and str(item['year']).strip()]
        if not years:
            return jsonify({'success': False, 'error': '未提供有效年份'}), 400

        # 以第一个item为准获取文件名与指标，并校验一致性（若不一致以第一个为准并给出日志提醒）
        metricName = items[0].get('file', '').strip()
        indicator_str = items[0].get('indicator', '').strip()
        if not metricName:
            return jsonify({'success': False, 'error': '未提供文件名前缀(file)'}), 400
        if not indicator_str:
            return jsonify({'success': False, 'error': '未提供指标列表(indicator)'}), 400

        # 隐式功能：如果文件名是大写，自动转换为小写
        original_metric_name = metricName
        if metricName.isupper():
            metricName = metricName.lower()
            print(f"隐式转换: 文件名从 '{original_metric_name}' 转换为 '{metricName}'")

        # 记录一致性校验
        inconsistent = [it for it in items if str(it.get('file', '')).strip() != metricName or str(it.get('indicator', '')).strip() != indicator_str]
        if inconsistent:
            print(f"警告: 本次请求存在不一致的file/indicator，将以第一个为准。数量={len(inconsistent)}")

        features = [f.strip() for f in indicator_str.split(',') if f.strip()]

        print(f"处理数据提取请求(合并模式): 年份={years}, 特征={features}, 文件名={metricName}")

        # 使用真实的NHANES数据（一次性合并所有年份）
        result = get_nhanes_data(
            years=years,
            features=features,
            metric_prefix=metricName,
            merge_output=True,
            save_each_file=True
        )

        # Convert result to CSV
        if hasattr(result, 'to_csv'):
            csv_data = result.to_csv(index=False)
        elif hasattr(result, 'to_string'):
            csv_data = result.to_string()
        else:
            csv_data = str(result)

        print(f"成功处理(合并): years={years}, file={metricName}")

        # 生成建议文件名：年份始末_文件名.csv
        try:
            start_year = min(int(y.split('-')[0]) for y in years)
            end_year = max(int(y.split('-')[-1]) for y in years)
            suggested_filename = f"{start_year}-{end_year}_{metricName}.csv"
        except Exception:
            # 解析失败则回退
            suggested_filename = f"{metricName}.csv"

        # 兼容前端原有结构，返回一个汇总结果与csv_data
        return jsonify({
            'success': True,
            'results': [{
                'years': years,
                'file': metricName,
                'indicator': indicator_str,
                'result': csv_data
            }],
            'csv_data': csv_data,
            'suggested_filename': suggested_filename
        })
    except Exception as e:
        import traceback
        print("自定义提取处理错误:")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# 批量合并提取（多个自定义项按seqn合并为一个文件）
@app.route('/process_nhanes_batch_merge', methods=['POST'])
def process_nhanes_batch_merge():
    try:
        # 检查get_nhanes_data函数是否可用
        if 'get_nhanes_data' not in globals():
            return jsonify({
                'success': False,
                'error': 'NHANES数据提取功能不可用，请检查系统配置'
            }), 500

        # 检查配置状态
        try:
            from GetNhanes import config
            base_path = config.get_base_path()
            if not os.path.exists(base_path):
                return jsonify({
                    'success': False,
                    'error': f'NHANES数据路径不存在: {base_path}，请检查配置'
                }), 500
        except Exception as config_error:
            return jsonify({
                'success': False,
                'error': f'NHANES数据路径配置错误: {config_error}'
            }), 500

        data = request.json
        items = data.get('items', [])
        if not items:
            return jsonify({'success': False, 'error': '没有提供要处理的数据项'}), 400

        # 将 items 归并为多个组：以 (file, indicator) 为键，years 为值
        groups = {}
        all_years = []
        for it in items:
            year_val = str(it.get('year', '')).strip()
            file_val = str(it.get('file', '')).strip()
            indicator_val = str(it.get('indicator', '')).strip()
            if not year_val or not file_val or not indicator_val:
                print(f"跳过无效项目: {it}")
                continue
            key = (file_val, indicator_val)
            groups.setdefault(key, set()).add(year_val)
            all_years.append(year_val)

        if not groups:
            return jsonify({'success': False, 'error': '没有可处理的有效项目'}), 400

        # 逐组提取并按 seqn 合并
        merged_df = None
        for (metricName, indicator_str), years_set in groups.items():
            years_list = sorted(list(years_set))
            features = [f.strip() for f in indicator_str.split(',') if f.strip()]
            # 确保包含 seqn
            if not any(col.lower() == 'seqn' for col in features):
                features = ['seqn'] + features

            # 隐式功能：如果文件名是大写，自动转换为小写
            original_metric_name = metricName
            if metricName.isupper():
                metricName = metricName.lower()
                print(f"隐式转换: 文件名从 '{original_metric_name}' 转换为 '{metricName}'")

            print(f"批量组处理: file={metricName}, years={years_list}, features={features}")

            df = get_nhanes_data(
                years=years_list,
                features=features,
                metric_prefix=metricName,
                merge_output=True,
                save_each_file=True
            )

            # 规范列名、前缀化避免冲突，保留一个 'seqn'
            if hasattr(df, 'columns') and 'seqn' in df.columns:
                prefixed_cols = {}
                for col in df.columns:
                    if col == 'seqn':
                        prefixed_cols[col] = col
                    else:
                        prefixed_cols[col] = f"{metricName}_{col}"
                df = df.rename(columns=prefixed_cols)
            else:
                # 若不存在 seqn，则无法合并，跳过
                print(f"警告: 数据集中缺少 seqn，跳过: file={metricName}")
                continue

            if merged_df is None:
                merged_df = df
            else:
                try:
                    merged_df = pd.merge(merged_df, df, on='seqn', how='outer')
                except Exception as me:
                    print(f"合并失败({metricName}): {str(me)}")

        if merged_df is None:
            return jsonify({'success': False, 'error': '无法生成合并数据，请检查输入'}), 400

        # 生成 CSV
        csv_data = merged_df.to_csv(index=False)

        # 生成建议文件名（使用所有年份的最小与最大）
        try:
            start_year = min(int(y.split('-')[0]) for y in all_years if y)
            end_year = max(int(y.split('-')[-1]) for y in all_years if y)
            suggested_filename = f"{start_year}-{end_year}_merged.csv"
        except Exception:
            suggested_filename = "merged.csv"

        return jsonify({
            'success': True,
            'csv_data': csv_data,
            'suggested_filename': suggested_filename,
            'merged_columns': list(merged_df.columns)
        })

    except Exception as e:
        import traceback
        print("批量合并处理错误:")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# 二级指标提取
@app.route('/download/<indicator>_results.csv', methods=['GET'])
def download_result_data(indicator):
    directory = os.path.join(os.path.dirname(__file__), 'Dataresource', 'ResultData')
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
    directory = os.path.join(os.path.dirname(__file__), 'Dataresource', 'covariatesData')
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

# 变量搜索接口
@app.route('/search_variables', methods=['POST'])
def search_variables():
    try:
        data = request.json
        query = data.get('query', '').strip().lower()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400

        # Path to varLabel.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, 'varLabel.json')
        
        if not os.path.exists(json_path):
             return jsonify({
                'success': False,
                'error': f'Variable definition file not found at {json_path}'
            }), 500

        # Read the JSON file
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                all_variables = json.load(f)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to read variable definition file: {str(e)}'
            }), 500

        # Filter data
        results = []
        count = 0
        
        for item in all_variables:
            # Check if query is in variable, label, or description
            # Use safe get with empty string default for None values
            if (query in (item.get('variable') or '').lower() or 
                query in (item.get('label') or '').lower() or 
                query in (item.get('description') or '').lower()):
                
                results.append(item)
                count += 1
                
                if count >= 100: # Limit to top 100 results
                    break
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })

    except Exception as e:
        import traceback
        print(f"Error searching variables: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 数据可视化统一接口
@app.route('/generate_visualization', methods=['POST'])
def generate_visualization():
    """
    统一的数据可视化接口,支持8种图表类型:
    - histogram: 直方图
    - jointplot: 联合分布图
    - scatter: 散点图
    - boxplot: 箱线图
    - violinplot: 小提琴图
    - barplot: 条形图
    - correlation_heatmap: 相关性矩阵热图
    - qqplot: QQ图
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
    color = request.form.get('color', '#0062FF')
    title = request.form.get('title', '')
    
    # 相关性热图的额外参数
    method = request.form.get('method', 'pearson')  # pearson, spearman, kendall
    columns_str = request.form.get('columns', '')  # 逗号分隔的列名
    
    # QQ图的额外参数
    distribution = request.form.get('distribution', 'norm')  # norm, t, uniform, expon
    
    # 条形图的额外参数
    show_percentage = request.form.get('show_percentage', 'true').lower() == 'true'

    try:
        # 保存文件到临时位置
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        result = None
        
        # 根据图表类型调用相应的生成函数
        if chart_type == 'histogram':
            # 直方图: 支持单变量或多变量重叠
            columns_list = None
            if columns_str:
                columns_list = [col.strip() for col in columns_str.split(',') if col.strip()]
            
            target_var = columns_list if columns_list else x_var
            
            if not target_var:
                return jsonify({
                    "success": False,
                    "error": "直方图需要选择至少一个数值变量",
                    "error_code": "MISSING_VAR"
                }), 400
            result = generate_histogram(temp_path, target_var, color, title or None)
            
        elif chart_type == 'jointplot':
            # 联合分布图: 需要两个数值列
            if not x_var or not y_var:
                return jsonify({
                    "success": False,
                    "error": "联合分布图需要选择X轴和Y轴变量",
                    "error_code": "MISSING_VARS"
                }), 400
            result = generate_jointplot(temp_path, x_var, y_var, color, title or None)
            
        elif chart_type == 'scatter':
            # 散点图: 需要两个数值列
            if not x_var or not y_var:
                return jsonify({
                    "success": False,
                    "error": "散点图需要选择X轴和Y轴变量",
                    "error_code": "MISSING_VARS"
                }), 400
            result = generate_scatterplot(temp_path, x_var, y_var, color, title or None)
            
        elif chart_type == 'boxplot':
            # 箱线图: 需要一个数值列(y_var),可选分组列(x_var)
            if not y_var:
                return jsonify({
                    "success": False,
                    "error": "箱线图需要选择一个数值变量",
                    "error_code": "MISSING_Y_VAR"
                }), 400
            result = generate_boxplot(temp_path, y_var, x_var or None, color, title or None)
            
        elif chart_type == 'violinplot':
            # 小提琴图: 需要一个数值列(y_var),可选分组列(x_var)
            if not y_var:
                return jsonify({
                    "success": False,
                    "error": "小提琴图需要选择一个数值变量",
                    "error_code": "MISSING_Y_VAR"
                }), 400
            result = generate_violinplot(temp_path, y_var, x_var or None, color, title or None)
            
        elif chart_type == 'barplot':
            # 条形图: 需要一个分类列
            if not x_var:
                return jsonify({
                    "success": False,
                    "error": "条形图需要选择一个分类变量",
                    "error_code": "MISSING_X_VAR"
                }), 400
            result = generate_barplot(temp_path, x_var, color, title or None, show_percentage)
            
        elif chart_type == 'correlation_heatmap':
            # 相关性矩阵热图: 可以指定列或使用所有数值列
            columns_list = None
            if columns_str:
                columns_list = [col.strip() for col in columns_str.split(',') if col.strip()]
            result = generate_correlation_heatmap(temp_path, columns_list, method, title or None)
            
        elif chart_type == 'qqplot':
            # QQ图: 需要一个数值列
            if not x_var:
                return jsonify({
                    "success": False,
                    "error": "QQ图需要选择一个数值变量",
                    "error_code": "MISSING_X_VAR"
                }), 400
            result = generate_qqplot(temp_path, x_var, distribution, color, title or None)
            
        else:
            return jsonify({
                "success": False,
                "error": f"不支持的图表类型: {chart_type}",
                "error_code": "UNSUPPORTED_CHART_TYPE",
                "supported_types": [
                    "histogram", "jointplot", "scatter", "boxplot", 
                    "violinplot", "barplot", "correlation_heatmap", "qqplot"
                ]
            }), 400

        # 清理临时文件
        try:
            os.unlink(temp_path)
        except:
            pass

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
            "chart_info": result,  # 包含图表的详细信息
            "message": f"成功生成{chart_type}图表"
        }
        
        return jsonify(response_data)
        
    except ValueError as ve:
        # 处理数据验证错误
        return jsonify({
            "success": False,
            "error": str(ve),
            "error_code": "VALIDATION_ERROR"
        }), 400
    except FileNotFoundError as fe:
        return jsonify({
            "success": False,
            "error": str(fe),
            "error_code": "FILE_NOT_FOUND"
        }), 404
    except Exception as e:
        import traceback
        print("可视化生成错误:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"图表生成失败: {str(e)}",
            "error_code": "GENERATION_ERROR"
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

# 健康检查端点
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'nhanes-backend',
        'timestamp': pd.Timestamp.now().isoformat()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
