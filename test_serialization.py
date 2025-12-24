import numpy as np
import pandas as pd
from backend.utils.serialization import convert_to_serializable

def test_val(val, name):
    res = convert_to_serializable(val)
    print(f"{name}: {val} (type {type(val)}) -> {res} (type {type(res)})")

test_val(0.0, "Float 0.0")
test_val(np.float64(0.0), "Numpy float64 0.0")
test_val(np.float32(0.0), "Numpy float32 0.0")
test_val(np.nan, "NaN")
test_val(float('nan'), "Float NaN")
test_val(np.inf, "Inf")
