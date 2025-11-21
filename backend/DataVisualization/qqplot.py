"""
QQ图生成模块
用于检验数据是否符合正态分布
"""
import pandas as pd
import seaborn as sns
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import scipy.stats as stats
import numpy as np

# ==================== 全局配置 ====================
# 配置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans', 'Arial Unicode MS', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 统一图片尺寸和DPI
FIGURE_SIZE = (10, 8)  # 英寸
FIGURE_DPI = 100
SAVE_DPI = 150


def generate_qqplot(csv_data, column_name, distribution='norm', color='#0062FF', title=None):
    """
    生成QQ图并返回base64编码图像
    
    Args:
        csv_data: CSV文件路径或文件对象
        column_name: 要检验的数值列名
        distribution: 参考分布类型 (默认: 'norm' 正态分布)
        color: 散点颜色 (默认: '#0062FF')
        title: 自定义标题。如果为None,则自动生成标题
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "column_name": 列名,
            "distribution": 参考分布
        }
    
    Raises:
        ValueError: 如果指定的列不存在或不是数值列
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
    
    # 获取数据并移除缺失值
    data = df[column_name].dropna()
    
    # 检查是否为数值类型
    if not pd.api.types.is_numeric_dtype(data):
        raise ValueError(f"列 '{column_name}' 不是数值类型")
    
    if len(data) == 0:
        raise ValueError(f"列 '{column_name}' 没有有效数据")
    
    # 创建图形
    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 生成QQ图
    # 某些分布需要额外的形状参数（shape parameters）
    # 使用样本大小-1作为自由度的默认值
    sample_size = len(data)
    df_param = sample_size - 1 if sample_size > 1 else 1
    
    if distribution == 't':
        # Student's T 分布需要自由度参数
        stats.probplot(data, dist=distribution, sparams=(df_param,), plot=ax)
    elif distribution == 'chi2':
        # Chi-Square 分布需要自由度参数
        stats.probplot(data, dist=distribution, sparams=(df_param,), plot=ax)
    elif distribution == 'f':
        # F 分布需要两个自由度参数 (dfn, dfd)
        dfn = max(2, df_param // 2)
        dfd = max(2, df_param - dfn)
        stats.probplot(data, dist=distribution, sparams=(dfn, dfd), plot=ax)
    elif distribution == 'gamma':
        # Gamma 分布需要形状参数 (alpha)
        # 使用简单的矩估计
        alpha = 2.0  # 默认形状参数
        stats.probplot(data, dist=distribution, sparams=(alpha,), plot=ax)
    elif distribution == 'beta':
        # Beta 分布需要两个形状参数 (a, b)
        stats.probplot(data, dist=distribution, sparams=(2, 2), plot=ax)
    else:
        # 其他分布（norm, uniform, expon等）不需要额外参数
        stats.probplot(data, dist=distribution, plot=ax)
    
    # 获取当前的线条和点
    line = ax.get_lines()[0]  # 理论分位数线
    points = ax.get_lines()[1]  # 实际数据点
    
    # 自定义样式
    line.set_color('red')
    line.set_linewidth(2)
    line.set_linestyle('--')
    line.set_label('理论分位数线')
    
    points.set_color(color)
    points.set_markersize(6)
    points.set_alpha(0.6)
    points.set_markeredgecolor('black')
    points.set_markeredgewidth(0.5)
    
    # 设置标题和标签
    dist_names = {
        'norm': '正态分布',
        't': 't分布',
        'chi2': '卡方分布',
        'f': 'F分布',
        'gamma': 'Gamma分布',
        'beta': 'Beta分布',
        'uniform': '均匀分布',
        'expon': '指数分布'
    }
    dist_name = dist_names.get(distribution, distribution)
    
    # 在标题中显示分布参数（如果适用）
    if distribution == 't':
        chart_title = title if title else f"{column_name} QQ图 ({dist_name}, df={df_param})"
    elif distribution == 'chi2':
        chart_title = title if title else f"{column_name} QQ图 ({dist_name}, df={df_param})"
    elif distribution == 'f':
        chart_title = title if title else f"{column_name} QQ图 ({dist_name}, dfn={dfn}, dfd={dfd})"
    elif distribution == 'gamma':
        chart_title = title if title else f"{column_name} QQ图 ({dist_name}, α=2.0)"
    elif distribution == 'beta':
        chart_title = title if title else f"{column_name} QQ图 ({dist_name}, a=2, b=2)"
    else:
        chart_title = title if title else f"{column_name} QQ图 ({dist_name})"
    
    ax.set_title(chart_title, fontsize=14, pad=20)
    ax.set_xlabel("理论分位数", fontsize=12)
    ax.set_ylabel("样本分位数", fontsize=12)
    
    # 添加图例
    ax.legend(loc='upper left', fontsize=10)
    
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
        "column_name": column_name,
        "distribution": distribution,
        "chart_type": "qqplot"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    result = generate_qqplot(csv_path, "URXDEA")
    print(f"QQ图已生成: {result['column_name']}")
