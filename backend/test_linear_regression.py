"""
简化的API测试脚本 - 只测试线性回归
"""
import requests

BASE_URL = "http://127.0.0.1:5000"

# 创建测试数据
test_csv_content = """x,y
1,2.1
2,3.9
3,6.2
4,7.8
5,10.1"""

test_file_path = "test_regression.csv"
with open(test_file_path, 'w', encoding='utf-8') as f:
    f.write(test_csv_content)

try:
    with open(test_file_path, 'rb') as f:
        files = {'file': ('test_regression.csv', f, 'text/csv')}
        data = {
            'x_var': 'x',
            'y_var': 'y'
        }
        response = requests.post(f"{BASE_URL}/linearRegression", files=files, data=data)
    
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.text}")
    
    import os
    os.remove(test_file_path)
    
except Exception as e:
    print(f"错误: {e}")
    import os
    if os.path.exists(test_file_path):
        os.remove(test_file_path)
