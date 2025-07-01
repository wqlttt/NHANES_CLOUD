from functools import reduce
import pandas as pd

from GetNhanes import get_nhanes_data


def fit_bmi():
    # ----------------------------------------------------------------------------------------------------
    # 提取 height
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']

    years = ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    # 使用小写指标
    features = ['seqn','bmxht']
    metricName = "bmx"
    height_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    height_data.rename(columns={'bmxht': 'height'},inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # 提取 weight
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    # 使用小写指标
    features = ['seqn', 'bmxwt']
    metricName = "bmx"
    weight_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    weight_data.rename(columns={'bmxwt': 'weight'}, inplace=True)


    # ----------------------------------------------------------------------------------------------------------------------------------------------------
    # 合并fbg和triglyceride
    height_data = height_data.reset_index(drop=True)
    weight_data = weight_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [height_data, weight_data]

    BMI_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)


    # 计算BMI
    try:
        BMI_Data['BMI'] = BMI_Data['weight']/((BMI_Data['height']/100)**2)
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating BMI: {e}")

    return BMI_Data

def calculation_bmi(feature_data=fit_bmi(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "BMI_results.csv"
    else:
        save_path = save_path + "BMI_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_bmi()
