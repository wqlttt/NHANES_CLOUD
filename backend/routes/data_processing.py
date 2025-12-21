import pandas as pd
import numpy as np
import os
import uuid
import time
import threading
from pathlib import Path
from flask import Blueprint, request, jsonify, send_file

processing_bp = Blueprint('processing', __name__)

TEMP_UPLOAD_DIR = Path("temp_uploads")

def cleanup_job():
    """Background job to clean up old files"""
    while True:
        try:
            # Check every 30 minutes
            time.sleep(1800)
            
            now = time.time()
            # Delete files older than 1 hour
            cutoff = now - 3600 
            
            if TEMP_UPLOAD_DIR.exists():
                for f in TEMP_UPLOAD_DIR.iterdir():
                    if f.is_file() and f.stat().st_mtime < cutoff:
                        try:
                            f.unlink()
                            print(f"[Cleanup] Deleted old file: {f}")
                        except Exception as e:
                            print(f"[Cleanup] Failed to delete {f}: {e}")
                            
        except Exception as e:
            print(f"[Cleanup] Error in cleanup loop: {e}")

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_job, daemon=True)
cleanup_thread.start()

def get_temp_path(original_path, suffix):
    """Generate a temporary path for processed files"""
    path = Path(original_path)
    # Use a unique ID to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    
    # Ensure temp directory exists
    if not TEMP_UPLOAD_DIR.exists():
        TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
    return str(TEMP_UPLOAD_DIR / f"{path.stem}_{suffix}_{unique_id}.csv")

def get_file_stats(df):
    """Calculate file statistics similar to file_operations"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    
    columns_info = []
    for col in df.columns:
        col_type = str(df[col].dtype)
        # Determine strict type
        strict_type = 'numeric' if pd.api.types.is_numeric_dtype(df[col]) else 'categorical'
        
        columns_info.append({
            "name": col,
            "type": col_type,
            "data_type": strict_type,
            "non_null_count": int(df[col].count()),
            "null_count": int(df[col].isnull().sum()),
            "unique_count": int(df[col].nunique())
        })

    return {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "numeric_columns_count": len(numeric_cols),
        "categorical_columns_count": len(categorical_cols),
        "file_size": 0, # Placeholder, calculation needs actual file size
        "columns": df.columns.tolist(),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "columns_info": columns_info,
        "preview_data": df.head(100).replace({np.nan: None}).to_dict(orient='records')
    }

@processing_bp.route('/process/impute', methods=['POST'])
def impute_data():
    try:
        data = request.json
        filepath = data.get('filepath')
        method = data.get('method') # 'drop', 'mean', 'mice'
        columns = data.get('columns', [])

        if not filepath or not os.path.exists(filepath):
            return jsonify({"success": False, "error": "File not found"}), 404

        df = pd.read_csv(filepath)
        
        print(f"[DEBUG] Impute Request - Method: {method}")
        print(f"[DEBUG] Requested columns: {columns}")
        print(f"[DEBUG] DF columns: {df.columns.tolist()}")

        # Ensure columns exist
        available_cols = [c for c in columns if c in df.columns]
        
        if not available_cols:
             print(f"[ERROR] No valid columns found. Available: {available_cols}")
             return jsonify({"success": False, "error": "No valid columns selected"}), 400

        if method == 'drop':
            df_cleaned = df.dropna(subset=available_cols)
        elif method == 'mean':
            # Only apply to numeric columns for mean
            numeric_cols = df[available_cols].select_dtypes(include=[np.number]).columns
            if not numeric_cols.empty:
                df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
            # For categorical, maybe mode? For now just mean for numeric
            df_cleaned = df
        elif method == 'mice':
            from sklearn.experimental import enable_iterative_imputer
            from sklearn.impute import IterativeImputer
            
            # MICE only works on numeric columns
            numeric_cols = df[available_cols].select_dtypes(include=[np.number]).columns
            
            if not numeric_cols.empty:
                imputer = IterativeImputer(random_state=42)
                df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
            
            df_cleaned = df
        else:
             return jsonify({"success": False, "error": f"Method {method} not supported yet"}), 400

        # Save to new temp file
        new_filepath = get_temp_path(filepath, "imputed")
        df_cleaned.to_csv(new_filepath, index=False)
        
        stats = get_file_stats(df_cleaned)
        stats['file_size'] = os.path.getsize(new_filepath)
        
        return jsonify({
            "success": True, 
            "filepath": new_filepath,
            "stats": stats
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@processing_bp.route('/process/filter', methods=['POST'])
def filter_data():
    try:
        data = request.json
        filepath = data.get('filepath')
        filters = data.get('filters', []) # List of {column, operator, value}

        if not filepath or not os.path.exists(filepath):
            return jsonify({"success": False, "error": "File not found"}), 404

        df = pd.read_csv(filepath)
        
        for f in filters:
            col = f.get('column')
            op = f.get('operator')
            val = f.get('value')
            
            if col not in df.columns:
                continue

            # Basic type handling
            is_numeric = pd.api.types.is_numeric_dtype(df[col])
            
            if is_numeric:
                try:
                    val = float(val)
                except:
                    pass # Keep as string if conversion fails, might error later
            else:
                # Add quotes for string query
                if op != 'contains':
                    val = f"'{val}'"

            query_str = ""
            if op == 'gt': query_str = f"`{col}` > {val}"
            elif op == 'lt': query_str = f"`{col}` < {val}"
            elif op == 'eq': query_str = f"`{col}` == {val}"
            elif op == 'neq': query_str = f"`{col}` != {val}"
            elif op == 'gte': query_str = f"`{col}` >= {val}"
            elif op == 'lte': query_str = f"`{col}` <= {val}"
            elif op == 'contains': 
                 # Contains is special, can't use simple query string easily for all cases using df.query directly with this pattern
                 # Use string accessor
                 df = df[df[col].astype(str).str.contains(str(val), na=False)]
                 continue

            if query_str:
                df = df.query(query_str)

        # Save to new temp file
        new_filepath = get_temp_path(filepath, "filtered")
        df.to_csv(new_filepath, index=False)
        
        stats = get_file_stats(df)
        stats['file_size'] = os.path.getsize(new_filepath)

        return jsonify({
            "success": True, 
            "filepath": new_filepath,
            "stats": stats
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@processing_bp.route('/process/download', methods=['GET'])
def download_processed_data():
    try:
        filepath = request.args.get('filepath')
        if not filepath:
            return jsonify({"success": False, "error": "Filepath is required"}), 400

        path_obj = Path(filepath)
        
        # Security check: ensure file is in temp_uploads
        # This is a basic check. For production, check against absolute path of temp_uploads
        if "temp_uploads" not in str(path_obj.resolve()):
             return jsonify({"success": False, "error": "Invalid file path"}), 403

        if not path_obj.exists():
             return jsonify({"success": False, "error": "File expired or not found"}), 404

        return send_file(
            path_obj,
            as_attachment=True,
            download_name=path_obj.name,
            mimetype='text/csv'
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
