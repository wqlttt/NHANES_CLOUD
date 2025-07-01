from functools import reduce
import pandas as pd
from GetNhanes import get_nhanes_data
from GetNhanes.coreCalculated import RARCalculated


def fit_npar():
    # ----------------------------------------------------------------------------------------------------
    # nepct
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    features = ['seqn', 'lbxnepct']
    metricName = "lab25"
    nepct1_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    nepct1_data.rename(columns={'lbxnepct': 'nepct'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2001-2002','2003-2004']
    features = ['seqn', 'lbxnepct']
    metricName = "l25_c"
    nepct2_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    nepct2_data.rename(columns={'lbxnepct': 'nepct'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    features = ['seqn', 'lbxnepct']
    metricName = "cbc_"
    nepct3_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    nepct3_data.rename(columns={'lbxnepct': 'nepct'}, inplace=True)

    nepct_data = pd.concat([nepct1_data, nepct2_data, nepct3_data], axis=0)

    # ----------------------------------------------------------------------------------------------------
    # 提取ALB
    alb_data = RARCalculated.fit_rar()
    alb_data.drop(columns=['rdw', 'RAR'], inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # 合并数据
    # ----------------------------------------------------------------------------------------------------
    # 合并所有数据
    nepct_data = nepct_data.reset_index(drop=True)
    alb_data = alb_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [nepct_data, alb_data]

    NPARfeatures_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    try:
        NPARfeatures_Data['NPAR'] = NPARfeatures_Data['nepct'] / (NPARfeatures_Data['alb'] * 0.1)
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating TyG: {e}")
    return NPARfeatures_Data


def calculation_npar(feature_data = fit_npar(), save_path = None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "NPAR_results.csv"
    else:
        save_path = save_path + "NPAR_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_npar()