import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhTranslations = {
    home: {
        title: 'NHANES 数据处理系统',
        subtitle: '美国国家健康与营养检查调查数据库处理平台',
        features: {
            dataExtraction: {
                title: '数据提取',
                subtitle: 'Data Extraction',
                description: '从NHANES数据库中提取所需变量和样本，支持多种筛选条件和导出格式',
                features: {
                    customExtraction: {
                        name: '自定义提取',
                        detail: '灵活选择年份、文件名和指标'
                    },
                    presetVariables: {
                        name: '预设变量组',
                        detail: '快速选择常用变量组合'
                    },
                    secondaryIndicators: {
                        name: '二级指标提取',
                        detail: '人口学、体格测量等分类指标'
                    },
                    mortalityData: {
                        name: '死亡数据提取',
                        detail: '获取死亡跟踪随访数据'
                    }
                },
                stats: {
                    samples: '100万+',
                    variables: '15000+',
                    cycles: '20+'
                },
                button: '进入数据提取'
            },
            visualization: {
                title: '数据可视化',
                subtitle: 'Data Visualization',
                description: '创建专业的统计图表和数据可视化，直观展示数据模式和趋势',
                features: {
                    chartTypes: {
                        name: '多种图表类型',
                        detail: '柱状图、散点图、折线图等'
                    },
                    interactiveConfig: {
                        name: '交互式配置',
                        detail: '拖拽式变量配置界面'
                    },
                    realTimePreview: {
                        name: '实时预览',
                        detail: '即时查看图表效果'
                    },
                    highQualityExport: {
                        name: '高质量导出',
                        detail: '支持多种格式输出'
                    }
                },
                stats: {
                    charts: '15+',
                    formats: '5+',
                    resolution: '4K'
                },
                button: '进入数据可视化'
            },
            analysis: {
                title: '数据分析',
                subtitle: 'Statistical Analysis',
                description: '执行专业的统计分析方法，获得科学可靠的研究结论和洞察',
                features: {
                    descriptiveStats: {
                        name: '描述性统计',
                        detail: '均值、标准差、分布分析'
                    },
                    hypothesisTesting: {
                        name: '假设检验',
                        detail: 'T检验、卡方检验等'
                    },
                    regression: {
                        name: '回归建模',
                        detail: '线性、逻辑回归分析'
                    },
                    survivalAnalysis: {
                        name: '生存分析',
                        detail: 'Cox回归、Kaplan-Meier'
                    }
                },
                stats: {
                    methods: '20+',
                    models: '10+',
                    precision: '99.9%'
                },
                button: '进入数据分析'
            }
        },
        introduction: {
            title: '功能简介',
            dataExtraction: {
                title: '数据提取：',
                description: '快速筛选和导出NHANES数据库中的目标数据'
            },
            visualization: {
                title: '数据可视化：',
                description: '生成专业的统计图表，直观展示数据规律'
            },
            analysis: {
                title: '数据分析：',
                description: '执行各种统计分析方法，获得科学结论'
            }
        }
    }
};

// 英文翻译
const enTranslations = {
    home: {
        title: 'NHANES Data Processing System',
        subtitle: 'National Health and Nutrition Examination Survey Database Processing Platform',
        features: {
            dataExtraction: {
                title: 'Data Extraction',
                subtitle: 'Data Extraction',
                description: 'Extract required variables and samples from NHANES database with multiple filtering options and export formats',
                features: {
                    customExtraction: {
                        name: 'Custom Extraction',
                        detail: 'Flexible selection of years, files and indicators'
                    },
                    presetVariables: {
                        name: 'Preset Variables',
                        detail: 'Quick selection of common variable combinations'
                    },
                    secondaryIndicators: {
                        name: 'Secondary Indicators',
                        detail: 'Demographics, physical measurements and other categorical indicators'
                    },
                    mortalityData: {
                        name: 'Mortality Data',
                        detail: 'Access mortality follow-up data'
                    }
                },
                stats: {
                    samples: '1M+',
                    variables: '15K+',
                    cycles: '20+'
                },
                button: 'Enter Data Extraction'
            },
            visualization: {
                title: 'Data Visualization',
                subtitle: 'Data Visualization',
                description: 'Create professional statistical charts and data visualizations to intuitively display data patterns and trends',
                features: {
                    chartTypes: {
                        name: 'Multiple Chart Types',
                        detail: 'Bar, scatter, line charts and more'
                    },
                    interactiveConfig: {
                        name: 'Interactive Config',
                        detail: 'Drag-and-drop variable configuration'
                    },
                    realTimePreview: {
                        name: 'Real-time Preview',
                        detail: 'Instant chart preview'
                    },
                    highQualityExport: {
                        name: 'High Quality Export',
                        detail: 'Support multiple output formats'
                    }
                },
                stats: {
                    charts: '15+',
                    formats: '5+',
                    resolution: '4K'
                },
                button: 'Enter Data Visualization'
            },
            analysis: {
                title: 'Statistical Analysis',
                subtitle: 'Statistical Analysis',
                description: 'Execute professional statistical analysis methods to obtain scientific and reliable research conclusions and insights',
                features: {
                    descriptiveStats: {
                        name: 'Descriptive Statistics',
                        detail: 'Mean, SD, distribution analysis'
                    },
                    hypothesisTesting: {
                        name: 'Hypothesis Testing',
                        detail: 'T-test, Chi-square test, etc.'
                    },
                    regression: {
                        name: 'Regression Modeling',
                        detail: 'Linear and logistic regression'
                    },
                    survivalAnalysis: {
                        name: 'Survival Analysis',
                        detail: 'Cox regression, Kaplan-Meier'
                    }
                },
                stats: {
                    methods: '20+',
                    models: '10+',
                    precision: '99.9%'
                },
                button: 'Enter Statistical Analysis'
            }
        },
        introduction: {
            title: 'Feature Introduction',
            dataExtraction: {
                title: 'Data Extraction:',
                description: 'Quickly filter and export target data from NHANES database'
            },
            visualization: {
                title: 'Data Visualization:',
                description: 'Generate professional statistical charts to visualize data patterns'
            },
            analysis: {
                title: 'Statistical Analysis:',
                description: 'Execute various statistical methods to obtain scientific conclusions'
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            zh: {
                translation: zhTranslations
            },
            en: {
                translation: enTranslations
            }
        },
        fallbackLng: 'zh',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
