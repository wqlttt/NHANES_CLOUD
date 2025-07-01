# import os  # 导入操作系统模块，用于文件路径操作
# import pandas as pd  # 导入pandas库，用于数据处理
# from .. import config  # 从上级目录导入配置模块
#
#
# def get_nhanes_data(
#         years,  # NHANES调查年份列表（如["1999-2000", "2001-2002"]）
#         metric_prefix,  # 数据文件的前缀（如"BPX_"表示血压数据）
#         features=None,  # 可选：指定需要提取的列名列表
#         output_dir=None,  # 可选：输出目录路径
#         merge_output=False,  # 可选：是否合并所有数据
#         save_each_file=False,  # 可选：是否保存每个单独文件
# ):
#     """从NHANES数据集中提取指定指标的数据"""
#
#     # 从配置中获取基础路径
#     try:
#         basepath = config.BASE_PATH  # 尝试从配置文件加载基础路径
#     except RuntimeError as e:
#         raise RuntimeError("NHANES基础路径未配置，请先调用config.set_base_path()") from e
#     except ImportError:
#         raise RuntimeError("配置模块不可用，请确保config.py存在") from None
#
#     # 验证features参数是否包含'seqn'（NHANES唯一标识符）
#     if features is not None:
#         if "seqn" not in features:
#             raise ValueError("Features必须包含'seqn'字段")
#
#     # 检查基础路径是否存在
#     if not os.path.exists(basepath):
#         raise FileNotFoundError(f"基础路径不存在: {basepath}")
#
#     # 检查years参数是否为空
#     if not years:
#         raise ValueError("年份列表不能为空")
#
#     # 设置输出目录（默认为当前目录下的nhanes_output文件夹）
#     output_dir = output_dir or os.path.join(os.getcwd(), "nhanes_output")
#     if save_each_file:
#         os.makedirs(output_dir, exist_ok=True)  # 如果需要保存单独文件则创建目录
#
#     # 初始化数据存储
#     all_data = []  # 存储所有加载的数据框
#     search_dirs = [  # NHANES数据子目录
#         "Laboratory",  # 实验室数据
#         "Questionnaire",  # 问卷调查数据
#         "Examination",  # 体检数据
#         "Dietary",  # 饮食数据
#         "Demographics",  # 人口统计数据
#     ]
#     matched_files = []  # 存储匹配到的文件路径
#
#     # 文件搜索逻辑
#     for year in years:  # 遍历每个年份
#         for data_dir in search_dirs:  # 遍历每个数据目录
#             current_path = os.path.join(basepath, year, data_dir, "tsv")  # 构建TSV文件路径
#             if not os.path.isdir(current_path):  # 跳过不存在的目录
#                 continue
#
#             try:
#                 # 查找以metric_prefix开头且以.tsv结尾的文件
#                 files = [
#                     f
#                     for f in os.listdir(current_path)
#                     if f.startswith(metric_prefix) and f.endswith(".tsv")
#                 ]
#                 # 记录匹配的文件信息（年份、目录类型、完整路径）
#                 matched_files.extend(
#                     [(year, data_dir, os.path.join(current_path, f)) for f in files]
#                 )
#             except Exception as e:
#                 print(f"文件扫描错误: {current_path} - {str(e)}")
#
#     # 数据处理逻辑
#     for year, data_dir, file_path in matched_files:
#         try:
#             df = pd.read_csv(file_path, sep="\t", low_memory=False)  # 读取TSV文件
#             df.loc[:, 'seqn'] = df['seqn'].astype(str) + "_" + year.split("-")[0]
#
#             # 列验证
#             if features is None:  # 如果未指定features，则选择所有列
#                 if "seqn" not in df.columns:  # 必须包含seqn列
#                     continue
#                 selected_columns = df.columns.tolist()
#             else:  # 检查指定的features是否存在
#                 missing = [col for col in features if col not in df.columns]
#                 if missing:  # 跳过缺失关键列的文件
#                     continue
#                 selected_columns = features
#
#             # 保存单独文件（如果需要）
#             if save_each_file:
#                 output_name = f"{year}_{data_dir}_{metric_prefix}.csv"  # 生成输出文件名
#
#                 df[selected_columns].to_csv(
#                     os.path.join(output_dir, output_name), index=False  # 保存为CSV
#                 )
#
#             # 确保'seqn'列存在且year是字符串
#             if 'seqn' in selected_columns and isinstance(year, str):
#                 # 在seqn后追加年份（如"12345_1999"）
#                 # df.loc[:, 'seqn'] = df['seqn'].astype(str) + "_" + year.split("-")[0]
#                 # 将处理后的数据加入列表
#                 all_data.append(df[selected_columns])
#
#             else:
#                 print("错误: 选择的列中缺少'seqn'或year不是字符串")
#
#         except Exception as e:
#             print(f"数据处理失败: {file_path} - {str(e)}")
#
#     # 合并最终数据
#     if merge_output:
#         merged_df = pd.concat(all_data, ignore_index=True)  # 合并所有数据框
#         return merged_df  # 返回合并后的DataFrame
#     return pd.DataFrame()  # 如果没有数据则返回空DataFrame

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