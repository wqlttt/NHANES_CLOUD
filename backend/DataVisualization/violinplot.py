"""
小提琴图生成模块
用于检查数据分布形状、密度和多峰特征
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


def generate_violinplot(csv_data, y_column, x_column=None, color='#0062FF', title=None):
    """
    生成小提琴图并返回base64编码图像
    
    Args:
        csv_data: CSV文件路径或文件对象
        y_column: Y轴数值列名(必需)
        x_column: X轴分组列名(可选)。如果为None,生成单个小提琴图
        color: 小提琴图颜色 (默认: '#0062FF')
        title: 自定义标题。如果为None,则自动生成标题
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "y_column": Y轴列名,
            "x_column": X轴列名或None
        }
    
    Raises:
        ValueError: 如果指定的列不存在
        FileNotFoundError: 如果CSV文件不存在
    """
    # 读取CSV数据
    try:
        df = pd.read_csv(csv_data)
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV文件未找到: {csv_data}")
    
    # 验证Y列是否存在
    if y_column not in df.columns:
        raise ValueError(f"列 '{y_column}' 在CSV中不存在")
    
    # 验证X列是否存在(如果提供)
    if x_column and x_column not in df.columns:
        raise ValueError(f"列 '{x_column}' 在CSV中不存在")
    
    # 创建图形
    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 生成小提琴图
    if x_column:
        # 分组小提琴图
        sns.violinplot(
            data=df,
            x=x_column,
            y=y_column,
            color=color,
            ax=ax,
            inner='box',  # 内部显示箱线图
            cut=0  # 不延伸到数据范围之外
        )
        ax.set_xlabel(x_column, fontsize=12)
        # 旋转X轴标签以避免重叠
        plt.xticks(rotation=45, ha='right')
    else:
        # 单个小提琴图
        sns.violinplot(
            data=df,
            y=y_column,
            color=color,
            ax=ax,
            inner='box',
            cut=0
        )
    
    # 设置标题和标签
    if x_column:
        chart_title = title if title else f"{y_column} 按 {x_column} 分组的小提琴图"
    else:
        chart_title = title if title else f"{y_column} 小提琴图"
    
    ax.set_title(chart_title, fontsize=14, pad=20)
    ax.set_ylabel(y_column, fontsize=12)
    
    # 添加网格
    ax.grid(True, linestyle='--', alpha=0.3, axis='y')
    
    # 转换为base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=SAVE_DPI, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close('all')
    
    return {
        "plot": plot_data,
        "y_column": y_column,
        "x_column": x_column,
        "chart_type": "violinplot"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    # 单个小提琴图
    result1 = generate_violinplot(csv_path, "URXDEA")
    print(f"小提琴图已生成: {result1['y_column']}")
    # 分组小提琴图
    result2 = generate_violinplot(csv_path, "URXDEA", "gender")
    print(f"分组小提琴图已生成: {result2['y_column']} by {result2['x_column']}")
