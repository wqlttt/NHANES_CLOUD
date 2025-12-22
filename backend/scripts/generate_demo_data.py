
import pandas as pd
import numpy as np
from pathlib import Path

# 重新生成一版「演示用综合数据」：
# - 所有列底层都是数值（整数/浮点），没有字符串
# - 含多个二元变量和多分类变量
# - 大比例缺失值（明显测试插补 / 过滤）
# - 可覆盖线性/逻辑/多分类逻辑/Cox/RCS + 各种统计检验和可视化

np.random.seed(42)

# 样本量稍微大一点，保证各种分析都稳定
n_samples = 800

# --- 1. 基础人口学变量（整数编码，底层仍是数值） ---
ids = np.arange(10001, 10001 + n_samples)
age = np.random.randint(18, 85, n_samples)
# 性别：1/2（数值型 + 二元变量）
gender = np.random.choice([1, 2], n_samples, p=[0.48, 0.52])
# 种族：1-5（多分类）
race = np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.4, 0.2, 0.1, 0.2, 0.1])
# 教育：1-5（多分类）
education = np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.1, 0.3, 0.3, 0.2, 0.1])

# --- 2. 社会经济（偏斜分布，适合直方图/箱线图） ---
income = np.random.lognormal(mean=10.5, sigma=0.8, size=n_samples).round(-2)
income = np.clip(income, 5000, 200000)

# --- 3. 连续健康指标（与年龄相关，用于线性/逻辑/RCS） ---
bmi = np.random.normal(24, 4, n_samples) + (age - 30) * 0.05
bmi = np.clip(bmi, 15, 50).round(1)

sbp = 110 + (age - 20) * 0.4 + (bmi - 25) * 0.5 + np.random.normal(0, 8, n_samples)
sbp = np.clip(sbp, 90, 200).round(0)

cholesterol = np.random.normal(190, 40, n_samples)
cholesterol = np.clip(cholesterol, 100, 350).round(0)

# --- 4. 疾病结局（多个二元 + 一个多分类） ---
hypertension = (sbp > 130).astype(int)

diabetes_prob = (age > 45).astype(int) * 0.2 + (bmi > 30).astype(int) * 0.3 + 0.05
diabetes_prob = np.clip(diabetes_prob, 0, 1)
diabetes = np.random.binomial(1, diabetes_prob)

# 自评健康：1=差, 2=一般, 3=好, 4=很好（多分类，仍然是整数）
health_score = 100 - (hypertension * 20) - (diabetes * 20) - (age * 0.2) + np.random.normal(0, 10, n_samples)
health_status = pd.cut(health_score, bins=[-np.inf, 40, 60, 80, np.inf], labels=[1, 2, 3, 4]).astype(int)

# --- 5. 生存数据（Cox / RCS-Cox） ---
time_to_event = np.random.exponential(60, n_samples).round(1)
time_to_event = np.clip(time_to_event, 1, 120)

hazard = (age / 80) + diabetes
event_prob = 1 - np.exp(-0.02 * hazard * time_to_event)
event_prob = np.clip(event_prob, 0, 1)
mortality_event = np.random.binomial(1, event_prob)

# --- 6. 组装 DataFrame ---
df = pd.DataFrame({
    "SEQN": ids,
    "Age": age,
    "Gender": gender,
    "Race": race,
    "Education": education,
    "Income": income,
    "BMI": bmi,
    "SystolicBP": sbp,
    "Cholesterol": cholesterol,
    "Hypertension": hypertension,
    "Diabetes": diabetes,
    "SelfReportedHealth": health_status,
    "FollowUpTime": time_to_event,
    "MortalityEvent": mortality_event,
})

# --- 7. 注入较高比例的缺失值（覆盖插补/过滤功能） ---
def add_missing(col_name: str, frac: float):
    n = int(len(df) * frac)
    if n <= 0:
        return
    idx = np.random.choice(df.index, n, replace=False)
    df.loc[idx, col_name] = np.nan

# 连续变量：缺失 15%–30%
add_missing("BMI", 0.25)
add_missing("Cholesterol", 0.30)
add_missing("Income", 0.18)
add_missing("SystolicBP", 0.15)
add_missing("Age", 0.10)

# 二元/多分类变量：也有一定缺失，测试 MICE / 删除策略
add_missing("Hypertension", 0.10)
add_missing("Diabetes", 0.10)
add_missing("SelfReportedHealth", 0.08)

# 生存结局也有少量缺失，测试 Cox / RCS 对 NA 的处理
add_missing("FollowUpTime", 0.08)
add_missing("MortalityEvent", 0.05)

# --- 8. 极端值 & 重复（测试异常值/去重等数据处理） ---
outlier_indices = np.random.choice(df.index, 4, replace=False)
df.loc[outlier_indices[0], "Income"] = 5_000_000  # 极高收入
df.loc[outlier_indices[1], "SystolicBP"] = 300    # 不合理高血压
df.loc[outlier_indices[2], "BMI"] = 100           # 极端 BMI
df.loc[outlier_indices[3], "Cholesterol"] = 800   # 极端胆固醇

duplicates = df.sample(n=10, random_state=123)
df = pd.concat([df, duplicates], ignore_index=True)

# --- 9. 保存到 resources/demo_data.csv，供 /load_demo_data 和前端 demo 使用 ---
resources_dir = Path(__file__).parent.parent / "resources"
resources_dir.mkdir(exist_ok=True)
output_path = resources_dir / "demo_data.csv"

df.to_csv(output_path, index=False)

print(f"Successfully generated demo data at: {output_path}")
print(f"Total rows (including duplicates): {len(df)}")
print("Key features:")
print("- All columns are numeric (ints/floats, 分类用数值编码)")
print("- Multiple binary variables: Hypertension, Diabetes, MortalityEvent")
print("- Multi-class variables: Race, Education, SelfReportedHealth")
print("- High missingness in BMI / Cholesterol / Income / SystolicBP 等多列")
print("- Survival fields: FollowUpTime, MortalityEvent (for Cox & RCS-Cox)")
print("- Outliers & duplicates for data cleaning demos")
