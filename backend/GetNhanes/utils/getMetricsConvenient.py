
import os
import pandas as pd
from .. import config



def get_nhanes_data(
    years,
    metric_prefix,
    features=None,
    output_dir=None,
    merge_output=False,
    save_each_file=False,
):
    """
    Extract and merge specified metric data from NHANES dataset.

    Args:
        years: List of years to process (e.g., ['2007-2008', '2009-2010'])
        features: Features to extract (None for all columns, must include 'seqn')
        metric_prefix: Target metric filename prefix (e.g., 'DEET')
        output_dir: Output directory (default: ./nhanes_output)
        merge_output: Whether to merge all files (default: False)
        save_each_file: Whether to save files (default: False)

    Returns:
        pd.DataFrame: Merged dataset

    Raises:
        ValueError: When parameter validation fails
        FileNotFoundError: When base path doesn't exist
        RuntimeError: When base directory is not configured
    """
    # Get base directory from config
    try:
        basepath = config.BASE_PATH  # 自动从配置文件加载或使用已设置的路径
    except RuntimeError as e:
        raise RuntimeError("NHANES基础路径未配置，请先调用config.set_base_path()") from e
    except ImportError:
        raise RuntimeError("配置模块不可用，请确保config.py存在") from None
    if features is not None:
        # if not features:
        #     raise ValueError("Features list cannot be empty.")
        if "seqn" not in features:
            raise ValueError("Features must include 'seqn'.")
    if not os.path.exists(basepath):
        raise FileNotFoundError(f"Base path not found: {basepath}")
    if not years:
        raise ValueError("Years list cannot be empty.")

    # Set output directory
    output_dir = output_dir or os.path.join(os.getcwd(), "nhanes_output")
    if save_each_file:
        os.makedirs(output_dir, exist_ok=True)

    # Initialize data storage
    all_data = []
    search_dirs = [
        "Laboratory",
        "Questionnaire",
        "Examination",
        "Dietary",
        "Demographics",
    ]
    matched_files = []

    # File search logic
    for year in years:
        for data_dir in search_dirs:
            current_path = os.path.join(basepath, year, data_dir, "tsv")
            if not os.path.isdir(current_path):
                continue

            try:
                files = [
                    f
                    for f in os.listdir(current_path)
                    if f.startswith(metric_prefix) and f.endswith(".tsv")
                ]
                matched_files.extend(
                    [(year, data_dir, os.path.join(current_path, f)) for f in files]
                )
            except Exception as e:
                print(f"File scanning error: {current_path} - {str(e)}")

    # Data processing logic
    for year, data_dir, file_path in matched_files:
        try:
            df = pd.read_csv(file_path, sep="\t", low_memory=False)
            # 新增: 确保seqn是整数类型
            if 'seqn' in df.columns:
                # 先转换为数值类型处理NaN
                df['seqn'] = pd.to_numeric(df['seqn'], errors='coerce')
                # 填充缺失值（使用-1标记缺失）
                df['seqn'] = df['seqn'].fillna(-1)
                # 转为整数
                df['seqn'] = df['seqn'].astype('int64')

            # Column validation
            if features is None:
                if "seqn" not in df.columns:
                    continue
                selected_columns = df.columns.tolist()
            else:
                missing = [col for col in features if col not in df.columns]
                if missing:
                    continue
                selected_columns = features

            # Save individual file
            if save_each_file:
                output_name = f"{year}_{data_dir}_{metric_prefix}.csv"
                df[selected_columns].to_csv(
                    os.path.join(output_dir, output_name), index=False
                )

            # 确保 'seqn' 列存在且 year 是字符串
            if 'seqn' in selected_columns and isinstance(year, str):
                # 直接操作原始 DataFrame 的 'seqn' 列
                df.loc[:, 'seqn'] = df['seqn'].astype(str) + "_" + year.split("-")[0]
                # Merge data
                all_data.append(df[selected_columns])
            else:
                print("Error: 'seqn' column not found in selected_columns or year is not a string")

        except Exception as e:
            print(f"Data processing failed: {file_path} - {str(e)}")

    # Merge final data
    if all_data:
        merged_df = pd.concat(all_data, ignore_index=True)
        if save_each_file and merge_output:
            year_range = (
                f"{min(y.split('-')[0] for y in years)}-"
                f"{max(y.split('-')[-1] for y in years)}"
            )
        return merged_df
    return pd.DataFrame()