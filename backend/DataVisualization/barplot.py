"""
条形图生成模块
用于检查分类变量的频数分布和类别不平衡
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


def generate_barplot(csv_data, column_name, color='#0062FF', title=None, show_percentage=True):
    """
    生成条形图并返回base64编码图像
    
    Args:
        csv_data: CSV文件路径或文件对象
        column_name: 要统计的分类列名
        color: 条形颜色 (默认: '#0062FF')
        title: 自定义标题。如果为None,则自动生成标题
        show_percentage: 是否在条形上显示百分比 (默认: True)
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "column_name": 列名,
            "categories": 类别数量
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
    
    # 验证列是否存在
    if column_name not in df.columns:
        raise ValueError(f"列 '{column_name}' 在CSV中不存在")
    
    # 统计频数
    value_counts = df[column_name].value_counts().sort_index()
    
    # 创建图形
    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 生成条形图
    bars = sns.barplot(
        x=value_counts.index.astype(str),
        y=value_counts.values,
        color=color,
        ax=ax,
        edgecolor='black',
        alpha=0.8
    )
    
    # 在条形上添加数值标签
    total = value_counts.sum()
    for i, (count, bar) in enumerate(zip(value_counts.values, bars.patches)):
        height = bar.get_height()
        if show_percentage:
            percentage = (count / total) * 100
            label = f'{count}\n({percentage:.1f}%)'
        else:
            label = f'{count}'
        
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            height,
            label,
            ha='center',
            va='bottom',
            fontsize=10
        )
    
    # 设置标题和标签
    chart_title = title if title else f"{column_name} 分布条形图"
    ax.set_title(chart_title, fontsize=14, pad=20)
    ax.set_xlabel(column_name, fontsize=12)
    ax.set_ylabel("频数", fontsize=12)
    
    # 旋转X轴标签以避免重叠
    plt.xticks(rotation=45, ha='right')
    
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
        "column_name": column_name,
        "categories": len(value_counts),
        "chart_type": "barplot"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    result = generate_barplot(csv_path, "gender")
    print(f"条形图已生成: {result['column_name']}, 类别数: {result['categories']}")
