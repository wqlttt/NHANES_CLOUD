from functools import reduce
import pandas as pd
from GetNhanes.coreCalculated import AIPCalculated
from GetNhanes import get_nhanes_data

def fit_uhr():
    # ------------------------------------------------------------------------------------------------
    # 提取 HDL-C
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    hdl_data = AIPCalculated.fit_aip()
    hdl_data.drop(columns=['AIP','triglycerid'], inplace=True)

    # ------------------------------------------------------------------------------------------------
    # 提取 UA
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    # 使用小写指标
    features = ['seqn', 'lbxsua']
    metricName = "lab18"
    ua1 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    ua1.rename(columns={'lbxsua': 'ua'}, inplace=True)

    years = ['2001-2002','2003-2004']
    # 使用小写指标
    features = ['seqn', 'lbxsua']
    metricName = "l40_"
    ua2 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    ua2.rename(columns={'lbxsua': 'ua'}, inplace=True)

    years = ['2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    features = ['seqn', 'lbxsua']
    metricName = "biopro_"
    ua3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    ua3.rename(columns={'lbxsua': 'ua'}, inplace=True)

    # 合并所有triglyceride数据
    ua_data = pd.concat([ua1, ua2, ua3], axis=0)

    # 合并所有数据------------------------
    hdl_data = hdl_data.reset_index(drop=True)
    ua_data = ua_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [hdl_data, ua_data]

    HUR_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    # 计算HUR
    try:
        HUR_Data["HUR"] =  HUR_Data["ua"] / HUR_Data["hdl"] * 1.0
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating AIP_Data: {e}")
    return HUR_Data

def calculation_uhr(feature_data=fit_uhr(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "UHR_results.csv"
    else:
        save_path = save_path + "UHR_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_uhr()