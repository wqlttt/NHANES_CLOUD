from functools import reduce
import numpy as np
import pandas as pd
from GetNhanes import get_nhanes_data


def fit_tyg():
    """Extract triglyceride and fasting blood glucose data, then calculate TyG index."""
    # ----------------------------------------------------------------------------------------------------
    # Extract triglyceride data
    # ['1999-2000','2001-2002','2003-2004','2005-2006','2007-2008', '2009-2010', '2011-2012', '2013-2014','2015-2016','2017-2018']

    years = ['1999-2000']
    features = ['seqn', 'lbxtr']
    metric_name = "lab13am"
    triglyceride1 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )

    years = ['2001-2002', '2003-2004']
    features = ['seqn', 'lbxtr']
    metric_name = "l13am"
    triglyceride2 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )

    years = ['2007-2008']
    features = ['seqn', 'lbxstr']
    metric_name = "biopro_e"
    triglyceride3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )
    triglyceride3.rename(columns={'lbxstr': 'lbxtr'}, inplace=True)

    years = ['2005-2006', '2009-2010', '2011-2012', '2013-2014', '2015-2016', '2017-2018']
    features = ['seqn', 'lbxtr']
    metric_name = "trigly_"
    triglyceride4 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )

    # Merge all triglyceride data
    triglyceride_data = pd.concat([triglyceride1, triglyceride2, triglyceride3, triglyceride4], axis=0)
    triglyceride_data.rename(columns={'lbxtr': 'triglycerid'}, inplace=True)

    # ----------------------------------------------------------------------------------------------------
    # Extract fasting blood glucose (FBG) data
    years = ['1999-2000', '2001-2002']
    features = ['seqn', 'lbxglu']
    metric_name = "lab10am"
    fbg1 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )
    fbg1.rename(columns={'lbxglu': 'fbg'}, inplace=True)

    years = ['2003-2004']
    features = ['seqn', 'lbxsgl']
    metric_name = "l40_c"
    fbg2 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )
    fbg2.rename(columns={'lbxsgl': 'fbg'}, inplace=True)

    years = ['2005-2006', '2007-2008', '2009-2010', '2011-2012', '2013-2014', '2015-2016', '2017-2018']
    features = ['seqn', 'lbxglu']
    metric_name = "=glu"
    fbg3 = get_nhanes_data(
        years=years,
        features=features,
        metric_prefix=metric_name,
        merge_output=True
    )
    fbg3.rename(columns={'lbxglu': 'fbg'}, inplace=True)

    # Merge all FBG data
    fbg_data = pd.concat([fbg1, fbg2, fbg3], axis=0)

    # ----------------------------------------------------------------------------------------------------
    # Merge FBG and triglyceride data
    triglyceride_data = triglyceride_data.reset_index(drop=True)
    fbg_data = fbg_data.reset_index(drop=True)

    # Merge all dataframes by 'seqn'
    dataframes = [triglyceride_data, fbg_data]
    tyg_features_data = reduce(lambda left, right: pd.merge(left, right, on='seqn'), dataframes)

    # Calculate TyG index
    try:
        tyg_features_data['TyG'] = np.log(tyg_features_data['triglycerid'] * tyg_features_data['fbg']) / np.log(2)
    except Exception as e:
        raise RuntimeError(f"An error occurred while calculating TyG: {e}")
    return tyg_features_data


def calculation_tyg(feature_data=None, save_path=None):
    """Save TyG calculation results to a CSV file."""
    if feature_data is None:
        feature_data = fit_tyg()
    if save_path is None:
        save_path = "TyG_results.csv"
    else:
        save_path = save_path + "TyG_results.csv"
    feature_data.to_csv(save_path, index=False)


if __name__ == '__main__':
    calculation_tyg()