"""
数据可视化相关路由
"""
from flask import Blueprint, request, jsonify
import os
import tempfile
from DataVisualization.histogram import generate_histogram
from DataVisualization.jointplot import generate_jointplot
from DataVisualization.scatterplot import generate_scatterplot
from DataVisualization.boxplot import generate_boxplot
from DataVisualization.violinplot import generate_violinplot
from DataVisualization.barplot import generate_barplot
from DataVisualization.correlation_heatmap import generate_correlation_heatmap
from DataVisualization.qqplot import generate_qqplot

visualization_bp = Blueprint('data_visualization', __name__)


@visualization_bp.route('/generate_visualization', methods=['POST'])
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
    method = request.form.get('method', 'pearson')
    columns_str = request.form.get('columns', '')
    
    # QQ图的额外参数
    distribution = request.form.get('distribution', 'norm')
    
    # 条形图的额外参数
    show_percentage = request.form.get('show_percentage', 'true').lower() == 'true'

    try:
        # 保存文件到临时位置
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        result = None
        
        # 根据图表类型调用相应的生成函数
        if chart_type == 'histogram':
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
            if not x_var or not y_var:
                return jsonify({
                    "success": False,
                    "error": "联合分布图需要选择X轴和Y轴变量",
                    "error_code": "MISSING_VARS"
                }), 400
            result = generate_jointplot(temp_path, x_var, y_var, color, title or None)
            
        elif chart_type == 'scatter':
            if not x_var or not y_var:
                return jsonify({
                    "success": False,
                    "error": "散点图需要选择X轴和Y轴变量",
                    "error_code": "MISSING_VARS"
                }), 400
            result = generate_scatterplot(temp_path, x_var, y_var, color, title or None)
            
        elif chart_type == 'boxplot':
            if not y_var:
                return jsonify({
                    "success": False,
                    "error": "箱线图需要选择一个数值变量",
                    "error_code": "MISSING_Y_VAR"
                }), 400
            result = generate_boxplot(temp_path, y_var, x_var or None, color, title or None)
            
        elif chart_type == 'violinplot':
            if not y_var:
                return jsonify({
                    "success": False,
                    "error": "小提琴图需要选择一个数值变量",
                    "error_code": "MISSING_Y_VAR"
                }), 400
            result = generate_violinplot(temp_path, y_var, x_var or None, color, title or None)
            
        elif chart_type == 'barplot':
            if not x_var:
                return jsonify({
                    "success": False,
                    "error": "条形图需要选择一个分类变量",
                    "error_code": "MISSING_X_VAR"
                }), 400
            result = generate_barplot(temp_path, x_var, color, title or None, show_percentage)
            
        elif chart_type == 'correlation_heatmap':
            columns_list = None
            if columns_str:
                columns_list = [col.strip() for col in columns_str.split(',') if col.strip()]
            result = generate_correlation_heatmap(temp_path, columns_list, method, title or None)
            
        elif chart_type == 'qqplot':
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
            "chart_info": result,
            "message": f"成功生成{chart_type}图表"
        }
        
        return jsonify(response_data)
        
    except ValueError as ve:
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


# 保留旧的单独路由以保持向后兼容
@visualization_bp.route('/draw_boxplot', methods=['POST'])
def draw_boxplot():
    """生成箱型图（向后兼容）"""
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    import io
    import base64
    from matplotlib import rcParams
    from utils.serialization import convert_to_serializable
    
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

    column = request.form.get('column')
    group_by = request.form.get('group_by')
    
    if not column:
        return jsonify({
            "success": False,
            "error": "请选择要分析的列",
            "error_code": "NO_COLUMN"
        }), 400

    try:
        rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
        rcParams['axes.unicode_minus'] = False
        
        df = pd.read_csv(file)
        
        if column not in df.columns:
            return jsonify({
                "success": False,
                "error": f"列 '{column}' 不存在",
                "error_code": "COLUMN_NOT_FOUND"
            }), 400
        
        if not pd.api.types.is_numeric_dtype(df[column]):
            return jsonify({
                "success": False,
                "error": f"列 '{column}' 不是数值类型，无法绘制箱型图",
                "error_code": "NON_NUMERIC_COLUMN"
            }), 400
        
        plt.figure(figsize=(10, 6))
        
        if group_by and group_by in df.columns:
            sns.boxplot(data=df, x=group_by, y=column)
            plt.title(f'{column} 按 {group_by} 分组的箱型图')
            plt.xticks(rotation=45)
        else:
            sns.boxplot(y=df[column])
            plt.title(f'{column} 的箱型图')
        
        plt.ylabel(column)
        plt.tight_layout()
        
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()
        
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


@visualization_bp.route('/draw_histogram', methods=['POST'])
def draw_histogram():
    """生成直方图（向后兼容）"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    column = request.form.get('column')
    if not column:
        return jsonify({"error": "No column selected"}), 400

    try:
        result = generate_histogram(file, column)
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "column_used": str(result['column_used'])
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Plotting failed: {str(e)}"}), 500


@visualization_bp.route('/draw_heatmap', methods=["POST"])
def draw_heatmap():
    """生成热图（向后兼容）"""
    from DataVisualization.heatmap import generate_heatmap
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"error": "No column selected"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"error": "No column selected"}), 400

    try:
        color = request.form.get('color', '#3b82f6')
        result = generate_heatmap(file, x_var, y_var, color)
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_var": str(result['x_var']),
            "y_var": str(result['y_var'])
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Plotting failed: {str(e)}"}), 500


@visualization_bp.route('/draw_scatterplot', methods=['POST'])
def draw_scatterplot():
    """生成散点图（向后兼容）"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"error": "No x column selected"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"error": "No y column selected"}), 400

    try:
        result = generate_scatterplot(file, x_var, y_var)
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
