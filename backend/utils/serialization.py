"""
JSON序列化辅助函数
"""
import numpy as np
import pandas as pd


def convert_to_serializable(obj):
    """将pandas/numpy数据类型转换为JSON可序列化的Python原生类型"""
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        val = float(obj)
        # 处理无穷大和NaN值
        if np.isinf(val):
            return None  # 或者返回一个大数值，如 999999
        elif np.isnan(val):
            return None
        return val
    elif isinstance(obj, np.ndarray):
        return [convert_to_serializable(item) for item in obj.tolist()]
    elif pd.isna(obj) or obj != obj:  # 检查NaN
        return None
    elif obj == float('inf') or obj == float('-inf'):
        return None  # 处理Python的无穷大
    return obj
