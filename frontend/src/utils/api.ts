// API配置工具
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 获取完整的API URL
export const getApiUrl = (path: string): string => {
    // 如果path已经包含完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // 如果设置了API_BASE_URL，则使用它
    if (API_BASE_URL) {
        // 确保path以/开头
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_BASE_URL}${normalizedPath}`;
    }

    // 否则使用相对路径（开发环境或没有设置API_BASE_URL时）
    return path;
};

// 常用的API端点
export const API_ENDPOINTS = {
    // 指标相关
    INDICATORS: '/api/indicators',
    INDICATOR_DATA: (name: string) => `/api/indicators/${name}`,

    // 死亡数据
    MORTALITY_DATA: (year: string) => `/api/mortality/${year}`,

    // 数据处理
    PROCESS_NHANES: '/process_nhanes',
    PROCESS_NHANES_BATCH: '/process_nhanes_batch_merge',

    // 文件处理
    GET_CSV_FILE: '/get_csvfile',
    GET_CSV_INFO: '/get_csv_info',
    GET_FILE_COLUMNS: '/get_file_columns',

    // 数据可视化
    GENERATE_VISUALIZATION: '/generate_visualization',
    DRAW_BOXPLOT: '/draw_boxplot',
    DRAW_HISTOGRAM: '/draw_histogram',
    DRAW_HEATMAP: '/draw_heatmap',
    DRAW_SCATTERPLOT: '/draw_scatterplot',

    // 数据分析
    LOGISTIC_REGRESSION: '/logisticRegression',
    MULTINOMIAL_LOGISTIC_REGRESSION: '/multinomialLogisticRegression',
    LINEAR_REGRESSION: '/linearRegression',
    COX_REGRESSION: '/CoxRegression',

    // 健康检查
    HEALTH: '/health'
};

// 导出配置信息（用于调试）
export const API_CONFIG = {
    baseUrl: API_BASE_URL,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
};

console.log('API配置:', API_CONFIG);
