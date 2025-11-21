"""
数据提取相关路由
"""
from flask import Blueprint, request, jsonify
import os
import json

extraction_bp = Blueprint('data_extraction', __name__)


@extraction_bp.route('/process_nhanes', methods=['POST'])
def process_nhanes():
    """NHANES数据提取接口"""
    try:
        # 检查get_nhanes_data函数是否可用
        if 'get_nhanes_data' not in globals():
            return jsonify({
                'success': False,
                'error': 'NHANES数据提取功能不可用，请检查系统配置'
            }), 500

        # 检查配置状态
        try:
            from GetNhanes import config
            base_path = config.get_base_path()
            if not os.path.exists(base_path):
                return jsonify({
                    'success': False,
                    'error': f'NHANES数据路径不存在: {base_path}，请检查配置'
                }), 500
        except Exception as config_error:
            return jsonify({
                'success': False,
                'error': f'NHANES数据路径配置错误: {config_error}'
            }), 500

        data = request.json
        items = data.get('items', [])

        if not items:
            return jsonify({
                'success': False,
                'error': '没有提供要处理的数据项'
            }), 400

        # 导入get_nhanes_data
        from GetNhanes.utils.getMetricsConvenient import get_nhanes_data

        years = [str(item['year']).strip() for item in items if 'year' in item and str(item['year']).strip()]
        if not years:
            return jsonify({'success': False, 'error': '未提供有效年份'}), 400

        metricName = items[0].get('file', '').strip()
        indicator_str = items[0].get('indicator', '').strip()
        if not metricName:
            return jsonify({'success': False, 'error': '未提供文件名前缀(file)'}), 400
        if not indicator_str:
            return jsonify({'success': False, 'error': '未提供指标列表(indicator)'}), 400

        # 隐式功能：如果文件名是大写，自动转换为小写
        original_metric_name = metricName
        if metricName.isupper():
            metricName = metricName.lower()
            print(f"隐式转换: 文件名从 '{original_metric_name}' 转换为 '{metricName}'")

        features = [f.strip() for f in indicator_str.split(',') if f.strip()]

        print(f"处理数据提取请求(合并模式): 年份={years}, 特征={features}, 文件名={metricName}")

        result = get_nhanes_data(
            years=years,
            features=features,
            metric_prefix=metricName,
            merge_output=True,
            save_each_file=True
        )

        # Convert result to CSV
        if hasattr(result, 'to_csv'):
            csv_data = result.to_csv(index=False)
        elif hasattr(result, 'to_string'):
            csv_data = result.to_string()
        else:
            csv_data = str(result)

        print(f"成功处理(合并): years={years}, file={metricName}")

        # 生成建议文件名
        try:
            start_year = min(int(y.split('-')[0]) for y in years)
            end_year = max(int(y.split('-')[-1]) for y in years)
            suggested_filename = f"{start_year}-{end_year}_{metricName}.csv"
        except Exception:
            suggested_filename = f"{metricName}.csv"

        return jsonify({
            'success': True,
            'results': [{
                'years': years,
                'file': metricName,
                'indicator': indicator_str,
                'result': csv_data
            }],
            'csv_data': csv_data,
            'suggested_filename': suggested_filename
        })
    except Exception as e:
        import traceback
        print("自定义提取处理错误:")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@extraction_bp.route('/search_variables', methods=['POST'])
def search_variables():
    """变量搜索接口"""
    try:
        data = request.json
        query = data.get('query', '').strip().lower()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400

        # Path to varLabel.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(os.path.dirname(current_dir), 'varLabel.json')
        
        if not os.path.exists(json_path):
             return jsonify({
                'success': False,
                'error': f'Variable definition file not found at {json_path}'
            }), 500

        # Read the JSON file
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                all_variables = json.load(f)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to read variable definition file: {str(e)}'
            }), 500

        # Filter data
        results = []
        count = 0
        
        for item in all_variables:
            if (query in (item.get('variable') or '').lower() or 
                query in (item.get('label') or '').lower() or 
                query in (item.get('description') or '').lower()):
                
                results.append(item)
                count += 1
                
                if count >= 100:
                    break
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })

    except Exception as e:
        import traceback
        print(f"Error searching variables: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
