import pandas as pd
import seaborn as sns
import io
import base64

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def generate_histogram(csv_data, column_name=None, color='#0062FF', title=None):
    """
    Generate a histogram from CSV data using seaborn and return as base64 image.
    Args:
        csv_data: File-like object or path to CSV.
        column_name: Optional specific column to plot. If None, uses the first numeric column.
        color: Color for the histogram bars. Default is '#0062FF'.
        title: Custom title for the histogram. If None, auto-generates title.
    Returns:
        dict: {"plot": base64_image, "column_used": str}
    Raises:
        ValueError: If no numeric columns exist.
    """
    df = pd.read_csv(csv_data)
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) == 0:
        raise ValueError("No numeric columns to plot")

    target_col = column_name if column_name else numeric_cols[0]
    plt.figure()

    hist_plot =  sns.histplot(data=df,
                 x=target_col,
                 kde=True,
                 color=color,  # Use custom color
                 bins=30,  # Adjust number of bins for smoother histogram
                 edgecolor="black",  # Add black edges to bars for definition
                 alpha=0.7)

    # 定义kde线
    kde_line = hist_plot.get_lines()[0]  # Access the KDE line
    kde_line.set_color("black")  # Set KDE line color to black
    kde_line.set_linewidth(2.5)  # Thicker line
    kde_line.set_alpha(0.8)  # Slight transparency

    # 使用自定义标题或自动生成标题
    chart_title = title if title else f"{target_col} 分布直方图"
    plt.title(chart_title)
    plt.xlabel(target_col)
    plt.ylabel("频次")

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.show()
    plt.close()

    return {"plot": plot_data, "column_used": target_col}


if __name__ == '__main__':
    x = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    generate_histogram(x , "URXDEA")