"""
数据分析相关路由
"""
from flask import Blueprint, request, jsonify
from DataAnalysis.logisticRegression import logistic_regression_analysis, multinomial_logistic_regression_analysis
from DataAnalysis.linearRegression import linear_regression_analysis, multiple_linear_regression_analysis
from DataAnalysis.coxRegression import cox_regression_analysis
from utils.serialization import convert_to_serializable

analysis_bp = Blueprint('data_analysis', __name__)


@analysis_bp.route('/logisticRegression', methods=["POST"])
def logistic_regression():
    """逻辑回归分析"""
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有上传文件"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "没有选择文件"}), 400
    
    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"success": False, "error": "请选择自变量"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"success": False, "error": "请选择因变量"}), 400
    
    try:
        result = logistic_regression_analysis(file, x_var, y_var)
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


@analysis_bp.route('/multinomialLogisticRegression', methods=["POST"])
def multinomial_logistic_regression():
    """多分类逻辑回归分析"""
    try:
        print("=== 多分类逻辑回归分析请求开始 ===")
        print("Files:", list(request.files.keys()))
        print("Form data:", dict(request.form))
        
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "没有选择文件"}), 400
        
        x_vars = request.form.getlist('x_vars')
        y_var = request.form.get('y_var')

        if not x_vars:
            x_var = request.form.get('x_var')
            if x_var:
                x_vars = [x_var]
        
        if not x_vars:
            return jsonify({"success": False, "error": "请至少选择一个自变量"}), 400
        if not y_var:
            return jsonify({"success": False, "error": "请选择因变量"}), 400
        
        print(f"自变量: {x_vars}")
        print(f"因变量: {y_var}")
        
        result = multinomial_logistic_regression_analysis(file, x_vars, y_var)
        
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_vars": x_vars,
            "y_var": y_var,
            "accuracy": convert_to_serializable(result.get("accuracy")),
            "coefficients": result.get("coefficients", {}),
            "classes": result.get("classes", []),
            "regression_type": "multinomial_logistic"
        }
        
        return jsonify(response_data)
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("多分类逻辑回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500


@analysis_bp.route('/linearRegression', methods=["POST"])
def linear_regression():
    """线性回归分析"""
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有上传文件"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "没有选择文件"}), 400
    
    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"success": False, "error": "请选择自变量"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"success": False, "error": "请选择因变量"}), 400
    
    try:
        result = linear_regression_analysis(file, x_var, y_var)
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_var": str(result['x_var']),
            "y_var": str(result['y_var']),
            "r_squared": convert_to_serializable(result.get("r2_score", result.get("r_squared"))),
            "coefficients": [convert_to_serializable(coef) for coef in result["coefficients"]],
            "intercept": convert_to_serializable(result["intercept"]),
            "regression_type": "linear"
        }
        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("线性回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500


@analysis_bp.route('/multipleLinearRegression', methods=["POST"])
def multiple_linear_regression():
    """多元线性回归分析"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "没有选择文件"}), 400
        
        x_vars = request.form.getlist('x_vars')
        y_var = request.form.get('y_var')
        
        if not x_vars:
            x_var = request.form.get('x_var')
            if x_var:
                x_vars = [x_var]
        
        if not x_vars:
            return jsonify({"success": False, "error": "请至少选择一个自变量"}), 400
        if not y_var:
            return jsonify({"success": False, "error": "请选择因变量"}), 400
        
        result = multiple_linear_regression_analysis(file, x_vars, y_var)
        
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "x_vars": x_vars,
            "y_var": y_var,
            "r_squared": convert_to_serializable(result.get("r2_score", result.get("r_squared"))),
            "adjusted_r_squared": convert_to_serializable(result.get("adjusted_r_squared")),
            "coefficients": {k: convert_to_serializable(v) for k, v in result.get("coefficients", {}).items()} if isinstance(result.get("coefficients"), dict) else [convert_to_serializable(c) for c in result.get("coefficients", [])],
            "intercept": convert_to_serializable(result.get("intercept")),
            "regression_type": "multiple_linear"
        }
        
        return jsonify(response_data)
        
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("多元线性回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500


@analysis_bp.route('/coxRegression', methods=["POST"])
def cox_regression():
    """Cox回归分析"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "没有选择文件"}), 400
        
        duration_col = request.form.get('duration_col')
        event_col = request.form.get('event_col')
        covariates = request.form.getlist('covariates')
        
        if not duration_col:
            return jsonify({"success": False, "error": "请选择时间列"}), 400
        if not event_col:
            return jsonify({"success": False, "error": "请选择事件列"}), 400
        if not covariates:
            covariate = request.form.get('covariate')
            if covariate:
                covariates = [covariate]
        
        if not covariates:
            return jsonify({"success": False, "error": "请至少选择一个协变量"}), 400
        
        result = cox_regression_analysis(file, duration_col, event_col, covariates)
        
        response_data = {
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "duration_col": duration_col,
            "event_col": event_col,
            "covariates": covariates,
            "coefficients": {k: convert_to_serializable(v) for k, v in result.get("coefficients", {}).items()},
            "hazard_ratios": {k: convert_to_serializable(v) for k, v in result.get("hazard_ratios", {}).items()},
            "p_values": {k: convert_to_serializable(v) for k, v in result.get("p_values", {}).items()},
            "concordance_index": convert_to_serializable(result.get("concordance_index")),
            "regression_type": "cox"
        }
        
        return jsonify(response_data)
        
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("Cox回归分析错误:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"分析失败: {str(e)}"}), 500
