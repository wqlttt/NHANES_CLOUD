// 模拟CSV数据
export const mockCommonIndicatorData = {
    phenoage: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'PHENOAGE', title: 'Phenoage', width: 100 },
            { field: 'ALBUMIN_GL', title: '白蛋白(g/L)', width: 100 },
            { field: 'CREAT_UMOL', title: '肌酐(μmol/L)', width: 100 },
            { field: 'GLUCOSE_MMOL', title: '血糖(mmol/L)', width: 100 },
            { field: 'LNCRP', title: 'ln(CRP)', width: 100 }
        ],
        records: [
            { SEQN: 83732, PHENOAGE: 42.3, ALBUMIN_GL: 42.1, CREAT_UMOL: 88.4, GLUCOSE_MMOL: 5.2, LNCRP: 0.65 },
            { SEQN: 83733, PHENOAGE: 38.7, ALBUMIN_GL: 44.3, CREAT_UMOL: 79.6, GLUCOSE_MMOL: 4.9, LNCRP: 0.32 },
            { SEQN: 83734, PHENOAGE: 58.9, ALBUMIN_GL: 39.8, CREAT_UMOL: 106.1, GLUCOSE_MMOL: 6.8, LNCRP: 1.23 },
            { SEQN: 83735, PHENOAGE: 35.2, ALBUMIN_GL: 45.1, CREAT_UMOL: 70.7, GLUCOSE_MMOL: 4.6, LNCRP: 0.18 },
            { SEQN: 83736, PHENOAGE: 48.6, ALBUMIN_GL: 41.7, CREAT_UMOL: 92.3, GLUCOSE_MMOL: 5.7, LNCRP: 0.88 }
        ]
    },
    tyg: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'TYG_INDEX', title: 'TyG指数', width: 100 },
            { field: 'TG_MGDL', title: '甘油三酯(mg/dL)', width: 120 },
            { field: 'FBG_MGDL', title: '空腹血糖(mg/dL)', width: 120 },
            { field: 'FASTING_STATUS', title: '空腹状态', width: 100 }
        ],
        records: [
            { SEQN: 83732, TYG_INDEX: 8.45, TG_MGDL: 128, FBG_MGDL: 95, FASTING_STATUS: '是' },
            { SEQN: 83733, TYG_INDEX: 8.12, TG_MGDL: 89, FBG_MGDL: 88, FASTING_STATUS: '是' },
            { SEQN: 83734, TYG_INDEX: 9.23, TG_MGDL: 186, FBG_MGDL: 112, FASTING_STATUS: '是' },
            { SEQN: 83735, TYG_INDEX: 7.89, TG_MGDL: 76, FBG_MGDL: 91, FASTING_STATUS: '是' },
            { SEQN: 83736, TYG_INDEX: 8.67, TG_MGDL: 145, FBG_MGDL: 97, FASTING_STATUS: '是' }
        ]
    },
    bmi: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'BMI', title: 'BMI(kg/m²)', width: 100 },
            { field: 'BMXHT', title: '身高(cm)', width: 100 },
            { field: 'BMXWT', title: '体重(kg)', width: 100 },
            { field: 'BMI_CATEGORY', title: 'BMI分类', width: 120 }
        ],
        records: [
            { SEQN: 83732, BMI: 26.4, BMXHT: 175.2, BMXWT: 81.1, BMI_CATEGORY: '超重' },
            { SEQN: 83733, BMI: 22.1, BMXHT: 162.3, BMXWT: 58.2, BMI_CATEGORY: '正常' },
            { SEQN: 83734, BMI: 29.8, BMXHT: 168.9, BMXWT: 85.0, BMI_CATEGORY: '肥胖' },
            { SEQN: 83735, BMI: 20.9, BMXHT: 159.1, BMXWT: 52.9, BMI_CATEGORY: '正常' },
            { SEQN: 83736, BMI: 24.7, BMXHT: 172.1, BMXWT: 73.2, BMI_CATEGORY: '正常' }
        ]
    },
    tyg_bmi: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'TYG_BMI', title: 'TyG-BMI', width: 100 },
            { field: 'TYG_INDEX', title: 'TyG指数', width: 100 },
            { field: 'BMI', title: 'BMI', width: 80 },
            { field: 'RISK_LEVEL', title: '风险等级', width: 100 }
        ],
        records: [
            { SEQN: 83732, TYG_BMI: 223.1, TYG_INDEX: 8.45, BMI: 26.4, RISK_LEVEL: '中等' },
            { SEQN: 83733, TYG_BMI: 179.5, TYG_INDEX: 8.12, BMI: 22.1, RISK_LEVEL: '低' },
            { SEQN: 83734, TYG_BMI: 275.1, TYG_INDEX: 9.23, BMI: 29.8, RISK_LEVEL: '高' },
            { SEQN: 83735, TYG_BMI: 164.9, TYG_INDEX: 7.89, BMI: 20.9, RISK_LEVEL: '低' },
            { SEQN: 83736, TYG_BMI: 214.1, TYG_INDEX: 8.67, BMI: 24.7, RISK_LEVEL: '中等' }
        ]
    },
    aip: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'AIP', title: 'AIP指数', width: 100 },
            { field: 'TG_MGDL', title: 'TG(mg/dL)', width: 100 },
            { field: 'HDL_MGDL', title: 'HDL-C(mg/dL)', width: 100 },
            { field: 'RISK_CATEGORY', title: '风险分类', width: 120 }
        ],
        records: [
            { SEQN: 83732, AIP: 0.31, TG_MGDL: 128, HDL_MGDL: 52, RISK_CATEGORY: '中等风险' },
            { SEQN: 83733, AIP: -0.15, TG_MGDL: 89, HDL_MGDL: 61, RISK_CATEGORY: '低风险' },
            { SEQN: 83734, AIP: 0.58, TG_MGDL: 186, HDL_MGDL: 38, RISK_CATEGORY: '高风险' },
            { SEQN: 83735, AIP: -0.23, TG_MGDL: 76, HDL_MGDL: 65, RISK_CATEGORY: '低风险' },
            { SEQN: 83736, AIP: 0.42, TG_MGDL: 145, HDL_MGDL: 47, RISK_CATEGORY: '中等风险' }
        ]
    },
    vai: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'VAI', title: 'VAI指数', width: 100 },
            { field: 'WAIST_CM', title: '腰围(cm)', width: 100 },
            { field: 'GENDER', title: '性别', width: 80 },
            { field: 'VAI_CATEGORY', title: 'VAI分类', width: 120 }
        ],
        records: [
            { SEQN: 83732, VAI: 2.1, WAIST_CM: 89.2, GENDER: '男', VAI_CATEGORY: '中等' },
            { SEQN: 83733, VAI: 1.3, WAIST_CM: 76.8, GENDER: '女', VAI_CATEGORY: '良好' },
            { SEQN: 83734, VAI: 3.8, WAIST_CM: 95.4, GENDER: '男', VAI_CATEGORY: '差' },
            { SEQN: 83735, VAI: 1.1, WAIST_CM: 71.2, GENDER: '女', VAI_CATEGORY: '良好' },
            { SEQN: 83736, VAI: 2.7, WAIST_CM: 82.6, GENDER: '男', VAI_CATEGORY: '中等' }
        ]
    },
    uhr: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'UHR', title: 'UHR(%)', width: 100 },
            { field: 'UA_MGDL', title: '尿酸(mg/dL)', width: 100 },
            { field: 'HDL_MGDL', title: 'HDL-C(mg/dL)', width: 100 },
            { field: 'RISK_STATUS', title: '风险状态', width: 100 }
        ],
        records: [
            { SEQN: 83732, UHR: 11.5, UA_MGDL: 6.0, HDL_MGDL: 52, RISK_STATUS: '正常' },
            { SEQN: 83733, UHR: 7.2, UA_MGDL: 4.4, HDL_MGDL: 61, RISK_STATUS: '正常' },
            { SEQN: 83734, UHR: 18.4, UA_MGDL: 7.0, HDL_MGDL: 38, RISK_STATUS: '升高' },
            { SEQN: 83735, UHR: 6.8, UA_MGDL: 4.4, HDL_MGDL: 65, RISK_STATUS: '正常' },
            { SEQN: 83736, UHR: 14.9, UA_MGDL: 7.0, HDL_MGDL: 47, RISK_STATUS: '轻微升高' }
        ]
    },
    uacr: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'UACR', title: 'UACR(mg/g)', width: 100 },
            { field: 'URINE_ALB', title: '尿白蛋白(mg/L)', width: 120 },
            { field: 'URINE_CR', title: '尿肌酐(mg/dL)', width: 120 },
            { field: 'KIDNEY_STATUS', title: '肾功能状态', width: 120 }
        ],
        records: [
            { SEQN: 83732, UACR: 12.5, URINE_ALB: 8.2, URINE_CR: 65.6, KIDNEY_STATUS: '正常' },
            { SEQN: 83733, UACR: 7.8, URINE_ALB: 5.1, URINE_CR: 65.4, KIDNEY_STATUS: '正常' },
            { SEQN: 83734, UACR: 45.2, URINE_ALB: 28.9, URINE_CR: 63.9, KIDNEY_STATUS: '微量白蛋白尿' },
            { SEQN: 83735, UACR: 6.3, URINE_ALB: 4.2, URINE_CR: 66.7, KIDNEY_STATUS: '正常' },
            { SEQN: 83736, UACR: 18.7, URINE_ALB: 12.1, URINE_CR: 64.7, KIDNEY_STATUS: '正常' }
        ]
    },
    egfr: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'EGFR', title: 'eGFR(mL/min/1.73m²)', width: 150 },
            { field: 'SCR_MGDL', title: '血清肌酐(mg/dL)', width: 130 },
            { field: 'AGE', title: '年龄', width: 80 },
            { field: 'CKD_STAGE', title: 'CKD分期', width: 100 }
        ],
        records: [
            { SEQN: 83732, EGFR: 89.2, SCR_MGDL: 1.0, AGE: 45, CKD_STAGE: 'G1(正常)' },
            { SEQN: 83733, EGFR: 95.7, SCR_MGDL: 0.9, AGE: 32, CKD_STAGE: 'G1(正常)' },
            { SEQN: 83734, EGFR: 67.3, SCR_MGDL: 1.2, AGE: 67, CKD_STAGE: 'G2(轻度下降)' },
            { SEQN: 83735, EGFR: 102.8, SCR_MGDL: 0.8, AGE: 28, CKD_STAGE: 'G1(正常)' },
            { SEQN: 83736, EGFR: 82.5, SCR_MGDL: 1.0, AGE: 55, CKD_STAGE: 'G1(正常)' }
        ]
    },
    rar: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'RAR', title: 'RAR比值', width: 100 },
            { field: 'RDW_PCT', title: 'RDW(%)', width: 100 },
            { field: 'ALB_GL', title: '白蛋白(g/L)', width: 100 },
            { field: 'INFLAMMATION_STATUS', title: '炎症状态', width: 120 }
        ],
        records: [
            { SEQN: 83732, RAR: 0.31, RDW_PCT: 13.2, ALB_GL: 42.1, INFLAMMATION_STATUS: '正常' },
            { SEQN: 83733, RAR: 0.29, RDW_PCT: 12.8, ALB_GL: 44.3, INFLAMMATION_STATUS: '正常' },
            { SEQN: 83734, RAR: 0.37, RDW_PCT: 14.8, ALB_GL: 39.8, INFLAMMATION_STATUS: '轻度炎症' },
            { SEQN: 83735, RAR: 0.27, RDW_PCT: 12.1, ALB_GL: 45.1, INFLAMMATION_STATUS: '正常' },
            { SEQN: 83736, RAR: 0.33, RDW_PCT: 13.8, ALB_GL: 41.7, INFLAMMATION_STATUS: '正常' }
        ]
    },
    bri: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'BRI', title: 'BRI指数', width: 100 },
            { field: 'WAIST_CM', title: '腰围(cm)', width: 100 },
            { field: 'HEIGHT_CM', title: '身高(cm)', width: 100 },
            { field: 'BODY_SHAPE', title: '体型评估', width: 100 }
        ],
        records: [
            { SEQN: 83732, BRI: 4.2, WAIST_CM: 89.2, HEIGHT_CM: 175.2, BODY_SHAPE: '正常' },
            { SEQN: 83733, BRI: 3.8, WAIST_CM: 76.8, HEIGHT_CM: 162.3, BODY_SHAPE: '正常' },
            { SEQN: 83734, BRI: 5.7, WAIST_CM: 95.4, HEIGHT_CM: 168.9, BODY_SHAPE: '偏圆' },
            { SEQN: 83735, BRI: 3.2, WAIST_CM: 71.2, HEIGHT_CM: 159.1, BODY_SHAPE: '偏瘦' },
            { SEQN: 83736, BRI: 4.5, WAIST_CM: 82.6, HEIGHT_CM: 172.1, BODY_SHAPE: '正常' }
        ]
    },
    sii: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'SII', title: 'SII指数', width: 100 },
            { field: 'PLT_COUNT', title: '血小板(×10³/μL)', width: 130 },
            { field: 'NEUTROPHIL', title: '中性粒细胞(×10³/μL)', width: 150 },
            { field: 'LYMPHOCYTE', title: '淋巴细胞(×10³/μL)', width: 140 }
        ],
        records: [
            { SEQN: 83732, SII: 652.1, PLT_COUNT: 285, NEUTROPHIL: 4.2, LYMPHOCYTE: 1.8 },
            { SEQN: 83733, SII: 423.8, PLT_COUNT: 245, NEUTROPHIL: 3.1, LYMPHOCYTE: 1.8 },
            { SEQN: 83734, SII: 891.5, PLT_COUNT: 325, NEUTROPHIL: 5.8, LYMPHOCYTE: 2.1 },
            { SEQN: 83735, SII: 367.2, PLT_COUNT: 225, NEUTROPHIL: 2.9, LYMPHOCYTE: 1.8 },
            { SEQN: 83736, SII: 578.9, PLT_COUNT: 275, NEUTROPHIL: 3.8, LYMPHOCYTE: 1.8 }
        ]
    },
    npar: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'NPAR', title: 'NPAR比值', width: 100 },
            { field: 'NEUTROPHIL_PCT', title: '中性粒细胞(%)', width: 130 },
            { field: 'ALB_GL', title: '白蛋白(g/L)', width: 100 },
            { field: 'IMMUNE_STATUS', title: '免疫状态', width: 100 }
        ],
        records: [
            { SEQN: 83732, NPAR: 1.45, NEUTROPHIL_PCT: 61.2, ALB_GL: 42.1, IMMUNE_STATUS: '正常' },
            { SEQN: 83733, NPAR: 1.28, NEUTROPHIL_PCT: 56.8, ALB_GL: 44.3, IMMUNE_STATUS: '正常' },
            { SEQN: 83734, NPAR: 1.72, NEUTROPHIL_PCT: 68.5, ALB_GL: 39.8, IMMUNE_STATUS: '轻度异常' },
            { SEQN: 83735, NPAR: 1.21, NEUTROPHIL_PCT: 54.6, ALB_GL: 45.1, IMMUNE_STATUS: '正常' },
            { SEQN: 83736, NPAR: 1.53, NEUTROPHIL_PCT: 63.8, ALB_GL: 41.7, IMMUNE_STATUS: '正常' }
        ]
    },
    ckm: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'CKM_STAGE', title: 'CKM分期', width: 100 },
            { field: 'BMI', title: 'BMI', width: 80 },
            { field: 'WAIST_CM', title: '腰围(cm)', width: 100 },
            { field: 'CVD_RISK', title: 'CVD风险(%)', width: 100 },
            { field: 'RISK_DESCRIPTION', title: '风险描述', width: 150 }
        ],
        records: [
            { SEQN: 83732, CKM_STAGE: 'CKM-1', BMI: 26.4, WAIST_CM: 89.2, CVD_RISK: 8.5, RISK_DESCRIPTION: '代谢风险因子' },
            { SEQN: 83733, CKM_STAGE: 'CKM-0', BMI: 22.1, WAIST_CM: 76.8, CVD_RISK: 3.2, RISK_DESCRIPTION: '正常' },
            { SEQN: 83734, CKM_STAGE: 'CKM-2', BMI: 29.8, WAIST_CM: 95.4, CVD_RISK: 15.7, RISK_DESCRIPTION: '代谢综合征' },
            { SEQN: 83735, CKM_STAGE: 'CKM-0', BMI: 20.9, WAIST_CM: 71.2, CVD_RISK: 2.1, RISK_DESCRIPTION: '正常' },
            { SEQN: 83736, CKM_STAGE: 'CKM-1', BMI: 24.7, WAIST_CM: 82.6, CVD_RISK: 6.8, RISK_DESCRIPTION: '代谢风险因子' }
        ]
    },
    mar: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'MAR', title: 'MAR比值', width: 100 },
            { field: 'MONOCYTE', title: '单核细胞(×10³/μL)', width: 140 },
            { field: 'ALB_GL', title: '白蛋白(g/L)', width: 100 },
            { field: 'INFLAMMATION_LEVEL', title: '炎症水平', width: 100 }
        ],
        records: [
            { SEQN: 83732, MAR: 0.014, MONOCYTE: 0.6, ALB_GL: 42.1, INFLAMMATION_LEVEL: '正常' },
            { SEQN: 83733, MAR: 0.011, MONOCYTE: 0.5, ALB_GL: 44.3, INFLAMMATION_LEVEL: '正常' },
            { SEQN: 83734, MAR: 0.018, MONOCYTE: 0.7, ALB_GL: 39.8, INFLAMMATION_LEVEL: '轻度' },
            { SEQN: 83735, MAR: 0.010, MONOCYTE: 0.4, ALB_GL: 45.1, INFLAMMATION_LEVEL: '正常' },
            { SEQN: 83736, MAR: 0.015, MONOCYTE: 0.6, ALB_GL: 41.7, INFLAMMATION_LEVEL: '正常' }
        ]
    },
    halp: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'HALP_SCORE', title: 'HALP评分', width: 100 },
            { field: 'HGB_GL', title: '血红蛋白(g/L)', width: 120 },
            { field: 'ALB_GL', title: '白蛋白(g/L)', width: 100 },
            { field: 'LYMPHOCYTE', title: '淋巴细胞(×10³/μL)', width: 140 },
            { field: 'PLT_COUNT', title: '血小板(×10³/μL)', width: 130 }
        ],
        records: [
            { SEQN: 83732, HALP_SCORE: 11.2, HGB_GL: 145, ALB_GL: 42.1, LYMPHOCYTE: 1.8, PLT_COUNT: 285 },
            { SEQN: 83733, HALP_SCORE: 13.8, HGB_GL: 138, ALB_GL: 44.3, LYMPHOCYTE: 1.8, PLT_COUNT: 245 },
            { SEQN: 83734, HALP_SCORE: 8.9, HGB_GL: 142, ALB_GL: 39.8, LYMPHOCYTE: 2.1, PLT_COUNT: 325 },
            { SEQN: 83735, HALP_SCORE: 15.2, HGB_GL: 132, ALB_GL: 45.1, LYMPHOCYTE: 1.8, PLT_COUNT: 225 },
            { SEQN: 83736, HALP_SCORE: 10.7, HGB_GL: 148, ALB_GL: 41.7, LYMPHOCYTE: 1.8, PLT_COUNT: 275 }
        ]
    },
    nlr: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'NLR', title: 'NLR比值', width: 100 },
            { field: 'NEUTROPHIL', title: '中性粒细胞(×10³/μL)', width: 150 },
            { field: 'LYMPHOCYTE', title: '淋巴细胞(×10³/μL)', width: 140 },
            { field: 'IMMUNE_STATUS', title: '免疫状态', width: 100 }
        ],
        records: [
            { SEQN: 83732, NLR: 2.33, NEUTROPHIL: 4.2, LYMPHOCYTE: 1.8, IMMUNE_STATUS: '正常' },
            { SEQN: 83733, NLR: 1.72, NEUTROPHIL: 3.1, LYMPHOCYTE: 1.8, IMMUNE_STATUS: '正常' },
            { SEQN: 83734, NLR: 2.76, NEUTROPHIL: 5.8, LYMPHOCYTE: 2.1, IMMUNE_STATUS: '轻度异常' },
            { SEQN: 83735, NLR: 1.61, NEUTROPHIL: 2.9, LYMPHOCYTE: 1.8, IMMUNE_STATUS: '正常' },
            { SEQN: 83736, NLR: 2.11, NEUTROPHIL: 3.8, LYMPHOCYTE: 1.8, IMMUNE_STATUS: '正常' }
        ]
    }
};

export const mockMortalityData = {
    mortality_2019: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'MORTSTAT', title: '死亡状态', width: 100 },
            { field: 'CAUSEAVL', title: '死因可用性', width: 120 },
            { field: 'UCOD_LEADING', title: '主要死因', width: 150 },
            { field: 'DIABETES', title: '糖尿病相关', width: 120 }
        ],
        records: [
            { SEQN: 83732, MORTSTAT: 0, CAUSEAVL: 0, UCOD_LEADING: '', DIABETES: 0 },
            { SEQN: 83733, MORTSTAT: 1, CAUSEAVL: 1, UCOD_LEADING: 'Heart disease', DIABETES: 0 },
            { SEQN: 83734, MORTSTAT: 0, CAUSEAVL: 0, UCOD_LEADING: '', DIABETES: 0 },
            { SEQN: 83735, MORTSTAT: 1, CAUSEAVL: 1, UCOD_LEADING: 'Cancer', DIABETES: 1 },
            { SEQN: 83736, MORTSTAT: 0, CAUSEAVL: 0, UCOD_LEADING: '', DIABETES: 0 }
        ]
    }
};

export const mockPresetGroupData = {
    basic_demographics: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'RIAGENDR', title: '性别', width: 80 },
            { field: 'RIDAGEYR', title: '年龄', width: 80 },
            { field: 'RIDRETH3', title: '种族', width: 120 }
        ],
        records: [
            { SEQN: 83732, RIAGENDR: 1, RIDAGEYR: 45, RIDRETH3: 3 },
            { SEQN: 83733, RIAGENDR: 2, RIDAGEYR: 32, RIDRETH3: 1 },
            { SEQN: 83734, RIAGENDR: 1, RIDAGEYR: 67, RIDRETH3: 4 },
            { SEQN: 83735, RIAGENDR: 2, RIDAGEYR: 28, RIDRETH3: 2 },
            { SEQN: 83736, RIAGENDR: 1, RIDAGEYR: 55, RIDRETH3: 3 }
        ]
    },
    metabolic_syndrome: {
        columns: [
            { field: 'SEQN', title: '序列号', width: 100 },
            { field: 'BMXBMI', title: 'BMI', width: 80 },
            { field: 'BPXSY1', title: '收缩压', width: 100 },
            { field: 'BPXDI1', title: '舒张压', width: 100 },
            { field: 'LBXGLU', title: '血糖', width: 100 }
        ],
        records: [
            { SEQN: 83732, BMXBMI: 26.4, BPXSY1: 128, BPXDI1: 82, LBXGLU: 95 },
            { SEQN: 83733, BMXBMI: 22.1, BPXSY1: 115, BPXDI1: 76, LBXGLU: 88 },
            { SEQN: 83734, BMXBMI: 29.8, BPXSY1: 142, BPXDI1: 89, LBXGLU: 112 },
            { SEQN: 83735, BMXBMI: 20.9, BPXSY1: 108, BPXDI1: 71, LBXGLU: 91 },
            { SEQN: 83736, BMXBMI: 24.7, BPXSY1: 124, BPXDI1: 79, LBXGLU: 97 }
        ]
    }
};
