
import numpy as np
from sklearn.metrics import r2_score, mean_squared_error
import pandas as pd
from backend.utils.serialization import convert_to_serializable

def test_r2(y_true, y_pred, case_name):
    print(f"--- {case_name} ---")
    score = r2_score(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    print(f"R2: {score} (type: {type(score)})")
    print(f"MSE: {mse}")
    
    serializable_r2 = convert_to_serializable(score)
    print(f"Serializable R2: {serializable_r2}")
    print(f"Serializable R2 is None? {serializable_r2 is None}")

# Case 1: Constant y_true and y_pred
y_true_const = np.array([1.0, 1.0, 1.0, 1.0])
y_pred_const = np.array([1.0, 1.0, 1.0, 1.0])
test_r2(y_true_const, y_pred_const, "Constant Data (Perfect Prediction)")

# Case 2: Constant y_true, y_pred differs slightly
y_true_const = np.array([1.0, 1.0, 1.0, 1.0])
y_pred_diff = np.array([1.1, 1.1, 1.1, 1.1])
test_r2(y_true_const, y_pred_diff, "Constant Data (Worse Prediction)")

# Case 3: Constant y_true, y_pred varies
y_true_const = np.array([1.0, 1.0, 1.0, 1.0])
y_pred_vary = np.array([1.1, 0.9, 1.1, 0.9])
test_r2(y_true_const, y_pred_vary, "Constant Data (Varying Prediction)")

# Case 4: Single point (should handle by split check, but testing anyway)
y_true_single = np.array([1.0])
y_pred_single = np.array([1.0])
try:
    test_r2(y_true_single, y_pred_single, "Single Point")
except Exception as e:
    print(f"Single Point Error: {e}")

# Case 5: Empty
y_true_empty = np.array([])
y_pred_empty = np.array([])
try:
    test_r2(y_true_empty, y_pred_empty, "Empty")
except Exception as e:
    print(f"Empty Error: {e}")
