import pandas as pd
import numpy as np
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import statsmodels.api as sm
import statsmodels.formula.api as smf
from patsy import dmatrix
from lifelines import CoxPHFitter

def rcs_analysis(csv_data, model_type, x_var, y_var, covariates=None, knots=4):
    """
    Perform Restricted Cubic Spline (RCS) analysis.

    Args:
        csv_data: File-like object or path to CSV.
        model_type (str): 'linear', 'logistic', or 'cox'.
        x_var (str): Continuous predictor variable.
        y_var (str): Outcome variable.
        covariates (list): List of covariate column names.
        knots (int): Number of knots (3-7).

    Returns:
        dict: {
            "plot": base64_image,
            "aic": float (optional),
            "p_value_nonlinear": float (optional)
        }
    """
    if covariates is None:
        covariates = []

    # Read Data
    data = pd.read_csv(csv_data)
    
    # Validation
    required_cols = [x_var, y_var] + covariates
    if not all(col in data.columns for col in required_cols):
        raise ValueError(f"One or more columns not found: {required_cols}")

    # Drop NA
    clean_data = data[required_cols].dropna()
    
    # Create formula string for RCS
    # We use patsy's 'cr' (natural cubic spline) or 'bs'
    # statsmodels usually works well with formula api
    # formula example: "y ~ cr(x, df=knots) + cov1 + cov2"
    
    # Note: 'cr' in patsy corresponds to natural cubic spline
    covariate_str = " + ".join(covariates)
    if covariate_str:
        formula_rhs = f"cr({x_var}, df={knots}) + {covariate_str}"
    else:
        formula_rhs = f"cr({x_var}, df={knots})"
    
    plt.rcParams['font.sans-serif'] = ['SimHei', 'WenQuanYi Micro Hei', 'DejaVu Sans', 'Arial Unicode MS', 'Microsoft YaHei', 'sans-serif']
    plt.rcParams['axes.unicode_minus'] = False
    plt.figure(figsize=(10, 6))

    result_stats = {}

    try:
        if model_type == 'linear':
            formula = f"{y_var} ~ {formula_rhs}"
            model = smf.ols(formula, data=clean_data).fit()
            
            # Predict for plotting
            x_range = np.linspace(clean_data[x_var].min(), clean_data[x_var].max(), 100)
            # We need to hold covariates constant (usually at mean or mode)
            pred_data = pd.DataFrame({x_var: x_range})
            for cov in covariates:
                if pd.api.types.is_numeric_dtype(clean_data[cov]):
                    pred_data[cov] = clean_data[cov].mean()
                else:
                    pred_data[cov] = clean_data[cov].mode()[0]
            
            predictions = model.get_prediction(pred_data)
            pred_summary = predictions.summary_frame(alpha=0.05)
            
            # Plot
            plt.plot(x_range, pred_summary['mean'], 'b-', label='Predicted Mean')
            plt.fill_between(x_range, pred_summary['mean_ci_lower'], pred_summary['mean_ci_upper'], color='b', alpha=0.1, label='95% CI')
            plt.scatter(clean_data[x_var], clean_data[y_var], alpha=0.1, color='gray', s=10, label='Data Points')
            plt.ylabel(y_var)

            result_stats['aic'] = model.aic
            # P-value for non-linearity is complex to extract directly from summary for all spline terms together without anova
            # Simplified: just return whole summary or key stats

        elif model_type == 'logistic':
            formula = f"{y_var} ~ {formula_rhs}"
            model = smf.logit(formula, data=clean_data).fit()
            
            # Predict
            x_range = np.linspace(clean_data[x_var].min(), clean_data[x_var].max(), 100)
            pred_data = pd.DataFrame({x_var: x_range})
            for cov in covariates:
                if pd.api.types.is_numeric_dtype(clean_data[cov]):
                    pred_data[cov] = clean_data[cov].mean()
                else:
                    pred_data[cov] = clean_data[cov].mode()[0]
            
            # Predicted probability
            y_prob = model.predict(pred_data)
            # CI calculation for Logit is slightly more involved manually with formula api, 
            # simplest is to predict XB then transform, but statsmodels predict doesn't give CI for prob easily
            # We will use get_prediction if available (statsmodels >= 0.14) or approximation
            
            # Using transform of linear prediction
            pred_lin = model.get_prediction(pred_data, transform=False) 
            predicted_logits = pred_lin.predicted_mean
            ci_low_logit = pred_lin.conf_int()[:, 0]
            ci_high_logit = pred_lin.conf_int()[:, 1]
            
            def expit(x): return 1 / (1 + np.exp(-x))
            
            plt.plot(x_range, expit(predicted_logits), 'r-', label='Predicted Probability')
            plt.fill_between(x_range, expit(ci_low_logit), expit(ci_high_logit), color='r', alpha=0.1, label='95% CI')
            
            # Rug plot
            plt.plot(clean_data[x_var][clean_data[y_var]==0], [0]*len(clean_data[x_var][clean_data[y_var]==0]), '|', color='b', alpha=0.5)
            plt.plot(clean_data[x_var][clean_data[y_var]==1], [1]*len(clean_data[x_var][clean_data[y_var]==1]), '|', color='r', alpha=0.5)
            plt.ylabel(f"Probability of {y_var}")

            result_stats['aic'] = model.aic

        elif model_type == 'cox':
            # Lifelines doesn't support formula strings with splines as natively as statsmodels
            # BUT statsmodels also has CoxPH.
            # However, previous code uses lifelines.
            # To stick with RCS, using statsmodels CoxPH model is better suited for formula interface
            # OR we can preprocess data using patsy and feed to lifelines (more complex)
            # Let's try statsmodels PHReg
            
            # Check for event/duration
            # y_var in request should be event, but Cox needs duration too. 
            # The signature of this function might need update or y_var is 'event', and we need 'time' separate
            # For now, let's assume y_var passed here is just the event, and we need another arg or parse it
            # To keep signature simple for this first pass, let's require 'time_var' in kwargs or similar.
            pass 
            raise ValueError("Cox RCS requires 'time' variable. Please update implementation.")

    except Exception as e:
        plt.close()
        raise e

    plt.xlabel(x_var)
    plt.title(f'RCS Analysis ({model_type.capitalize()}) - {knots} knots')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Save Plot
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    result_stats['plot'] = plot_data
    return result_stats

# Special handler for Cox to match existing pattern if needed, 
# but better to integrate into main function if we change signature.
def rcs_cox_analysis(csv_data, time_var, event_var, x_var, covariates=None, knots=4):
    if covariates is None:
        covariates = []
        
    data = pd.read_csv(csv_data)
    required_cols = [time_var, event_var, x_var] + covariates
    clean_data = data[required_cols].dropna()

    # Use statsmodels PHReg
    # formula: "time_var ~ cr(x_var, df=knots) + covs"
    # Note: PHReg in statsmodels requires 'status' indicating censor/event? 
    # Actually PHReg API: model = sm.PHReg.from_formula("time ~ x + y", data=data, status=event)
    
    covariate_str = (" + " + " + ".join(covariates)) if covariates else ""
    formula = f"{time_var} ~ cr({x_var}, df={knots}){covariate_str}"
    
    # event_var must be Series
    status = clean_data[event_var]
    
    model = sm.PHReg.from_formula(formula, data=clean_data, status=status)
    result = model.fit()

    # Hazard Ratio Plot (Relative to mean or median X)
    # RCS in Cox usually plots log Hazard Ratio (or HR) vs X
    # Reference value (X_ref) usually median
    x_ref = clean_data[x_var].median()
    x_range = np.linspace(clean_data[x_var].min(), clean_data[x_var].max(), 100)
    
    # Prepare predict data
    # We want to compare X=x_i to X=x_ref, holding covars constant means they cancel out in HR ratio
    # log(HR(x)) = beta * (Spline(x) - Spline(x_ref))
    
    # This manual prediction is tricky with statsmodels internal spline basis
    # Easier: predict log_hazard relative to baseline?
    # statsmodels PHReg predict gives 'hazard_ratio' (relative to mean of covariates?)
    
    # Let's simple way:
    # create pred_data with x varying, others constant (mean)
    # get predicted hazard ratio
    
    pred_data = pd.DataFrame({x_var: x_range})
    pred_ref = pd.DataFrame({x_var: [x_ref]})
    
    for cov in covariates:
        val = clean_data[cov].mean() if pd.api.types.is_numeric_dtype(clean_data[cov]) else clean_data[cov].mode()[0]
        pred_data[cov] = val
        pred_ref[cov] = val
        
    # Get predicted log hazard or hazard ratio
    # predicted_values gives linear predictor (log hazard ratio relative to baseline)
    lp = result.predict(pred_data, pred_type='lp') 
    lp_ref = result.predict(pred_ref, pred_type='lp')
    
    # Relative log hazard
    log_hr = lp - lp_ref[0]
    hr = np.exp(log_hr)
    
    # CI is tricky without manual delta method or bootstrap here for the difference
    # For MVP, just plot the line first
    
    plt.rcParams['font.sans-serif'] = ['SimHei', 'WenQuanYi Micro Hei', 'DejaVu Sans', 'Arial Unicode MS', 'Microsoft YaHei', 'sans-serif']
    plt.rcParams['axes.unicode_minus'] = False
    
    plt.figure(figsize=(10, 6))
    plt.plot(x_range, hr, 'b-', label='Hazard Ratio (ref: median)')
    plt.axhline(y=1, color='k', linestyle=':', alpha=0.5)
    plt.xlabel(x_var)
    plt.ylabel(f"Hazard Ratio (Ref = {x_ref:.2f})")
    plt.title(f'RCS Cox Regression - {knots} knots')
    plt.yscale('log') # Usually better for HR
    plt.grid(True, alpha=0.3, which='both')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return {
        "plot": plot_data,
        "aic": result.aic
    }
