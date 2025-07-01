import pandas as pd
import seaborn as sns
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def generate_heatmap(csv_data, x_var, y_var, color='#3b82f6', title=None):
    """
    Generate a heatmap from CSV data and return as base64 image.

    Args:
        csv_data: File-like object or path to CSV.
        x_var: x-axis variable name
        y_var: y-axis variable name
        color: hex color code (default: '#3b82f6')
        title: Custom title for the heatmap. If None, auto-generates title.

    Returns:
        dict: {"plot": base64_image, "x_var": str, "y_var": str}

    Raises:
        ValueError: If specified columns don't exist
    """
    # Read CSV data
    data = pd.read_csv(csv_data)

    # Check if columns exist
    if x_var not in data.columns or y_var not in data.columns:
        raise ValueError(f"Columns {x_var} or {y_var} not found in CSV")

    # Prepare data for heatmap
    # heatmap_data = data.pivot_table(index=y_var, columns=x_var, aggfunc='size', fill_value=0)

    # Create plot
    plt.figure()
    # sns.heatmap(heatmap_data, annot=annot, fmt='d', cmap=cmap)
    sns.jointplot(x=data[x_var], y=data[y_var], kind="hex", color=color)
    plt.xlabel(x_var)
    plt.ylabel(y_var)
    
    # 使用自定义标题或自动生成标题
    chart_title = title if title else f"{x_var} vs {y_var} 热力图"
    plt.title(chart_title)

    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.show()
    plt.close()

    return {
        "plot": plot_data,
        "x_var": x_var,
        "y_var": y_var
    }

if __name__ == '__main__':
    # Example usage
    csv_path = "E:\\NHANES_DATA\\2025_02_07\\Final_DEET_data_clean_01_07.csv"
    result = generate_heatmap(csv_path, "URXDEA", "age")
    print(f"Heatmap generated for {result['x_var']} vs {result['y_var']}")
