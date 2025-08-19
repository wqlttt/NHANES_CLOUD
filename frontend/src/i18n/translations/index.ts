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
            total: '共 {total} 条',
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
            totalItems: '共 {count} 项',
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
        // ... 数据分析页面的翻译
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
            total: 'Total {total} items',
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
            totalItems: 'Total {count} items',
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
        // ... Data Analysis page translations
    }
};
