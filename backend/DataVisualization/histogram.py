"""
直方图生成模块
用于生成单变量分布直方图(带KDE曲线)及多变量重叠直方图
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


def generate_histogram(csv_data, column_name=None, color='#0062FF', title=None):
    """
    生成直方图并返回base64编码图像。支持单列或多列重叠。
    
    Args:
        csv_data: CSV文件路径或文件对象
        column_name: 要绘制的列名(str)或列名列表(list)。如果为None,使用第一个数值列
        color: 直方图条形颜色 (默认: '#0062FF')
        title: 自定义标题。如果为None,则自动生成标题
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "column_used": 使用的列名或列名列表
        }
    
    Raises:
        ValueError: 如果没有数值列可绘制
        FileNotFoundError: 如果CSV文件不存在
    """
    # 读取CSV数据
    try:
        df = pd.read_csv(csv_data)
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV文件未找到: {csv_data}")
    
    # 获取数值列
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) == 0:
        raise ValueError("CSV中没有数值列可绘制")
    
    # 确定目标列
    target_cols = []
    if isinstance(column_name, list):
        target_cols = column_name
    elif column_name:
        target_cols = [column_name]
    else:
        target_cols = [numeric_cols[0]]
        
    # 验证所有列是否存在
    for col in target_cols:
        if col not in df.columns:
            raise ValueError(f"列 '{col}' 在CSV中不存在")
    
    # 创建图形
    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 生成直方图
    if len(target_cols) == 1:
        # 单列模式
        target_col = target_cols[0]
        hist_plot = sns.histplot(
            data=df,
            x=target_col,
            kde=True,
            color=color,
            bins=30,
            edgecolor="black",
            alpha=0.7,
            ax=ax
        )
        # 设置KDE线样式
        if len(hist_plot.get_lines()) > 0:
            kde_line = hist_plot.get_lines()[0]
            kde_line.set_color("black")
            kde_line.set_linewidth(2.5)
            kde_line.set_alpha(0.8)
            
        ax.set_xlabel(target_col, fontsize=12)
        chart_title = title if title else f"{target_col} 分布直方图"
    else:
        # 多列重叠模式
        colors = sns.color_palette("husl", len(target_cols))
        for i, col in enumerate(target_cols):
            sns.histplot(
                data=df,
                x=col,
                kde=True,
                color=colors[i],
                label=col,
                bins=30,
                element="step", # 使用阶梯状以减少遮挡
                fill=True,
                alpha=0.5, # 增加透明度
                ax=ax
            )
        ax.legend()
        ax.set_xlabel("Value", fontsize=12)
        chart_title = title if title else f"多变量分布直方图 ({', '.join(target_cols)})"

    # 设置标题和标签
    ax.set_title(chart_title, fontsize=14, pad=20)
    ax.set_ylabel("频次", fontsize=12)
    
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
        "column_used": target_cols if len(target_cols) > 1 else target_cols[0],
        "chart_type": "histogram"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    # result = generate_histogram(csv_path, "URXDEA")
    # print(f"直方图已生成: {result['column_used']}")