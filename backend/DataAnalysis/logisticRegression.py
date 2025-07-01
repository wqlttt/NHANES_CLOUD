import pandas as pd
import numpy as np
import io
import base64
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import seaborn as sns


def logistic_regression_analysis(csv_data, x_var, y_var):
    """
    Perform logistic regression analysis and return results including a base64 plot.

    Args:
        csv_data: File-like object or path to CSV.
        x_var (str): Feature column name (X)
        y_var (str): Target column name (y, classification label)

    Returns:
        dict: {
            "plot": base64_image,
            "x_var": str,
            "y_var": str,
            "accuracy": float,
            "coefficients": list,
            "intercept": float
        }

    Raises:
        ValueError: If specified columns don't exist
    """
    # Read CSV data
    data = pd.read_csv(csv_data)

    # Check if columns exist
    if x_var not in data.columns or y_var not in data.columns:
        raise ValueError(f"Columns {x_var} or {y_var} not found in CSV")

    # Extract features and target
    clean_data = data[[x_var, y_var]].dropna()
    
    if len(clean_data) < 5:
        raise ValueError("Not enough valid data points for logistic regression analysis")
    
    X = clean_data[[x_var]].values
    y = clean_data[y_var].values

    # Check for binary classification
    unique_values = np.unique(y)
    print(f"因变量 {y_var} 的唯一值: {unique_values}")
    
    if len(unique_values) > 2:
        # 尝试给出更具体的建议
        suggestion = ""
        if len(unique_values) > 10:
            suggestion = f"建议：{y_var} 似乎是连续变量，请选择二分类变量（如性别、是否通过等）或使用线性回归分析。"
        else:
            suggestion = f"建议：{y_var} 是多分类变量，请使用'多分类逻辑回归'分析方法。"
        
        raise ValueError(f"逻辑回归要求二分类因变量（只有2个类别）。当前因变量 {y_var} 有 {len(unique_values)} 个类别。\n{suggestion}")
    
    if len(unique_values) < 2:
        raise ValueError(f"因变量 {y_var} 只有 1 个类别（{unique_values}），无法进行分类分析。请检查数据质量。")

    # Data preprocessing: standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split into train and test sets
    if len(clean_data) > 10:
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
    else:
        X_train, X_test, y_train, y_test = X_scaled, X_scaled, y, y

    # Train logistic regression model
    model = LogisticRegression(random_state=42)
    model.fit(X_train, y_train)

    # Predict and calculate accuracy
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Create plot with Chinese font support
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    plt.rcParams['font.size'] = 10
    
    plt.figure(figsize=(10, 6))
    plt.scatter(X_scaled, y, c=y, cmap='RdYlBu', alpha=0.6, label='数据点')

    # Plot decision boundary
    x_range = np.linspace(X_scaled.min(), X_scaled.max(), 300).reshape(-1, 1)
    y_prob = model.predict_proba(x_range)[:, 1]
    plt.plot(x_range, y_prob, 'k-', linewidth=2, label='决策边界（概率）')

    plt.title(f'二分类逻辑回归分析\n准确率: {accuracy:.3f}', fontsize=14)
    plt.xlabel(f'标准化 {x_var}', fontsize=12)
    plt.ylabel(f'{y_var} (概率)', fontsize=12)
    plt.legend()
    plt.grid(True, alpha=0.3)

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
        "accuracy": float(accuracy),
        "coefficients": model.coef_[0].tolist(),
        "intercept": float(model.intercept_[0]),
        "sample_size": len(clean_data)
    }


def multinomial_logistic_regression_analysis(csv_data, x_vars, y_var):
    """
    Perform multinomial logistic regression analysis for multi-class classification.

    Args:
        csv_data: File-like object or path to CSV.
        x_vars (list): List of feature column names
        y_var (str): Target column name (multi-class)

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
    
    if len(clean_data) < len(x_vars) + 2:
        raise ValueError("Not enough valid data points for multinomial logistic regression")
    
    X = clean_data[x_vars].values
    y = clean_data[y_var].values

    # Check target variable
    unique_classes = np.unique(y)
    n_classes = len(unique_classes)
    print(f"多分类目标变量 {y_var}:")
    print(f"  类别数量: {n_classes}")
    print(f"  类别值: {unique_classes}")
    print(f"  样本分布: {dict(zip(*np.unique(y, return_counts=True)))}")

    if n_classes < 3:
        raise ValueError(f"多分类回归需要至少3个类别，当前只有 {n_classes} 个类别")

    # Data preprocessing
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split data
    if len(clean_data) > 20:
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        X_train, X_test, y_train, y_test = X_scaled, X_scaled, y, y

    # Train multinomial logistic regression
    model = LogisticRegression(
        multi_class='multinomial', 
        solver='lbfgs',  # 适合多分类
        random_state=42,
        max_iter=1000
    )
    model.fit(X_train, y_train)

    # Predictions and metrics
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Create comprehensive plot
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    plt.rcParams['font.size'] = 10

    # Create subplots
    if len(x_vars) == 1:
        # Single feature - show probability curves
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Scatter plot of data
        scatter = ax1.scatter(X_scaled[:, 0], y, c=y, cmap='viridis', alpha=0.6)
        ax1.set_xlabel(f'标准化 {x_vars[0]}')
        ax1.set_ylabel(f'{y_var}')
        ax1.set_title('数据分布')
        ax1.grid(True, alpha=0.3)
        plt.colorbar(scatter, ax=ax1)
        
        # Probability curves for each class
        x_range = np.linspace(X_scaled[:, 0].min(), X_scaled[:, 0].max(), 300).reshape(-1, 1)
        probabilities = model.predict_proba(x_range)
        
        for i, class_val in enumerate(unique_classes):
            ax2.plot(x_range, probabilities[:, i], label=f'类别 {class_val}', linewidth=2)
        
        ax2.set_xlabel(f'标准化 {x_vars[0]}')
        ax2.set_ylabel('预测概率')
        ax2.set_title('各类别预测概率')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
    else:
        # Multiple features - show confusion matrix and feature importance
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax1,
                    xticklabels=unique_classes, yticklabels=unique_classes)
        ax1.set_title('混淆矩阵')
        ax1.set_xlabel('预测值')
        ax1.set_ylabel('真实值')
        
        # Feature importance (coefficients magnitude)
        if hasattr(model, 'coef_'):
            # Calculate average magnitude of coefficients across all classes
            coef_importance = np.mean(np.abs(model.coef_), axis=0)
            ax2.barh(x_vars, coef_importance)
            ax2.set_xlabel('特征重要性（系数绝对值平均）')
            ax2.set_title('特征重要性')
            ax2.grid(True, alpha=0.3)

    plt.suptitle(f'多分类逻辑回归分析\n准确率: {accuracy:.3f}, 类别数: {n_classes}', fontsize=14)
    plt.tight_layout()

    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "x_vars": x_vars,
        "y_var": y_var,
        "accuracy": float(accuracy),
        "n_classes": int(n_classes),
        "class_labels": unique_classes.tolist(),
        "coefficients": model.coef_.tolist() if hasattr(model, 'coef_') else [],
        "intercept": model.intercept_.tolist() if hasattr(model, 'intercept_') else [],
        "sample_size": len(clean_data),
        "classification_type": "multinomial"
    }


# 示例使用
if __name__ == "__main__":
    data = "E:\\NHANES_Web_testData\\logistic_regression_data.csv"
    # 假设有一个CSV文件，其中包含"age"和"purchased"两列
    result = logistic_regression_analysis(data, 'Feature', 'Target')
    print(f"Logistic regression analysis for {result['x_var']} vs {result['y_var']}")
    print(f"Accuracy: {result['accuracy']:.2f}")
    print(f"Coefficients: {result['coefficients']}")
    print(f"Intercept: {result['intercept']}")