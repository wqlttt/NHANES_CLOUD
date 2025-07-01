from functools import reduce
import numpy as np
import pandas as pd
from GetNhanes.coreCalculated import TyGCalculated
from GetNhanes import get_nhanes_data

def fit_aip():

    # ------------------------------------------------------------------------------------------------
    # 提取甘油三酯 TyG_data["triglycerid"]
    TyG_data = TyGCalculated.fit_tyg()
    TyG_data = TyG_data.drop(columns=['fbg','TyG'])

    # ------------------------------------------------------------------------------------------------
    # 提取 HDL-C
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    # 使用小写指标
    features = ['seqn', 'lbdhdl']
    metricName = "lab13"
    hdl1 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hdl1.rename(columns={'lbdhdl': 'hdl'}, inplace=True)

    years = ['2001-2002','2003-2004']
    # 使用小写指标
    features = ['seqn', 'lbdhdl']
    metricName = "l13_b"
    hdl2 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hdl2.rename(columns={'lbdhdl': 'hdl'}, inplace=True)

    years = ['2003-2004']
    # 使用小写指标
    features = ['seqn', 'lbxhdd']
    metricName = "l13_c"
    hdl3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hdl3.rename(columns={'lbxhdd': 'hdl'}, inplace=True)

    years = ['2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    # 使用小写指标
    features = ['seqn', 'lbdhdd']
    metricName = "hdl"
    hdl3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hdl3.rename(columns={'lbdhdd': 'hdl'}, inplace=True)

    # 合并所有triglyceride数据
    hdl_data = pd.concat([hdl1, hdl2, hdl3], axis=0)

    # 合并所有数据----------------------------------------------
    hdl_data = hdl_data.reset_index(drop=True)
    TyG_data = TyG_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [hdl_data, TyG_data]

    AIP_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    # 计算AIT
    try:
        AIP_Data ["AIP"] = np.log(AIP_Data["triglycerid"]/AIP_Data["hdl"])
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating AIP_Data: {e}")
    return AIP_Data

def calculation_aip(feature_data=fit_aip(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "AIP_results.csv"
    else:
        save_path = save_path + "AIP_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_aip()