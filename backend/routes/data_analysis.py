"""
数据分析相关路由
"""
from flask import Blueprint, request, jsonify
import sys
import os
from DataAnalysis.logisticRegression import logistic_regression_analysis, multinomial_logistic_regression_analysis
from DataAnalysis.linearRegression import linear_regression_analysis, multiple_linear_regression_analysis
from DataAnalysis.coxRegression import cox_regression_analysis
from DataAnalysis.hypothesisTesting import ttest_analysis, chisquare_analysis, anova_analysis, ranksum_analysis
from DataAnalysis.rcsAnalysis import rcs_analysis, rcs_cox_analysis
from utils.serialization import convert_to_serializable

analysis_bp = Blueprint('data_analysis', __name__)


def get_file_input():
    """获取文件输入，支持上传文件和服务器文件路径"""
    # 优先检查是否有文件路径参数 (用于演示数据)
    filepath = request.form.get('filepath')
    if filepath:
        if not os.path.exists(filepath):
             return None, jsonify({"success": False, "error": f"找不到文件: {filepath}"}), 404
        return filepath, None, None

    if 'file' not in request.files:
        return None, jsonify({"success": False, "error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return None, jsonify({"success": False, "error": "No file selected"}), 400
        
    return file, None, None


@analysis_bp.route('/logisticRegression', methods=["POST"])
def logistic_regression():
    """逻辑回归分析"""
    file, error_resp, status_code = get_file_input()
    if error_resp:
        return error_resp, status_code
    
    x_var = request.form.get('x_var')
    if not x_var:
        return jsonify({"success": False, "error": "Please select independent variable"}), 400
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"success": False, "error": "Please select dependent variable"}), 400
    
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
        print("Logistic regression analysis error:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Analysis failed: {str(e)}"}), 500


@analysis_bp.route('/multinomialLogisticRegression', methods=["POST"])
def multinomial_logistic_regression():
    """多分类逻辑回归分析"""
    try:
        print("=== 多分类逻辑回归分析请求开始 ===")
        print("Files:", list(request.files.keys()))
        print("Form data:", dict(request.form))
        
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        x_vars = request.form.getlist('x_vars')
        y_var = request.form.get('y_var')

        if not x_vars:
            x_var = request.form.get('x_var')
            if x_var:
                x_vars = [x_var]
        
        if not x_vars:
            return jsonify({"success": False, "error": "Please select at least one independent variable"}), 400
        if not y_var:
            return jsonify({"success": False, "error": "Please select dependent variable"}), 400
        
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
        print("Multinomial logistic regression analysis error:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Analysis failed: {str(e)}"}), 500


@analysis_bp.route('/linearRegression', methods=["POST"])
@analysis_bp.route('/linearRegression', methods=["POST"])
def linear_regression():
    """线性回归分析 (Generic handler for both Simple and Multiple)"""
    file, error_resp, status_code = get_file_input()
    if error_resp:
        return error_resp, status_code
    
    # Try to get parameters
    y_var = request.form.get('y_var')
    if not y_var:
        return jsonify({"success": False, "error": "Please select dependent variable"}), 400

    # Handling x variables (could be single 'x_var' or list 'x_vars')
    x_vars = request.form.getlist('x_vars')
    if not x_vars:
        x_var_single = request.form.get('x_var')
        if x_var_single:
            x_vars = [x_var_single]
    
    if not x_vars:
         return jsonify({"success": False, "error": "Please select independent variable(s)"}), 400

    try:
        # Decide between Simple and Multiple Linear Regression based on number of X variables
        if len(x_vars) == 1:
            # Simple Linear Regression
            x_var = x_vars[0]
            result = linear_regression_analysis(file, x_var, y_var)
            response_data = {
                "success": True,
                "plot": f"data:image/png;base64,{result['plot']}",
                "x_var": str(result['x_var']),
                "y_var": str(result['y_var']),
                "r_squared": convert_to_serializable(result.get("r2_score", result.get("r_squared"))),
                "coefficients": [convert_to_serializable(coef) for coef in result["coefficients"]],
                "intercept": convert_to_serializable(result["intercept"]),
                "regression_type": "linear_simple", # Updated to match frontend expectation
                "sample_size": convert_to_serializable(result.get("sample_size"))
            }
        else:
            # Multiple Linear Regression
            result = multiple_linear_regression_analysis(file, x_vars, y_var)
            response_data = {
                "success": True,
                "plot": f"data:image/png;base64,{result['plot']}",
                "x_vars": x_vars,
                "y_var": y_var,
                "r_squared": convert_to_serializable(result.get("r2_score", result.get("r_squared"))),
                "adjusted_r_squared": convert_to_serializable(result.get("adjusted_r_squared")),
                # Handle coefficients dict vs list
                "coefficients": {k: convert_to_serializable(v) for k, v in result.get("coefficients", {}).items()} if isinstance(result.get("coefficients"), dict) else [convert_to_serializable(c) for c in result.get("coefficients", [])],
                "intercept": convert_to_serializable(result.get("intercept")),
                "regression_type": "linear_multiple", # Updated to match frontend expectation
                 "sample_size": convert_to_serializable(result.get("sample_size"))
            }

        return jsonify(response_data)
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("Linear regression analysis error:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Analysis failed: {str(e)}"}), 500


@analysis_bp.route('/multipleLinearRegression', methods=["POST"])
def multiple_linear_regression():
    """多元线性回归分析 (Unified Handler)"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        x_vars = request.form.getlist('x_vars')
        y_var = request.form.get('y_var')
        
        # Fallback for single var passed to multiple endpoint (unlikely but robust)
        if not x_vars:
            x_var = request.form.get('x_var')
            if x_var:
                x_vars = [x_var]
        
        if not x_vars:
            return jsonify({"success": False, "error": "Please select at least one independent variable"}), 400
        if not y_var:
            return jsonify({"success": False, "error": "Please select dependent variable"}), 400
        
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
            "regression_type": "linear_multiple", # Updated to match frontend
             "sample_size": convert_to_serializable(result.get("sample_size"))
        }
        
        return jsonify(response_data)
        
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        import traceback
        print("Multiple linear regression analysis error:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Analysis failed: {str(e)}"}), 500


@analysis_bp.route('/coxRegression', methods=["POST"])
def cox_regression():
    """Cox回归分析"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        duration_col = request.form.get('duration_col')
        event_col = request.form.get('event_col')
        covariates = request.form.getlist('covariates')
        
        if not duration_col:
            return jsonify({"success": False, "error": "Please select time variable"}), 400
        if not event_col:
            return jsonify({"success": False, "error": "Please select event variable"}), 400
        if not covariates:
            covariate = request.form.get('covariate')
            if covariate:
                covariates = [covariate]
        
        if not covariates:
            return jsonify({"success": False, "error": "Please select at least one covariate"}), 400
        
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
        print("Cox regression analysis error:")
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Analysis failed: {str(e)}"}), 500


@analysis_bp.route('/ttest', methods=["POST"])
def ttest_route():
    """Two-sample T-test"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        group_col = request.form.get('group_col')
        value_col = request.form.get('value_col')

        if not group_col or not value_col:
            return jsonify({"success": False, "error": "Please select both group and value columns"}), 400

        result = ttest_analysis(file, group_col, value_col)
        
        return jsonify({
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "statistic": convert_to_serializable(result['statistic']),
            "p_value": convert_to_serializable(result['p_value']),
            "groups": result['groups'],
            "means": {k: convert_to_serializable(v) for k, v in result['means'].items()},
            "analysis_type": "ttest"
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/chisquare', methods=["POST"])
def chisquare_route():
    """Chi-square Test"""
    """Chi-square Test"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        col1 = request.form.get('col1')
        col2 = request.form.get('col2')

        if not col1 or not col2:
            return jsonify({"success": False, "error": "Please select two categorical columns"}), 400

        result = chisquare_analysis(file, col1, col2)
        
        return jsonify({
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "statistic": convert_to_serializable(result['statistic']),
            "p_value": convert_to_serializable(result['p_value']),
            "dof": convert_to_serializable(result['dof']),
            "analysis_type": "chisquare"
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/anova', methods=["POST"])
def anova_route():
    """One-way ANOVA"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        group_col = request.form.get('group_col')
        value_col = request.form.get('value_col')

        if not group_col or not value_col:
            return jsonify({"success": False, "error": "Please select group and value columns"}), 400

        result = anova_analysis(file, group_col, value_col)
        
        return jsonify({
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "statistic": convert_to_serializable(result['statistic']),
            "p_value": convert_to_serializable(result['p_value']),
            "groups": result['groups'],
            "analysis_type": "anova"
        })
    except ValueError as e:
        print(f"ANOVA ValueError: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"ANOVA Exception: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/ranksum', methods=["POST"])
def ranksum_route():
    """Mann-Whitney U Test (Rank-sum)"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        group_col = request.form.get('group_col')
        value_col = request.form.get('value_col')

        if not group_col or not value_col:
            return jsonify({"success": False, "error": "Please select group and value columns"}), 400

        result = ranksum_analysis(file, group_col, value_col)
        
        return jsonify({
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "statistic": convert_to_serializable(result['statistic']),
            "p_value": convert_to_serializable(result['p_value']),
            "groups": result['groups'],
            "analysis_type": "ranksum"
        })
    except ValueError as e:
        print(f"Rank-sum ValueError: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"Rank-sum Exception: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/rcs', methods=["POST"])
def rcs_route():
    """Restricted Cubic Spline (RCS) Analysis"""
    """Restricted Cubic Spline (RCS) Analysis"""
    try:
        file, error_resp, status_code = get_file_input()
        if error_resp:
            return error_resp, status_code
        
        model_type = request.form.get('model_type') # linear, logistic, cox
        x_var = request.form.get('x_var')
        y_var = request.form.get('y_var') # event_var for Cox, outcome for others
        covariates = request.form.getlist('covariates')
        knots = int(request.form.get('knots', 4))
        
        if not model_type or not x_var or not y_var:
            return jsonify({"success": False, "error": "Missing required parameters"}), 400
            
        if not covariates:
            # Handle single covariate passed as string
            cov = request.form.get('covariates')
            if cov:
                covariates = [cov]

        if model_type == 'cox':
            time_var = request.form.get('time_var')
            if not time_var:
                return jsonify({"success": False, "error": "Cox model requires time_var"}), 400
            result = rcs_cox_analysis(file, time_var, y_var, x_var, covariates, knots)
        else:
            result = rcs_analysis(file, model_type, x_var, y_var, covariates, knots)
        
        return jsonify({
            "success": True,
            "plot": f"data:image/png;base64,{result['plot']}",
            "aic": convert_to_serializable(result.get('aic')),
            "analysis_type": "rcs",
            "model_type": model_type
        })

    except ValueError as e:
        print(f"RCS ValueError: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"RCS Exception: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
