import pandas as pd
import numpy as np
import io
import base64
import matplotlib.pyplot

matplotlib.use('Agg')
from lifelines import CoxPHFitter
import matplotlib.pyplot as plt


def cox_regression_analysis(csv_data, covariate_cols, time_col, event_col):
    """
    Perform Cox Proportional Hazards analysis and return results including a base64 forest plot.

    Args:
        csv_data: File-like object or path to CSV.
        covariate_cols (list): List of column names for covariates.
        time_col (str): Column name for survival time.
        event_col (str): Column name for event status (1=event, 0=censored).

    Returns:
        dict: {
            "plot": base64_image,
            "covariates": list,
            "hazard_ratios": list,
            "ci_lower": list,
            "ci_upper": list
        }

    Raises:
        ValueError: If specified columns don't exist
    """
    # Read CSV data
    data = pd.read_csv(csv_data)

    # Check if columns exist
    required_cols = covariate_cols + [time_col, event_col]
    if not all(col in data.columns for col in required_cols):
        raise ValueError("One or more specified columns not found in the CSV file.")

    # Prepare data for Cox model
    cox_data = data[required_cols].dropna()
    
    # 检查数据质量
    if len(cox_data) < 10:  # 至少需要10个样本
        raise ValueError(f"数据不足，删除缺失值后样本量为{len(cox_data)}，至少需要10个样本")
    
    # 检查时间变量是否为正数
    if (cox_data[time_col] <= 0).any():
        raise ValueError("时间变量必须为正数")
    
    # 检查事件变量是否只包含0和1
    event_values = cox_data[event_col].unique()
    if not all(val in [0, 1] for val in event_values):
        raise ValueError("事件变量只能包含0（删失）和1（事件）")
    
    # 检查每个协变量的方差
    print(f"样本量: {len(cox_data)}")
    print(f"事件数量: {cox_data[event_col].sum()}")
    print(f"删失数量: {len(cox_data) - cox_data[event_col].sum()}")
    
    for col in covariate_cols:
        var_all = cox_data[col].var()
        var_event = cox_data[cox_data[event_col] == 1][col].var()
        var_censored = cox_data[cox_data[event_col] == 0][col].var()
        print(f"协变量 {col}: 总体方差={var_all:.4f}, 事件组方差={var_event:.4f}, 删失组方差={var_censored:.4f}")
        
        # 如果方差过小，给出警告但不停止分析
        if var_all < 1e-6:
            print(f"警告: 协变量 {col} 的方差过小，可能导致收敛问题")

    # 检查协变量之间的相关性
    corr_matrix = cox_data[covariate_cols].corr()
    high_corr_pairs = []
    for i in range(len(covariate_cols)):
        for j in range(i+1, len(covariate_cols)):
            corr_val = abs(corr_matrix.iloc[i, j])
            if corr_val > 0.9:
                high_corr_pairs.append((covariate_cols[i], covariate_cols[j], corr_val))
    
    if high_corr_pairs:
        print("警告: 发现高度相关的协变量:")
        for var1, var2, corr in high_corr_pairs:
            print(f"  {var1} - {var2}: 相关系数 = {corr:.4f}")

    # Initialize and fit the Cox model
    cph = CoxPHFitter(penalizer=0.1)  # 添加正则化项
    try:
        cph.fit(cox_data, duration_col=time_col, event_col=event_col)
        print("Cox模型拟合成功")
    except Exception as e:
        # 尝试更强的正则化
        print(f"初次拟合失败，尝试更强的正则化: {str(e)}")
        try:
            cph = CoxPHFitter(penalizer=1.0)
            cph.fit(cox_data, duration_col=time_col, event_col=event_col)
            print("使用强正则化拟合成功")
        except Exception as e2:
            raise ValueError(f"Cox模型拟合失败（已尝试正则化）: {str(e2)}\n\n建议检查数据质量：\n1. 确保协变量有足够的变异性\n2. 检查是否存在完全分离现象\n3. 减少协变量数量或增加样本量")

    # Extract model results
    summary = cph.summary
    hr = summary['exp(coef)'].values  # Hazard ratios
    ci_lower = summary['exp(coef) lower 95%'].values
    ci_upper = summary['exp(coef) upper 95%'].values
    covariates = summary.index.tolist()
    
    # 处理无穷大和NaN值
    def clean_value(val):
        if np.isinf(val) or np.isnan(val):
            return None
        return float(val)
    
    hr = [clean_value(x) for x in hr]
    ci_lower = [clean_value(x) for x in ci_lower]
    ci_upper = [clean_value(x) for x in ci_upper]

    # Create forest plot
    plt.figure(figsize=(10, max(len(covariates) * 0.5 + 2, 4)))

    # 过滤有效的数据点用于绘图
    valid_indices = [i for i, (h, l, u) in enumerate(zip(hr, ci_lower, ci_upper)) 
                     if h is not None and l is not None and u is not None]
    
    if valid_indices:
        valid_hr = [hr[i] for i in valid_indices]
        valid_ci_lower = [ci_lower[i] for i in valid_indices]
        valid_ci_upper = [ci_upper[i] for i in valid_indices]
        valid_covariates = [covariates[i] for i in valid_indices]
        
        # Plot hazard ratios as points
        y_pos = np.arange(len(valid_covariates))
        hr_array = np.array(valid_hr)
        ci_lower_array = np.array(valid_ci_lower)
        ci_upper_array = np.array(valid_ci_upper)
        
        plt.errorbar(hr_array, y_pos, 
                     xerr=[hr_array - ci_lower_array, ci_upper_array - hr_array],
                     fmt='o', capsize=5, color='black', markersize=6)

        # Add vertical line at HR=1
        plt.axvline(x=1, color='red', linestyle='--', alpha=0.7)

        # Customize plot
        plt.yticks(y_pos, valid_covariates)
        plt.xlabel('Hazard Ratio (95% CI)')
        plt.title('Cox Proportional Hazards Model - Forest Plot')
        plt.grid(True, axis='x', alpha=0.3)
        
        # 设置x轴范围
        if len(valid_hr) > 0:
            x_min = min(min(valid_ci_lower), 0.1)
            x_max = max(max(valid_ci_upper), 5.0)
            plt.xlim(x_min * 0.9, x_max * 1.1)
    else:
        # 如果没有有效数据，显示警告信息
        plt.text(0.5, 0.5, 'No valid data for forest plot\n(contains infinite values)', 
                 ha='center', va='center', transform=plt.gca().transAxes,
                 fontsize=12, color='red')
        plt.xlim(0, 2)
        plt.ylim(0, 1)

    plt.tight_layout()
    
    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "covariates": covariates,
        "hazard_ratios": hr,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper
    }


# Example usage
if __name__ == '__main__':
    csv_path = 'E:\\NHANES_Web_testData\\synthetic_cox_data.csv'
    result = cox_regression_analysis(csv_path, ['age', 'treatment', 'sex'], 'survival_time', 'event_status')

    print("Cox Regression Analysis Results:")
    print(f"Covariates: {result['covariates']}")
    print(f"Hazard Ratios: {result['hazard_ratios']}")
    print(f"95% CI Lower: {result['ci_lower']}")
    print(f"95% CI Upper: {result['ci_upper']}")
