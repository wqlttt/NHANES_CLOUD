import pandas as pd
import numpy as np
import io
import base64
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import seaborn as sns


def linear_regression_analysis(csv_data, x_var, y_var):
    """
    Perform linear regression analysis and return results including a base64 plot.

    Args:
        csv_data: File-like object or path to CSV.
        x_var (str): Feature column name (X)
        y_var (str): Target column name (y, continuous variable)

    Returns:
        dict: {
            "plot": base64_image,
            "x_var": str,
            "y_var": str,
            "r2_score": float,
            "mse": float,
            "coefficients": list,
            "intercept": float,
            "equation": str
        }

    Raises:
        ValueError: If specified columns don't exist
    """
    # Read CSV data
    data = pd.read_csv(csv_data)

    # Check if columns exist
    if x_var not in data.columns or y_var not in data.columns:
        raise ValueError(f"Columns {x_var} or {y_var} not found in CSV")

    # Extract features and target, remove missing values
    clean_data = data[[x_var, y_var]].dropna()
    
    if len(clean_data) < 2:
        raise ValueError("Not enough valid data points for regression analysis")
    
    X = clean_data[[x_var]].values
    y = clean_data[y_var].values

    # Check if X and y are numeric
    print(f"检查数据类型 - {x_var}: {clean_data[x_var].dtype}, {y_var}: {clean_data[y_var].dtype}")
    print(f"因变量 {y_var} 的唯一值: {clean_data[y_var].unique()[:10]}")  # 显示前10个唯一值
    
    if not pd.api.types.is_numeric_dtype(clean_data[x_var]):
        raise ValueError(f"自变量 {x_var} 必须是数值类型才能进行线性回归。当前类型: {clean_data[x_var].dtype}")
    if not pd.api.types.is_numeric_dtype(clean_data[y_var]):
        # 检查是否可以转换为数值类型
        try:
            clean_data[y_var] = pd.to_numeric(clean_data[y_var], errors='coerce')
            if clean_data[y_var].isnull().all():
                raise ValueError(f"因变量 {y_var} 无法转换为数值类型，不能进行线性回归。请选择连续型数值变量作为因变量。")
            print(f"已将因变量 {y_var} 转换为数值类型")
        except:
            raise ValueError(f"因变量 {y_var} 必须是连续型数值变量才能进行线性回归。当前类型: {clean_data[y_var].dtype}。提示：如果这是分类变量(如性别、是否通过等)，请使用逻辑回归。")

    # Split into train and test sets
    if len(clean_data) > 10:  # Only split if we have enough data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
    else:
        # Use all data for training if dataset is small
        X_train, X_test, y_train, y_test = X, X, y, y

    # Train linear regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Predict and calculate metrics
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)

    # Create plot with Chinese font support
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    plt.rcParams['font.size'] = 10
    
    plt.figure(figsize=(10, 6))
    
    # Scatter plot of actual data
    plt.scatter(X, y, alpha=0.6, color='blue', label='数据点')
    
    # Plot regression line
    x_range = np.linspace(X.min(), X.max(), 100).reshape(-1, 1)
    y_pred_line = model.predict(x_range)
    plt.plot(x_range, y_pred_line, 'r-', linewidth=2, label='回归直线')
    
    # Calculate equation
    slope = model.coef_[0]
    intercept = model.intercept_
    equation = f'y = {slope:.3f}x + {intercept:.3f}'
    
    # Add equation and metrics to plot
    plt.title(f'线性回归分析\nR² = {r2:.3f}, MSE = {mse:.3f}\n{equation}', fontsize=14)
    plt.xlabel(x_var, fontsize=12)
    plt.ylabel(y_var, fontsize=12)
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Add correlation coefficient
    correlation = np.corrcoef(X.flatten(), y)[0, 1]
    plt.text(0.05, 0.95, f'相关系数: {correlation:.3f}', 
             transform=plt.gca().transAxes, 
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
             verticalalignment='top')

    plt.tight_layout()

    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "x_var": x_var,
        "y_var": y_var,
        "r2_score": float(r2),
        "mse": float(mse),
        "correlation": float(correlation),
        "coefficients": [float(slope)],
        "intercept": float(intercept),
        "equation": equation,
        "sample_size": len(clean_data)
    }


# 多变量线性回归分析
def multiple_linear_regression_analysis(csv_data, x_vars, y_var):
    """
    Perform multiple linear regression analysis.

    Args:
        csv_data: File-like object or path to CSV.
        x_vars (list): List of feature column names
        y_var (str): Target column name

    Returns:
        dict: Analysis results with plot and statistics
    """
    # Read CSV data
    data = pd.read_csv(csv_data)

    # Check if columns exist
    missing_cols = [col for col in x_vars + [y_var] if col not in data.columns]
    if missing_cols:
        raise ValueError(f"Columns {missing_cols} not found in CSV")

    # Extract features and target, remove missing values
    clean_data = data[x_vars + [y_var]].dropna()
    
    if len(clean_data) < len(x_vars) + 1:
        raise ValueError("Not enough valid data points for multiple regression analysis")
    
    X = clean_data[x_vars].values
    y = clean_data[y_var].values

    # Check if all variables are numeric
    print(f"多变量回归数据类型检查:")
    for var in x_vars + [y_var]:
        print(f"  {var}: {clean_data[var].dtype}")
        if var == y_var:
            print(f"  因变量 {y_var} 的唯一值: {clean_data[y_var].unique()[:10]}")
    
    for var in x_vars + [y_var]:
        if not pd.api.types.is_numeric_dtype(clean_data[var]):
            if var == y_var:
                # 对因变量尝试转换
                try:
                    clean_data[y_var] = pd.to_numeric(clean_data[y_var], errors='coerce')
                    if clean_data[y_var].isnull().all():
                        raise ValueError(f"因变量 {y_var} 无法转换为数值类型，不能进行线性回归。请选择连续型数值变量作为因变量。")
                    print(f"已将因变量 {y_var} 转换为数值类型")
                except:
                    raise ValueError(f"因变量 {y_var} 必须是连续型数值变量才能进行多变量线性回归。当前类型: {clean_data[y_var].dtype}。提示：如果这是分类变量，请使用逻辑回归。")
            else:
                # 对自变量尝试转换
                try:
                    clean_data[var] = pd.to_numeric(clean_data[var], errors='coerce')
                    if clean_data[var].isnull().all():
                        raise ValueError(f"自变量 {var} 无法转换为数值类型。")
                    print(f"已将自变量 {var} 转换为数值类型")
                except:
                    raise ValueError(f"变量 {var} 必须是数值类型才能进行线性回归。当前类型: {clean_data[var].dtype}")

    # Train model
    model = LinearRegression()
    model.fit(X, y)
    
    # Predictions
    y_pred = model.predict(X)
    r2 = r2_score(y, y_pred)
    mse = mean_squared_error(y, y_pred)

    # Create residual plot
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    plt.rcParams['font.size'] = 10
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Predicted vs Actual
    ax1.scatter(y, y_pred, alpha=0.6)
    ax1.plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2)
    ax1.set_xlabel(f'实际值 ({y_var})')
    ax1.set_ylabel(f'预测值 ({y_var})')
    ax1.set_title(f'预测值 vs 实际值\nR² = {r2:.3f}')
    ax1.grid(True, alpha=0.3)
    
    # Residual plot
    residuals = y - y_pred
    ax2.scatter(y_pred, residuals, alpha=0.6)
    ax2.axhline(y=0, color='r', linestyle='--')
    ax2.set_xlabel('预测值')
    ax2.set_ylabel('残差')
    ax2.set_title('残差图')
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()

    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    # Create equation
    equation = f"y = {model.intercept_:.3f}"
    for i, (coef, var) in enumerate(zip(model.coef_, x_vars)):
        sign = "+" if coef >= 0 else ""
        equation += f" {sign}{coef:.3f}*{var}"

    return {
        "plot": plot_data,
        "x_vars": x_vars,
        "y_var": y_var,
        "r2_score": float(r2),
        "mse": float(mse),
        "coefficients": [float(c) for c in model.coef_],
        "intercept": float(model.intercept_),
        "equation": equation,
        "sample_size": len(clean_data)
    }


# 示例使用
if __name__ == "__main__":
    # 创建示例数据
    np.random.seed(42)
    n = 100
    x = np.random.randn(n)
    y = 2 * x + 1 + 0.5 * np.random.randn(n)
    
    df = pd.DataFrame({'x': x, 'y': y})
    df.to_csv('test_linear_regression.csv', index=False)
    
    result = linear_regression_analysis('test_linear_regression.csv', 'x', 'y')
    print(f"Linear regression analysis for {result['x_var']} vs {result['y_var']}")
    print(f"R² Score: {result['r2_score']:.3f}")
    print(f"MSE: {result['mse']:.3f}")
    print(f"Equation: {result['equation']}") 