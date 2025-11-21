import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    Row,
    Col,
    Input,
    Table,
    Button,
    Space,
    Checkbox,
    Select,
    Form,
    InputNumber,
    Tag,
    Divider,
    Progress,
    Modal,
    Tabs,
    message,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';
import {
    SearchOutlined,
    PlusOutlined,
    DownloadOutlined,
    FilterOutlined,
    DeleteOutlined,
    EditOutlined,
    TableOutlined,
} from '@ant-design/icons';
import { ListTable } from '@visactor/vtable';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 年份选项
const yearOptions = [
    '1999-2000', '2001-2002', '2003-2004', '2005-2006', '2007-2008',
    '2009-2010', '2011-2012', '2013-2014', '2015-2016', '2017-2018'
];

// 常见二级指标 - 与CSV文件名保持一致
const commonIndicators = [
    { value: 'phenoage0', label: 'Phenoage (Phenotypic Age)', description: 'Aging assessment indicator based on biomarkers, including 10 indicators such as albumin, creatinine, and glucose' },
    { value: 'TyG', label: 'TyG (Triglycerides-Glucose Index)', description: 'Insulin resistance assessment indicator, calculated based on fasting triglycerides and glucose' },
    { value: 'BMI', label: 'BMI (Body Mass Index)', description: 'Weight(kg)/Height(m)², standard indicator for weight status assessment' },
    { value: 'TyG_BMI', label: 'TyG-BMI (TyG and BMI Product)', description: 'Product of TyG index and BMI, comprehensive metabolic risk assessment' },
    { value: 'AIP', label: 'AIP (Atherogenic Index of Plasma)', description: 'log(TG/HDL-C), indicator for assessing atherosclerosis risk' },
    { value: 'VAI', label: 'VAI (Visceral Adiposity Index)', description: 'Visceral fat assessment indicator based on waist circumference, BMI, triglycerides, and HDL-C' },
    { value: 'UHR', label: 'UHR (Uric Acid to HDL Ratio)', description: 'Ratio of uric acid to high-density lipoprotein cholesterol, assessing metabolic abnormality risk' },
    { value: 'eGFR', label: 'eGFR (estimated Glomerular Filtration Rate)', description: 'Estimated glomerular filtration rate calculated using CKD-EPI formula' },
    { value: 'RAR', label: 'RAR (Red Blood Cell Distribution Width to Albumin Ratio)', description: 'RDW to albumin ratio, assessing inflammation and nutritional status' },
    { value: 'BRI', label: 'BRI (Body Roundness Index)', description: 'Body shape assessment indicator based on waist circumference and height' },
    { value: 'SII', label: 'SII (Systemic Immune-inflammation Index)', description: '(Platelets × Neutrophils)/Lymphocytes, assessing systemic inflammation status' },
    { value: 'NPAR', label: 'NPAR (Neutrophil Percentage to Albumin Ratio)', description: 'Ratio of neutrophil percentage to albumin, assessing inflammatory nutritional status' },
    { value: 'MAR', label: 'MAR (Monocyte to Albumin Ratio)', description: 'Ratio of monocyte count to albumin concentration, inflammation indicator' },
    { value: 'HALP', label: 'HALP (Hemoglobin-Albumin-Lymphocyte-Platelet Score)', description: 'Comprehensive nutrition and immune assessment indicator' },
    { value: 'NLR', label: 'NLR (Neutrophil to Lymphocyte Ratio)', description: 'Ratio of neutrophils to lymphocytes, inflammation and immune indicator' },
    { value: 'HRR', label: 'HRR (Heart Rate Reserve)', description: 'Heart rate reserve related indicator' },
    { value: 'FIB4', label: 'FIB4 (Fibrosis-4 Index)', description: 'Liver fibrosis assessment indicator' }
];

// 死亡指标 - 对应MortData目录中的CSV文件
const mortalityIndicators = [
    { value: '1999-2000', label: 'Mortality Data (1999-2000)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2001-2002', label: 'Mortality Data (2001-2002)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2003-2004', label: 'Mortality Data (2003-2004)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2005-2006', label: 'Mortality Data (2005-2006)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2007-2008', label: 'Mortality Data (2007-2008)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2009-2010', label: 'Mortality Data (2009-2010)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2011-2012', label: 'Mortality Data (2011-2012)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2013-2014', label: 'Mortality Data (2013-2014)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2015-2016', label: 'Mortality Data (2015-2016)', description: 'Contains information about mortality status, time of death, cause of death, etc.' },
    { value: '2017-2018', label: 'Mortality Data (2017-2018)', description: 'Contains information about mortality status, time of death, cause of death, etc.' }
];

// 预设变量组
const presetVariableGroups = [
    {
        value: 'basic_demographics',
        label: 'Basic Demographics Variables',
        description: 'Core variables including SEQN, gender, age, race, etc.',
        variables: ['SEQN', 'RIAGENDR', 'RIDAGEYR', 'RIDRETH3']
    },
    {
        value: 'metabolic_syndrome',
        label: 'Metabolic Syndrome Variables',
        description: 'Metabolic syndrome related indicators: BMI, blood pressure, blood glucose, blood lipids',
        variables: ['BMXBMI', 'BPXSY1', 'BPXDI1', 'LBXGLU', 'LBXTC']
    },
    {
        value: 'cardiovascular',
        label: 'Cardiovascular Disease Variables',
        description: 'Cardiovascular disease risk assessment related indicators',
        variables: ['BPXSY1', 'BPXDI1', 'LBXTC', 'LBXHDL', 'LBXLDL']
    },
    {
        value: 'diabetes',
        label: 'Diabetes Variables',
        description: 'Diabetes diagnosis and management related indicators',
        variables: ['LBXGLU', 'LBXGH', 'LBXIN', 'DIQ010']
    }
];

// 模拟CSV数据
const mockCommonIndicatorData = {
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

const mockMortalityData = {
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

const mockPresetGroupData = {
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

interface CustomExtractionItem {
    key: string;
    years: string[];
    fileName: string;
    indicators: string;
}

const DataExtraction: React.FC = () => {
    const { t } = useTranslation();
    const [customExtractions, setCustomExtractions] = useState<CustomExtractionItem[]>([]);
    const [editingItem, setEditingItem] = useState<string | null>(null); // 正在编辑的项目key
    const [editForm, setEditForm] = useState<{
        years: string[];
        fileName: string;
        indicators: string;
    }>({ years: [], fileName: '', indicators: '' }); // 编辑表单数据
    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [indicators, setIndicators] = useState('');
    const [selectedCommonIndicator, setSelectedCommonIndicator] = useState('');
    const [selectedMortalityIndicator, setSelectedMortalityIndicator] = useState('');
    const [selectedPresetGroup, setSelectedPresetGroup] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    // 检测屏幕尺寸
    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);
    const [downloadingStates, setDownloadingStates] = useState({
        custom: false,
        common: false,
        mortality: false,
        preset: false,
        batchCustom: false,
        exportAll: false
    });

    // VTable 实例和ResizeObserver
    const [commonTable, setCommonTable] = useState<ListTable | null>(null);
    const [mortalityTable, setMortalityTable] = useState<ListTable | null>(null);
    const [presetTable, setPresetTable] = useState<ListTable | null>(null);
    const [observersRef] = useState<{ observers: ResizeObserver[], timeouts: NodeJS.Timeout[] }>({
        observers: [],
        timeouts: []
    });

    // 加载状态管理
    const [loadingIndicatorData, setLoadingIndicatorData] = useState(false);

    // 分页状态管理
    const [paginationState, setPaginationState] = useState({
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const [mortalityPaginationState, setMortalityPaginationState] = useState({
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });

    // 当前显示的数据
    const [currentIndicatorData, setCurrentIndicatorData] = useState<any>(null);
    const [currentMortalityData, setCurrentMortalityData] = useState<any>(null);
    const [loadingMortalityData, setLoadingMortalityData] = useState(false);

    // 变量搜索状态
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSearchRows, setSelectedSearchRows] = useState<any[]>([]);

    // 设置特定下载状态
    const setDownloadingState = (type: string, loading: boolean) => {
        setDownloadingStates(prev => ({
            ...prev,
            [type]: loading
        }));
    };

    // 创建VTable实例
    const createVTable = (containerId: string, data: any) => {
        const container = document.getElementById(containerId);
        if (!container || !data) return null;

        // 清除之前的表格
        container.innerHTML = '';

        // 根据容器ID确定表格类型，清理对应的旧实例和观察器
        if (containerId === 'common-indicator-table' && commonTable) {
            try {
                commonTable.release();
            } catch (e) {
                console.warn('清理常见指标表格实例时出错:', e);
            }
        } else if (containerId === 'mortality-table' && mortalityTable) {
            try {
                mortalityTable.release();
            } catch (e) {
                console.warn('清理死亡数据表格实例时出错:', e);
            }
        } else if (containerId === 'preset-group-table' && presetTable) {
            try {
                presetTable.release();
            } catch (e) {
                console.warn('清理预设组表格实例时出错:', e);
            }
        }

        // 清理容器相关的观察器和定时器
        const existingObserver = (container as any).__resizeObserver;
        const existingTimeout = (container as any).__resizeTimeout;

        if (existingObserver) {
            try {
                existingObserver.disconnect();
                // 从全局列表中移除
                const index = observersRef.observers.indexOf(existingObserver);
                if (index > -1) {
                    observersRef.observers.splice(index, 1);
                }
            } catch (e) {
                console.warn('清理ResizeObserver时出错:', e);
            }
        }

        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // 优化列配置 - 设置更宽的初始宽度，确保完整显示数值
        const adaptiveColumns = data.columns.map((col: any, index: number) => {
            let width = 180; // 增加默认宽度以显示完整数值

            // 根据列名设置合适的初始宽度
            const fieldName = col.field.toLowerCase();
            if (fieldName.includes('seqn') || fieldName.includes('id')) {
                width = 120; // ID类字段
            } else if (fieldName.includes('age') || fieldName.includes('年龄')) {
                width = 100; // 年龄字段
            } else if (fieldName.includes('phenoage') && fieldName.includes('advance')) {
                width = 220; // 长数值字段更宽
            } else if (fieldName.includes('phenoage')) {
                width = 200; // phenoage字段
            } else {
                // 对于包含小数点的数值字段，设置更宽的列宽
                width = 180; // 数值字段默认宽度
            }

            return {
                ...col,
                width, // 使用固定宽度，不设置最小最大值限制
                // 移除 minWidth 和 maxWidth 限制，让用户自由调整
                // 确保文本不被截断
                style: {
                    textOverflow: 'visible', // 不使用省略号
                    whiteSpace: 'nowrap',    // 不换行
                    overflow: 'visible'      // 允许溢出显示
                }
            };
        });

        const tableInstance = new ListTable(container, {
            columns: adaptiveColumns,
            records: data.records,
            widthMode: 'standard', // 使用标准宽度模式，允许用户调整
            heightMode: 'autoHeight', // 自动计算高度，配合容器滚动
            autoWrapText: false, // 禁用自动换行，保持所有内容在一行显示
            autoFillWidth: false,   // 关闭自动填充宽度，让用户自由调整
            autoFillHeight: false,  // 关闭自动填充高度，使用固定行高
            // 允许用户自由调整列宽
            columnWidthComputeMode: 'only-header',

            theme: {
                defaultStyle: {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 14,
                    color: '#333',
                    bgColor: '#fff',
                    autoWrapText: false, // 禁用默认样式的自动换行
                    textOverflow: 'visible', // 不使用省略号
                    textAlign: 'left' // 左对齐显示完整文本
                },
                headerStyle: {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#fff',
                    bgColor: '#1890ff',
                    autoWrapText: false, // 禁用表头的自动换行
                    textOverflow: 'visible', // 表头也不使用省略号
                    textAlign: 'center' // 表头居中
                },
                bodyStyle: {
                    hover: {
                        cellBgColor: '#f5f5f5'
                    },
                    autoWrapText: false, // 禁用表体的自动换行
                    textOverflow: 'visible' // 表体不使用省略号
                }
            },
            defaultRowHeight: 40, // 固定行高为40px
            defaultHeaderRowHeight: 50, // 固定表头行高为50px
            // 移除内置分页，使用外部分页控件
            // 列调整配置
            columnResizeMode: 'all', // 允许调整所有列的宽度
            allowFrozenColCount: 1,  // 允许冻结第一列
            transpose: false,
            showHeader: true,
            showFrozenIcon: true,
            select: {
                headerSelectMode: 'inline'
            },
            hover: {
                highlightMode: 'cross'
            }
            // 列宽调整功能已通过 columnResizeMode: 'all' 启用
        });

        // 防抖函数
        let resizeTimeout: NodeJS.Timeout;
        let lastWidth = container.clientWidth;
        let lastHeight = container.clientHeight;

        // 监听窗口大小变化，使用防抖避免无限循环
        const resizeObserver = new ResizeObserver(() => {
            // 清除之前的定时器
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // 使用防抖，300ms 后执行
            resizeTimeout = setTimeout(() => {
                try {
                    if (!container || !container.isConnected) {
                        resizeObserver.disconnect();
                        return;
                    }

                    if (tableInstance) {
                        const newWidth = container.clientWidth;
                        const newHeight = container.clientHeight;

                        // 只有当尺寸确实发生变化时才更新
                        if (Math.abs(newWidth - lastWidth) > 5 || Math.abs(newHeight - lastHeight) > 5) {
                            lastWidth = newWidth;
                            lastHeight = newHeight;

                            // 使用 requestAnimationFrame 确保在下一帧执行
                            requestAnimationFrame(() => {
                                try {
                                    if (tableInstance && container && container.isConnected) {
                                        tableInstance.resize();
                                    }
                                } catch (error) {
                                    console.warn('VTable resize RAF error:', error);
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.warn('VTable resize error:', error);
                }
            }, 300);
        });

        // 延迟观察，避免初始化时的冲突
        const delayTimeout = setTimeout(() => {
            if (container && resizeObserver) {
                resizeObserver.observe(container);
                // 为每个表格单独管理观察器
                observersRef.observers.push(resizeObserver);

                // 给容器添加一个标识，用于清理时识别
                (container as any).__resizeObserver = resizeObserver;
                (container as any).__resizeTimeout = resizeTimeout;
            }
        }, 100);

        observersRef.timeouts.push(delayTimeout);

        return tableInstance;
    };

    // 加载死亡数据页面的函数
    const loadMortalityPage = async (mortalityYear: string, page: number = 1, pageSize?: number) => {
        if (!mortalityYear) return;

        setLoadingMortalityData(true);

        // 先显示加载状态
        const loadingContainer = document.getElementById('mortality-table');
        if (loadingContainer) {
            loadingContainer.innerHTML = `<div style="text-align: center; padding: 20px;">${t('common.loading')}</div>`;
        }

        try {
            const currentPageSize = pageSize || mortalityPaginationState.pageSize;
            console.log(`加载死亡数据: 年份=${mortalityYear}, 页码=${page}, 每页=${currentPageSize}`);
            const data = await fetchMortalityData(mortalityYear, page, currentPageSize);
            if (data) {
                setCurrentMortalityData(data);
                setTimeout(() => {
                    const table = createVTable('mortality-table', data);
                    setMortalityTable(table);
                    setLoadingMortalityData(false);
                }, 100);
            }
        } catch (error) {
            console.error('加载死亡数据失败:', error);
            setLoadingMortalityData(false);
        }
    };

    // 变量搜索函数
    const handleSearch = async (value: string) => {
        if (!value.trim()) {
            message.warning('请输入搜索关键词');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.SEARCH_VARIABLES), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: value }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setSearchResults(data.results);
                if (data.results.length === 0) {
                    message.info('未找到匹配的变量');
                }
            } else {
                message.error(data.error || '搜索失败');
            }
        } catch (error) {
            console.error('搜索变量失败:', error);
            message.error('搜索变量失败，请检查网络连接');
        } finally {
            setIsSearching(false);
        }
    };

    // 加载指定页面数据的函数
    const loadIndicatorPage = async (indicatorName: string, page: number = 1, pageSize?: number) => {
        if (!indicatorName) return;

        setLoadingIndicatorData(true);

        // 先显示加载状态
        const loadingContainer = document.getElementById('common-indicator-table');
        if (loadingContainer) {
            loadingContainer.innerHTML = `<div style="text-align: center; padding: 20px;">${t('common.loading')}</div>`;
        }

        try {
            const currentPageSize = pageSize || paginationState.pageSize;
            console.log(`加载数据: 指标=${indicatorName}, 页码=${page}, 每页=${currentPageSize}`);
            const data = await fetchIndicatorData(indicatorName, page, currentPageSize);
            if (data) {
                setCurrentIndicatorData(data);
                setTimeout(() => {
                    const table = createVTable('common-indicator-table', data);
                    setCommonTable(table);
                    setLoadingIndicatorData(false);
                }, 100);
            }
        } catch (error) {
            console.error('加载指标数据失败:', error);
            setLoadingIndicatorData(false);
        }
    };

    // 监听选择变化，重置分页并加载第一页数据
    useEffect(() => {
        if (selectedCommonIndicator) {
            setPaginationState(prev => ({
                ...prev,
                currentPage: 1
            }));
            loadIndicatorPage(selectedCommonIndicator, 1);
        }
    }, [selectedCommonIndicator]);

    // 监听分页变化，加载对应页面数据
    useEffect(() => {
        if (selectedCommonIndicator && paginationState.currentPage > 1) {
            loadIndicatorPage(selectedCommonIndicator, paginationState.currentPage);
        }
    }, [paginationState.currentPage]);

    // 注：页面大小变化的处理已移到Select的onChange中，避免状态更新延迟问题

    // 监听死亡数据选择变化，重置分页并加载第一页数据
    useEffect(() => {
        if (selectedMortalityIndicator) {
            setMortalityPaginationState(prev => ({
                ...prev,
                currentPage: 1
            }));
            loadMortalityPage(selectedMortalityIndicator, 1);
        }
    }, [selectedMortalityIndicator]);

    // 监听死亡数据分页变化，加载对应页面数据
    useEffect(() => {
        if (selectedMortalityIndicator && mortalityPaginationState.currentPage > 1) {
            loadMortalityPage(selectedMortalityIndicator, mortalityPaginationState.currentPage);
        }
    }, [mortalityPaginationState.currentPage]);

    useEffect(() => {
        if (selectedPresetGroup) {
            const data = mockPresetGroupData[selectedPresetGroup as keyof typeof mockPresetGroupData];
            if (data) {
                setTimeout(() => {
                    const table = createVTable('preset-group-table', data);
                    setPresetTable(table);
                }, 100);
            }
        }
    }, [selectedPresetGroup]);

    // 组件卸载时清理表格实例和观察器
    useEffect(() => {
        return () => {
            // 清理表格实例
            if (commonTable) commonTable.release();
            if (mortalityTable) mortalityTable.release();
            if (presetTable) presetTable.release();

            // 清理ResizeObserver
            observersRef.observers.forEach(observer => {
                observer.disconnect();
            });
            observersRef.observers.length = 0;

            // 清理定时器
            observersRef.timeouts.forEach(timeout => {
                clearTimeout(timeout);
            });
            observersRef.timeouts.length = 0;
        };
    }, []); // 移除依赖项，只在组件卸载时执行

    // 添加自定义提取项
    const addCustomExtraction = () => {
        if (selectedYears.length === 0 || !fileName || !indicators) {
            Modal.warning({
                title: t('dataExtraction.messages.completeInfo'),
                content: t('dataExtraction.messages.completeInfoContent')
            });
            return;
        }

        const newItem: CustomExtractionItem = {
            key: Date.now().toString(),
            years: [...selectedYears],
            fileName: fileName,
            indicators: indicators
        };

        setCustomExtractions([...customExtractions, newItem]);
        setSelectedYears([]);
        setFileName('');
        setIndicators('');

        Modal.success({
            title: t('dataExtraction.messages.addSuccess'),
            content: t('dataExtraction.messages.addSuccessContent')
        });
    };

    // 删除自定义提取项
    const deleteCustomExtraction = (key: string) => {
        setCustomExtractions(customExtractions.filter(item => item.key !== key));
    };

    // 开始编辑
    const startEdit = (record: CustomExtractionItem) => {
        setEditingItem(record.key);
        setEditForm({
            years: record.years,
            fileName: record.fileName,
            indicators: record.indicators
        });
    };

    // 保存编辑
    const saveEdit = () => {
        if (!editingItem) return;

        setCustomExtractions(prev => prev.map(item =>
            item.key === editingItem
                ? { ...item, ...editForm }
                : item
        ));

        // 重置编辑状态
        setEditingItem(null);
        setEditForm({ years: [], fileName: '', indicators: '' });

        message.success('修改成功');
    };

    // 取消编辑
    const cancelEdit = () => {
        setEditingItem(null);
        setEditForm({ years: [], fileName: '', indicators: '' });
    };

    // 导出全部指标数据的函数
    const exportAllIndicatorData = async (indicatorName: string) => {
        if (!indicatorName) return;

        setDownloadingStates(prev => ({ ...prev, exportAll: true }));

        try {
            // 调用后端API获取全部数据（不分页）
            const response = await fetch(getApiUrl(API_ENDPOINTS.INDICATOR_DATA(indicatorName)) + '?export_all=true');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                const indicatorLabel = commonIndicators.find(item => item.value === indicatorName)?.label || indicatorName;
                const exportData = {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records
                };

                exportToCSV(exportData, `${indicatorLabel}_全部数据.csv`);
            } else {
                message.error(t('dataExtraction.messages.fetchDataFailed'));
            }
        } catch (error) {
            console.error('导出全部数据失败:', error);
            message.error(t('dataExtraction.messages.exportFailed'));
        } finally {
            setDownloadingStates(prev => ({ ...prev, exportAll: false }));
        }
    };

    // 导出全部死亡数据的函数
    const exportAllMortalityData = async (mortalityYear: string) => {
        if (!mortalityYear) return;

        setDownloadingStates(prev => ({ ...prev, exportAll: true }));

        try {
            // 调用后端API获取全部死亡数据（不分页）
            const response = await fetch(getApiUrl(API_ENDPOINTS.MORTALITY_DATA(mortalityYear)) + '?export_all=true');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                const mortalityLabel = mortalityIndicators.find(item => item.value === mortalityYear)?.label || mortalityYear;
                const exportData = {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records
                };

                exportToCSV(exportData, `${mortalityLabel}_全部数据.csv`);
            } else {
                message.error('获取全部死亡数据失败');
            }
        } catch (error) {
            console.error('导出全部死亡数据失败:', error);
            message.error('导出全部死亡数据失败，请检查网络连接');
        } finally {
            setDownloadingStates(prev => ({ ...prev, exportAll: false }));
        }
    };

    // 导出CSV功能
    const exportToCSV = (data: any, filename: string) => {
        if (!data || !data.records || data.records.length === 0) {
            message.warning(t('dataExtraction.messages.noDataToExport'));
            return;
        }

        const recordCount = data.records.length;

        // 显示导出进度提示
        const hide = message.loading(t('dataExtraction.messages.exportProgress', { count: recordCount }), 0);

        try {
            // 构建CSV内容
            const headers = data.columns.map((col: any) => col.title || col.field);
            const csvContent = [
                // 表头
                headers.join(','),
                // 数据行
                ...data.records.map((record: any) =>
                    data.columns.map((col: any) => {
                        const value = record[col.field];
                        // 处理包含逗号、引号或换行符的值
                        if (value === null || value === undefined) {
                            return '';
                        }
                        const stringValue = String(value);
                        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                            return `"${stringValue.replace(/"/g, '""')}"`;
                        }
                        return stringValue;
                    }).join(',')
                )
            ].join('\n');

            // 创建下载链接
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset-utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 清理URL对象
            setTimeout(() => URL.revokeObjectURL(url), 100);

            hide();
            message.success(t('dataExtraction.messages.exportSuccess', { count: recordCount }));
        } catch (error) {
            hide();
            console.error('导出失败:', error);
            message.error(t('dataExtraction.messages.exportFailed'));
        }
    };

    // 指标标准化：若未包含 SEQN，则自动加入并置于首位
    const normalizeIndicators = (indicators: string): string => {
        if (!indicators || !indicators.trim()) return 'seqn';
        const parts = indicators
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        const filtered = parts.filter(p => p.toLowerCase() !== 'SEQN');
        return ['seqn', ...filtered].join(',');
    };

    // 下载自定义单个文件
    const downloadCustomFile = async (record: CustomExtractionItem) => {
        setDownloadingState('custom', true);

        try {
            console.log('下载自定义文件:', {
                type: 'custom',
                data: {
                    years: record.years,
                    fileName: record.fileName,
                    indicators: record.indicators.split(',')
                }
            });

            // 构造请求数据 - 为每个年份创建一个项目
            const items = record.years.map(year => ({
                year: year,
                file: record.fileName,
                indicator: normalizeIndicators(record.indicators)
            }));

            // 调用后端API
            const response = await fetch(getApiUrl(API_ENDPOINTS.PROCESS_NHANES), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.csv_data) {
                // 创建CSV文件下载
                const blob = new Blob(['\uFEFF' + result.csv_data], {
                    type: 'text/csv;charset=utf-8;'
                });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                const suggested = (result && result.suggested_filename) ? String(result.suggested_filename) : `${record.fileName}.csv`;
                link.setAttribute('download', suggested);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);

                setDownloadingState('custom', false);
                Modal.success({
                    title: t('dataExtraction.messages.downloadSuccess'),
                    content: t('dataExtraction.messages.downloadSuccessContent')
                });
            } else {
                throw new Error(result.error || '数据处理失败');
            }
        } catch (error) {
            console.error('下载自定义文件失败:', error);
            setDownloadingState('custom', false);
            Modal.error({
                title: '下载失败',
                content: `下载自定义文件时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
            });
        }
    };

    // 下载常见指标
    const downloadCommonIndicator = () => {
        if (!selectedCommonIndicator) return;

        setDownloadingState('common', true);

        const selectedItem = commonIndicators.find(item => item.value === selectedCommonIndicator);
        console.log('下载常见指标:', {
            type: 'common_indicator',
            data: {
                indicator: selectedCommonIndicator,
                label: selectedItem?.label,
                description: selectedItem?.description
            }
        });

        // 模拟API调用
        setTimeout(() => {
            setDownloadingState('common', false);
            Modal.success({
                title: t('dataExtraction.messages.downloadSuccess'),
                content: t('dataExtraction.messages.downloadSuccessContent')
            });
        }, 1500);
    };

    // 下载死亡指标
    const downloadMortalityData = () => {
        if (!selectedMortalityIndicator) return;

        setDownloadingState('mortality', true);

        const selectedItem = mortalityIndicators.find(item => item.value === selectedMortalityIndicator);
        console.log('下载死亡数据:', {
            type: 'mortality_data',
            data: {
                indicator: selectedMortalityIndicator,
                label: selectedItem?.label,
                description: selectedItem?.description
            }
        });

        // 模拟API调用
        setTimeout(() => {
            setDownloadingState('mortality', false);
            Modal.success({
                title: t('dataExtraction.messages.downloadSuccess'),
                content: t('dataExtraction.messages.downloadSuccessContent')
            });
        }, 2500);
    };

    // 下载预设变量组
    const downloadPresetGroup = () => {
        if (!selectedPresetGroup) return;

        setDownloadingState('preset', true);

        const selectedItem = presetVariableGroups.find(item => item.value === selectedPresetGroup);
        console.log('下载预设变量组:', {
            type: 'preset_group',
            data: {
                group: selectedPresetGroup,
                label: selectedItem?.label,
                variables: selectedItem?.variables,
                description: selectedItem?.description
            }
        });

        // 模拟API调用
        setTimeout(() => {
            setDownloadingState('preset', false);
            Modal.success({
                title: t('dataExtraction.messages.downloadSuccess'),
                content: t('dataExtraction.messages.downloadSuccessContent')
            });
        }, 1800);
    };

    // 批量下载所有自定义文件（后端按 seqn 合并，返回单一文件）
    const downloadAllCustomFiles = async () => {
        if (customExtractions.length === 0) {
            Modal.warning({
                title: t('common.noData'),
                content: t('dataExtraction.messages.noDataToDownload')
            });
            return;
        }

        setDownloadingState('batchCustom', true);

        try {
            console.log('批量下载自定义文件:', {
                type: 'batch_custom',
                data: {
                    files: customExtractions.map(item => ({
                        years: item.years,
                        fileName: item.fileName,
                        indicators: item.indicators.split(',')
                    }))
                }
            });

            // 构造所有请求项目（由后端进行合并）
            const allItems: Array<{ year: string, file: string, indicator: string }> = [];
            customExtractions.forEach(record => {
                record.years.forEach(year => {
                    allItems.push({
                        year: year,
                        file: record.fileName,
                        indicator: normalizeIndicators(record.indicators)
                    });
                });
            });

            // 调用后端批量合并接口
            const response = await fetch(getApiUrl(API_ENDPOINTS.PROCESS_NHANES_BATCH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: allItems })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.csv_data) {
                // 创建合并后的CSV文件下载
                const blob = new Blob(['\uFEFF' + result.csv_data], {
                    type: 'text/csv;charset=utf-8;'
                });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                const suggested = (result && result.suggested_filename) ? String(result.suggested_filename) : `batch_custom_extraction_${new Date().toISOString().split('T')[0]}.csv`;
                link.setAttribute('download', suggested);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);

                setDownloadingState('batchCustom', false);
                Modal.success({
                    title: t('dataExtraction.messages.batchDownloadSuccess'),
                    content: t('dataExtraction.messages.batchDownloadSuccessContent', { count: customExtractions.length })
                });
            } else {
                throw new Error(result.error || '批量数据处理失败');
            }
        } catch (error) {
            console.error('批量下载自定义文件失败:', error);
            setDownloadingState('batchCustom', false);
            Modal.error({
                title: '批量下载失败',
                content: `批量下载自定义文件时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
            });
        }
    };

    // 获取死亡数据的函数
    const fetchMortalityData = async (mortalityYear: string, page: number = 1, limit: number = 10) => {
        try {
            // 调用后端API获取死亡数据
            const response = await fetch(getApiUrl(API_ENDPOINTS.MORTALITY_DATA(mortalityYear)) + `?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                // 更新分页状态
                if (apiData.pagination) {
                    setMortalityPaginationState(prev => ({
                        ...prev,
                        currentPage: apiData.pagination.page,
                        pageSize: apiData.pagination.limit,
                        total: apiData.pagination.total,
                        totalPages: apiData.pagination.total_pages
                    }));
                }

                // 转换API响应数据为VTable格式
                return {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records,
                    pagination: apiData.pagination
                };
            } else {
                throw new Error('API响应格式不正确');
            }
        } catch (error) {
            console.error('获取死亡数据失败:', error);
            // 如果API失败，设置空数据
            setMortalityPaginationState(prev => ({
                ...prev,
                currentPage: 1,
                pageSize: 0,
                total: 0,
                totalPages: 0
            }));
            return null;
        }
    };

    // API调用函数
    const fetchIndicatorData = async (indicatorName: string, page: number = 1, limit: number = 10) => {
        try {
            // 调用后端API获取真实数据
            const response = await fetch(getApiUrl(API_ENDPOINTS.INDICATOR_DATA(indicatorName)) + `?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                // 更新分页状态
                if (apiData.pagination) {
                    setPaginationState(prev => ({
                        ...prev,
                        currentPage: apiData.pagination.page,
                        pageSize: apiData.pagination.limit,
                        total: apiData.pagination.total,
                        totalPages: apiData.pagination.total_pages
                    }));
                }

                // 转换API响应数据为VTable格式
                return {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records,
                    pagination: apiData.pagination
                };
            } else {
                throw new Error('API响应格式不正确');
            }
        } catch (error) {
            console.error('获取指标数据失败:', error);
            // 如果API失败，回退到模拟数据
            const fallbackData = mockCommonIndicatorData[indicatorName as keyof typeof mockCommonIndicatorData];
            if (fallbackData) {
                console.log('使用模拟数据作为备选方案');
                // 为模拟数据设置分页信息
                setPaginationState(prev => ({
                    ...prev,
                    currentPage: 1,
                    pageSize: fallbackData.records.length,
                    total: fallbackData.records.length,
                    totalPages: 1
                }));
                return fallbackData;
            } else {
                // 如果没有模拟数据，返回空数据结构
                setPaginationState(prev => ({
                    ...prev,
                    currentPage: 1,
                    pageSize: 0,
                    total: 0,
                    totalPages: 0
                }));
                return {
                    columns: [
                        { field: 'message', title: '提示', width: 'auto' }
                    ],
                    records: [
                        { message: `暂无 ${indicatorName} 指标数据` }
                    ]
                };
            }
        }
    };

    // 自定义提取表格列
    const customColumns = [
        {
            title: t('common.yearRange'),
            dataIndex: 'years',
            key: 'years',
            width: 150,
            render: (years: string[], record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;
                return isEditing ? (
                    <Checkbox.Group
                        value={editForm.years}
                        onChange={(values) => setEditForm(prev => ({ ...prev, years: values as string[] }))}
                        style={{ fontSize: '12px' }}
                    >
                        <div style={{ maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                            <Space direction="vertical" size={2}>
                                {yearOptions.map(year => (
                                    <Checkbox key={year} value={year} style={{ fontSize: '11px' }}>
                                        {year}
                                    </Checkbox>
                                ))}
                            </Space>
                        </div>
                    </Checkbox.Group>
                ) : (
                    <div>
                        {years.map(year => (
                            <Tag key={year} style={{ margin: '1px', fontSize: '10px' }}>
                                {year}
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: t('common.fileName'),
            dataIndex: 'fileName',
            key: 'fileName',
            width: 150,
            render: (fileName: string, record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;
                return isEditing ? (
                    <Input
                        size="small"
                        value={editForm.fileName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fileName: e.target.value }))}
                        placeholder="文件名"
                    />
                ) : (
                    <Tag color="blue">{fileName}</Tag>
                );
            }
        },
        {
            title: t('common.indicators'),
            dataIndex: 'indicators',
            key: 'indicators',
            render: (indicators: string, record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;
                return isEditing ? (
                    <Input
                        size="small"
                        value={editForm.indicators}
                        onChange={(e) => setEditForm(prev => ({ ...prev, indicators: e.target.value }))}
                        placeholder="指标，用逗号分隔"
                    />
                ) : (
                    <div style={{ maxWidth: '200px' }}>
                        {indicators.split(',').map((indicator, index) => (
                            <Tag key={index} style={{ margin: '1px' }}>
                                {indicator.trim()}
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;

                if (isEditing) {
                    return (
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space size="small">
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={saveEdit}
                                    style={{ fontSize: '11px' }}
                                >
                                    {t('common.save')}
                                </Button>
                                <Button
                                    size="small"
                                    onClick={cancelEdit}
                                    style={{ fontSize: '11px' }}
                                >
                                    {t('common.cancel')}
                                </Button>
                            </Space>
                        </Space>
                    );
                }

                return (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space size="small">
                            <Button
                                type="default"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => startEdit(record)}
                                style={{ fontSize: '11px' }}
                            >
                                {t('common.edit')}
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => deleteCustomExtraction(record.key)}
                                style={{ fontSize: '11px' }}
                            >
                                {t('common.delete')}
                            </Button>
                        </Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => downloadCustomFile(record)}
                            loading={downloadingStates.custom}
                            block
                            style={{ fontSize: '11px' }}
                        >
                            {t('common.download')}
                        </Button>
                    </Space>
                );
            }
        }
    ];

    return (
        <div>
            <Title level={2}>{t('dataExtraction.title')}</Title>
            <Text type="secondary">
                {t('dataExtraction.subtitle')}
            </Text>

            <div style={{ marginTop: 24 }}>
                {/* 变量搜索 */}
                <Card
                    title={
                        <Space>
                            <SearchOutlined style={{ color: '#1890ff' }} />
                            <span>{t('home.features.dataExtraction.variableSearch.title', '变量搜索')}</span>
                        </Space>
                    }
                    style={{ marginBottom: 16 }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <div style={{ marginBottom: 16 }}>
                        <Input.Search
                            placeholder={t('home.features.dataExtraction.variableSearch.placeholder', '输入关键词搜索变量 (如: HDL, Glucose)')}
                            enterButton={t('common.search', '搜索')}
                            size="large"
                            onSearch={handleSearch}
                            loading={isSearching}
                        />
                    </div>

                    {searchResults.length > 0 && (
                        <>
                            <Table
                                dataSource={searchResults}
                                columns={[
                                    { title: t('common.year', 'Year'), dataIndex: 'year', key: 'year', width: 100 },
                                    { title: t('common.fileName', 'File Name'), dataIndex: 'file', key: 'file', width: 150 },
                                    { title: t('common.variable', 'Variable'), dataIndex: 'variable', key: 'variable', width: 120 },
                                    { title: t('common.label', 'Label'), dataIndex: 'label', key: 'label' },
                                    { title: t('common.description', 'Description'), dataIndex: 'description', key: 'description', ellipsis: true }
                                ]}
                                rowKey={(record) => `${record.year}-${record.variable}`}
                                rowSelection={{
                                    type: 'checkbox',
                                    onChange: (selectedRowKeys, selectedRows) => {
                                        setSelectedSearchRows(selectedRows);
                                    },
                                }}
                                pagination={{ pageSize: 10 }}
                                size="small"
                                scroll={{ x: 'max-content' }}
                            />
                            {selectedSearchRows.length > 0 && (
                                <div style={{ marginTop: 16, textAlign: 'right' }}>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            // Helper function to extract base name and suffix
                                            const parseFileName = (fileName: string): { base: string, suffix: string } => {
                                                // Match pattern: base_letter or just base
                                                const match = fileName.match(/^(.+?)(_[a-z])?$/i);
                                                if (match) {
                                                    return {
                                                        base: match[1],
                                                        suffix: match[2] || ''
                                                    };
                                                }
                                                return { base: fileName, suffix: '' };
                                            };

                                            // Group by file name first
                                            const fileGroups: { [key: string]: { years: Set<string>, file: string, variables: Set<string> }[] } = {};

                                            selectedSearchRows.forEach(row => {
                                                const key = row.file;
                                                if (!fileGroups[key]) {
                                                    fileGroups[key] = [];
                                                }

                                                // Find if there's already a group for this year
                                                let yearGroup = fileGroups[key].find(g => g.years.has(row.year));
                                                if (!yearGroup) {
                                                    yearGroup = {
                                                        years: new Set([row.year]),
                                                        file: row.file,
                                                        variables: new Set()
                                                    };
                                                    fileGroups[key].push(yearGroup);
                                                }
                                                yearGroup.variables.add(row.variable);
                                            });

                                            // Try to merge groups with similar file names (NHANES pattern)
                                            const allFiles = Object.keys(fileGroups);
                                            const mergedGroups: { years: Set<string>, fileName: string, variables: Set<string> }[] = [];

                                            // Group files by base name
                                            const baseGroups: { [base: string]: string[] } = {};
                                            allFiles.forEach(file => {
                                                const { base } = parseFileName(file);
                                                if (!baseGroups[base]) {
                                                    baseGroups[base] = [];
                                                }
                                                baseGroups[base].push(file);
                                            });

                                            // Process each base group
                                            Object.entries(baseGroups).forEach(([base, files]) => {
                                                if (files.length > 1) {
                                                    // Check if all files follow the pattern: base, base_b, base_c, etc.
                                                    const allFollowPattern = files.every(f => {
                                                        const { base: fBase, suffix } = parseFileName(f);
                                                        return fBase === base && (suffix === '' || /^_[a-z]$/i.test(suffix));
                                                    });

                                                    if (allFollowPattern) {
                                                        // Merge these files
                                                        const mergedYears = new Set<string>();
                                                        const mergedVariables = new Set<string>();

                                                        files.forEach(f => {
                                                            fileGroups[f].forEach(group => {
                                                                group.years.forEach(y => mergedYears.add(y));
                                                                group.variables.forEach(v => mergedVariables.add(v));
                                                            });
                                                        });

                                                        mergedGroups.push({
                                                            years: mergedYears,
                                                            fileName: base + '_', // Use base_ to indicate a merged file set
                                                            variables: mergedVariables
                                                        });
                                                    } else {
                                                        // Don't merge, keep separate
                                                        files.forEach(f => {
                                                            fileGroups[f].forEach(group => {
                                                                mergedGroups.push({
                                                                    years: group.years,
                                                                    fileName: f,
                                                                    variables: group.variables
                                                                });
                                                            });
                                                        });
                                                    }
                                                } else {
                                                    // Single file, keep as is
                                                    fileGroups[files[0]].forEach(group => {
                                                        mergedGroups.push({
                                                            years: group.years,
                                                            fileName: files[0],
                                                            variables: group.variables
                                                        });
                                                    });
                                                }
                                            });

                                            // Add each merged group as a custom extraction
                                            mergedGroups.forEach(group => {
                                                const newItem: CustomExtractionItem = {
                                                    key: Date.now().toString() + Math.random(),
                                                    years: Array.from(group.years),
                                                    fileName: group.fileName,
                                                    indicators: Array.from(group.variables).join(',')
                                                };
                                                setCustomExtractions(prev => [...prev, newItem]);
                                            });

                                            message.success(`已添加 ${selectedSearchRows.length} 个变量到自定义提取列表`);
                                            setSelectedSearchRows([]);
                                        }}
                                    >
                                        添加到自定义提取 ({selectedSearchRows.length})
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {/* 自定义提取 */}
                <Card
                    title={
                        <Space>
                            <PlusOutlined style={{ color: '#1890ff' }} />
                            <span>{t('dataExtraction.customExtraction.title')}</span>
                        </Space>
                    }
                    style={{ marginBottom: 16 }}
                    bodyStyle={{ padding: '20px' }}
                >
                    {/* 添加新项目表单 */}
                    <div style={{
                        background: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #e9ecef'
                    }}>
                        <Row gutter={isMobile ? [8, 12] : [16, 16]}>
                            <Col span={24}>
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        📅 {t('dataExtraction.customExtraction.yearRange')}
                                    </Text>
                                </div>
                                <Checkbox.Group
                                    value={selectedYears}
                                    onChange={setSelectedYears}
                                    style={{ width: '100%' }}
                                >
                                    <Row gutter={[6, 6]}>
                                        {yearOptions.map(year => (
                                            <Col span={isMobile ? 12 : 4} key={year}>
                                                <Checkbox
                                                    value={year}
                                                    style={{
                                                        fontSize: isMobile ? '11px' : '13px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {year}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Col>
                        </Row>

                        <Row gutter={isMobile ? [8, 12] : [16, 16]} style={{ marginTop: 16 }}>
                            <Col xs={24} sm={24} md={8}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        📁 {t('dataExtraction.customExtraction.fileName')}
                                    </Text>
                                </div>
                                <Input
                                    placeholder={t('dataExtraction.customExtraction.fileNamePlaceholder')}
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    style={{ borderRadius: '6px' }}
                                    size={isMobile ? 'small' : 'middle'}
                                />
                            </Col>
                            <Col xs={24} sm={24} md={10}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        📊 {t('dataExtraction.customExtraction.indicators')}
                                    </Text>
                                </div>
                                <Input
                                    placeholder={t('dataExtraction.customExtraction.indicatorsPlaceholder')}
                                    value={indicators}
                                    onChange={(e) => setIndicators(e.target.value)}
                                    style={{ borderRadius: '6px' }}
                                    size={isMobile ? 'small' : 'middle'}
                                />
                                <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '12px' }}>
                                    {t('dataExtraction.customExtraction.indicatorsHint')}
                                </Text>
                            </Col>
                            <Col xs={24} sm={24} md={6}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        ⚡ {t('dataExtraction.customExtraction.actions')}
                                    </Text>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addCustomExtraction}
                                    block
                                    size={isMobile ? 'middle' : 'large'}
                                    style={{
                                        borderRadius: '6px',
                                        background: 'linear-gradient(45deg, #1890ff, #36cfc9)',
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
                                    }}
                                >
                                    {t('dataExtraction.customExtraction.addToList')}
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {/* 数据预览表格 */}
                    {customExtractions.length > 0 ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16
                            }}>
                                <div>
                                    <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                        📋 {t('dataExtraction.customExtraction.previewList')}
                                    </Text>
                                    <Text type="secondary" style={{ marginLeft: 8 }}>
                                        {t('dataExtraction.customExtraction.totalItems', { count: customExtractions.length })}
                                    </Text>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={downloadAllCustomFiles}
                                    loading={downloadingStates.batchCustom}
                                    size="large"
                                    style={{
                                        borderRadius: '6px',
                                        background: 'linear-gradient(45deg, #52c41a, #73d13d)',
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                                    }}
                                >
                                    {t('dataExtraction.customExtraction.batchDownload')}
                                </Button>
                            </div>
                            <Table
                                columns={customColumns}
                                dataSource={customExtractions}
                                pagination={false}
                                size="middle"
                                bordered
                                style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}
                                scroll={{ x: 'max-content' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            border: '2px dashed #d9d9d9'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                {t('dataExtraction.customExtraction.noData')}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                {t('dataExtraction.customExtraction.noDataHint')}
                            </Text>
                        </div>
                    )}
                </Card>

                {/* 快速提取选项 */}
                <Row gutter={isMobile ? [8, 16] : [16, 16]}>
                    <Col xs={24} sm={24} md={8}>
                        <Card title={t('dataExtraction.commonIndicators.title')} style={{ height: 200 }}>
                            <Select
                                placeholder={t('dataExtraction.commonIndicators.placeholder')}
                                style={{ width: '100%', marginBottom: 16 }}
                                value={selectedCommonIndicator}
                                onChange={setSelectedCommonIndicator}
                                showSearch
                            >
                                {commonIndicators.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                block
                                disabled={!selectedCommonIndicator}
                                loading={downloadingStates.common}
                                onClick={downloadCommonIndicator}
                            >
                                {t('dataExtraction.commonIndicators.downloadButton')}
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} sm={24} md={8}>
                        <Card title={t('dataExtraction.mortalityData.title')} style={{ height: isMobile ? 'auto' : 200, minHeight: isMobile ? 180 : undefined }}>
                            <Select
                                placeholder={t('dataExtraction.mortalityData.placeholder')}
                                style={{ width: '100%', marginBottom: 16 }}
                                value={selectedMortalityIndicator}
                                onChange={setSelectedMortalityIndicator}
                            >
                                {mortalityIndicators.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                block
                                disabled={!selectedMortalityIndicator}
                                loading={downloadingStates.mortality}
                                onClick={downloadMortalityData}
                            >
                                {t('dataExtraction.mortalityData.downloadButton')}
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} sm={24} md={8}>
                        <Card title={t('dataExtraction.presetGroups.title')} style={{ height: isMobile ? 'auto' : 200, minHeight: isMobile ? 180 : undefined }}>
                            <Select
                                placeholder={t('dataExtraction.presetGroups.placeholder')}
                                style={{ width: '100%', marginBottom: 16 }}
                                value={selectedPresetGroup}
                                onChange={setSelectedPresetGroup}
                            >
                                {presetVariableGroups.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                block
                                disabled={!selectedPresetGroup}
                                loading={downloadingStates.preset}
                                onClick={downloadPresetGroup}
                            >
                                {t('dataExtraction.presetGroups.downloadButton')}
                            </Button>
                        </Card>
                    </Col>
                </Row>

                {/* 分别显示三个选择项的详细信息 */}
                <div style={{ marginTop: 16 }}>


                    {/* 常见指标详细信息 */}
                    {selectedCommonIndicator && (
                        <div style={{ marginBottom: 16 }}>
                            <Card
                                title={
                                    <Space>
                                        <TableOutlined />
                                        <Tag color="blue">{t('dataExtraction.commonIndicators.title')}</Tag>
                                        {commonIndicators.find(item => item.value === selectedCommonIndicator)?.label}
                                    </Space>
                                }
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        {commonIndicators.find(item => item.value === selectedCommonIndicator)?.description}
                                    </Text>
                                </div>

                                {/* 导出按钮 */}
                                {currentIndicatorData && (
                                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                                        <Button
                                            type="default"
                                            icon={<DownloadOutlined />}
                                            onClick={() => exportAllIndicatorData(selectedCommonIndicator)}
                                            loading={downloadingStates.exportAll}
                                            style={{
                                                background: '#52c41a',
                                                borderColor: '#52c41a',
                                                color: 'white'
                                            }}
                                        >
                                            {t('common.exportCSV')}
                                        </Button>
                                    </div>
                                )}

                                {/* 数据统计信息和控制面板 */}
                                {paginationState.total > 0 && (
                                    <div style={{
                                        marginBottom: 16,
                                        padding: '12px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Space>
                                                    <Text>{t('common.pagination.total', { total: paginationState.total })}</Text>
                                                    <Text>|</Text>
                                                    <Text>{t('common.pagination.page')} <strong>{paginationState.currentPage}</strong> / {paginationState.totalPages}</Text>
                                                </Space>
                                            </Col>
                                            <Col>
                                                <Space>
                                                    <Text>{t('common.pagination.pageSize')}:</Text>
                                                    <Select
                                                        size="small"
                                                        value={paginationState.pageSize}
                                                        onChange={(value) => {
                                                            console.log(`用户选择页面大小: ${value}`);
                                                            setPaginationState(prev => ({
                                                                ...prev,
                                                                pageSize: value,
                                                                currentPage: 1
                                                            }));
                                                            if (selectedCommonIndicator) {
                                                                // 直接传递新的页面大小，避免状态更新延迟问题
                                                                loadIndicatorPage(selectedCommonIndicator, 1, value);
                                                            }
                                                        }}
                                                        disabled={loadingIndicatorData}
                                                        style={{ width: 80 }}
                                                    >
                                                        <Option value={10}>10</Option>
                                                        <Option value={20}>20</Option>
                                                        <Option value={50}>50</Option>
                                                        <Option value={100}>100</Option>
                                                        <Option value={200}>200</Option>
                                                    </Select>
                                                    <Text>{t('common.pagination.items')}</Text>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {/* 表格容器 */}
                                <div
                                    id="common-indicator-table"
                                    style={{
                                        width: '100%',
                                        // 固定高度：表头50px + 最初10行*40px = 450px（默认显示完整10行）
                                        // 最大高度：表头50px + 最多20行*40px = 850px（超过20行显示滚动）
                                        height: paginationState.pageSize <= 10 ? '450px' :
                                            paginationState.pageSize <= 20 ? `${50 + paginationState.pageSize * 40}px` : '850px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px',
                                        overflow: 'auto', // 允许垂直和水平滚动
                                        resize: 'none', // 禁用手动调整大小
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />

                                {/* 分页控件 */}
                                {paginationState.totalPages > 1 && (
                                    <div style={{
                                        marginTop: 16,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Space size="middle">
                                            <Button
                                                disabled={paginationState.currentPage <= 1 || loadingIndicatorData}
                                                onClick={() => setPaginationState(prev => ({ ...prev, currentPage: 1 }))}
                                            >
                                                {t('common.pagination.first')}
                                            </Button>
                                            <Button
                                                disabled={paginationState.currentPage <= 1 || loadingIndicatorData}
                                                onClick={() => setPaginationState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                            >
                                                {t('common.pagination.prev')}
                                            </Button>

                                            {/* 页码显示 */}
                                            <Space>
                                                {(() => {
                                                    const { currentPage, totalPages } = paginationState;
                                                    const pageNumbers = [];
                                                    const maxDisplayPages = 5;

                                                    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
                                                    let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

                                                    if (endPage - startPage + 1 < maxDisplayPages) {
                                                        startPage = Math.max(1, endPage - maxDisplayPages + 1);
                                                    }

                                                    for (let i = startPage; i <= endPage; i++) {
                                                        pageNumbers.push(
                                                            <Button
                                                                key={i}
                                                                type={i === currentPage ? 'primary' : 'default'}
                                                                disabled={loadingIndicatorData}
                                                                onClick={() => setPaginationState(prev => ({ ...prev, currentPage: i }))}
                                                                size="small"
                                                            >
                                                                {i}
                                                            </Button>
                                                        );
                                                    }
                                                    return pageNumbers;
                                                })()}
                                            </Space>

                                            <Button
                                                disabled={paginationState.currentPage >= paginationState.totalPages || loadingIndicatorData}
                                                onClick={() => setPaginationState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                            >
                                                {t('common.pagination.next')}
                                            </Button>
                                            <Button
                                                disabled={paginationState.currentPage >= paginationState.totalPages || loadingIndicatorData}
                                                onClick={() => setPaginationState(prev => ({ ...prev, currentPage: prev.totalPages }))}
                                            >
                                                {t('common.pagination.last')}
                                            </Button>

                                            {/* 跳转到指定页 */}
                                            <Space>
                                                <Text>{t('common.pagination.jump')}</Text>
                                                <InputNumber
                                                    size="small"
                                                    min={1}
                                                    max={paginationState.totalPages}
                                                    value={paginationState.currentPage}
                                                    onChange={(value) => {
                                                        if (value && value !== paginationState.currentPage) {
                                                            setPaginationState(prev => ({ ...prev, currentPage: value }));
                                                        }
                                                    }}
                                                    disabled={loadingIndicatorData}
                                                    style={{ width: 60 }}
                                                />
                                                <Text>{t('common.pagination.page')}</Text>
                                            </Space>
                                        </Space>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* 死亡指标详细信息 */}
                    {selectedMortalityIndicator && (
                        <div style={{ marginBottom: 16 }}>
                            <Card
                                title={
                                    <Space>
                                        <TableOutlined />
                                        <Tag color="red">{t('dataExtraction.mortalityData.title')}</Tag>
                                        {mortalityIndicators.find(item => item.value === selectedMortalityIndicator)?.label}
                                    </Space>
                                }
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        {mortalityIndicators.find(item => item.value === selectedMortalityIndicator)?.description}
                                    </Text>
                                </div>

                                {/* 导出按钮 */}
                                {currentMortalityData && (
                                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                                        <Button
                                            type="default"
                                            icon={<DownloadOutlined />}
                                            onClick={() => exportAllMortalityData(selectedMortalityIndicator)}
                                            loading={downloadingStates.exportAll}
                                            style={{
                                                background: '#f5222d',
                                                borderColor: '#f5222d',
                                                color: 'white'
                                            }}
                                        >
                                            {t('common.exportCSV')}
                                        </Button>
                                    </div>
                                )}

                                {/* 数据统计信息和控制面板 */}
                                {mortalityPaginationState.total > 0 && (
                                    <div style={{
                                        marginBottom: 16,
                                        padding: '12px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}>
                                        <Row justify="space-between" align="middle">
                                            <Col>
                                                <Space>
                                                    <Text>{t('common.pagination.total', { total: mortalityPaginationState.total })}</Text>
                                                    <Text>|</Text>
                                                    <Text>当前页: <strong>{mortalityPaginationState.currentPage}</strong> / {mortalityPaginationState.totalPages}</Text>
                                                </Space>
                                            </Col>
                                            <Col>
                                                <Space>
                                                    <Text>{t('common.pagination.pageSize')}:</Text>
                                                    <Select
                                                        value={mortalityPaginationState.pageSize}
                                                        onChange={(value) => {
                                                            setMortalityPaginationState(prev => ({
                                                                ...prev,
                                                                currentPage: 1,
                                                                pageSize: value
                                                            }));
                                                            if (selectedMortalityIndicator) {
                                                                loadMortalityPage(selectedMortalityIndicator, 1, value);
                                                            }
                                                        }}
                                                        disabled={loadingMortalityData}
                                                        style={{ width: 80 }}
                                                    >
                                                        <Option value={10}>10</Option>
                                                        <Option value={20}>20</Option>
                                                        <Option value={50}>50</Option>
                                                        <Option value={100}>100</Option>
                                                        <Option value={200}>200</Option>
                                                    </Select>
                                                    <Text>{t('common.pagination.items')}</Text>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {/* 表格容器 */}
                                <div
                                    id="mortality-table"
                                    style={{
                                        width: '100%',
                                        height: mortalityPaginationState.pageSize <= 10 ? '450px' :
                                            mortalityPaginationState.pageSize <= 20 ? `${50 + mortalityPaginationState.pageSize * 40}px` : '850px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px',
                                        overflow: 'auto',
                                        resize: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />

                                {/* 分页控件 */}
                                {mortalityPaginationState.totalPages > 1 && (
                                    <div style={{
                                        marginTop: 16,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Space size="middle">
                                            <Button
                                                disabled={mortalityPaginationState.currentPage <= 1 || loadingMortalityData}
                                                onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: 1 }))}
                                            >
                                                {t('common.pagination.first')}
                                            </Button>
                                            <Button
                                                disabled={mortalityPaginationState.currentPage <= 1 || loadingMortalityData}
                                                onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                            >
                                                {t('common.pagination.prev')}
                                            </Button>

                                            {/* 页码显示 */}
                                            <Space>
                                                {(() => {
                                                    const { currentPage, totalPages } = mortalityPaginationState;
                                                    const pageNumbers = [];
                                                    const maxDisplayPages = 5;

                                                    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
                                                    let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

                                                    if (endPage - startPage + 1 < maxDisplayPages) {
                                                        startPage = Math.max(1, endPage - maxDisplayPages + 1);
                                                    }

                                                    for (let i = startPage; i <= endPage; i++) {
                                                        pageNumbers.push(
                                                            <Button
                                                                key={i}
                                                                type={i === currentPage ? 'primary' : 'default'}
                                                                disabled={loadingMortalityData}
                                                                onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: i }))}
                                                                size="small"
                                                            >
                                                                {i}
                                                            </Button>
                                                        );
                                                    }
                                                    return pageNumbers;
                                                })()}
                                            </Space>

                                            <Button
                                                disabled={mortalityPaginationState.currentPage >= mortalityPaginationState.totalPages || loadingMortalityData}
                                                onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                            >
                                                {t('common.pagination.next')}
                                            </Button>
                                            <Button
                                                disabled={mortalityPaginationState.currentPage >= mortalityPaginationState.totalPages || loadingMortalityData}
                                                onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: prev.totalPages }))}
                                            >
                                                {t('common.pagination.last')}
                                            </Button>

                                            {/* 跳转到指定页 */}
                                            <Space>
                                                <Text>{t('common.pagination.jump')}</Text>
                                                <InputNumber
                                                    size="small"
                                                    min={1}
                                                    max={mortalityPaginationState.totalPages}
                                                    value={mortalityPaginationState.currentPage}
                                                    onChange={(value) => {
                                                        if (value && value !== mortalityPaginationState.currentPage) {
                                                            setMortalityPaginationState(prev => ({ ...prev, currentPage: value }));
                                                        }
                                                    }}
                                                    disabled={loadingMortalityData}
                                                    style={{ width: 60 }}
                                                />
                                                <Text>{t('common.pagination.page')}</Text>
                                            </Space>
                                        </Space>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* 预设变量组详细信息 */}
                    {selectedPresetGroup && (
                        <div style={{ marginBottom: 16 }}>
                            <Card
                                title={
                                    <Space>
                                        <TableOutlined />
                                        <Tag color="green">{t('dataExtraction.presetGroups.title')}</Tag>
                                        {presetVariableGroups.find(item => item.value === selectedPresetGroup)?.label}
                                    </Space>
                                }
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        {presetVariableGroups.find(item => item.value === selectedPresetGroup)?.description}
                                    </Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text>包含变量：</Text>
                                        {presetVariableGroups.find(item => item.value === selectedPresetGroup)?.variables.map(variable => (
                                            <Tag key={variable} style={{ margin: '2px' }}>{variable}</Tag>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    id="preset-group-table"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        minHeight: '300px',
                                        maxHeight: '500px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        resize: 'vertical'
                                    }}
                                />
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataExtraction; 