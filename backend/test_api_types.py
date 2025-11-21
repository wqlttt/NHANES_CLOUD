"""
简单的API测试 - 测试类型检测
"""
import requests
import json

# 上传测试文件
with open('test_mixed_types.csv', 'rb') as f:
    files = {'file': ('test_mixed_types.csv', f, 'text/csv')}
    response = requests.post('http://127.0.0.1:5000/get_csvfile', files=files)

print("=" * 70)
print("类型检测结果")
print("=" * 70)

result = response.json()

if result.get('success'):
    print(f"\n✅ 文件上传成功: {result.get('filename')}")
    print(f"总行数: {result.get('total_rows')}")
    print(f"总列数: {result.get('total_columns')}")
    
    print(f"\n数值型列 ({len(result.get('numeric_columns', []))}):")
    for col in result.get('numeric_columns', []):
        print(f"  • {col}")
    
    print(f"\n分类型列 ({len(result.get('categorical_columns', []))}):")
    for col in result.get('categorical_columns', []):
        print(f"  • {col}")
    
    print("\n详细列信息:")
    for col_info in result.get('columns_info', []):
        print(f"\n  [{col_info['name']}]")
        print(f"    类型: {col_info['data_type']}")
        print(f"    唯一值: {col_info['unique_count']}")
        if col_info['data_type'] == 'numeric':
            print(f"    范围: {col_info.get('min_value')} - {col_info.get('max_value')}")
        elif col_info['data_type'] == 'categorical':
            top = col_info.get('top_values', {})
            if top:
                print(f"    常见值: {', '.join(list(top.keys())[:3])}")
    
    print("\n" + "=" * 70)
    print("预期验证:")
    print("=" * 70)
    
    expected_numeric = ['age', 'salary', 'height']
    expected_categorical = ['name', 'gender', 'education_level', 'marital_status', 
                           'binary_flag', 'department', 'city', 'employee_id']
    
    actual_numeric = result.get('numeric_columns', [])
    actual_categorical = result.get('categorical_columns', [])
    
    numeric_correct = set(expected_numeric) == set(actual_numeric)
    categorical_correct = set(expected_categorical) == set(actual_categorical)
    
    print(f"\n数值型检测: {'✅ 正确' if numeric_correct else '❌ 有误'}")
    if not numeric_correct:
        missing = set(expected_numeric) - set(actual_numeric)
        extra = set(actual_numeric) - set(expected_numeric)
        if missing:
            print(f"  漏检: {missing}")
        if extra:
            print(f"  误判为数值型: {extra}")
    
    print(f"\n分类型检测: {'✅ 正确' if categorical_correct else '❌ 有误'}")
    if not categorical_correct:
        missing = set(expected_categorical) - set(actual_categorical)
        extra = set(actual_categorical) - set(expected_categorical)
        if missing:
            print(f"  漏检: {missing}")
        if extra:
            print(f"  误判为分类型: {extra}")
    
    if numeric_correct and categorical_correct:
        print("\n" + "=" * 70)
        print("✅ 所有类型检测完全正确!")
        print("=" * 70)
else:
    print(f"❌ 错误: {result.get('error')}")
