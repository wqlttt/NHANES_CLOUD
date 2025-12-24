import pandas as pd
import numpy as np
import io
import traceback
from backend.DataAnalysis.linearRegression import linear_regression_analysis, multiple_linear_regression_analysis

def create_test_csv(data_dict):
    df = pd.DataFrame(data_dict)
    buffer = io.BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    return buffer

def test_linear_regression():
    print("--- Testing Linear Regression Fixes ---")

    # Case 1: String-formatted numbers (The original bug)
    print("\n[Case 1] String-formatted numbers")
    data_str = {
        'x': ['1', '2', '3', '4', '5'],
        'y': ['2.1', '4.2', '6.1', '8.05', '10.2'] # Clean linear relationship
    }
    csv_file = create_test_csv(data_str)
    try:
        result = linear_regression_analysis(csv_file, 'x', 'y')
        print("Success!")
        print(f"R2: {result['r2_score']}")
        print(f"MSE: {result['mse']}")
        if result['r2_score'] > 0.9:
            print("PASS: High R2 as expected")
        else:
            print("FAIL: Low R2")
    except Exception as e:
        print(f"FAIL: Exception raised: {e}")
        traceback.print_exc()

    # Case 2: Constant Y (Should output R2=0.0 instead of NaN/Inf)
    print("\n[Case 2] Constant Y (Edge Case)")
    data_const = {
        'x': [1, 2, 3, 4, 5],
        'y': [10, 10, 10, 10, 10]
    }
    csv_file = create_test_csv(data_const)
    try:
        result = linear_regression_analysis(csv_file, 'x', 'y')
        print("Success!")
        print(f"R2: {result['r2_score']}")
        print(f"MSE: {result['mse']}")
        if result['r2_score'] == 0.0:
            print("PASS: R2 handled as 0.0")
        else:
            print(f"FAIL: R2 is {result['r2_score']}")
    except Exception as e:
        print(f"FAIL: Exception raised: {e}")
        traceback.print_exc()
        
    # Case 3: Multiple Regression with Strings
    print("\n[Case 3] Multiple Regression with Strings")
    data_multi = {
        'x1': ['1', '2', '3', '4', '5'],
        'x2': ['2', '4', '6', '8', '10'],
        'y': ['2.1', '4.2', '6.1', '8.05', '10.2']
    }
    csv_file = create_test_csv(data_multi)
    try:
        result = multiple_linear_regression_analysis(csv_file, ['x1', 'x2'], 'y')
        print("Success!")
        print(f"R2: {result['r2_score']}")
        if result['r2_score'] > 0.9:
             print("PASS: High R2 as expected")
        else:
             print("FAIL: Low R2")
    except Exception as e:
        print(f"FAIL: Exception raised: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_linear_regression()
