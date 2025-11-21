"""
测试智能类型检测功能
创建不同类型的测试数据，验证类型检测是否准确
"""
import pandas as pd
import numpy as np
import os
import sys

# 添加路径以导入模块
sys.path.insert(0, os.path.dirname(__file__))

from services.csv_service import CSVService

def create_test_csv():
    """创建包含各种类型列的测试CSV文件"""
    data = {
        # 真正的数值型列
        'age': [25, 30, 35, 28, 42, 38, 33, 29, 31, 27],
        'salary': [50000, 60000, 70000, 55000, 85000, 75000, 62000, 58000, 61000, 54000],
        'height': [170.5, 165.2, 180.3, 175.8, 168.9, 172.1, 177.5, 169.3, 173.2, 171.8],
        
        # 应该被识别为分类型的数值编码
        'gender': [1, 2, 1, 2, 1, 1, 2, 1, 2, 2],  # 1=男, 2=女
        'education_level': [1, 2, 3, 2, 4, 3, 2, 1, 3, 2],  # 1-4 教育程度
        'marital_status': [1, 2, 1, 3, 2, 1, 1, 2, 3, 2],  # 1=单身, 2=已婚, 3=离异
        'binary_flag': [0, 1, 1, 0, 1, 0, 1, 1, 0, 1],  # 0/1 二分类
        
        # 明显的分类型（字符串）
        'department': ['Engineering', 'Marketing', 'Engineering', 'Sales', 'Engineering', 
                      'Marketing', 'Sales', 'Engineering', 'Marketing', 'Sales'],
        'city': ['北京', '上海', '广州', '深圳', '北京', '上海', '广州', '深圳', '北京', '上海'],
        
        # ID类型（虽然是数字，但应该被识别为分类）
        'employee_id': [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
    }
    
    df = pd.DataFrame(data)
    test_file = 'test_type_detection.csv'
    df.to_csv(test_file, index=False, encoding='utf-8-sig')
    return test_file

def test_type_detection():
    """测试类型检测功能"""
    print("=" * 70)
    print("智能类型检测测试")
    print("=" * 70)
    
    # 创建测试文件
    test_file = create_test_csv()
    
    try:
        # 读取并分析
        with open(test_file, 'rb') as f:
            result = CSVService.parse_csv_file(f, os.path.getsize(test_file))
        
        print("\n文件信息:")
        print(f"  总行数: {result['total_rows']}")
        print(f"  总列数: {result['total_columns']}")
        
        print("\n数值型列 ({})：".format(len(result['numeric_columns'])))
        for col in result['numeric_columns']:
            print(f"  ✓ {col}")
        
        print("\n分类型列 ({})：".format(len(result['categorical_columns'])))
        for col in result['categorical_columns']:
            print(f"  ✓ {col}")
        
        print("\n列详细信息:")
        for col_info in result['columns_info']:
            col_name = col_info['name']
            col_type = col_info['data_type']
            unique_count = col_info['unique_count']
            
            if col_type == 'numeric':
                print(f"\n  [{col_name}] - 数值型")
                print(f"    唯一值数量: {unique_count}")
                print(f"    范围: {col_info.get('min_value')} - {col_info.get('max_value')}")
                print(f"    平均值: {col_info.get('mean_value', 0):.2f}")
            elif col_type == 'categorical':
                print(f"\n  [{col_name}] - 分类型")
                print(f"    唯一值数量: {unique_count}")
                top_values = col_info.get('top_values', {})
                if top_values:
                    print(f"    常见值: {', '.join([f'{k}({v})' for k, v in list(top_values.items())[:3]])}")
        
        print("\n" + "=" * 70)
        print("预期结果验证:")
        print("=" * 70)
        
        expected_numeric = {'age', 'salary', 'height'}
        expected_categorical = {'gender', 'education_level', 'marital_status', 
                               'binary_flag', 'department', 'city', 'employee_id'}
        
        actual_numeric = set(result['numeric_columns'])
        actual_categorical = set(result['categorical_columns'])
        
        print("\n数值型列检测:")
        correct_numeric = expected_numeric == actual_numeric
        if correct_numeric:
            print("  ✅ 完全正确!")
        else:
            print("  ❌ 有误差:")
            if expected_numeric - actual_numeric:
                print(f"    漏检: {expected_numeric - actual_numeric}")
            if actual_numeric - expected_numeric:
                print(f"    误判: {actual_numeric - expected_numeric}")
        
        print("\n分类型列检测:")
        correct_categorical = expected_categorical == actual_categorical
        if correct_categorical:
            print("  ✅ 完全正确!")
        else:
            print("  ❌ 有误差:")
            if expected_categorical - actual_categorical:
                print(f"    漏检: {expected_categorical - actual_categorical}")
            if actual_categorical - expected_categorical:
                print(f"    误判: {actual_categorical - expected_categorical}")
        
        print("\n" + "=" * 70)
        if correct_numeric and correct_categorical:
            print("总体结果: ✅ 所有类型检测正确!")
        else:
            print("总体结果: ⚠️  部分类型检测需要改进")
        print("=" * 70)
        
    finally:
        # 清理测试文件
        if os.path.exists(test_file):
            os.remove(test_file)
            print(f"\n已清理测试文件: {test_file}")

if __name__ == "__main__":
    test_type_detection()
