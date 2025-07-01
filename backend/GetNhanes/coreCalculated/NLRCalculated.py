from GetNhanes.coreCalculated import SIICalculated


def fit_nlr():
    # ----------------------------------------------------------------------------------------------------
    # 提取 lymphocyte
    NLR_data = SIICalculated.fit_sii()
    NLR_data.drop(columns=['Platelet_Count', 'SII'], inplace=True)

    # 计算NLR
    try:
        NLR_data["NLR"] = NLR_data["Neutrophil"] / NLR_data["Lymphocyte"]
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating BMI: {e}")

    return NLR_data


def calculation_nlr(feature_data=fit_nlr(), save_path=None):
    # 如果 save_path 为空，则保存到当前路径
    if save_path is None:
        save_path = "NLR_results.csv"
    else:
        save_path = save_path + "NLR_results.csv"
    feature_data.to_csv(save_path, index=False)

if __name__ == '__main__':
    calculation_nlr()