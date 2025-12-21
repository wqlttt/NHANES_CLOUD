
import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Number of samples
n_samples = 500

# --- 1. Basic Demographics ---
ids = range(10001, 10001 + n_samples)
age = np.random.randint(18, 85, n_samples)
gender = np.random.choice([1, 2], n_samples, p=[0.48, 0.52]) # 1:Male, 2:Female
race = np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.4, 0.2, 0.1, 0.2, 0.1]) # 1:White, 2:Black, 3:Asian, 4:Hispanic, 5:Other
education = np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.1, 0.3, 0.3, 0.2, 0.1]) # 1:Less than 9th, 5:Post-Grad

# --- 2. Socioeconomic (Skewed Data for Histograms/Boxplots) ---
# Income: Log-normal distribution to create right skew
income = np.random.lognormal(mean=10.5, sigma=0.8, size=n_samples).round(-2)
income = np.clip(income, 5000, 200000)

# --- 3. Health Metrics (Continuous with Correlations) ---
# BMI: Normal distribution, correlated with Age
bmi = np.random.normal(24, 4, n_samples) + (age - 30) * 0.05
bmi = np.clip(bmi, 15, 50).round(1)

# Systolic BP: Correlated with Age and BMI
sbp = 110 + (age - 20) * 0.4 + (bmi - 25) * 0.5 + np.random.normal(0, 8, n_samples)
sbp = np.clip(sbp, 90, 190).round(0)

# Cholesterol: Normal distribution
cholesterol = np.random.normal(190, 40, n_samples)
cholesterol = np.clip(cholesterol, 100, 350).round(0)

# --- 4. Disease Status (Binary & Multi-class) ---
# Hypertension (Binary): 1 if SBP > 130
hypertension = (sbp > 130).astype(int)

# Diabetes (Binary): Correlated with BMI and Age
diabetes_prob = (age > 45).astype(int) * 0.2 + (bmi > 30).astype(int) * 0.3 + 0.05
diabetes_prob = np.clip(diabetes_prob, 0, 1)
diabetes = np.random.binomial(1, diabetes_prob)

# Health Status (Ordinal): 1=Poor ... 4=Excellent
# Inversely related to diseases
health_score = 100 - (hypertension * 20) - (diabetes * 20) - (age * 0.2) + np.random.normal(0, 10, n_samples)
health_status = pd.cut(health_score, bins=[-np.inf, 40, 60, 80, np.inf], labels=[1, 2, 3, 4]) # Numeric labels

# --- 5. Survival Data (for Cox Regression) ---
time_to_event = np.random.exponential(60, n_samples).round(1) # Months
time_to_event = np.clip(time_to_event, 1, 120)
# Event: Higher risk for older, diabetes
hazard = (age / 80) + diabetes
event_prob = 1 - np.exp(-0.02 * hazard * time_to_event)
mortality_event = np.random.binomial(1, np.clip(event_prob, 0, 1))

# --- 6. Construct Basic DataFrame ---
df = pd.DataFrame({
    'SEQN': ids,
    'Age': age,
    'Gender': gender,
    'Race': race,
    'Education': education,
    'Income': income,
    'BMI': bmi,
    'SystolicBP': sbp,
    'Cholesterol': cholesterol,
    'Hypertension': hypertension,
    'Diabetes': diabetes,
    'SelfReportedHealth': health_status,
    'FollowUpTime': time_to_event,
    'MortalityEvent': mortality_event
})

# --- DATA PROCESSING SCENARIOS ---

# A. Missing Values (for Imputation demo)
# Drop 5% of BMI and 8% of Cholesterol
n_missing_bmi = int(n_samples * 0.05)
n_missing_chol = int(n_samples * 0.08)
df.loc[np.random.choice(df.index, n_missing_bmi, replace=False), 'BMI'] = np.nan
df.loc[np.random.choice(df.index, n_missing_chol, replace=False), 'Cholesterol'] = np.nan

# B. Outliers (for Outlier Detection demo)
# Introduce 3 extreme high values in Income and SystolicBP
outlier_indices = np.random.choice(df.index, 3, replace=False)
df.loc[outlier_indices[0], 'Income'] = 5000000 # Extreme income
df.loc[outlier_indices[1], 'SystolicBP'] = 300 # Physiologically impossible BP
df.loc[outlier_indices[2], 'BMI'] = 100 # Extreme BMI

# C. Duplicate Rows (for Deduplication demo)
# Duplicate 5 random rows and append them
duplicates = df.sample(n=5)
df = pd.concat([df, duplicates], ignore_index=True)

# Save
output_file = 'nhanes_comprehensive_demo.csv'
df.to_csv(output_file, index=False)

print(f"Successfully generated {output_file} with {len(df)} rows.")
print("Feature Highlights:")
print("- Missing Values: BMI, Cholesterol")
print("- Outliers: Income, SystolicBP, BMI")
print("- Duplicates: 5 rows duplicated")
print("- Categorical: Gender, Race, Education, SelfReportedHealth")
print("- Survival: FollowUpTime, MortalityEvent")
