from functools import reduce
import pandas as pd
from GetNhanes import get_nhanes_data
from GetNhanes.coreCalculated import RARCalculated


def fit_mar():
    # ----------------------------------------------------------------------------------------------------
    # 提取MC
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    features = ['seqn', 'lbdmono']
    metricName = "lab25"
    mc1_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    mc1_data.rename(columns={'lbdmono': 'mc'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2001-2002','2003-2004']
    features = ['seqn', 'lbdmono']
    metricName = "l25_"
    mc2_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    mc2_data.rename(columns={'lbdmono': 'mc'}, inplace=True)

    years = ['2001-2002', '2003-2004']
    features = ['seqn', 'lbdmono']
    metricName = "cbc_"
    mc3_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    mc3_data.rename(columns={'lbdmono': 'mc'}, inplace=True)

    # 合并所有MC数据
    mc_data = pd.concat([mc1_data, mc2_data, mc3_data], axis=0)

    # ----------------------------------------------------------------------------------------------------
    # 提取MC
    alb_data = RARCalculated.fit_rar()
    alb_data.drop(columns=['rdw', 'RAR'], inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # 合并所有数据
    mc_data = mc_data.reset_index(drop=True)
    alb_data = alb_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [mc_data, alb_data]

    MARfeatures_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    try:
        MARfeatures_Data['MAR'] = MARfeatures_Data['mc'] / MARfeatures_Data['alb']
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating TyG: {e}")
    return MARfeatures_Data

def calculation_mar(feature_data = fit_mar(), save_path = None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "MAR_results.csv"
    else:
        save_path = save_path + "MAR_results.csv"
    feature_data.to_csv(save_path, index=False)

if __name__ == '__main__':
    calculation_mar()