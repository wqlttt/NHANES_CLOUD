"""
CSV文件处理服务
"""
import pandas as pd
import numpy as np
from utils.serialization import convert_to_serializable
from config import MAX_FILE_SIZE


class CSVService:
    """CSV文件处理服务类"""
    
    @staticmethod
    def parse_csv_file(file, file_length):
        """
        解析CSV文件并返回详细信息
        
        Args:
            file: Flask FileStorage对象
            file_length: 文件大小（字节）
            
        Returns:
            dict: 包含文件统计信息、列信息、预览数据等
            
        Raises:
            ValueError: 文件为空或格式错误
            pd.errors.ParserError: CSV解析错误
            UnicodeDecodeError: 编码错误
        """
        # Read the CSV file into a DataFrame while preserving NA values
        df = pd.read_csv(file, keep_default_na=True)
        
        # 基本信息检查
        if df.empty:
            raise ValueError("CSV文件为空")
        
        # 使用智能类型检测
        numeric_columns, categorical_columns, datetime_columns = CSVService._intelligent_type_detection(df)
        
        # 计算基本统计信息
        file_stats = {
            "total_rows": int(len(df)),
            "total_columns": int(len(df.columns)),
            "numeric_columns_count": int(len(numeric_columns)),
            "categorical_columns_count": int(len(categorical_columns)),
            "datetime_columns_count": int(len(datetime_columns)),
            "missing_values_total": int(df.isnull().sum().sum()),
            "file_size": int(file_length)
        }
        
        # 列信息详细分析
        columns_info = CSVService._get_columns_info(df, numeric_columns, categorical_columns, datetime_columns)
        
        # 数据预览（前100行）
        preview_df = df.head(100)
        cleaned_preview_df = preview_df.replace([np.nan, pd.NaT], None)
        
        # 如果数据量太大，只返回预览数据
        if len(df) > 1000:
            full_df = df.head(1000)
            cleaned_full_df = full_df.replace([np.nan, pd.NaT], None)
            data_truncated = True
        else:
            cleaned_full_df = df.replace([np.nan, pd.NaT], None)
            data_truncated = False
        
        return {
            "file_stats": file_stats,
            "columns": df.columns.tolist(),
            "columns_info": columns_info,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "datetime_columns": datetime_columns,
            "preview_data": cleaned_preview_df.to_dict(orient='records'),
            "full_data": cleaned_full_df.to_dict(orient='records'),
            "data_truncated": data_truncated,
            "total_rows": len(df),
            "total_columns": len(df.columns)
        }
    
    @staticmethod
    def _intelligent_type_detection(df):
        """
        智能检测列的数据类型 - 基于数据值的实际特征
        
        核心思想：分析数据值本身的特征，而不仅仅依赖统计和关键词
        
        判断规则：
        1. 非数值型 (object/category) → 分类型
        2. datetime → 日期时间型
        3. 数值型进一步分析：
           - 检查数据值的实际范围和分布
           - 小范围的离散整数 (如1-10的性别、年龄组) → 分类型
           - 大范围的数值 (如薪水、ID) → 数值型
           - 浮点数且不是整数伪装 → 数值型
        
        Returns:
            tuple: (numeric_columns, categorical_columns, datetime_columns)
        """
        numeric_columns = []
        categorical_columns = []
        datetime_columns = []
        
        # 分类型强提示词（这些词几乎肯定是分类）
        strong_categorical_keywords = [
            'gender', 'sex', 'race', 'ethnicity', 
            'marital', 'status', 'type', 'category',
            'flag', 'indicator', 'binary', 'is_', 'has_'
        ]
        
        for col in df.columns:
            col_dtype = df[col].dtype
            col_lower = col.lower()
            
            # 1. 明确的分类型
            if col_dtype in ['object', 'category', 'bool']:
                categorical_columns.append(col)
                continue
            
            # 2. 日期时间型
            if pd.api.types.is_datetime64_any_dtype(col_dtype):
                datetime_columns.append(col)
                continue
            
            # 3. 数值型需要基于数据值特征判断
            if pd.api.types.is_numeric_dtype(col_dtype):
                non_null_values = df[col].dropna()
                
                if len(non_null_values) == 0:
                    categorical_columns.append(col)
                    continue
                
                unique_count = df[col].nunique(dropna=True)
                total_count = len(non_null_values)
                
                # 检查是否全是整数
                is_integer_type = pd.api.types.is_integer_dtype(col_dtype)
                if not is_integer_type and pd.api.types.is_float_dtype(col_dtype):
                    # float类型检查是否实际上都是整数值
                    is_integer_type = (non_null_values == non_null_values.astype(int)).all()
                
                # 获取数据范围
                min_val = non_null_values.min()
                max_val = non_null_values.max()
                value_range = max_val - min_val
                
                # 判断逻辑
                is_categorical = False
                
                # 强分类关键词优先（包括ID类列）
                if any(keyword in col_lower for keyword in strong_categorical_keywords):
                    if unique_count <= 100:  # 关键词暗示分类，且唯一值不太多
                        is_categorical = True
                # 特殊检查：列名包含'id'且唯一值数量很高（可能是标识符）
                elif 'id' in col_lower and unique_count >= total_count * 0.8:
                    # 如果80%以上的值都是唯一的，这很可能是ID列
                    is_categorical = True
                
                # 基于数据值特征判断
                elif is_integer_type:
                    # 整数类型的判断
                    
                    # 规则1: 二分类 (0/1)
                    if unique_count == 2:
                        unique_vals = set(non_null_values.unique())
                        if unique_vals.issubset({0, 1}):
                            is_categorical = True
                    
                    # 规则2: 唯一值很少 (<=5)，几乎肯定是分类
                    elif unique_count <= 5:
                        is_categorical = True
                    
                    # 规则3: 唯一值6-10个，检查值的范围
                    elif unique_count <= 10:
                        # 特殊情况：如果唯一值数量等于总行数（每个值都不同），这通常是数值型
                        # 例如小数据集中的age列
                        # 但排除值范围很小的情况（可能是序号或编号）
                        if unique_count == total_count:
                            # 如果值范围很大（相对于唯一值数量），是数值型
                            # 如果值看起来像连续的序号（如1,2,3...或1001,1002,1003...），是分类
                            if value_range == unique_count - 1:
                                # 连续序列，可能是ID
                                is_categorical = True
                            else:
                                # 非连续，是真正的数值
                                is_categorical = False
                        # 如果值都在小范围内（如1-10），是分类
                        # 如果值很大（如1001-1010），可能是ID，归为数值
                        elif value_range < 20 and min_val >= 0:
                            is_categorical = True
                        # 如果最小值很大（>100），即使唯一值少，也可能是数值（如部门代码101,102,103）
                        elif min_val > 100:
                            is_categorical = False
                    
                    # 规则4: 唯一值占比很小 (<2%)，且唯一值不超过50
                    elif unique_count <= 50 and (unique_count / total_count) < 0.02:
                        # 大数据集中的少量唯一值，可能是分类
                        # 但如果值范围很大，可能是ID或编码，归为数值
                        if value_range < 200:
                            is_categorical = True
                
                else:
                    # 浮点数类型
                    # 如果真的有小数（不是伪装的整数），通常是数值型
                    # 唯一例外：只有很少几个特定值（如0.0, 0.5, 1.0）
                    if unique_count <= 10:
                        # 检查是否是特定的离散值（可能是评分等级）
                        if value_range <= 10:
                            is_categorical = True
                
                if is_categorical:
                    categorical_columns.append(col)
                else:
                    numeric_columns.append(col)
            else:
                # 其他类型归为分类型
                categorical_columns.append(col)
        
        return numeric_columns, categorical_columns, datetime_columns
    
    @staticmethod
    def _get_columns_info(df, numeric_columns, categorical_columns, datetime_columns):
        """获取列的详细信息"""
        columns_info = []
        for col in df.columns:
            col_info = {
                "name": col,
                "type": str(df[col].dtype),
                "non_null_count": int(df[col].count()),
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
            }
            
            # 如果是数值列，添加统计信息
            if col in numeric_columns:
                col_info.update({
                    "data_type": "numeric",
                    "min_value": convert_to_serializable(df[col].min()),
                    "max_value": convert_to_serializable(df[col].max()),
                    "mean_value": convert_to_serializable(df[col].mean()),
                    "std_value": convert_to_serializable(df[col].std()),
                })
            elif col in categorical_columns:
                top_values_dict = {}
                if not df[col].empty:
                    value_counts = df[col].value_counts().head(5)
                    top_values_dict = {str(k): convert_to_serializable(v) for k, v in value_counts.items()}
                
                col_info.update({
                    "data_type": "categorical",
                    "top_values": top_values_dict
                })
            elif col in datetime_columns:
                col_info.update({
                    "data_type": "datetime"
                })
            else:
                col_info.update({
                    "data_type": "other"
                })
            
            columns_info.append(col_info)
        
        return columns_info
    
    @staticmethod
    def get_file_columns(file):
        """
        快速获取CSV文件的列信息（读取全部数据以准确判断类型）
        
        Args:
            file: Flask FileStorage对象
            
        Returns:
            dict: 包含列名、类型等信息
        """
        # 读取完整数据以准确判断类型
        df = pd.read_csv(file)
        
        # 使用智能类型检测
        numeric_columns, categorical_columns, datetime_columns = CSVService._intelligent_type_detection(df)
        all_columns = df.columns.tolist()
        
        # 为前端下拉框准备选项格式
        column_options = []
        for col in all_columns:
            col_type = "other"
            if col in numeric_columns:
                col_type = "numeric"
            elif col in categorical_columns:
                col_type = "categorical"
            elif col in datetime_columns:
                col_type = "datetime"
            
            column_options.append({
                "value": col,
                "label": col,
                "type": col_type,
                "description": f"{col} ({col_type})"
            })
        
        return {
            "columns": all_columns,
            "column_options": column_options,
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "datetime_columns": datetime_columns,
            "total_columns": len(all_columns)
        }
    
    @staticmethod
    def get_csv_info_simple(file):
        """
        简化版本的CSV文件信息获取，专门用于调试工具
        
        Args:
            file: Flask FileStorage对象
            
        Returns:
            dict: 简化的文件信息
        """
        df = pd.read_csv(file)
        
        if df.empty:
            raise ValueError("CSV文件为空")
        
        # 获取列信息
        columns = df.columns.tolist()
        dtypes = [str(dtype) for dtype in df.dtypes]
        unique_counts = [int(df[col].nunique()) for col in columns]
        
        # 获取样本值
        sample_values = []
        for col in columns:
            unique_vals = df[col].dropna().unique()
            if len(unique_vals) > 5:
                sample_vals = unique_vals[:5].tolist()
            else:
                sample_vals = unique_vals.tolist()
            sample_values.append([str(v) for v in sample_vals])
        
        # 预览数据
        preview = df.head(5).to_dict(orient='records')
        
        return {
            "columns": columns,
            "dtypes": dtypes,
            "unique_counts": unique_counts,
            "sample_values": sample_values,
            "rows_count": len(df),
            "preview": preview
        }
