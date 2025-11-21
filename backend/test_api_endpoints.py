"""
完整的API端点测试脚本
测试所有重构后的API端点
"""
import requests
import json
import os

BASE_URL = "http://127.0.0.1:5000"

def print_section(title):
    """打印分节标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_health_check():
    """测试健康检查端点"""
    print("\n[1/12] 测试健康检查端点 (GET /health)")
    try:
        response = requests.get(f"{BASE_URL}/health")
        result = response.json()
        success = response.status_code == 200 and result.get('status') == 'healthy'
        print(f"  状态码: {response.status_code}")
        print(f"  响应: {result}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        return False

def test_csv_upload():
    """测试CSV文件上传端点"""
    print("\n[2/12] 测试CSV文件上传 (POST /get_csvfile)")
    
    test_csv = """name,age,salary,department
Alice,25,50000,Engineering
Bob,30,60000,Marketing
Charlie,35,70000,Engineering
David,28,55000,Sales"""
    
    test_file = "test_upload.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            response = requests.post(f"{BASE_URL}/get_csvfile", files=files)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  行数: {result.get('file_stats', {}).get('total_rows')}")
        print(f"  列数: {result.get('file_stats', {}).get('total_columns')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_histogram():
    """测试直方图生成"""
    print("\n[3/12] 测试直方图生成 (POST /generate_visualization - histogram)")
    
    test_csv = """value
10
15
20
25
30
35
40"""
    
    test_file = "test_histogram.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'histogram',
                'x_var': 'value',
                'color': '#0062FF',
                'title': 'Test Histogram'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_scatter():
    """测试散点图生成"""
    print("\n[4/12] 测试散点图生成 (POST /generate_visualization - scatter)")
    
    test_csv = """x,y
1,2
2,4
3,6
4,8
5,10"""
    
    test_file = "test_scatter.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'scatter',
                'x_var': 'x',
                'y_var': 'y',
                'color': '#FF6B6B',
                'title': 'Test Scatter Plot'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_boxplot():
    """测试箱线图生成"""
    print("\n[5/12] 测试箱线图生成 (POST /generate_visualization - boxplot)")
    
    test_csv = """category,value
A,10
A,15
A,20
B,25
B,30
B,35"""
    
    test_file = "test_boxplot.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'boxplot',
                'x_var': 'category',
                'y_var': 'value',
                'color': '#4ECDC4',
                'title': 'Test Boxplot'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_linear_regression():
    """测试线性回归分析"""
    print("\n[6/12] 测试线性回归分析 (POST /linearRegression)")
    
    test_csv = """x,y
1,2.1
2,3.9
3,6.2
4,7.8
5,10.1
6,12.3
7,13.8
8,16.2"""
    
    test_file = "test_linear.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'x_var': 'x',
                'y_var': 'y'
            }
            response = requests.post(f"{BASE_URL}/linearRegression", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  R²: {result.get('r_squared')}")
        print(f"  回归类型: {result.get('regression_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_logistic_regression():
    """测试逻辑回归分析"""
    print("\n[7/12] 测试逻辑回归分析 (POST /logisticRegression)")
    
    test_csv = """x,y
1,0
2,0
3,0
4,1
5,1
6,1
7,1
8,1"""
    
    test_file = "test_logistic.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'x_var': 'x',
                'y_var': 'y'
            }
            response = requests.post(f"{BASE_URL}/logisticRegression", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  准确率: {result.get('accuracy')}")
        print(f"  回归类型: {result.get('regression_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_correlation_heatmap():
    """测试相关性热图"""
    print("\n[8/12] 测试相关性热图 (POST /generate_visualization - correlation_heatmap)")
    
    test_csv = """var1,var2,var3
1,2,3
2,4,6
3,6,9
4,8,12
5,10,15"""
    
    test_file = "test_corr.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'correlation_heatmap',
                'columns': 'var1,var2,var3',
                'method': 'pearson',
                'title': 'Test Correlation Heatmap'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_qqplot():
    """测试QQ图"""
    print("\n[9/12] 测试QQ图 (POST /generate_visualization - qqplot)")
    
    test_csv = """value
1.2
2.3
3.1
4.5
5.2
6.1
7.3
8.2"""
    
    test_file = "test_qq.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'qqplot',
                'x_var': 'value',
                'distribution': 'norm',
                'color': '#9B59B6',
                'title': 'Test QQ Plot'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_barplot():
    """测试条形图"""
    print("\n[10/12] 测试条形图 (POST /generate_visualization - barplot)")
    
    test_csv = """category
A
A
B
B
B
C"""
    
    test_file = "test_bar.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'barplot',
                'x_var': 'category',
                'color': '#E74C3C',
                'title': 'Test Bar Plot',
                'show_percentage': 'true'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_violinplot():
    """测试小提琴图"""
    print("\n[11/12] 测试小提琴图 (POST /generate_visualization - violinplot)")
    
    test_csv = """group,value
A,10
A,15
A,20
A,25
B,30
B,35
B,40
B,45"""
    
    test_file = "test_violin.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'violinplot',
                'x_var': 'group',
                'y_var': 'value',
                'color': '#3498DB',
                'title': 'Test Violin Plot'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def test_jointplot():
    """测试联合分布图"""
    print("\n[12/12] 测试联合分布图 (POST /generate_visualization - jointplot)")
    
    test_csv = """x,y
1,2
2,4
3,6
4,8
5,10
6,12
7,14"""
    
    test_file = "test_joint.csv"
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write(test_csv)
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {
                'chart_type': 'jointplot',
                'x_var': 'x',
                'y_var': 'y',
                'color': '#2ECC71',
                'title': 'Test Joint Plot'
            }
            response = requests.post(f"{BASE_URL}/generate_visualization", files=files, data=data)
        
        result = response.json()
        success = response.status_code == 200 and result.get('success') == True
        print(f"  状态码: {response.status_code}")
        print(f"  成功: {result.get('success')}")
        print(f"  图表类型: {result.get('chart_type')}")
        print(f"  结果: {'✅ 通过' if success else '❌ 失败'}")
        
        os.remove(test_file)
        return success
    except Exception as e:
        print(f"  ❌ 错误: {e}")
        if os.path.exists(test_file):
            os.remove(test_file)
        return False

def run_all_tests():
    """运行所有测试"""
    print_section("开始完整API端点测试")
    
    tests = [
        ("健康检查", test_health_check),
        ("CSV文件上传", test_csv_upload),
        ("直方图生成", test_histogram),
        ("散点图生成", test_scatter),
        ("箱线图生成", test_boxplot),
        ("线性回归分析", test_linear_regression),
        ("逻辑回归分析", test_logistic_regression),
        ("相关性热图", test_correlation_heatmap),
        ("QQ图", test_qqplot),
        ("条形图", test_barplot),
        ("小提琴图", test_violinplot),
        ("联合分布图", test_jointplot),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n  ❌ {test_name} 测试异常: {e}")
            results[test_name] = False
    
    # 打印测试总结
    print_section("测试总结")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ 通过" if result else "❌ 失败"
        print(f"  {test_name:20s}: {status}")
    
    print(f"\n  总计: {passed}/{total} 测试通过 ({passed/total*100:.1f}%)")
    print('='*60)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
