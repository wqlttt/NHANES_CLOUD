import pandas as pd
import seaborn as sns
import io
import base64
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt


def generate_scatterplot(csv_data, x_column=None, y_column=None, color='#0062FF', title=None):
    """
    Generate a scatter plot from CSV data using seaborn and return as base64 image.
    Args:
        csv_data: File-like object or path to CSV.
        x_column: Optional specific column for x-axis. If None, uses the first numeric column.
        y_column: Optional specific column for y-axis. If None, uses the second numeric column.
        color: Color for the scatter points. Default is '#0062FF'.
        title: Custom title for the scatter plot. If None, auto-generates title.
    Returns:
        dict: {"plot": base64_image, "x_column": str, "y_column": str}
    Raises:
        ValueError: If not enough numeric columns exist.
    """
    df = pd.read_csv(csv_data)
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) < 2:
        raise ValueError("Need at least 2 numeric columns to plot")

    x_col = x_column if x_column else numeric_cols[0]
    y_col = y_column if y_column else numeric_cols[1]

    plt.figure()
    scatter_plot = sns.scatterplot(
        data=df,
        x=x_col,
        y=y_col,
        color=color,  # Use custom color
        alpha=0.7,
        edgecolor="black"
    )

    # Add regression line
    sns.regplot(
        data=df,
        x=x_col,
        y=y_col,
        scatter=False,
        color="black",
        line_kws={'linewidth': 2.5, 'alpha': 0.8}
    )

    # 使用自定义标题或自动生成标题
    chart_title = title if title else f"{x_col} vs {y_col} 散点图"
    plt.title(chart_title)
    plt.xlabel(x_col)
    plt.ylabel(y_col)
    plt.grid(True, linestyle='--', alpha=0.5)

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {"plot": plot_data, "x_column": x_col, "y_column": y_col}


if __name__ == '__main__':
    x = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    generate_scatterplot(x, "URXDEA", "URXDEB")
