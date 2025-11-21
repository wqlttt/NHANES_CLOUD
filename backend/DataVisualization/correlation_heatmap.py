"""
相关性矩阵热图生成模块
用于探索多个数值变量之间的相关性关系
"""
import pandas as pd
import seaborn as sns
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# ==================== 全局配置 ====================
# 配置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans', 'Arial Unicode MS', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 统一图片尺寸和DPI
FIGURE_SIZE = (10, 8)  # 英寸
FIGURE_DPI = 100
SAVE_DPI = 150


def generate_correlation_heatmap(csv_data, columns=None, method='pearson', title=None):
    """
    生成相关性矩阵热图并返回base64编码图像
    
    Args:
        csv_data: CSV文件路径或文件对象
        columns: 要计算相关性的列名列表。如果为None,使用所有数值列
        method: 相关性计算方法 ('pearson', 'spearman', 'kendall')
        title: 自定义标题。如果为None,则自动生成标题
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "columns": 使用的列名列表,
            "method": 相关性计算方法
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
    
    # 选择要分析的列
    if columns:
        # 验证所有列是否存在
        missing_cols = [col for col in columns if col not in df.columns]
        if missing_cols:
            raise ValueError(f"以下列在CSV中不存在: {missing_cols}")
        df_selected = df[columns]
    else:
        # 使用所有数值列
        df_selected = df.select_dtypes(include=['number'])
    
    # 检查是否有足够的数值列
    if df_selected.shape[1] < 2:
        raise ValueError("需要至少2个数值列来计算相关性")
    
    # 计算相关性矩阵
    corr_matrix = df_selected.corr(method=method)
    
    # 创建图形
    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 生成热图
    sns.heatmap(
        corr_matrix,
        annot=True,  # 显示数值
        fmt='.2f',  # 保留两位小数
        cmap='coolwarm',  # 颜色映射
        center=0,  # 中心值为0
        vmin=-1,
        vmax=1,
        square=True,  # 方形单元格
        linewidths=0.5,
        cbar_kws={'label': '相关系数'},
        ax=ax
    )
    
    # 设置标题
    method_names = {
        'pearson': 'Pearson',
        'spearman': 'Spearman',
        'kendall': 'Kendall'
    }
    chart_title = title if title else f"{method_names.get(method, method)} 相关性矩阵热图"
    ax.set_title(chart_title, fontsize=14, pad=20)
    
    # 旋转标签
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    
    # 转换为base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=SAVE_DPI, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close('all')
    
    return {
        "plot": plot_data,
        "columns": list(df_selected.columns),
        "method": method,
        "chart_type": "correlation_heatmap"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    # 使用所有数值列
    result1 = generate_correlation_heatmap(csv_path)
    print(f"相关性热图已生成,包含 {len(result1['columns'])} 个变量")
    # 指定特定列
    result2 = generate_correlation_heatmap(csv_path, columns=['URXDEA', 'URXDEB', 'age'])
    print(f"相关性热图已生成: {result2['columns']}")
