"""
Utils package initialization.
Exposes convenient functions from submodules.
"""

from .getMetricsConvenient import *  # 导入所有来自getMetricsConvenient的功能

# 显式声明公开接口
__all__ = [
    "get_nhanes_data"
]

# 可选：添加包版本信息
__version__ = '0.1.0'