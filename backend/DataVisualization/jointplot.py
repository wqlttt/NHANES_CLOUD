"""
联合分布图生成模块
用于生成双变量联合分布图(六边形密度图)
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


def generate_jointplot(csv_data, x_var, y_var, color='#3b82f6', title=None):
    """
    生成双变量联合分布图(六边形密度图)并返回base64编码图像
    
    Args:
        csv_data: CSV文件路径或文件对象
        x_var: X轴变量名
        y_var: Y轴变量名
        color: 十六进制颜色代码 (默认: '#3b82f6')
        title: 自定义标题。如果为None,则自动生成标题
    
    Returns:
        dict: {
            "plot": base64编码的图像字符串,
            "x_var": X轴变量名,
            "y_var": Y轴变量名
        }
    
    Raises:
        ValueError: 如果指定的列不存在
        FileNotFoundError: 如果CSV文件不存在
    """
    # 读取CSV数据
    try:
        data = pd.read_csv(csv_data)
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV文件未找到: {csv_data}")
    
    # 验证列是否存在
    if x_var not in data.columns:
        raise ValueError(f"列 '{x_var}' 在CSV中不存在")
    if y_var not in data.columns:
        raise ValueError(f"列 '{y_var}' 在CSV中不存在")
    
    # 创建图形
    fig = plt.figure(figsize=FIGURE_SIZE, dpi=FIGURE_DPI)
    
    # 生成六边形密度图
    g = sns.jointplot(
        data=data,
        x=x_var,
        y=y_var,
        kind="hex",
        color=color,
        height=8,
        ratio=5
    )
    
    # 设置标题
    chart_title = title if title else f"{x_var} vs {y_var} 联合分布图"
    g.fig.suptitle(chart_title, fontsize=14, y=1.02)
    
    # 设置轴标签
    g.set_axis_labels(x_var, y_var, fontsize=12)
    
    # 转换为base64
    buffer = io.BytesIO()
    g.savefig(buffer, format='png', dpi=SAVE_DPI, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close('all')
    
    return {
        "plot": plot_data,
        "x_var": x_var,
        "y_var": y_var,
        "chart_type": "jointplot"
    }


if __name__ == '__main__':
    # 示例用法
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    result = generate_jointplot(csv_path, "URXDEA", "age")
    print(f"联合分布图已生成: {result['x_var']} vs {result['y_var']}")
