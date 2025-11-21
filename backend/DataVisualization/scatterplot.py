"""
散点图生成模块
用于生成双变量散点图(带回归线)
"""
import pandas as pd
import seaborn as sns
import io
import base64
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt

# ==================== 全局配置 ====================
# 配置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans', 'Arial Unicode MS', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 统一图片尺寸和DPI
FIGURE_SIZE = (10, 8)  # 英寸
FIGURE_DPI = 100
SAVE_DPI = 150


def generate_scatterplot(csv_data, x_column=None, y_column=None, color='#0062FF', title=None):
    """
    生成双变量散点图(带回归线)并返回base64编码图像
    
    Args:
        csv_data: CSV文件路径或文件对象
        x_column: X轴列名。如果为None,使用第一个数值列
        y_column: Y轴列名。如果为None,使用第二个数值列
        color: 散点颜色 (默认: '#0062FF')
        title: 自定义标题。如果为None,则自动生成标题
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "x_column": X轴列名,
            "y_column": Y轴列名
        }
    
    Raises:
        ValueError: 如果数值列少于2个
        FileNotFoundError: 如果CSV文件不存在
    """
    # 读取CSV数据
    try:
        df = pd.read_csv(csv_data)
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV文件未找到: {csv_data}")
    
    # 获取数值列
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) < 2:
        raise ValueError("需要至少2个数值列来绘制散点图")
    
    # 确定X和Y列
    x_col = x_column if x_column else numeric_cols[0]
    y_col = y_column if y_column else numeric_cols[1]
    
    if x_col not in df.columns:
        raise ValueError(f"列 '{x_col}' 在CSV中不存在")
    if y_col not in df.columns:
        raise ValueError(f"列 '{y_col}' 在CSV中不存在")
    
    # 创建图形
    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 绘制散点图
    scatter_plot = sns.scatterplot(
        data=df,
        x=x_col,
        y=y_col,
        color=color,
        alpha=0.7,
        edgecolor="black",
        s=50,
        ax=ax
    )
    
    # 添加回归线
    sns.regplot(
        data=df,
        x=x_col,
        y=y_col,
        scatter=False,
        color="black",
        line_kws={'linewidth': 2.5, 'alpha': 0.8},
        ax=ax
    )
    
    # 设置标题和标签
    chart_title = title if title else f"{x_col} vs {y_col} 散点图"
    ax.set_title(chart_title, fontsize=14, pad=20)
    ax.set_xlabel(x_col, fontsize=12)
    ax.set_ylabel(y_col, fontsize=12)
    
    # 添加网格
    ax.grid(True, linestyle='--', alpha=0.3)
    
    # 转换为base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=SAVE_DPI, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close('all')
    
    return {
        "plot": plot_data,
        "x_column": x_col,
        "y_column": y_col,
        "chart_type": "scatterplot"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    result = generate_scatterplot(csv_path, "URXDEA", "URXDEB")
    print(f"散点图已生成: {result['x_column']} vs {result['y_column']}")
