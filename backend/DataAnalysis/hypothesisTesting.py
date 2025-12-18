import pandas as pd
import numpy as np
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

def ttest_analysis(csv_data, group_col, value_col):
    """
    Perform independent two-sample T-test.
    """
    data = pd.read_csv(csv_data)
    if group_col not in data.columns or value_col not in data.columns:
        raise ValueError(f"Columns {group_col} or {value_col} not found")

    clean_data = data[[group_col, value_col]].dropna()
    groups = clean_data[group_col].unique()
    
    if len(groups) != 2:
        raise ValueError(f"T-test requires exactly 2 groups, found {len(groups)}: {list(groups)}")

    group1 = clean_data[clean_data[group_col] == groups[0]][value_col]
    group2 = clean_data[clean_data[group_col] == groups[1]][value_col]

    t_stat, p_val = stats.ttest_ind(group1, group2)

    # Plotting
    plt.figure(figsize=(8, 6))
    sns.boxplot(x=group_col, y=value_col, data=clean_data)
    plt.title(f'T-test: {groups[0]} vs {groups[1]}\np={p_val:.4f}, t={t_stat:.4f}')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "statistic": float(t_stat),
        "p_value": float(p_val),
        "groups": [str(g) for g in groups],
        "means": {str(g): float(clean_data[clean_data[group_col] == g][value_col].mean()) for g in groups}
    }

def chisquare_analysis(csv_data, col1, col2):
    """
    Perform Chi-square test of independence.
    """
    data = pd.read_csv(csv_data)
    if col1 not in data.columns or col2 not in data.columns:
        raise ValueError(f"Columns {col1} or {col2} not found")

    clean_data = data[[col1, col2]].dropna()
    contingency_table = pd.crosstab(clean_data[col1], clean_data[col2])
    
    chi2, p_val, dof, expected = stats.chi2_contingency(contingency_table)

    # Plotting heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(contingency_table, annot=True, fmt='d', cmap='YlGnBu')
    plt.title(f'Chi-square Test\np={p_val:.4f}, chi2={chi2:.4f}')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "statistic": float(chi2),
        "p_value": float(p_val),
        "dof": int(dof),
        "contingency_table": contingency_table.to_dict()
    }

def anova_analysis(csv_data, group_col, value_col):
    """
    Perform One-way ANOVA.
    """
    data = pd.read_csv(csv_data)
    if group_col not in data.columns or value_col not in data.columns:
        raise ValueError(f"Columns {group_col} or {value_col} not found")

    clean_data = data[[group_col, value_col]].dropna()
    groups = clean_data[group_col].unique()
    
    if len(groups) < 2:
        raise ValueError("ANOVA requires at least 2 groups")

    group_data = [clean_data[clean_data[group_col] == g][value_col] for g in groups]
    f_stat, p_val = stats.f_oneway(*group_data)

    # Plotting
    plt.figure(figsize=(10, 6))
    sns.violinplot(x=group_col, y=value_col, data=clean_data)
    plt.title(f'One-way ANOVA\np={p_val:.4f}, F={f_stat:.4f}')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "statistic": float(f_stat),
        "p_value": float(p_val),
        "groups": [str(g) for g in groups]
    }

def ranksum_analysis(csv_data, group_col, value_col):
    """
    Perform Mann-Whitney U test (Rank-sum test).
    """
    data = pd.read_csv(csv_data)
    if group_col not in data.columns or value_col not in data.columns:
        raise ValueError(f"Columns {group_col} or {value_col} not found")

    clean_data = data[[group_col, value_col]].dropna()
    groups = clean_data[group_col].unique()
    
    if len(groups) != 2:
        raise ValueError(f"Rank-sum test requires exactly 2 groups, found {len(groups)}: {list(groups)}")

    group1 = clean_data[clean_data[group_col] == groups[0]][value_col]
    group2 = clean_data[clean_data[group_col] == groups[1]][value_col]

    stat, p_val = stats.mannwhitneyu(group1, group2)

    # Plotting
    plt.figure(figsize=(8, 6))
    sns.boxplot(x=group_col, y=value_col, data=clean_data)
    plt.title(f'Mann-Whitney U Test\np={p_val:.4f}, U={stat:.4f}')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return {
        "plot": plot_data,
        "statistic": float(stat),
        "p_value": float(p_val),
        "groups": [str(g) for g in groups]
    }
