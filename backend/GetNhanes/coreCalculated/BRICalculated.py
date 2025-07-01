import math
import pandas as pd
from functools import reduce
from GetNhanes.coreCalculated import VAICalculated, BMICalculated

def fit_bri():
    wc_data = VAICalculated.fit_vai()
    wc_data.drop(columns=['Triglyceride','HDL','gender','BMI','VAI'], inplace=True)

    height_data = BMICalculated.fit_bmi()
    height_data.drop(columns=['weight','BMI'], inplace=True)

    # 按seqn合并所有数据框
    dataframes = [wc_data, height_data]

    BRIfeatures_Data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    try:
        BRIfeatures_Data['BRI'] = BRIfeatures_Data.apply(lambda row: 364.2 - 365.5 * math.sqrt(
            1 - ((row['waist'] / (2 * math.pi)) ** 2) / ((0.5 * row['height']) ** 2)), axis=1)
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating BRI: {e}")

    return BRIfeatures_Data

def calculation_bri(feature_data=fit_bri(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "BRI_results.csv"
    else:
        save_path = save_path + "BRI_results.csv"
    feature_data.to_csv(save_path, index=False)

if __name__ == '__main__':
    calculation_bri()