export const zhTranslations = {
    common: {
        loading: '加载中...',
        noData: '暂无数据',
        actions: '操作',
        edit: '编辑',
        delete: '删除',
        save: '保存',
        cancel: '取消',
        download: '下载',
        export: '导出',
        search: '搜索',
        add: '添加',
        confirm: '确认',
        back: '返回',
        next: '下一步',
        submit: '提交',
        reset: '重置',
        more: '更多',
        all: '全部',
        yes: '是',
        no: '否',
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '提示',
        pagination: {
            total: '共 {{total}} 条',
            pageSize: '每页显示',
            jump: '跳转至',
            page: '页',
            prev: '上一页',
            next: '下一页',
            first: '首页',
            last: '末页'
        }
    },
    nav: {
        home: '首页',
        dataExtraction: '数据提取',
        dataVisualization: '数据可视化',
        dataAnalysis: '数据分析'
    },
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
    },
    dataExtraction: {
        title: '数据提取',
        subtitle: '选择不同的数据提取方式，获取NHANES数据',
        customExtraction: {
            title: '自定义数据提取',
            yearRange: '选择年份范围',
            fileName: '文件名称',
            fileNamePlaceholder: '例如: DEMO_J',
            indicators: '指标列表',
            indicatorsPlaceholder: '例如: RIAGENDR,RIDAGEYR,BMXBMI',
            indicatorsHint: '多个指标用英文逗号分隔',
            actions: '操作',
            addToList: '添加到列表',
            noData: '暂无数据提取项目',
            noDataHint: '请先选择年份、填写文件名和指标，然后点击"添加到列表"',
            previewList: '数据提取列表',
            totalItems: '共 {{count}} 项',
            batchDownload: '批量下载全部'
        },
        commonIndicators: {
            title: '常见二级指标提取',
            placeholder: '选择或搜索指标',
            downloadButton: '下载常见指标'
        },
        mortalityData: {
            title: '死亡指标提取',
            placeholder: '选择年份死亡数据',
            downloadButton: '下载死亡数据'
        },
        presetGroups: {
            title: '预设变量组',
            placeholder: '选择预设变量组合',
            downloadButton: '下载变量组',
            variables: '包含变量：'
        },
        messages: {
            completeInfo: '请完善信息',
            completeInfoContent: '请选择年份、输入文件名和指标',
            addSuccess: '添加成功',
            addSuccessContent: '自定义提取项已添加到预览列表',
            editSuccess: '修改成功',
            downloadSuccess: '下载完成',
            downloadSuccessContent: '文件已成功下载！',
            noDataToExport: '没有数据可导出',
            exportProgress: '正在导出 {count} 条数据...',
            exportSuccess: 'CSV文件已成功导出！包含 {count} 条数据',
            exportFailed: '导出失败，请重试'
        }
    },
    dataVisualization: {
        title: '数据可视化',
        subtitle: '上传CSV文件，创建各种类型的统计图表',
        config: {
            tab: '图表配置'
        },
        upload: {
            title: '1. 数据源',
            button: '选择CSV文件',
            fileInfo: '文件信息',
            fileName: '文件名：',
            rowCount: '数据行数：',
            columnCount: '列数：',
            numeric: '数值型',
            categorical: '分类型',
            fileSize: '文件大小：',
            supportFormat: '支持格式：CSV文件，最大50MB',
            success: '文件上传成功！{{message}}',
            error: '文件上传失败：{{error}}',
            networkError: '文件上传失败，请检查网络连接'
        },
        preview: {
            title: '数据预览',
            showFirst: '(显示前10行数据)',
            totalData: '总数据',
            totalColumns: '总列数',
            fileSize: '文件大小',
            rows: '行',
            columns: '列',
            unavailable: '数据预览暂不可用',
            checkFormat: '请确保上传的CSV文件格式正确'
        },
        chartType: {
            title: '2. 图表类型',
            histogram: '直方图',
            scatter: '散点图',
            heatmap: '热力图',
            boxplot: '箱型图',
            requirements: {
                histogram: 'X轴变量（数值型）',
                scatter: 'X轴和Y轴变量（数值型）',
                heatmap: 'X轴和Y轴变量（数值型）',
                boxplot: 'Y轴变量（数值型），X轴变量可选（分类型）',
                default: '请选择变量'
            }
        },
        variables: {
            title: '3. 变量配置',
            xAxis: 'X轴变量',
            yAxis: 'Y轴变量',
            group: '分组变量（可选）',
            selectX: '选择X轴变量',
            selectY: '选择Y轴变量',
            selectGroup: '选择分组变量',
            required: '请选择{axis}轴变量'
        },
        settings: {
            title: '4. 图表设置',
            chartTitle: '图表标题',
            titleType: {
                auto: '自动生成',
                custom: '自定义标题'
            },
            customTitle: {
                label: '自定义标题',
                placeholder: '请输入图表标题',
                required: '请输入图表标题'
            },
            colorTheme: {
                label: '颜色主题',
                blue: '蓝色系',
                green: '绿色系',
                orange: '橙色系',
                purple: '紫色系'
            }
        },
        generate: {
            button: '生成图表',
            cancel: '取消生成',
            retry: '重新生成',
            hint: '上传CSV文件并配置参数后，点击生成图表',
            loading: '正在生成图表...',
            success: '图表生成成功！',
            timeoutWarning: {
                title: '生成时间较长',
                description: '图表生成正在处理中，可能由于数据量较大或网络较慢。',
                options: '您可以选择继续等待、取消当前操作或重新生成。',
                waitMessage: '图表生成需要较长时间，请耐心等待或返回配置页面取消操作'
            },
            errors: {
                noFile: '请先上传CSV文件',
                noXVar: '请选择X轴变量',
                noYVar: '散点图和热力图需要选择Y轴变量',
                failed: '图表生成失败：{{error}}',
                cancelled: '图表生成已取消',
                cancelling: '正在取消图表生成...',
                networkError: '图表生成失败，请检查网络连接'
            }
        },
        chartTitles: {
            histogram: '{{x}} 分布直方图',
            scatter: '{{x}} vs {{y}} 散点图',
            heatmap: '{{x}} vs {{y}} 热力图',
            boxplot: '{{x}} 箱型图',
            boxplotGrouped: '{{x}} 按 {{y}} 分组箱型图'
        },
        result: {
            tab: '图表结果',
            display: '图表展示',
            download: {
                image: '下载图片',
                data: '下载数据'
            },
            noData: '暂无图表数据',
            previewImage: '点击预览大图',
            info: {
                title: '图表信息',
                type: '图表类型：',
                dataSource: '数据源：',
                sampleSize: '样本量：',
                generateTime: '生成时间：',
                variables: '使用变量：',
                noFile: '未上传文件',
                notGenerated: '暂未生成',
                rows: '行'
            },
            summary: {
                title: '数据摘要',
                totalColumns: '总列数：',
                numericColumns: '数值列：',
                categoricalColumns: '分类列：',
                fileSize: '文件大小：'
            }
        }
    },
    dataAnalysis: {
        title: '数据分析',
        subtitle: '上传数据文件，选择统计分析方法，配置参数并查看分析结果',
        upload: {
            title: '数据上传',
            button: '上传CSV文件',
            reupload: '重新上传CSV文件',
            supportFormat: '支持格式：CSV文件，最大50MB',
            fileInfo: '文件信息：',
            fileName: '文件名：',
            rowCount: '数据行数：',
            columnCount: '列数：',
            numericType: '数值型',
            categoricalType: '分类型'
        },
        preview: {
            title: '数据预览',
            showFirst: '(显示前10行数据)',
            totalData: '总数据',
            totalColumns: '总列数',
            fileSize: '文件大小',
            unavailable: '数据预览暂不可用',
            checkFormat: '请确保上传的CSV文件格式正确'
        },
        methods: {
            title: '1. 选择分析方法',
            linear_regression: {
                name: '线性回归',
                description: '建立连续型因变量与自变量间的线性关系'
            },
            logistic_regression: {
                name: '逻辑回归',
                description: '建立二分类因变量与自变量间的逻辑关系'
            },
            cox_regression: {
                name: 'Cox回归分析',
                description: 'Cox比例风险模型，用于生存分析'
            },
            multinomial_logistic_regression: {
                name: '多分类逻辑回归',
                description: '多分类逻辑回归，适用于CKMStage等多分类因变量'
            }
        },
        config: {
            title: '分析参数配置',
            cox: {
                title: 'Cox回归分析说明',
                description: '协变量：影响生存的因素；时间变量：生存时间（必须为正数）；事件变量：事件状态（0=删失，1=发生事件）',
                covariates: {
                    label: '协变量',
                    hint: '(可多选，影响生存的因素)',
                    placeholder: '选择协变量（可多选，如：年龄、性别、治疗方式等）',
                    required: '请选择协变量'
                },
                timeVar: {
                    label: '时间变量',
                    hint: '(生存时间，数值型)',
                    placeholder: '选择生存时间变量（如：survival_time）',
                    required: '请选择时间变量'
                },
                eventVar: {
                    label: '事件变量',
                    hint: '(0=删失，1=事件)',
                    placeholder: '选择事件状态变量（如：event_status）',
                    required: '请选择事件变量'
                },
                alpha: {
                    label: '显著性水平',
                    hint: '(统计检验的α水平)',
                    options: {
                        '0.01': 'α = 0.01 (99%置信度)',
                        '0.05': 'α = 0.05 (95%置信度，推荐)',
                        '0.10': 'α = 0.10 (90%置信度)'
                    }
                }
            },
            linear: {
                title: '线性回归分析说明',
                description: '线性回归用于分析连续型因变量与一个或多个自变量的线性关系。因变量必须是连续型数值变量（如身高、体重、收入、年龄等）。如果因变量是分类变量（如性别、是否通过等），请使用逻辑回归。',
                yVar: {
                    label: '因变量 (Y)',
                    hint: '(连续型变量，必须为数值型)',
                    placeholder: '选择因变量（如：身高、体重、收入等）',
                    required: '请选择因变量'
                },
                xVars: {
                    label: '自变量 (X)',
                    hint: '(可多选，数值型或分类型)',
                    placeholder: '选择自变量（如：年龄、性别、教育程度等）',
                    required: '请选择自变量'
                }
            },
            logistic: {
                title: '逻辑回归分析说明',
                description: '逻辑回归用于分析二分类因变量与自变量的关系。因变量应包含两个分类（如：0/1，是/否，成功/失败）。',
                yVar: {
                    label: '因变量 (Y)',
                    hint: '(二分类变量，如：0/1，成功/失败)',
                    placeholder: '选择因变量（如：是否患病、是否通过等）',
                    required: '请选择因变量'
                },
                xVar: {
                    label: '自变量 (X)',
                    hint: '(数值型或分类型变量)',
                    placeholder: '选择自变量（如：年龄、性别、教育程度等）',
                    required: '请选择自变量'
                }
            },
            multinomial: {
                title: '多分类逻辑回归分析说明',
                description: '多分类逻辑回归用于分析多分类因变量与自变量的关系。因变量应包含3个或更多分类（如：CKMStage的0,1,2,3,4等级）。适用于分析有序或无序的多分类问题。',
                yVar: {
                    label: '因变量 (Y)',
                    hint: '(多分类变量，如：CKMStage的0,1,2,3,4)',
                    placeholder: '选择因变量（如：CKMStage、疾病严重程度等）',
                    required: '请选择因变量'
                },
                xVars: {
                    label: '自变量 (X)',
                    hint: '(可多选，数值型或分类型)',
                    placeholder: '选择自变量（如：年龄、性别、BMI等）',
                    required: '请选择自变量'
                },
                tip: '多分类逻辑回归会自动处理缺失值，并标准化数值型特征。模型将输出每个类别的预测概率和整体分类准确率。'
            }
        },
        analysis: {
            start: '开始分析',
            currentMethod: '当前分析方法：',
            needUpload: '(需要先上传数据文件)',
            timeoutWarning: {
                title: '分析时间较长',
                description: '数据分析正在处理中，可能由于数据量较大或计算复杂。',
                options: '您可以选择继续等待、取消当前操作或重新分析。',
                waitMessage: '数据分析正在处理中，可能由于数据量较大或计算复杂，请耐心等待或返回配置页面取消操作'
            },
            cancel: '取消分析',
            retry: '重新分析',
            progress: '正在进行',
            messages: {
                uploadFirst: '请先上传CSV文件',
                selectCovariates: '请选择协变量',
                selectTimeVar: '请选择时间变量',
                selectEventVar: '请选择事件变量',
                selectXVar: '请选择自变量',
                selectYVar: '请选择因变量',
                formValidationFailed: '请完整填写Cox回归分析参数',
                selectValidMethod: '请选择有效的分析方法',
                analysisSuccess: '{method}分析完成！',
                analysisFailed: '{method}分析失败：{error}',
                analysisCancelled: '{method}分析已取消',
                cancelling: '正在取消分析...',
                networkError: '{method}分析失败，请检查网络连接'
            }
        },
        results: {
            tab: '分析结果',
            title: '结果',
            noResults: '请在配置页面选择分析方法并开始分析',
            export: '导出结果',
            generateReport: '生成报告',
            info: {
                title: '分析信息',
                method: '分析方法：',
                dataSource: '数据源：',
                sampleSize: '样本量：',
                analysisTime: '分析时间：',
                simulatedData: '模拟数据',
                people: '人'
            },
            cox: {
                forestPlot: '森林图',
                hazardRatios: '风险比结果',
                columns: {
                    covariate: '协变量',
                    hr: '风险比 (HR)',
                    ciLower: '95% CI 下限',
                    ciUpper: '95% CI 上限'
                },
                summary: {
                    title: 'Cox回归分析结果',
                    description: '分析了{count}个协变量的风险比。森林图展示了各协变量的风险比及其95%置信区间。'
                }
            },
            linear: {
                plot: '回归图',
                statistics: '回归统计',
                equation: '回归方程：',
                coefficients: '回归系数',
                intercept: '截距',
                independentCoefficient: '自变量系数',
                regressionIntercept: '回归截距',
                regressionCoefficient: '回归系数',
                columns: {
                    variable: '变量',
                    coefficient: '系数值',
                    description: '说明'
                },
                stats: {
                    r2: 'R² 决定系数',
                    mse: 'MSE 均方误差',
                    correlation: '相关系数',
                    sampleSize: '样本数量'
                },
                summary: {
                    title: '线性回归分析结果',
                    description: '{type}线性回归分析完成。R² = {r2}，表示模型解释了因变量 {variance}% 的方差。样本量：{sampleSize}',
                    types: {
                        simple: '单变量',
                        multiple: '多变量'
                    }
                }
            },
            logistic: {
                plot: '逻辑回归图',
                statistics: '分类统计',
                accuracy: '分类准确率',
                intercept: '截距',
                independentCoefficient: '自变量系数',
                regressionIntercept: '回归截距',
                modelInfo: {
                    title: '模型说明：',
                    xVar: '自变量：',
                    yVar: '因变量：',
                    type: '模型类型：二分类逻辑回归'
                },
                coefficients: '回归系数',
                summary: {
                    title: '逻辑回归分析结果',
                    description: '二分类逻辑回归分析完成。模型准确率：{accuracy}%。自变量 {xVar} 对因变量 {yVar} 的预测效果{performance}。',
                    performance: {
                        good: '较好',
                        fair: '一般'
                    }
                }
            },
            multinomial: {
                plot: '多分类回归分析图',
                statistics: '分类统计',
                stats: {
                    accuracy: '分类准确率',
                    classes: '类别数量',
                    sampleSize: '样本数量'
                },
                modelInfo: {
                    title: '模型说明：',
                    xVars: '自变量：',
                    yVar: '因变量：',
                    labels: '类别标签：',
                    type: '模型类型：多分类逻辑回归'
                },
                summary: {
                    title: '多分类逻辑回归分析结果',
                    description: '多分类逻辑回归分析完成。模型准确率：{accuracy}%。成功分类 {classes} 个类别（{labels}）。适用于CKMStage等多分类因变量的分析。'
                }
            }
        }
    }
};

export const enTranslations = {
    common: {
        loading: 'Loading...',
        noData: 'No Data',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        download: 'Download',
        export: 'Export',
        search: 'Search',
        add: 'Add',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        reset: 'Reset',
        more: 'More',
        all: 'All',
        yes: 'Yes',
        no: 'No',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        pagination: {
            total: 'Total {{total}} items',
            pageSize: 'Items per page',
            jump: 'Jump to',
            page: 'Page',
            prev: 'Previous',
            next: 'Next',
            first: 'First',
            last: 'Last'
        }
    },
    nav: {
        home: 'Home',
        dataExtraction: 'Data Extraction',
        dataVisualization: 'Data Visualization',
        dataAnalysis: 'Data Analysis'
    },
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
    },
    dataExtraction: {
        title: 'Data Extraction',
        subtitle: 'Choose different data extraction methods to obtain NHANES data',
        customExtraction: {
            title: 'Custom Data Extraction',
            yearRange: 'Select Year Range',
            fileName: 'File Name',
            fileNamePlaceholder: 'e.g., DEMO_J',
            indicators: 'Indicator List',
            indicatorsPlaceholder: 'e.g., RIAGENDR,RIDAGEYR,BMXBMI',
            indicatorsHint: 'Separate multiple indicators with commas',
            actions: 'Actions',
            addToList: 'Add to List',
            noData: 'No data extraction items',
            noDataHint: 'Please select years, enter file name and indicators, then click "Add to List"',
            previewList: 'Data Extraction List',
            totalItems: 'Total {{count}} items',
            batchDownload: 'Batch Download All'
        },
        commonIndicators: {
            title: 'Common Secondary Indicators',
            placeholder: 'Select or search indicators',
            downloadButton: 'Download Common Indicators'
        },
        mortalityData: {
            title: 'Mortality Data Extraction',
            placeholder: 'Select mortality data by year',
            downloadButton: 'Download Mortality Data'
        },
        presetGroups: {
            title: 'Preset Variable Groups',
            placeholder: 'Select preset variable group',
            downloadButton: 'Download Variable Group',
            variables: 'Included Variables:'
        },
        messages: {
            completeInfo: 'Please Complete Information',
            completeInfoContent: 'Please select years, enter file name and indicators',
            addSuccess: 'Added Successfully',
            addSuccessContent: 'Custom extraction item has been added to the preview list',
            editSuccess: 'Modified Successfully',
            downloadSuccess: 'Download Complete',
            downloadSuccessContent: 'File has been downloaded successfully!',
            noDataToExport: 'No data to export',
            exportProgress: 'Exporting {count} records...',
            exportSuccess: 'CSV file exported successfully! Contains {count} records',
            exportFailed: 'Export failed, please try again'
        }
    },
    dataVisualization: {
        title: 'Data Visualization',
        subtitle: 'Upload CSV file and create various types of statistical charts',
        config: {
            tab: 'Chart Configuration'
        },
        upload: {
            title: '1. Data Source',
            button: 'Select CSV File',
            fileInfo: 'File Information',
            fileName: 'File Name:',
            rowCount: 'Row Count:',
            columnCount: 'Columns:',
            numeric: 'Numeric',
            categorical: 'Categorical',
            fileSize: 'File Size:',
            supportFormat: 'Supported Format: CSV file, max 50MB',
            success: 'File uploaded successfully! {{message}}',
            error: 'File upload failed: {{error}}',
            networkError: 'File upload failed, please check network connection'
        },
        preview: {
            title: 'Data Preview',
            showFirst: '(Showing first 10 rows)',
            totalData: 'Total Data',
            totalColumns: 'Total Columns',
            fileSize: 'File Size',
            rows: 'rows',
            columns: 'columns',
            unavailable: 'Data preview unavailable',
            checkFormat: 'Please ensure the CSV file format is correct'
        },
        chartType: {
            title: '2. Chart Type',
            histogram: 'Histogram',
            scatter: 'Scatter Plot',
            heatmap: 'Heatmap',
            boxplot: 'Box Plot',
            requirements: {
                histogram: 'X-axis variable (numeric)',
                scatter: 'X and Y-axis variables (numeric)',
                heatmap: 'X and Y-axis variables (numeric)',
                boxplot: 'Y-axis variable (numeric), X-axis variable optional (categorical)',
                default: 'Please select variables'
            }
        },
        variables: {
            title: '3. Variable Configuration',
            xAxis: 'X-axis Variable',
            yAxis: 'Y-axis Variable',
            group: 'Group Variable (Optional)',
            selectX: 'Select X-axis variable',
            selectY: 'Select Y-axis variable',
            selectGroup: 'Select group variable',
            required: 'Please select {axis}-axis variable'
        },
        settings: {
            title: '4. Chart Settings',
            chartTitle: 'Chart Title',
            titleType: {
                auto: 'Auto Generate',
                custom: 'Custom Title'
            },
            customTitle: {
                label: 'Custom Title',
                placeholder: 'Please enter chart title',
                required: 'Please enter chart title'
            },
            colorTheme: {
                label: 'Color Theme',
                blue: 'Blue',
                green: 'Green',
                orange: 'Orange',
                purple: 'Purple'
            }
        },
        generate: {
            button: 'Generate Chart',
            cancel: 'Cancel Generation',
            retry: 'Retry Generation',
            hint: 'Upload CSV file and configure parameters, then click Generate Chart',
            loading: 'Generating chart...',
            success: 'Chart generated successfully!',
            timeoutWarning: {
                title: 'Generation Taking Long',
                description: 'Chart generation is in progress, may take longer due to data size or network speed.',
                options: 'You can choose to wait, cancel the operation, or retry.',
                waitMessage: 'Chart generation needs more time, please wait or return to config page to cancel'
            },
            errors: {
                noFile: 'Please upload a CSV file first',
                noXVar: 'Please select X-axis variable',
                noYVar: 'Scatter plot and heatmap require Y-axis variable',
                failed: 'Chart generation failed: {{error}}',
                cancelled: 'Chart generation cancelled',
                cancelling: 'Cancelling chart generation...',
                networkError: 'Chart generation failed, please check network connection'
            }
        },
        chartTitles: {
            histogram: '{{x}} Distribution Histogram',
            scatter: '{{x}} vs {{y}} Scatter Plot',
            heatmap: '{{x}} vs {{y}} Heatmap',
            boxplot: '{{x}} Box Plot',
            boxplotGrouped: '{{x}} Box Plot Grouped by {{y}}'
        },
        result: {
            tab: 'Chart Result',
            display: 'Chart Display',
            download: {
                image: 'Download Image',
                data: 'Download Data'
            },
            noData: 'No chart data',
            previewImage: 'Click to preview larger image',
            info: {
                title: 'Chart Information',
                type: 'Chart Type:',
                dataSource: 'Data Source:',
                sampleSize: 'Sample Size:',
                generateTime: 'Generate Time:',
                variables: 'Used Variables:',
                noFile: 'No file uploaded',
                notGenerated: 'Not generated yet',
                rows: 'rows'
            },
            summary: {
                title: 'Data Summary',
                totalColumns: 'Total Columns:',
                numericColumns: 'Numeric Columns:',
                categoricalColumns: 'Categorical Columns:',
                fileSize: 'File Size:'
            }
        }
    },
    dataAnalysis: {
        title: 'Data Analysis',
        subtitle: 'Upload data file, select statistical analysis method, configure parameters and view analysis results',
        upload: {
            title: 'Data Upload',
            button: 'Upload CSV File',
            reupload: 'Re-upload CSV File',
            supportFormat: 'Supported Format: CSV file, max 50MB',
            fileInfo: 'File Information:',
            fileName: 'File Name:',
            rowCount: 'Row Count:',
            columnCount: 'Columns:',
            numericType: 'Numeric',
            categoricalType: 'Categorical'
        },
        preview: {
            title: 'Data Preview',
            showFirst: '(Showing first 10 rows)',
            totalData: 'Total Data',
            totalColumns: 'Total Columns',
            fileSize: 'File Size',
            unavailable: 'Data preview unavailable',
            checkFormat: 'Please ensure the CSV file format is correct'
        },
        methods: {
            title: '1. Select Analysis Method',
            linear_regression: {
                name: 'Linear Regression',
                description: 'Establish linear relationships between continuous dependent variables and independent variables'
            },
            logistic_regression: {
                name: 'Logistic Regression',
                description: 'Establish logical relationships between binary dependent variables and independent variables'
            },
            cox_regression: {
                name: 'Cox Regression Analysis',
                description: 'Cox proportional hazards model for survival analysis'
            },
            multinomial_logistic_regression: {
                name: 'Multinomial Logistic Regression',
                description: 'Multinomial logistic regression, suitable for multi-class dependent variables like CKMStage'
            }
        },
        config: {
            title: 'Analysis Parameter Configuration',
            cox: {
                title: 'Cox Regression Analysis Guide',
                description: 'Covariates: factors affecting survival; Time variable: survival time (must be positive); Event variable: event status (0=censored, 1=event)',
                covariates: {
                    label: 'Covariates',
                    hint: '(Multiple selection, factors affecting survival)',
                    placeholder: 'Select covariates (e.g., age, gender, treatment)',
                    required: 'Please select covariates'
                },
                timeVar: {
                    label: 'Time Variable',
                    hint: '(Survival time, numeric)',
                    placeholder: 'Select survival time variable (e.g., survival_time)',
                    required: 'Please select time variable'
                },
                eventVar: {
                    label: 'Event Variable',
                    hint: '(0=censored, 1=event)',
                    placeholder: 'Select event status variable (e.g., event_status)',
                    required: 'Please select event variable'
                },
                alpha: {
                    label: 'Significance Level',
                    hint: '(α level for statistical testing)',
                    options: {
                        '0.01': 'α = 0.01 (99% confidence)',
                        '0.05': 'α = 0.05 (95% confidence, recommended)',
                        '0.10': 'α = 0.10 (90% confidence)'
                    }
                }
            },
            linear: {
                title: 'Linear Regression Analysis Guide',
                description: 'Linear regression analyzes the linear relationship between continuous dependent variables and one or more independent variables. The dependent variable must be a continuous numeric variable (e.g., height, weight, income, age). If the dependent variable is categorical (e.g., gender, pass/fail), use logistic regression.',
                yVar: {
                    label: 'Dependent Variable (Y)',
                    hint: '(Continuous variable, must be numeric)',
                    placeholder: 'Select dependent variable (e.g., height, weight, income)',
                    required: 'Please select dependent variable'
                },
                xVars: {
                    label: 'Independent Variables (X)',
                    hint: '(Multiple selection, numeric or categorical)',
                    placeholder: 'Select independent variables (e.g., age, gender, education)',
                    required: 'Please select independent variables'
                }
            },
            logistic: {
                title: 'Logistic Regression Analysis Guide',
                description: 'Logistic regression analyzes the relationship between binary dependent variables and independent variables. The dependent variable should have two categories (e.g., 0/1, yes/no, success/failure).',
                yVar: {
                    label: 'Dependent Variable (Y)',
                    hint: '(Binary variable, e.g., 0/1, success/failure)',
                    placeholder: 'Select dependent variable (e.g., disease status, pass/fail)',
                    required: 'Please select dependent variable'
                },
                xVar: {
                    label: 'Independent Variable (X)',
                    hint: '(Numeric or categorical variable)',
                    placeholder: 'Select independent variable (e.g., age, gender, education)',
                    required: 'Please select independent variable'
                }
            },
            multinomial: {
                title: 'Multinomial Logistic Regression Analysis Guide',
                description: 'Multinomial logistic regression analyzes the relationship between multi-class dependent variables and independent variables. The dependent variable should have 3 or more categories (e.g., CKMStage levels 0,1,2,3,4). Suitable for analyzing ordered or unordered multi-class problems.',
                yVar: {
                    label: 'Dependent Variable (Y)',
                    hint: '(Multi-class variable, e.g., CKMStage 0,1,2,3,4)',
                    placeholder: 'Select dependent variable (e.g., CKMStage, disease severity)',
                    required: 'Please select dependent variable'
                },
                xVars: {
                    label: 'Independent Variables (X)',
                    hint: '(Multiple selection, numeric or categorical)',
                    placeholder: 'Select independent variables (e.g., age, gender, BMI)',
                    required: 'Please select independent variables'
                },
                tip: 'Multinomial logistic regression will automatically handle missing values and standardize numeric features. The model will output prediction probabilities for each class and overall classification accuracy.'
            }
        },
        analysis: {
            start: 'Start Analysis',
            currentMethod: 'Current Analysis Method:',
            needUpload: '(Need to upload data file first)',
            timeoutWarning: {
                title: 'Analysis Taking Long',
                description: 'Data analysis is in progress, may take longer due to data size or computation complexity.',
                options: 'You can choose to wait, cancel the operation, or retry analysis.',
                waitMessage: 'Data analysis is in progress, may take longer due to data size or computation complexity, please wait or return to config page to cancel'
            },
            cancel: 'Cancel Analysis',
            retry: 'Retry Analysis',
            progress: 'Processing',
            messages: {
                uploadFirst: 'Please upload CSV file first',
                selectCovariates: 'Please select covariates',
                selectTimeVar: 'Please select time variable',
                selectEventVar: 'Please select event variable',
                selectXVar: 'Please select independent variable',
                selectYVar: 'Please select dependent variable',
                formValidationFailed: 'Please complete Cox regression analysis parameters',
                selectValidMethod: 'Please select a valid analysis method',
                analysisSuccess: '{method} analysis completed!',
                analysisFailed: '{method} analysis failed: {error}',
                analysisCancelled: '{method} analysis cancelled',
                cancelling: 'Cancelling analysis...',
                networkError: '{method} analysis failed, please check network connection'
            }
        },
        results: {
            tab: 'Analysis Results',
            title: 'Results',
            noResults: 'Please select analysis method and start analysis in configuration page',
            export: 'Export Results',
            generateReport: 'Generate Report',
            info: {
                title: 'Analysis Information',
                method: 'Analysis Method:',
                dataSource: 'Data Source:',
                sampleSize: 'Sample Size:',
                analysisTime: 'Analysis Time:',
                simulatedData: 'Simulated Data',
                people: 'people'
            },
            cox: {
                forestPlot: 'Forest Plot',
                hazardRatios: 'Hazard Ratios',
                columns: {
                    covariate: 'Covariate',
                    hr: 'Hazard Ratio (HR)',
                    ciLower: '95% CI Lower',
                    ciUpper: '95% CI Upper'
                },
                summary: {
                    title: 'Cox Regression Analysis Results',
                    description: 'Analyzed hazard ratios for {count} covariates. Forest plot shows hazard ratios and their 95% confidence intervals.'
                }
            },
            linear: {
                plot: 'Regression Plot',
                statistics: 'Regression Statistics',
                equation: 'Regression Equation:',
                coefficients: 'Regression Coefficients',
                intercept: 'Intercept',
                independentCoefficient: 'Independent Variable Coefficient',
                regressionIntercept: 'Regression Intercept',
                regressionCoefficient: 'Regression Coefficient',
                columns: {
                    variable: 'Variable',
                    coefficient: 'Coefficient',
                    description: 'Description'
                },
                stats: {
                    r2: 'R² (R-squared)',
                    mse: 'MSE (Mean Square Error)',
                    correlation: 'Correlation',
                    sampleSize: 'Sample Size'
                },
                summary: {
                    title: 'Linear Regression Analysis Results',
                    description: '{type} linear regression completed. R² = {r2}, indicating the model explains {variance}% of the variance in the dependent variable. Sample size: {sampleSize}',
                    types: {
                        simple: 'Univariate',
                        multiple: 'Multivariate'
                    }
                }
            },
            logistic: {
                plot: 'Logistic Regression Plot',
                statistics: 'Classification Statistics',
                accuracy: 'Classification Accuracy',
                intercept: 'Intercept',
                independentCoefficient: 'Independent Variable Coefficient',
                regressionIntercept: 'Regression Intercept',
                modelInfo: {
                    title: 'Model Information:',
                    xVar: 'Independent Variable:',
                    yVar: 'Dependent Variable:',
                    type: 'Model Type: Binary Logistic Regression'
                },
                coefficients: 'Regression Coefficients',
                summary: {
                    title: 'Logistic Regression Analysis Results',
                    description: 'Binary logistic regression completed. Model accuracy: {accuracy}%. The predictive effect of independent variable {xVar} on dependent variable {yVar} is {performance}.',
                    performance: {
                        good: 'good',
                        fair: 'fair'
                    }
                }
            },
            multinomial: {
                plot: 'Multinomial Regression Analysis Plot',
                statistics: 'Classification Statistics',
                stats: {
                    accuracy: 'Classification Accuracy',
                    classes: 'Number of Classes',
                    sampleSize: 'Sample Size'
                },
                modelInfo: {
                    title: 'Model Information:',
                    xVars: 'Independent Variables:',
                    yVar: 'Dependent Variable:',
                    labels: 'Class Labels:',
                    type: 'Model Type: Multinomial Logistic Regression'
                },
                summary: {
                    title: 'Multinomial Logistic Regression Analysis Results',
                    description: 'Multinomial logistic regression completed. Model accuracy: {accuracy}%. Successfully classified {classes} classes ({labels}). Suitable for multi-class dependent variables like CKMStage.'
                }
            }
        }
    }
};
