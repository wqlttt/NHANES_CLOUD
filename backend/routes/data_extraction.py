"""
数据提取相关路由
"""
from flask import Blueprint, request, jsonify
import os
import sys
import json
import math
import pandas as pd
import numpy as np

# 尝试加载NHANES数据提取核心函数
try:
    from GetNhanes.utils.getMetricsConvenient import get_nhanes_data
    print("数据提取模块: 成功导入get_nhanes_data")
except Exception as e:
    get_nhanes_data = None
    print(f"数据提取模块: 无法导入get_nhanes_data，功能将不可用: {e}")

extraction_bp = Blueprint('data_extraction', __name__)

# 目录常量
_ROUTES_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_ROUTES_DIR)
_RESULT_DATA_DIR = os.path.join(_BACKEND_ROOT, 'Dataresource', 'ResultData')
_MORT_DATA_DIR = os.path.join(_BACKEND_ROOT, 'Dataresource', 'MortData')
_DEFAULT_PAGE_SIZE = 10
_NHANES_SEARCH_DIRS = ["Laboratory", "Questionnaire", "Examination", "Dietary", "Demographics"]


def _get_available_indicators():
    """扫描结果目录下可用的指标文件"""
    if not os.path.exists(_RESULT_DATA_DIR):
        return []
    indicators = []
    for filename in os.listdir(_RESULT_DATA_DIR):
        if filename.endswith('_results.csv'):
            indicators.append(filename.replace('_results.csv', ''))
    return sorted(indicators)


def _get_available_mortality_years():
    """扫描死亡数据目录下可用的年份"""
    if not os.path.exists(_MORT_DATA_DIR):
        return []
    years = []
    for filename in os.listdir(_MORT_DATA_DIR):
        if filename.endswith('_mort.csv'):
            years.append(filename.replace('_mort.csv', ''))
    return sorted(years)


def _normalize_features(indicator_str):
    """去重并统一特征字段格式，全部转为小写并确保seqn位于首位"""
    if not indicator_str:
        return ['seqn']

    raw_items = [
        item.strip().lower()
        for item in indicator_str.split(',')
        if item and item.strip()
    ]

    normalized = []
    seen = set()

    # 先放入 seqn
    normalized.append('seqn')
    seen.add('seqn')

    for item in raw_items:
        if item in seen:
            continue
        normalized.append(item)
        seen.add(item)

    return normalized


def _metric_prefix_exists(base_path, years, metric_prefix):
    for year in years:
        for data_dir in _NHANES_SEARCH_DIRS:
            current_path = os.path.join(base_path, year, data_dir, "tsv")
            if not os.path.isdir(current_path):
                continue
            for filename in os.listdir(current_path):
                if filename.startswith(metric_prefix) and filename.endswith(".tsv"):
                    return True
    return False


def _resolve_metric_prefix(metric_prefix, years, base_path):
    """根据要求统一转为小写"""
    if not metric_prefix:
        return metric_prefix
    return metric_prefix.strip().lower()


@extraction_bp.route('/process_nhanes', methods=['POST'])
def process_nhanes():
    """NHANES数据提取接口"""
    try:
        # 检查get_nhanes_data函数是否可用
        if get_nhanes_data is None:
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

        years = [str(item['year']).strip() for item in items if 'year' in item and str(item['year']).strip()]
        if not years:
            return jsonify({'success': False, 'error': '未提供有效年份'}), 400
        # 按年份起始值从小到大排序
        years = sorted(years, key=lambda y: int(str(y).split('-')[0]))

        metricName = items[0].get('file', '').strip()
        indicator_str = items[0].get('indicator', '').strip()
        if not metricName:
            return jsonify({'success': False, 'error': '未提供文件名前缀(file)'}), 400
        if not indicator_str:
            return jsonify({'success': False, 'error': '未提供指标列表(indicator)'}), 400

        # 记录一致性校验
        inconsistent = [
            it for it in items
            if str(it.get('file', '')).strip() != metricName or str(it.get('indicator', '')).strip() != indicator_str
        ]
        if inconsistent:
            print(f"警告: 本次请求存在不一致的file/indicator，将以第一个为准。数量={len(inconsistent)}")

        metricName = _resolve_metric_prefix(metricName, years, base_path)
        features = _normalize_features(indicator_str)
        if not features:
            return jsonify({'success': False, 'error': '未提供有效的指标字段'}), 400
        normalized_indicator_str = ','.join(features)

        print(f"处理数据提取请求(合并模式): 年份={years}, 特征={features}, 文件名={metricName}")
        sys.stdout.flush()

        result = get_nhanes_data(
            years=years,
            features=features,
            metric_prefix=metricName,
            merge_output=True,
            save_each_file=True
        )

        try:
            preview_rows = result.head(5).to_dict(orient='records') if hasattr(result, 'head') else None
            print(f"[调试] get_nhanes_data 返回行数={len(result)}，列={list(result.columns) if hasattr(result, 'columns') else 'N/A'}，前5行预览={preview_rows}")
            sys.stdout.flush()
        except Exception as preview_error:
            print(f"[调试] 生成预览失败: {preview_error}")
            sys.stdout.flush()

        # Convert result to CSV
        if hasattr(result, 'to_csv'):
            csv_data = result.to_csv(index=False)
        elif hasattr(result, 'to_string'):
            csv_data = result.to_string()
        else:
            csv_data = str(result)

        print(f"[调试] csv_data 长度={len(csv_data)}")
        sys.stdout.flush()

        print(f"成功处理(合并): years={years}, file={metricName}")
        sys.stdout.flush()

        # 生成建议文件名
        try:
            start_year = min(int(str(y).split('-')[0]) for y in years)
            end_year = max(int(str(y).split('-')[-1]) for y in years)
            suggested_filename = f"{start_year}-{end_year}_{metricName}.csv"
        except Exception:
            suggested_filename = f"{metricName}.csv"

        return jsonify({
            'success': True,
            'results': [{
                'years': years,
                'file': metricName,
                'indicator': normalized_indicator_str,
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


@extraction_bp.route('/process_nhanes_batch_merge', methods=['POST'])
def process_nhanes_batch_merge():
    """批量将多组指标按seqn合并为一个文件"""
    try:
        if get_nhanes_data is None:
            return jsonify({
                'success': False,
                'error': 'NHANES数据提取功能不可用，请检查系统配置'
            }), 500

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

        data = request.json or {}
        items = data.get('items', [])
        if not items:
            print("[调试][batch] items 为空，返回 400")
            sys.stdout.flush()
            return jsonify({'success': False, 'error': '没有提供要处理的数据项'}), 400

        groups = {}
        all_years = []
        for it in items:
            year_val = str(it.get('year', '')).strip()
            file_val = str(it.get('file', '')).strip()
            indicator_val = str(it.get('indicator', '')).strip()
            if not year_val or not file_val or not indicator_val:
                print(f"跳过无效项目: {it}")
                continue
            key = (file_val, indicator_val)
            groups.setdefault(key, set()).add(year_val)
            all_years.append(year_val)

        if not groups:
            print("[调试][batch] 没有可处理的有效项目，所有 items 均被跳过")
            print(f"[调试][batch] 原始 items = {items}")
            sys.stdout.flush()
            return jsonify({'success': False, 'error': '没有可处理的有效项目'}), 400

        # 第一步：预扫描所有组合，统计每个指标在多少个文件前缀中出现
        from collections import defaultdict
        indicator_usage = defaultdict(set)  # 指标小写 -> {metric_resolved,...}
        group_features = {}
        group_metric_resolved = {}

        for (metricName, indicator_str), years_set in groups.items():
            # 按年份起始值从小到大排序
            years_list = sorted(list(years_set), key=lambda y: int(str(y).split('-')[0]))
            features = _normalize_features(indicator_str)
            metric_resolved = _resolve_metric_prefix(metricName, years_list, base_path)

            group_features[(metricName, indicator_str)] = features
            group_metric_resolved[(metricName, indicator_str)] = metric_resolved

            for feat in features:
                if feat.lower() == 'seqn':
                    continue
                indicator_usage[feat.lower()].add(metric_resolved)

        # 第二步：真正提取并按需要重命名列
        merged_df = None
        for (metricName, indicator_str), years_set in groups.items():
            years_list = sorted(list(years_set))
            features = group_features[(metricName, indicator_str)]
            metric_resolved = group_metric_resolved[(metricName, indicator_str)]

            print(f"批量组处理: file={metric_resolved}, years={years_list}, features={features}")
            sys.stdout.flush()

            df = get_nhanes_data(
                years=years_list,
                features=features,
                metric_prefix=metric_resolved,
                merge_output=True,
                save_each_file=True
            )

            if hasattr(df, 'columns') and any(col.lower() == 'seqn' for col in df.columns):
                seqn_col = next(col for col in df.columns if col.lower() == 'seqn')
                rename_map = {}
                for col in df.columns:
                    if col == seqn_col:
                        rename_map[col] = 'seqn'
                    else:
                        indicator_key = col.lower()
                        # 如果该指标只在一个文件前缀中出现，直接用指标名；否则用 file+indicator 区分
                        if len(indicator_usage.get(indicator_key, set())) == 1:
                            rename_map[col] = col.lower()
                        else:
                            rename_map[col] = f"{metric_resolved}_{col.lower()}"
                df = df.rename(columns=rename_map)
            else:
                print(f"警告: 数据集中缺少 seqn，跳过: file={metric_resolved}")
                sys.stdout.flush()
                continue

            if merged_df is None:
                merged_df = df
            else:
                try:
                    merged_df = pd.merge(merged_df, df, on='seqn', how='outer')
                except Exception as merge_error:
                    print(f"合并失败({metric_resolved}): {str(merge_error)}")
                    sys.stdout.flush()

        if merged_df is None:
            print("[调试][batch] merged_df 仍为 None，无法生成合并数据，返回 400")
            print(f"[调试][batch] groups keys = {list(groups.keys())}")
            sys.stdout.flush()
            return jsonify({'success': False, 'error': '无法生成合并数据，请检查输入'}), 400

        csv_data = merged_df.to_csv(index=False)
        try:
            start_year = min(int(y.split('-')[0]) for y in all_years if y)
            end_year = max(int(y.split('-')[-1]) for y in all_years if y)
            suggested_filename = f"{start_year}-{end_year}_merged.csv"
        except Exception:
            suggested_filename = "merged.csv"

        return jsonify({
            'success': True,
            'csv_data': csv_data,
            'suggested_filename': suggested_filename,
            'merged_columns': list(merged_df.columns)
        })

    except Exception as e:
        import traceback
        print("批量合并处理错误:")
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


@extraction_bp.route('/api/indicators/<indicator_name>', methods=['GET'])
def get_indicator_data(indicator_name):
    """获取指定指标的数据列表"""
    try:
        page = int(request.args.get('page', 1) or 1)
        limit = request.args.get('limit', _DEFAULT_PAGE_SIZE)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = _DEFAULT_PAGE_SIZE
        export_all = request.args.get('export_all', 'false').lower() == 'true'

        if page < 1:
            page = 1
        if limit <= 0:
            limit = _DEFAULT_PAGE_SIZE
        elif limit > 1000:
            limit = 1000

        if not os.path.exists(_RESULT_DATA_DIR):
            return jsonify({
                'success': False,
                'error': '指标结果目录不存在，请先生成结果文件'
            }), 500

        file_path = os.path.join(_RESULT_DATA_DIR, f'{indicator_name}_results.csv')
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': f'指标文件不存在: {indicator_name}',
                'available_indicators': _get_available_indicators()
            }), 404

        df = pd.read_csv(file_path)

        if export_all:
            page_data = df
            pagination_info = {
                'total': len(df),
                'page': 1,
                'limit': len(df),
                'total_pages': 1,
                'has_next': False,
                'has_prev': False
            }
        else:
            total_records = len(df)
            total_pages = max(1, math.ceil(total_records / limit)) if total_records else 1
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            page_data = df.iloc[start_idx:end_idx]
            pagination_info = {
                'total': total_records,
                'page': page,
                'limit': limit,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }

        cleaned_page = page_data.replace([np.nan, pd.NaT], None)
        columns = [{'field': col, 'title': col, 'width': 'auto'} for col in df.columns]

        return jsonify({
            'success': True,
            'indicator': indicator_name,
            'columns': columns,
            'records': cleaned_page.to_dict(orient='records'),
            'pagination': pagination_info
        })
    except Exception as e:
        import traceback
        print("获取指标数据失败:")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'读取数据失败: {str(e)}'
        }), 500


@extraction_bp.route('/api/indicators', methods=['GET'])
def list_available_indicators():
    """列出所有可用指标"""
    try:
        indicators = _get_available_indicators()
        return jsonify({
            'success': True,
            'indicators': indicators,
            'count': len(indicators)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'获取指标列表失败: {str(e)}'
        }), 500


@extraction_bp.route('/api/mortality/<mortality_year>', methods=['GET'])
def get_mortality_data(mortality_year):
    """获取死亡数据"""
    try:
        page = int(request.args.get('page', 1) or 1)
        limit = request.args.get('limit', _DEFAULT_PAGE_SIZE)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = _DEFAULT_PAGE_SIZE
        export_all = request.args.get('export_all', 'false').lower() == 'true'

        if page < 1:
            page = 1
        if limit <= 0:
            limit = _DEFAULT_PAGE_SIZE
        elif limit > 1000:
            limit = 1000

        if not os.path.exists(_MORT_DATA_DIR):
            return jsonify({
                'success': False,
                'error': '死亡数据目录不存在，请先上传或生成死亡数据文件'
            }), 500

        file_path = os.path.join(_MORT_DATA_DIR, f'{mortality_year}_mort.csv')
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': f'死亡数据文件不存在: {mortality_year}',
                'available_years': _get_available_mortality_years()
            }), 404

        df = pd.read_csv(file_path)

        if export_all:
            page_data = df
            pagination_info = {
                'total': len(df),
                'page': 1,
                'limit': len(df),
                'total_pages': 1,
                'has_next': False,
                'has_prev': False
            }
        else:
            total_records = len(df)
            total_pages = max(1, math.ceil(total_records / limit)) if total_records else 1
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            page_data = df.iloc[start_idx:end_idx]
            pagination_info = {
                'total': total_records,
                'page': page,
                'limit': limit,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }

        cleaned_page = page_data.replace([np.nan, pd.NaT], None)
        columns = [{
            'field': col,
            'title': col.upper(),
            'width': 'auto'
        } for col in df.columns]

        return jsonify({
            'success': True,
            'year': mortality_year,
            'columns': columns,
            'records': cleaned_page.to_dict(orient='records'),
            'pagination': pagination_info
        })
    except Exception as e:
        import traceback
        print("获取死亡数据失败:")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'读取死亡数据失败: {str(e)}'
        }), 500
