from functools import reduce
import pandas as pd
from GetNhanes import get_nhanes_data
from GetNhanes.coreCalculated import FIB4Calculated


def fit_sii():

    # ----------------------------------------------------------------------------------------------------
    # 提取 lymphocyte
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    # 使用小写指标
    features = ['seqn', 'lbdlymno']
    metricName = "lab25"
    lymphocyte_data1 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    lymphocyte_data1.rename(columns={'lbdlymno': 'Lymphocyte'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2001-2002','2003-2004']
    # 使用小写指标
    features = ['seqn', 'lbdlymno']
    metricName = "l25_"
    lymphocyte_data2 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    lymphocyte_data2.rename(columns={'lbdlymno': 'Lymphocyte'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    # 使用小写指标
    features = ['seqn', 'lbdlymno']
    metricName = "cbc_"
    lymphocyte_data3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )

    lymphocyte_data3.rename(columns={'lbdlymno': 'Lymphocyte'}, inplace=True)

    lymphocyte_data = pd.concat([lymphocyte_data1, lymphocyte_data2, lymphocyte_data3], axis=0)

    # ----------------------------------------------------------------------------------------------------
    # 提取 Neutrophil
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    # 使用小写指标
    features = ['seqn', 'lbdneno']
    metricName = "lab25"
    neutrophil_data1 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    neutrophil_data1.rename(columns={'lbdneno': 'Neutrophil'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2001-2002', '2003-2004']
    # 使用小写指标
    features = ['seqn', 'lbdneno']
    metricName = "l25_"
    neutrophil_data2 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    neutrophil_data2.rename(columns={'lbdneno': 'Neutrophil'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2005-2006', '2007-2008', '2009-2010', '2011-2012', '2013-2014', '2015-2016', '2017-2018']
    # 使用小写指标
    features = ['seqn', 'lbdneno']
    metricName = "cbc_"
    neutrophil_data3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )

    neutrophil_data3.rename(columns={'lbdneno': 'Neutrophil'}, inplace=True)

    neutrophil_data = pd.concat([neutrophil_data1, neutrophil_data2, neutrophil_data3], axis=0)

    # ----------------------------------------------------------------------------------------------------
    # 提取 PLT
    plt_data = FIB4Calculated.fit_fib4()
    plt_data.drop(columns=['ast', 'alt', 'age', 'FIB4'], inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # 合并所有值
    lymphocyte_data = lymphocyte_data.reset_index(drop=True)
    neutrophil_data = neutrophil_data.reset_index(drop=True)
    plt_data = plt_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [lymphocyte_data, neutrophil_data, plt_data]

    SII_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    # 计算BMI
    try:
        SII_Data["SII"] = (SII_Data["Platelet_Count"] * SII_Data["Neutrophil"]) / SII_Data["Lymphocyte"]
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating BMI: {e}")

    return SII_Data

def calculation_sii(feature_data=fit_sii(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "SII_results.csv"
    else:
        save_path = save_path + "SII_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_sii()

