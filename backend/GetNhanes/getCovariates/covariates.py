from functools import reduce
import pandas as pd

from GetNhanes import get_nhanes_data


def fit_covariates():

    years = ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    # 协变量 类别
    features = ['seqn','riagendr','ridageyr','ridreth1','dmdeduc3','dmdeduc2','dmdmartl','indfmpir']
    metricName = "demo"
    convariates_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )

    return convariates_data

def calculation_covariates(feature_data=fit_covariates(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "covariates1_results.csv"
    else:
        save_path = save_path + "covariates1_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_covariates()
