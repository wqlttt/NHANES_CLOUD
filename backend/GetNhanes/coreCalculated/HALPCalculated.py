from functools import reduce
import pandas as pd
from GetNhanes import get_nhanes_data
from GetNhanes.coreCalculated import SIICalculated, RARCalculated


def fit_halp():
    # ----------------------------------------------------------------------------------------------------
    # hemoglobin
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['1999-2000']
    features = ['seqn', 'lbxhgb']
    metricName = "lab25"
    hemoglobin1_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hemoglobin1_data.rename(columns={'lbxhgb': 'hemoglobin'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2001-2002', '2003-2004']
    features = ['seqn', 'lbxhgb']
    metricName = "l25_"
    hemoglobin2_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hemoglobin2_data.rename(columns={'lbxhgb': 'hemoglobin'}, inplace=True)

    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']
    years = ['2005-2006', '2007-2008', '2009-2010', '2011-2012', '2013-2014', '2015-2016', '2017-2018']
    features = ['seqn', 'lbxhgb']
    metricName = "cbc_"
    hemoglobin3_data = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metricName,
        merge_output=True
    )
    hemoglobin3_data.rename(columns={'lbxhgb': 'hemoglobin'}, inplace=True)

    hemoglobin_data = pd.concat([hemoglobin1_data, hemoglobin2_data, hemoglobin3_data], axis=0)

    # ----------------------------------------------------------------------------------------------------
    # 计算ALB
    alb_data = RARCalculated.fit_rar()
    alb_data.drop(columns=['rdw', 'RAR'], inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # 计算淋巴细胞&血小板计数
    # Lymphocyte,Platelet_Count
    L_P_data = SIICalculated.fit_sii()
    L_P_data.drop(columns=['Neutrophil', 'SII'], inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # 合并所有数据
    hemoglobin_data = hemoglobin_data.reset_index(drop=True)
    alb_data = alb_data.reset_index(drop=True)
    L_P_data = L_P_data.reset_index(drop=True)

    # 按seqn合并所有数据框
    dataframes = [hemoglobin_data, alb_data, L_P_data]

    HALPfeatures_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    try:
        HALPfeatures_Data['HALP'] = (HALPfeatures_Data['hemoglobin'] * HALPfeatures_Data['alb'] * HALPfeatures_Data['Lymphocyte']) / HALPfeatures_Data['Platelet_Count']
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating TyG: {e}")

    return HALPfeatures_Data

def calculation_halp(feature_data = fit_halp(), save_path = None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "HALP_results.csv"
    else:
        save_path = save_path + "HALP_results.csv"
    feature_data.to_csv(save_path, index=False)

if __name__ == '__main__':
    calculation_halp()