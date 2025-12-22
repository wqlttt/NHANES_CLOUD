import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';
import {
    Typography,
    Card,
    Row,
    Col,
    Select,
    Button,
    Space,
    Form,
    Table,
    Statistic,
    Tabs,
    Alert,
    Divider,
    Tag,
    Progress,
    List,
    Input,
    Upload,
    message,
    Image,
    Tooltip,
} from 'antd';
import {
    CalculatorOutlined,
    FundOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    PlayCircleOutlined,
    DownloadOutlined,
    UploadOutlined,
    LineChartOutlined,
    StopOutlined,
    ReloadOutlined,
    SettingOutlined,
    BarChartOutlined,
    CloudUploadOutlined,
    TableOutlined,
    LoadingOutlined,
    InboxOutlined,
    UndoOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;
const { TextArea } = Input;

// 分析方法配置
const getAnalysisTypes = (t: any) => [
    {
        key: 'linear_regression',
        name: t('dataAnalysis.methods.linear_regression.name'),
        icon: <LineChartOutlined />,
        description: t('dataAnalysis.methods.linear_regression.description'),
    },
    {
        key: 'logistic_regression',
        name: t('dataAnalysis.methods.logistic_regression.name'),
        icon: <ExperimentOutlined />,
        description: t('dataAnalysis.methods.logistic_regression.description'),
    },
    {
        key: 'cox_regression',
        name: t('dataAnalysis.methods.cox_regression.name'),
        icon: <FundOutlined />,
        description: t('dataAnalysis.methods.cox_regression.description'),
    },
    {
        key: 'multinomial_logistic_regression',
        name: t('dataAnalysis.methods.multinomial_logistic_regression.name'),
        icon: <ExperimentOutlined />,
        description: t('dataAnalysis.methods.multinomial_logistic_regression.description'),
    },
    {
        key: 'ttest',
        name: t('dataAnalysis.methods.ttest.name'),
        icon: <ExperimentOutlined />,
        description: t('dataAnalysis.methods.ttest.description'),
    },
    {
        key: 'chisquare',
        name: t('dataAnalysis.methods.chisquare.name'),
        icon: <ExperimentOutlined />,
        description: t('dataAnalysis.methods.chisquare.description'),
    },
    {
        key: 'anova',
        name: t('dataAnalysis.methods.anova.name'),
        icon: <ExperimentOutlined />,
        description: t('dataAnalysis.methods.anova.description'),
    },
    {
        key: 'ranksum',
        name: t('dataAnalysis.methods.ranksum.name'),
        icon: <ExperimentOutlined />,
        description: t('dataAnalysis.methods.ranksum.description'),
    },
    {
        key: 'rcs',
        name: t('dataAnalysis.methods.rcs.name'),
        icon: <LineChartOutlined />,
        description: t('dataAnalysis.methods.rcs.description'),
    },
];

// 接口类型定义
interface FileInfo {
    filename: string;
    file_stats: {
        total_rows: number;
        total_columns: number;
        numeric_columns_count: number;
        categorical_columns_count: number;
        file_size: number;
    };
    columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    columns_info: Array<{
        name: string;
        type: string;
        data_type: string;
        non_null_count: number;
        null_count: number;
        unique_count: number;
    }>;
    preview_data?: Array<Record<string, any>>;
}

interface CoxRegressionResult {
    success: boolean;
    plot: string;
    covariates: string[];
    hazard_ratios: number[];
    ci_lower: number[];
    ci_upper: number[];
}

interface LinearRegressionResult {
    success: boolean;
    plot: string;
    x_var?: string;
    x_vars?: string[];
    y_var: string;
    r2_score: number;
    mse: number;
    correlation?: number;
    coefficients: number[];
    intercept: number;
    equation: string;
    sample_size: number;
    regression_type: 'linear_simple' | 'linear_multiple';
}

interface LogisticRegressionResult {
    success: boolean;
    plot: string;
    x_var: string;
    y_var: string;
    accuracy: number;
    coefficients: number[];
    intercept: number;
    regression_type: 'logistic';
}

interface MultinomialLogisticRegressionResult {
    success: boolean;
    plot: string;
    x_vars: string[];
    y_var: string;
    accuracy: number;
    n_classes: number;
    class_labels: (string | number)[];
    coefficients: number[][];
    intercept: number[];
    sample_size: number;
    regression_type: 'multinomial_logistic';
}

interface TTestResult {
    success: boolean;
    plot: string;
    statistic: number;
    p_value: number;
    groups: string[];
    means: Record<string, number>;
}

interface ChiSquareResult {
    success: boolean;
    plot: string;
    statistic: number;
    p_value: number;
    dof: number;
}

interface AnovaResult {
    success: boolean;
    plot: string;
    statistic: number;
    p_value: number;
    groups: string[];
}

interface RankSumResult {
    success: boolean;
    plot: string;
    statistic: number;
    p_value: number;
    groups: string[];
}



interface RankSumResult {
    success: boolean;
    plot: string;
    statistic: number;
    p_value: number;
    groups: string[];
}

interface RCSResult {
    success: boolean;
    plot: string;
    aic?: number;
    analysis_type: string;
    model_type: string;
}

const DataAnalysis: React.FC = () => {
    const { t } = useTranslation();
    const [selectedAnalysis, setSelectedAnalysis] = useState('linear_regression');
    const [form] = Form.useForm();
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisTimeout, setAnalysisTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showAnalysisTimeoutWarning, setShowAnalysisTimeoutWarning] = useState(false);
    const [analysisAbortController, setAnalysisAbortController] = useState<AbortController | null>(null);
    const [results, setResults] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('config');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 友好的错误信息映射
    const getFriendlyErrorMessage = (error: string) => {
        if (!error) return t('dataAnalysis.analysis.messages.unknownError');

        if (error.includes('endog must be in the unit interval')) {
            return t('dataAnalysis.errors.unitInterval');
        }
        if (error.includes('No module named')) {
            return t('dataAnalysis.errors.backendModuleMissing', { error });
        }
        if (error.includes('Found arrays with inconsistent numbers of samples')) {
            return t('dataAnalysis.errors.inconsistentSamples');
        }
        if (error.includes('Network Error') || error.includes('Network error')) {
            return t('dataAnalysis.analysis.messages.networkError', { method: t(`dataAnalysis.methods.${selectedAnalysis}.name`) });
        }
        if (error === 'Thinking...') {
            return error; // Keep as is if it's not a real error
        }

        // Default: return the raw error but translated if possible
        return error;
    };

    // 加载演示数据
    const handleLoadDemoData = async () => {
        try {
            setUploadLoading(true);
            const response = await fetch(getApiUrl(API_ENDPOINTS.LOAD_DEMO_DATA), {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                message.success(t('dataAnalysis.upload.demoSuccess', { defaultValue: 'Demo data loaded successfully!' }));
                setUploadedFile({
                    uid: 'demo-file',
                    name: data.filename,
                    status: 'done',
                    url: data.filepath,
                } as any);

                // 设置文件信息用于预览
                setFileInfo({
                    filename: data.filename,
                    file_stats: {
                        total_rows: data.total_rows,
                        total_columns: data.total_columns,
                        file_size: 0, // 演示文件大小未知，或者是后端返回
                        numeric_columns_count: data.numeric_columns.length,
                        categorical_columns_count: data.categorical_columns.length
                    },
                    columns: data.columns,
                    numeric_columns: data.numeric_columns,
                    categorical_columns: data.categorical_columns,
                    columns_info: [], // Add empty array or parsed info if available
                    preview_data: data.preview_data
                });

                // 重置之前的分析结果
                setResults(null);
                setErrorMsg(null);
                form.resetFields();
            } else {
                message.error(data.error || t('dataAnalysis.upload.demoFailed', { defaultValue: 'Failed to load demo data' }));
            }
        } catch (error) {
            console.error('Error loading demo data:', error);
            message.error(t('dataAnalysis.upload.demoFailed', { defaultValue: 'Failed to load demo data' }));
        } finally {
            setUploadLoading(false);
        }
    };

    // 文件相关状态
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [coxResult, setCoxResult] = useState<CoxRegressionResult | null>(null);
    const [linearResult, setLinearResult] = useState<LinearRegressionResult | null>(null);
    const [logisticResult, setLogisticResult] = useState<LogisticRegressionResult | null>(null);
    const [multinomialResult, setMultinomialResult] = useState<MultinomialLogisticRegressionResult | null>(null);
    const [ttestResult, setTtestResult] = useState<TTestResult | null>(null);
    const [chisquareResult, setChisquareResult] = useState<ChiSquareResult | null>(null);
    const [anovaResult, setAnovaResult] = useState<AnovaResult | null>(null);
    const [rankSumResult, setRankSumResult] = useState<RankSumResult | null>(null);
    const [rcsResult, setRcsResult] = useState<RCSResult | null>(null);

    // 处理文件上传
    const handleFileUpload = async (file: File) => {
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.GET_CSV_FILE), {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setUploadedFile(file);
                setFileInfo(result);
                message.success(t('dataVisualization.upload.success', { message: result.message }));

                // 清空之前的分析结果和错误
                setResults(null);
                setErrorMsg(null);
                setCoxResult(null);
                setLinearResult(null);
                setLogisticResult(null);
                setMultinomialResult(null);
                setTtestResult(null);
                setChisquareResult(null);
                setAnovaResult(null);
                setRankSumResult(null);
                setRcsResult(null);

                // 重置表单
                form.resetFields();
            } else {
                message.error(t('dataVisualization.upload.error', { error: result.error }));
            }
        } catch (error: any) {
            console.error('文件上传错误:', error);
            setErrorMsg(error.message || 'Network Error');
            message.error(t('dataVisualization.upload.networkError'));
        } finally {
            setUploadLoading(false);
        }

        return false; // 阻止antd默认上传行为
    };

    // 取消分析
    const handleCancelAnalysis = () => {
        if (analysisAbortController) {
            analysisAbortController.abort();
            message.info(t('dataAnalysis.analysis.messages.cancelling'));
        }
    };

    // 重试分析
    const handleRetryAnalysis = () => {
        setShowAnalysisTimeoutWarning(false);
        handleRunAnalysis(); // 使用通用的分析函数
    };

    // 运行Cox回归分析
    const handleCoxRegression = async () => {
        if (!uploadedFile) {
            message.error(t('dataAnalysis.analysis.messages.uploadFirst'));
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('表单数据:', formValues);
        const { covariateVars, timeVar, eventVar } = formValues;

        // 验证必要参数
        if (!covariateVars || covariateVars.length === 0) {
            message.error(t('dataAnalysis.analysis.messages.selectCovariates'));
            return;
        }
        if (!timeVar) {
            message.error(t('dataAnalysis.analysis.messages.selectTimeVar'));
            return;
        }
        if (!eventVar) {
            message.error(t('dataAnalysis.analysis.messages.selectEventVar'));
            return;
        }

        console.log('Cox回归参数:', {
            covariateVars,
            timeVar,
            eventVar,
            fileName: uploadedFile.name
        });

        setAnalyzing(true);
        setProgress(0);
        setErrorMsg(null);
        setActiveTab('results');
        setShowAnalysisTimeoutWarning(false);

        // 创建取消控制器
        const controller = new AbortController();
        setAnalysisAbortController(controller);

        // 设置20秒超时警告（分析可能需要更长时间）
        const timeout = setTimeout(() => {
            setShowAnalysisTimeoutWarning(true);
        }, 20000);
        setAnalysisTimeout(timeout);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }

        // 添加协变量（多个值）
        covariateVars.forEach((covar: string) => {
            formData.append('covariate_cols', covar);
        });

        formData.append('time_col', timeVar);
        formData.append('event_col', eventVar);

        // 打印FormData内容（调试用）
        console.log('发送的FormData:');
        formData.forEach((value, key) => {
            console.log(key + ': ' + value);
        });

        // 模拟进度
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        try {
            console.log('发送Cox回归请求...');
            const response = await fetch(getApiUrl(API_ENDPOINTS.COX_REGRESSION), {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            console.log('收到响应，状态:', response.status);
            const result = await response.json();
            console.log('响应结果:', result);

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success) {
                setCoxResult(result);
                setResults(result);
                message.success(t('dataAnalysis.analysis.messages.analysisSuccess', { method: t('dataAnalysis.methods.cox_regression.name') }));
            } else {
                const msg = result.error || t('dataAnalysis.analysis.messages.unknownError');
                console.error('Analysis failed:', msg);
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.cox_regression.name'), error: msg }));
                setResults(null);
                setCoxResult(null);
            }
        } catch (error: any) {
            clearInterval(progressInterval);
            console.error('Cox回归分析错误:', error);
            if (error.name === 'AbortError') {
                message.warning(t('dataAnalysis.analysis.messages.analysisCancelled', { method: t('dataAnalysis.methods.cox_regression.name') }));
            } else {
                const msg = error.message || t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.cox_regression.name') });
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.cox_regression.name') }));
            }
            setResults(null);
            setCoxResult(null);
            setActiveTab('results');
        } finally {
            setAnalyzing(false);
            setShowAnalysisTimeoutWarning(false);
            setAnalysisAbortController(null);
            if (analysisTimeout) {
                clearTimeout(analysisTimeout);
                setAnalysisTimeout(null);
            }
        }
    };

    // 运行线性回归分析
    const handleLinearRegression = async () => {
        if (!uploadedFile) {
            message.error(t('dataAnalysis.analysis.messages.uploadFirst'));
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('线性回归表单数据:', formValues);
        const { xVars, yVar } = formValues;

        if (!xVars || xVars.length === 0) {
            message.error(t('dataAnalysis.analysis.messages.selectXVar'));
            return;
        }

        if (!yVar) {
            message.error(t('dataAnalysis.analysis.messages.selectYVar'));
            return;
        }

        console.log('线性回归参数:', { xVars, yVar, isArray: Array.isArray(xVars) });

        setAnalyzing(true);
        setProgress(20);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }

        // 支持多变量回归
        if (Array.isArray(xVars)) {
            xVars.forEach(x => formData.append('x_vars', x));
        } else {
            formData.append('x_vars', xVars);
        }
        formData.append('y_var', yVar);

        try {
            setProgress(60);
            const response = await fetch(getApiUrl(API_ENDPOINTS.LINEAR_REGRESSION), {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setProgress(90);

            if (result.success) {
                console.log('线性回归结果:', result);
                console.log('图片数据长度:', result.plot ? result.plot.length : '无');
                console.log('图片数据前缀:', result.plot ? result.plot.substring(0, 50) : '无');

                setLinearResult(result);
                setResults(result);  // 设置通用结果状态
                setProgress(100);
                message.success(t('dataAnalysis.analysis.messages.analysisSuccess', { method: t('dataAnalysis.methods.linear_regression.name') }));
                setActiveTab('results');
            } else {
                const msg = result.error || t('dataAnalysis.analysis.messages.unknownError');
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.linear_regression.name'), error: msg }));
                setActiveTab('results');
            }
        } catch (error: any) {
            console.error('线性回归分析错误:', error);
            setErrorMsg(error.message || t('dataAnalysis.analysis.messages.networkError', { method: t(`dataAnalysis.methods.${selectedAnalysis}.name`) }));
            message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.linear_regression.name') }));
            setActiveTab('results');
        } finally {
            setAnalyzing(false);
        }
    };

    // 运行逻辑回归分析
    const handleLogisticRegression = async () => {
        if (!uploadedFile) {
            message.error(t('dataAnalysis.analysis.messages.uploadFirst'));
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('逻辑回归表单数据:', formValues);
        const { xVar, yVar } = formValues;

        if (!xVar) {
            message.error(t('dataAnalysis.analysis.messages.selectXVar'));
            return;
        }

        if (!yVar) {
            message.error(t('dataAnalysis.analysis.messages.selectYVar'));
            return;
        }

        setAnalyzing(true);
        setProgress(20);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }
        formData.append('x_var', xVar);
        formData.append('y_var', yVar);

        try {
            setProgress(60);
            const response = await fetch(getApiUrl(API_ENDPOINTS.LOGISTIC_REGRESSION), {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setProgress(90);

            if (result.success) {
                console.log('逻辑回归结果:', result);
                console.log('逻辑回归图片数据长度:', result.plot ? result.plot.length : '无');
                console.log('逻辑回归图片数据前缀:', result.plot ? result.plot.substring(0, 50) : '无');

                setLogisticResult(result);
                setResults(result);  // 设置通用结果状态
                setProgress(100);
                message.success(t('dataAnalysis.analysis.messages.analysisSuccess', { method: t('dataAnalysis.methods.logistic_regression.name') }));
                setActiveTab('results');
            } else {
                const msg = result.error || t('dataAnalysis.analysis.messages.unknownError');
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.logistic_regression.name'), error: msg }));
                setActiveTab('results');
            }
        } catch (error: any) {
            console.error('逻辑回归分析错误:', error);
            setErrorMsg(error.message || t('dataAnalysis.analysis.messages.networkError', { method: t(`dataAnalysis.methods.${selectedAnalysis}.name`) }));
            message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.logistic_regression.name') }));
            setActiveTab('results');
        } finally {
            setAnalyzing(false);
        }
    };

    // 运行多分类逻辑回归分析
    const handleMultinomialLogisticRegression = async () => {
        if (!uploadedFile) {
            message.error(t('dataAnalysis.analysis.messages.uploadFirst'));
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('多分类逻辑回归表单数据:', formValues);
        const { xVars, yVar } = formValues;

        if (!xVars || xVars.length === 0) {
            message.error(t('dataAnalysis.analysis.messages.selectXVar'));
            return;
        }

        if (!yVar) {
            message.error(t('dataAnalysis.analysis.messages.selectYVar'));
            return;
        }

        console.log('多分类逻辑回归参数:', { xVars, yVar, isArray: Array.isArray(xVars) });

        setAnalyzing(true);
        setProgress(20);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }

        // 支持多变量分析
        if (Array.isArray(xVars)) {
            xVars.forEach(x => formData.append('x_vars', x));
        } else {
            formData.append('x_vars', xVars);
        }
        formData.append('y_var', yVar);

        try {
            setProgress(60);
            const response = await fetch(getApiUrl(API_ENDPOINTS.MULTINOMIAL_LOGISTIC_REGRESSION), {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setProgress(90);

            if (result.success) {
                console.log('多分类逻辑回归结果:', result);
                console.log('多分类回归图片数据长度:', result.plot ? result.plot.length : '无');
                console.log('多分类回归图片数据前缀:', result.plot ? result.plot.substring(0, 50) : '无');

                setMultinomialResult(result);
                setResults(result);
                setProgress(100);
                message.success(t('dataAnalysis.analysis.messages.analysisSuccess', { method: t('dataAnalysis.methods.multinomial_logistic_regression.name') }));
                setActiveTab('results');
            } else {
                const msg = result.error || t('dataAnalysis.analysis.messages.unknownError');
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.multinomial_logistic_regression.name'), error: msg }));
                setActiveTab('results');
            }
        } catch (error: any) {
            console.error('多分类逻辑回归分析错误:', error);
            setErrorMsg(error.message || t('dataAnalysis.analysis.messages.networkError', { method: t(`dataAnalysis.methods.${selectedAnalysis}.name`) }));
            message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.multinomial_logistic_regression.name') }));
            setActiveTab('results');
        } finally {
            setAnalyzing(false);
        }
    };

    // Generic handler for statistical tests
    const handleStatisticalTest = async (endpoint: string, resultSetter: (res: any) => void) => {
        if (!uploadedFile) {
            message.error(t('dataAnalysis.analysis.messages.uploadFirst'));
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('Stats test form data:', formValues);

        // For Chi-square: col1, col2
        // For others: group_col, value_col
        const { col1, col2, groupCol, valueCol } = formValues;

        if (endpoint === API_ENDPOINTS.CHI_SQUARE) {
            if (!col1 || !col2) {
                message.error(t('dataAnalysis.analysis.messages.selectColumns'));
                return;
            }
        } else {
            if (!groupCol || !valueCol) {
                message.error(t('dataAnalysis.analysis.messages.selectColumns'));
                return;
            }
        }

        setAnalyzing(true);
        setProgress(20);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }

        if (endpoint === API_ENDPOINTS.CHI_SQUARE) {
            formData.append('col1', col1);
            formData.append('col2', col2);
        } else {
            formData.append('group_col', groupCol);
            formData.append('value_col', valueCol);
        }

        try {
            setProgress(60);
            const response = await fetch(getApiUrl(endpoint), {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setProgress(90);

            if (result.success) {
                resultSetter(result);
                setResults(result);
                setProgress(100);
                message.success(t('dataAnalysis.analysis.messages.analysisSuccess', { method: selectedAnalysis }));
                setActiveTab('results');
            } else {
                const msg = result.error || t('dataAnalysis.analysis.messages.unknownError');
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: selectedAnalysis, error: msg }));
                setActiveTab('results');
            }
        } catch (error: any) {
            console.error('Analysis error:', error);
            setErrorMsg(error.message || t('dataAnalysis.analysis.messages.networkError', { method: t(`dataAnalysis.methods.${selectedAnalysis}.name`) }));
            message.error(t('dataAnalysis.analysis.messages.networkError'));
            setActiveTab('results');
        } finally {
            setAnalyzing(false);
        }
    };

    // 运行RCS分析
    const handleRCSAnalysis = async () => {
        if (!uploadedFile) {
            message.error(t('dataAnalysis.analysis.messages.uploadFirst'));
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('RCS Analysis Params:', formValues);

        const { modelType, xVar, yVar, covariates, knots, timeVar } = formValues;

        if (!modelType) {
            message.error(t('dataAnalysis.analysis.messages.selectModelType'));
            return;
        }
        if (!xVar) {
            message.error(t('dataAnalysis.analysis.messages.selectXVarContinuous'));
            return;
        }
        if (!yVar) {
            message.error(t('dataAnalysis.analysis.messages.selectYVarOutcome'));
            return;
        }
        if (modelType === 'cox' && !timeVar) {
            message.error(t('dataAnalysis.analysis.messages.coxRequiresTimeVar'));
            return;
        }

        setAnalyzing(true);
        setProgress(20);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }
        formData.append('model_type', modelType);
        formData.append('x_var', xVar);
        formData.append('y_var', yVar);
        formData.append('knots', knots || 4);

        if (timeVar) {
            formData.append('time_var', timeVar);
        }

        if (covariates && covariates.length > 0) {
            if (Array.isArray(covariates)) {
                covariates.forEach(c => formData.append('covariates', c));
            } else {
                formData.append('covariates', covariates);
            }
        }

        try {
            setProgress(60);
            const response = await fetch(getApiUrl(API_ENDPOINTS.RCS_ANALYSIS), {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setProgress(90);

            if (result.success) {
                setRcsResult(result);
                setResults(result);
                setProgress(100);
                message.success(t('dataAnalysis.analysis.messages.rcsSuccess'));
                setActiveTab('results');
            } else {
                const msg = result.error || t('dataAnalysis.analysis.messages.unknownError');
                setErrorMsg(msg);
                message.error(t('dataAnalysis.analysis.messages.rcsFailed', { msg }));
                setActiveTab('results');
            }
        } catch (error: any) {
            console.error('RCS Analysis Error Details:', error);
            // Check if error is specifically about string pattern (Base64/atob issue)
            if (error.message && error.message.includes("The string did not match the expected pattern")) {
                console.error('Potentially invalid Base64 string in response');
            }

            setErrorMsg(error.message || 'Network Error');
            message.error(t('dataAnalysis.analysis.messages.networkError'));
            setActiveTab('results');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRunAnalysis = async () => {
        console.log('开始分析，当前分析类型:', selectedAnalysis);

        if (selectedAnalysis === 'cox_regression') {
            // 先验证表单
            try {
                await form.validateFields(['covariateVars', 'timeVar', 'eventVar']);
                console.log('表单验证通过，开始Cox回归分析');
                handleCoxRegression();
                return;
            } catch (error) {
                console.log('表单验证失败:', error);
                message.error(t('dataAnalysis.analysis.messages.formValidationFailed'));
                return;
            }
        }

        if (selectedAnalysis === 'linear_regression') {
            await handleLinearRegression();
            return;
        }

        if (selectedAnalysis === 'logistic_regression') {
            await handleLogisticRegression();
            return;
        }

        if (selectedAnalysis === 'multinomial_logistic_regression') {
            await handleMultinomialLogisticRegression();
            return;
        }

        if (selectedAnalysis === 'ttest') {
            await handleStatisticalTest(API_ENDPOINTS.T_TEST, setTtestResult);
            return;
        }
        if (selectedAnalysis === 'chisquare') {
            await handleStatisticalTest(API_ENDPOINTS.CHI_SQUARE, setChisquareResult);
            return;
        }
        if (selectedAnalysis === 'anova') {
            await handleStatisticalTest(API_ENDPOINTS.ANOVA, setAnovaResult);
            return;
        }
        if (selectedAnalysis === 'ranksum') {
            await handleStatisticalTest(API_ENDPOINTS.RANK_SUM, setRankSumResult);
            return;
        }

        if (selectedAnalysis === 'rcs') {
            await handleRCSAnalysis();
            return;
        }

        // 如果没有匹配的分析方法
        message.error(t('dataAnalysis.analysis.messages.selectValidMethod'));
    };

    // 渲染变量选择选项
    const renderColumnOptions = (columnType?: 'numeric' | 'categorical' | 'all') => {
        if (!fileInfo) return [];

        let availableColumns: string[] = [];

        switch (columnType) {
            case 'numeric':
                availableColumns = fileInfo.numeric_columns;
                break;
            case 'categorical':
                availableColumns = fileInfo.categorical_columns;
                break;
            default:
                availableColumns = fileInfo.columns;
        }

        return availableColumns.map(col => (
            <Option key={col} value={col}>
                {col}
                {fileInfo.columns_info.find(info => info.name === col)?.data_type &&
                    ` (${fileInfo.columns_info.find(info => info.name === col)?.data_type})`
                }
            </Option>
        ));
    };





    // Cox回归表格列定义
    const coxColumns = [
        {
            title: t('dataAnalysis.results.cox.columns.covariate'),
            dataIndex: 'covariate',
            key: 'covariate',
            width: '30%',
        },
        {
            title: t('dataAnalysis.results.cox.columns.hr'),
            dataIndex: 'hr',
            key: 'hr',
            width: '25%',
            render: (val: any) => {
                if (val === null || val === 'N/A') return 'N/A';
                return typeof val === 'number' ? val.toFixed(4) : val;
            }
        },
        {
            title: t('dataAnalysis.results.cox.columns.ciLower'),
            dataIndex: 'ci_lower',
            key: 'ci_lower',
            width: '25%',
            render: (val: any) => {
                if (val === null || val === 'N/A') return 'N/A';
                return typeof val === 'number' ? val.toFixed(4) : val;
            }
        },
        {
            title: t('dataAnalysis.results.cox.columns.ciUpper'),
            dataIndex: 'ci_upper',
            key: 'ci_upper',
            width: '20%',
            render: (val: any) => {
                if (val === null || val === 'N/A') return 'N/A';
                return typeof val === 'number' ? val.toFixed(4) : val;
            }
        },
    ];

    const renderResults = () => {
        // 根据不同分析类型检查相应的结果状态
        if (selectedAnalysis === 'cox_regression' && !coxResult) return null;
        if (selectedAnalysis === 'linear_regression' && !linearResult) return null;
        if (selectedAnalysis === 'logistic_regression' && !logisticResult) return null;
        if (selectedAnalysis === 'multinomial_logistic_regression' && !multinomialResult) return null;
        if (selectedAnalysis === 'rcs' && !rcsResult) return null;

        if (selectedAnalysis === 'rcs' && rcsResult) {
            return (
                <div>
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                            }}>
                                <LineChartOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.rcs.plot')}</Title>
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                            padding: '24px',
                        }}>
                            {rcsResult.plot ? (
                                <Image
                                    src={rcsResult.plot}
                                    alt={t('dataAnalysis.results.rcs.plot')}
                                    style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    <Text>{t('dataAnalysis.results.rcs.noPlot')}</Text>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px',
                                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                            }}>
                                <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.rcs.statistics')}</Title>
                        </div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                            padding: '24px',
                        }}>
                            <Space direction="vertical">
                                <Text><strong>{t('dataAnalysis.results.rcs.modelType')}</strong> {rcsResult.model_type}</Text>
                                {rcsResult.aic && <Text><strong>{t('dataAnalysis.results.rcs.aic')}</strong> {rcsResult.aic.toFixed(2)}</Text>}
                            </Space>
                        </div>
                    </div>
                </div>
            );
        }
        if (selectedAnalysis === 'ttest' && !ttestResult) return null;
        if (selectedAnalysis === 'chisquare' && !chisquareResult) return null;
        if (selectedAnalysis === 'anova' && !anovaResult) return null;
        if (selectedAnalysis === 'ranksum' && !rankSumResult) return null;

        switch (selectedAnalysis) {
            case 'cox_regression':
                if (!coxResult) return null;

                // 准备Cox回归结果表格数据，处理null值
                const coxTableData = coxResult.covariates.map((covariate, index) => ({
                    key: index,
                    covariate: covariate,
                    hr: coxResult.hazard_ratios[index] ?? 'N/A',
                    ci_lower: coxResult.ci_lower[index] ?? 'N/A',
                    ci_upper: coxResult.ci_upper[index] ?? 'N/A',
                }));

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <BarChartOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.cox.forestPlot')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Image
                                                src={coxResult.plot}
                                                alt={t('dataAnalysis.results.cox.forestPlot')}
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                preview={{
                                                    mask: t('dataVisualization.result.previewImage')
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.cox.hazardRatios')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Table
                                            columns={coxColumns}
                                            dataSource={coxTableData}
                                            pagination={false}
                                            size="small"
                                            style={{ background: 'transparent' }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Alert
                            message={t('dataAnalysis.results.cox.summary.title')}
                            description={t('dataAnalysis.results.cox.summary.description', { count: coxResult.covariates.length })}
                            type="success"
                            showIcon
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                );

            case 'linear_regression':
                if (!linearResult) return null;

                // 准备回归系数表格数据
                const linearTableData = linearResult.coefficients.map((coef, index) => {
                    if (linearResult.regression_type === 'linear_simple') {
                        return {
                            key: index,
                            variable: index === 0 ? linearResult.x_var : t('dataAnalysis.results.linear.intercept'),
                            coefficient: coef,
                            description: index === 0 ? t('dataAnalysis.results.linear.independentCoefficient') : t('dataAnalysis.results.linear.regressionIntercept')
                        };
                    } else {
                        return {
                            key: index,
                            variable: linearResult.x_vars?.[index] || t('dataAnalysis.results.linear.intercept'),
                            coefficient: coef,
                            description: t('dataAnalysis.results.linear.regressionCoefficient')
                        };
                    }
                });

                // 添加截距项
                linearTableData.push({
                    key: linearTableData.length,
                    variable: t('dataAnalysis.results.linear.intercept'),
                    coefficient: linearResult.intercept,
                    description: t('dataAnalysis.results.linear.regressionIntercept')
                });

                const linearColumns = [
                    { title: t('dataAnalysis.results.linear.columns.variable'), dataIndex: 'variable', key: 'variable' },
                    { title: t('dataAnalysis.results.linear.columns.coefficient'), dataIndex: 'coefficient', key: 'coefficient', render: (val: number) => (typeof val === 'number' ? val.toFixed(4) : 'N/A') },
                    { title: t('dataAnalysis.results.linear.columns.description'), dataIndex: 'description', key: 'description' },
                ];

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(6, 182, 212, 0.3)'
                                        }}>
                                            <FundOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.linear.plot')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            {linearResult.plot ? (
                                                <Image
                                                    src={linearResult.plot}
                                                    alt={t('dataAnalysis.results.linear.plot')}
                                                    style={{ maxWidth: '100%', height: 'auto' }}
                                                    preview={{
                                                        mask: t('dataVisualization.result.previewImage')
                                                    }}
                                                    onError={(e) => {
                                                        console.error('线性回归图片加载失败:', e);
                                                        console.log('图片URL:', linearResult.plot?.substring(0, 100));
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                                    {t('dataVisualization.result.noData')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.linear.statistics')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col xs={24} lg={12}>
                                                <Statistic title={t('dataAnalysis.results.linear.stats.r2')} value={linearResult.r2_score} precision={4} />
                                            </Col>
                                            <Col xs={24} lg={12}>
                                                <Statistic title={t('dataAnalysis.results.linear.stats.mse')} value={linearResult.mse} precision={4} />
                                            </Col>
                                        </Row>
                                        {linearResult.correlation && (
                                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                                <Col xs={24} lg={12}>
                                                    <Statistic title={t('dataAnalysis.results.linear.stats.correlation')} value={linearResult.correlation} precision={4} />
                                                </Col>
                                                <Col xs={24} lg={12}>
                                                    <Statistic title={t('dataAnalysis.results.linear.stats.sampleSize')} value={linearResult.sample_size} />
                                                </Col>
                                            </Row>
                                        )}
                                        <Divider />
                                        <Text strong>{t('dataAnalysis.results.linear.equation')}</Text>
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            marginTop: '8px',
                                            fontFamily: 'monospace'
                                        }}>
                                            {linearResult.equation}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px',
                                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                }}>
                                    <TableOutlined style={{ color: 'white', fontSize: '18px' }} />
                                </div>
                                <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.linear.coefficients')}</Title>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                padding: '24px',
                            }}>
                                <Table
                                    columns={linearColumns}
                                    dataSource={linearTableData}
                                    pagination={false}
                                    size="small"
                                    style={{ background: 'transparent' }}
                                />
                            </div>
                        </div>

                        <Alert
                            message={t('dataAnalysis.results.linear.summary.title')}
                            description={t('dataAnalysis.results.linear.summary.description', {
                                type: t(`dataAnalysis.results.linear.summary.types.${linearResult.regression_type === 'linear_simple' ? 'simple' : 'multiple'}`),
                                r2: typeof linearResult.r2_score === 'number' ? linearResult.r2_score.toFixed(4) : 'N/A',
                                variance: typeof linearResult.r2_score === 'number' ? (linearResult.r2_score * 100).toFixed(2) : 'N/A',
                                sampleSize: linearResult.sample_size
                            })}
                            type="success"
                            showIcon
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                );

            case 'logistic_regression':
                if (!logisticResult) return null;

                // 准备逻辑回归系数表格数据
                const logisticTableData = [
                    {
                        key: 0,
                        variable: logisticResult.x_var,
                        coefficient: logisticResult.coefficients[0],
                        description: t('dataAnalysis.results.logistic.independentCoefficient')
                    },
                    {
                        key: 1,
                        variable: t('dataAnalysis.results.logistic.intercept'),
                        coefficient: logisticResult.intercept,
                        description: t('dataAnalysis.results.logistic.regressionIntercept')
                    }
                ];

                const logisticColumns = [
                    { title: t('dataAnalysis.results.linear.columns.variable'), dataIndex: 'variable', key: 'variable' },
                    { title: t('dataAnalysis.results.linear.columns.coefficient'), dataIndex: 'coefficient', key: 'coefficient', render: (val: number) => val.toFixed(4) },
                    { title: t('dataAnalysis.results.linear.columns.description'), dataIndex: 'description', key: 'description' },
                ];

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <CalculatorOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.logistic.plot')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            {logisticResult.plot ? (
                                                <Image
                                                    src={logisticResult.plot}
                                                    alt={t('dataAnalysis.results.logistic.plot')}
                                                    style={{ maxWidth: '100%', height: 'auto' }}
                                                    preview={{
                                                        mask: t('dataVisualization.result.previewImage')
                                                    }}
                                                    onError={(e) => {
                                                        console.error('逻辑回归图片加载失败:', e);
                                                        console.log('图片URL:', logisticResult.plot?.substring(0, 100));
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                                    {t('dataVisualization.result.noData')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.logistic.statistics')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col span={24}>
                                                <Statistic title={t('dataAnalysis.results.logistic.accuracy')} value={logisticResult.accuracy * 100} precision={2} suffix="%" />
                                            </Col>
                                        </Row>
                                        <Divider />
                                        <div>
                                            <Text strong>{t('dataAnalysis.results.logistic.modelInfo.title')}</Text>
                                            <div style={{ marginTop: '8px' }}>
                                                <Text>{t('dataAnalysis.results.logistic.modelInfo.xVar')} {logisticResult.x_var}</Text><br />
                                                <Text>{t('dataAnalysis.results.logistic.modelInfo.yVar')} {logisticResult.y_var}</Text><br />
                                                <Text>{t('dataAnalysis.results.logistic.modelInfo.type')}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px',
                                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <TableOutlined style={{ color: 'white', fontSize: '18px' }} />
                                </div>
                                <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.logistic.coefficients')}</Title>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                padding: '24px',
                            }}>
                                <Table
                                    columns={logisticColumns}
                                    dataSource={logisticTableData}
                                    pagination={false}
                                    size="small"
                                    style={{ background: 'transparent' }}
                                />
                            </div>
                        </div>

                        <Alert
                            message={t('dataAnalysis.results.logistic.summary.title')}
                            description={t('dataAnalysis.results.logistic.summary.description', {
                                accuracy: (logisticResult.accuracy * 100).toFixed(2),
                                xVar: logisticResult.x_var,
                                yVar: logisticResult.y_var,
                                performance: t(`dataAnalysis.results.logistic.summary.performance.${logisticResult.accuracy > 0.7 ? 'good' : 'fair'}`)
                            })}
                            type="success"
                            showIcon
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                );

            case 'multinomial_logistic_regression':
                if (!multinomialResult) return null;

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <BarChartOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.multinomial.plot')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            {multinomialResult.plot ? (
                                                <Image
                                                    src={multinomialResult.plot}
                                                    alt={t('dataAnalysis.results.multinomial.plot')}
                                                    style={{ maxWidth: '100%', height: 'auto' }}
                                                    preview={{
                                                        mask: t('dataVisualization.result.previewImage')
                                                    }}
                                                    onError={(e) => {
                                                        console.error('多分类回归图片加载失败:', e);
                                                        console.log('图片URL:', multinomialResult.plot?.substring(0, 100));
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                                    {t('dataVisualization.result.noData')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.results.multinomial.statistics')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col xs={24} lg={12}>
                                                <Statistic title={t('dataAnalysis.results.multinomial.stats.accuracy')} value={multinomialResult.accuracy * 100} precision={2} suffix="%" />
                                            </Col>
                                            <Col xs={24} lg={12}>
                                                <Statistic title={t('dataAnalysis.results.multinomial.stats.classes')} value={multinomialResult.n_classes} />
                                            </Col>
                                        </Row>
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col span={24}>
                                                <Statistic title={t('dataAnalysis.results.multinomial.stats.sampleSize')} value={multinomialResult.sample_size} />
                                            </Col>
                                        </Row>
                                        <Divider />
                                        <div>
                                            <Text strong>{t('dataAnalysis.results.multinomial.modelInfo.title')}</Text>
                                            <div style={{ marginTop: '8px' }}>
                                                <Text>{t('dataAnalysis.results.multinomial.modelInfo.xVars')} {multinomialResult.x_vars.join(', ')}</Text><br />
                                                <Text>{t('dataAnalysis.results.multinomial.modelInfo.yVar')} {multinomialResult.y_var}</Text><br />
                                                <Text>{t('dataAnalysis.results.multinomial.modelInfo.labels')} {multinomialResult.class_labels.join(', ')}</Text><br />
                                                <Text>{t('dataAnalysis.results.multinomial.modelInfo.type')}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Alert
                            message={t('dataAnalysis.results.multinomial.summary.title')}
                            description={t('dataAnalysis.results.multinomial.summary.description', {
                                accuracy: (multinomialResult.accuracy * 100).toFixed(2),
                                classes: multinomialResult.n_classes,
                                labels: multinomialResult.class_labels.join(', ')
                            })}
                            type="success"
                            showIcon
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                );

            case 'ttest':
                if (!ttestResult) return null;
                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <BarChartOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>Boxplot</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Image src={ttestResult.plot} style={{ maxWidth: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>T-Test Results</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Statistic title="T-Statistic" value={ttestResult.statistic} precision={4} />
                                        <Statistic title="P-Value" value={ttestResult.p_value} precision={4} valueStyle={{ color: ttestResult.p_value < 0.05 ? '#cf1322' : '#3f8600' }} />
                                        <Divider />
                                        <Paragraph>Groups: {ttestResult.groups.join(', ')}</Paragraph>
                                        <Text strong>Means:</Text>
                                        <ul>
                                            {Object.entries(ttestResult.means).map(([group, mean]) => (
                                                <li key={group}>{group}: {mean.toFixed(4)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );
            case 'chisquare':
                if (!chisquareResult) return null;
                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)'
                                        }}>
                                            <TableOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>Heatmap</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Image src={chisquareResult.plot} style={{ maxWidth: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>Chi-Square Test Results</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Statistic title="Chi-Square Statistic" value={chisquareResult.statistic} precision={4} />
                                        <Statistic title="P-Value" value={chisquareResult.p_value} precision={4} valueStyle={{ color: chisquareResult.p_value < 0.05 ? '#cf1322' : '#3f8600' }} />
                                        <Statistic title="Degrees of Freedom" value={chisquareResult.dof} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );
            case 'anova':
                if (!anovaResult) return null;
                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <BarChartOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>Violin Plot</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Image src={anovaResult.plot} style={{ maxWidth: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>ANOVA Results</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Statistic title="F-Statistic" value={anovaResult.statistic} precision={4} />
                                        <Statistic title="P-Value" value={anovaResult.p_value} precision={4} valueStyle={{ color: anovaResult.p_value < 0.05 ? '#cf1322' : '#3f8600' }} />
                                        <Divider />
                                        <Paragraph>Groups: {anovaResult.groups.join(', ')}</Paragraph>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );
            case 'ranksum':
                if (!rankSumResult) return null;
                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <BarChartOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>Boxplot</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Image src={rankSumResult.plot} style={{ maxWidth: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={12}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>Mann-Whitney U Test Results</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px',
                                    }}>
                                        <Statistic title="U-Statistic" value={rankSumResult.statistic} precision={4} />
                                        <Statistic title="P-Value" value={rankSumResult.p_value} precision={4} valueStyle={{ color: rankSumResult.p_value < 0.05 ? '#cf1322' : '#3f8600' }} />
                                        <Divider />
                                        <Paragraph>Groups: {rankSumResult.groups.join(', ')}</Paragraph>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );
            default:
                return (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                    }}>
                        <Alert message="分析结果" description="分析完成" type="success" style={{ borderRadius: '12px' }} />
                    </div>
                );
        }
    };

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={`page-entry ${isVisible ? 'visible' : ''}`} style={{ paddingBottom: '60px' }}>
            <div className="hero-section">
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                    <ExperimentOutlined /> Data Analysis Engine
                </div>
                <Title level={1} className="hero-title">
                    {t('dataAnalysis.title')}
                </Title>
                <Text className="hero-subtitle">
                    {t('dataAnalysis.subtitle')}
                </Text>
            </div>

            <div className="main-content-layout">
                <div className="glass-card static-card" style={{ padding: '30px', minHeight: '600px' }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane tab={t('dataAnalysis.config.title')} key="config">
                            <Row gutter={24}>
                                <Col span={24}>
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '12px',
                                                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <CloudUploadOutlined style={{ color: 'white', fontSize: '18px' }} />
                                            </div>
                                            <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.upload.title')}</Title>
                                        </div>
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.4)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                            padding: '24px',
                                        }}>
                                            <Row gutter={24} align="middle">
                                                <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                                                    <Dragger
                                                        name="file"
                                                        multiple={false}
                                                        maxCount={1}
                                                        accept=".csv"
                                                        beforeUpload={handleFileUpload}
                                                        onRemove={() => {
                                                            setUploadedFile(null);
                                                            setFileInfo(null);
                                                            setResults(null);
                                                            setErrorMsg(null);
                                                            form.resetFields();
                                                        }}
                                                        style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.1)' }}
                                                        disabled={uploadLoading}
                                                    >
                                                        <p className="ant-upload-drag-icon">
                                                            <InboxOutlined style={{ color: '#1890ff' }} />
                                                        </p>
                                                        <p className="ant-upload-text">{t('dataProcessing.upload.dragText')}</p>
                                                        <p className="ant-upload-hint">
                                                            {t('dataProcessing.upload.hint')}
                                                        </p>
                                                    </Dragger>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    {fileInfo ? (
                                                        <Alert
                                                            message={t('dataAnalysis.upload.fileInfo')}
                                                            description={
                                                                <div>
                                                                    <div style={{ marginBottom: 4 }}><Text strong>{t('dataAnalysis.upload.fileName')}:</Text> {fileInfo.filename}</div>
                                                                    <div style={{ marginBottom: 4 }}><Text strong>{t('dataAnalysis.upload.rowCount')}:</Text> {fileInfo.file_stats.total_rows}</div>
                                                                    <div style={{ marginBottom: 8 }}><Text strong>{t('dataAnalysis.upload.columnCount')}:</Text> {fileInfo.file_stats.total_columns}</div>
                                                                    <div>
                                                                        <Space wrap>
                                                                            <Tag color="blue">{t('dataAnalysis.upload.numericType')}: {fileInfo.file_stats.numeric_columns_count}</Tag>
                                                                            <Tag color="green">{t('dataAnalysis.upload.categoricalType')}: {fileInfo.file_stats.categorical_columns_count}</Tag>
                                                                        </Space>
                                                                    </div>
                                                                </div>
                                                            }
                                                            type="info"
                                                            showIcon
                                                            icon={<FileTextOutlined />}
                                                            style={{ borderRadius: '12px' }}
                                                        />
                                                    ) : (
                                                        <div style={{ textAlign: 'center', color: '#999' }}>
                                                            <FileTextOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                                                            <div>{t('dataVisualization.upload.hint', { defaultValue: 'Please upload a file to start analysis' })}</div>
                                                            <div style={{ marginTop: 16 }}>
                                                                <Button
                                                                    icon={<ExperimentOutlined />}
                                                                    onClick={handleLoadDemoData}
                                                                    loading={uploadLoading}
                                                                >
                                                                    {t('dataAnalysis.upload.loadDemo', { defaultValue: 'Experience Demo Data' })}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>

                                    {fileInfo && (
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '12px',
                                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                                    }}>
                                                        <TableOutlined style={{ color: 'white', fontSize: '18px' }} />
                                                    </div>
                                                    <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.preview.title')}</Title>
                                                </div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {t('dataAnalysis.preview.showFirst')}
                                                </Text>
                                            </div>
                                            <div style={{
                                                background: 'rgba(255, 255, 255, 0.4)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                                padding: '24px',
                                            }}>
                                                <div style={{
                                                    marginBottom: 16,
                                                    padding: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                                    borderRadius: '8px',
                                                }}>
                                                    <Row justify="space-between" align="middle">
                                                        <Col>
                                                            <Space split={<Divider type="vertical" />}>
                                                                <Text>{t('dataAnalysis.preview.totalData')}: <strong>{fileInfo.file_stats.total_rows.toLocaleString()}</strong></Text>
                                                                <Text>{t('dataAnalysis.preview.totalColumns')}: <strong>{fileInfo.file_stats.total_columns}</strong></Text>
                                                                <Text>{t('dataAnalysis.preview.fileSize')}: <strong>{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB</strong></Text>
                                                            </Space>
                                                        </Col>
                                                        <Col>
                                                            <Space>
                                                                <Tag color="blue">{t('dataAnalysis.upload.numericType')}: {fileInfo.file_stats.numeric_columns_count}</Tag>
                                                                <Tag color="green">{t('dataAnalysis.upload.categoricalType')}: {fileInfo.file_stats.categorical_columns_count}</Tag>
                                                            </Space>
                                                        </Col>
                                                    </Row>
                                                </div>

                                                {fileInfo.preview_data ? (
                                                    <Table
                                                        columns={fileInfo.columns.map(col => ({
                                                            title: col,
                                                            dataIndex: col,
                                                            key: col,
                                                            width: 120,
                                                            ellipsis: true,
                                                            render: (text: any) => (
                                                                <span title={text?.toString()}>
                                                                    {text !== null && text !== undefined ? String(text) : '-'}
                                                                </span>
                                                            )
                                                        }))}
                                                        dataSource={fileInfo.preview_data.map((row: any, index: number) => ({
                                                            key: index,
                                                            ...row
                                                        }))}
                                                        pagination={false}
                                                        size="small"
                                                        scroll={{ x: 'max-content', y: 300 }}
                                                        bordered={false}
                                                        style={{ background: 'transparent' }}
                                                    />
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                                        <Text type="secondary">{t('dataAnalysis.preview.unavailable')}</Text>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)'
                                        }}>
                                            <ExperimentOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.methods.title')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '16px',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        <List
                                            grid={{ gutter: 16, column: 2, xs: 1, sm: 2, md: 2 }}
                                            dataSource={getAnalysisTypes(t)}
                                            renderItem={item => (
                                                <List.Item
                                                    key={item.key}
                                                    style={{ marginBottom: 16 }}
                                                >
                                                    <div
                                                        style={{
                                                            cursor: 'pointer',
                                                            backgroundColor: selectedAnalysis === item.key
                                                                ? 'rgba(255, 255, 255, 0.8)'
                                                                : 'rgba(255, 255, 255, 0.2)',
                                                            border: selectedAnalysis === item.key
                                                                ? '1px solid #1890ff'
                                                                : '1px solid transparent',
                                                            borderRadius: '12px',
                                                            padding: '12px',
                                                            height: '100%',
                                                            transition: 'all 0.3s ease',
                                                            backdropFilter: selectedAnalysis === item.key ? 'blur(5px)' : 'none',
                                                            boxShadow: selectedAnalysis === item.key ? '0 4px 12px rgba(24, 144, 255, 0.15)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                        onClick={() => setSelectedAnalysis(item.key)}
                                                        className="method-list-item"
                                                    >
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            background: selectedAnalysis === item.key ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : '#f0f2f5',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: selectedAnalysis === item.key ? 'white' : '#666',
                                                            transition: 'all 0.3s ease',
                                                            marginRight: '12px',
                                                            flexShrink: 0
                                                        }}>
                                                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: selectedAnalysis === item.key ? 600 : 500, color: '#333', marginBottom: 4 }}>
                                                                {item.name}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#666',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>
                                                                {item.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </div>



                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            boxShadow: '0 4px 10px rgba(82, 196, 26, 0.3)'
                                        }}>
                                            <SettingOutlined style={{ color: 'white', fontSize: '18px' }} />
                                        </div>
                                        <Title level={5} style={{ margin: 0 }}>{t('dataAnalysis.config.title')}</Title>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                        padding: '24px'
                                    }}>
                                        <Form
                                            form={form}
                                            layout="vertical"
                                        >
                                            {selectedAnalysis === 'cox_regression' ? (
                                                // Cox回归特殊参数
                                                <>
                                                    <Alert
                                                        message={t('dataAnalysis.config.cox.title')}
                                                        description={t('dataAnalysis.config.cox.description')}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.cox.covariates.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.cox.covariates.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="covariateVars"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.cox.covariates.required') }]}
                                                            >
                                                                <Select
                                                                    mode="multiple"
                                                                    placeholder={t('dataAnalysis.config.cox.covariates.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    maxTagCount="responsive"
                                                                    allowClear
                                                                    style={{ minHeight: '32px' }}
                                                                    tagRender={(props) => {
                                                                        const { label, closable, onClose } = props;
                                                                        return (
                                                                            <Tag
                                                                                color="blue"
                                                                                closable={closable}
                                                                                onClose={onClose}
                                                                                style={{ margin: '2px' }}
                                                                            >
                                                                                {label}
                                                                            </Tag>
                                                                        );
                                                                    }}
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.cox.timeVar.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.cox.timeVar.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="timeVar"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.cox.timeVar.required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.cox.timeVar.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('numeric')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.cox.eventVar.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.cox.eventVar.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="eventVar"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.cox.eventVar.required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.cox.eventVar.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.cox.alpha.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.cox.alpha.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="alpha"
                                                                initialValue="0.05"
                                                            >
                                                                <Select>
                                                                    <Option value="0.01">{t('dataAnalysis.config.cox.alpha.options.0.01')}</Option>
                                                                    <Option value="0.05">{t('dataAnalysis.config.cox.alpha.options.0.05')}</Option>
                                                                    <Option value="0.10">{t('dataAnalysis.config.cox.alpha.options.0.10')}</Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : selectedAnalysis === 'linear_regression' ? (
                                                // 线性回归参数
                                                <>
                                                    <Alert
                                                        message={t('dataAnalysis.config.linear.title')}
                                                        description={t('dataAnalysis.config.linear.description')}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.linear.yVar.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.linear.yVar.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="yVar"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.linear.yVar.required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.linear.yVar.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('numeric')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.linear.xVars.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.linear.xVars.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="xVars"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.logistic.xVar.required') }]}
                                                            >
                                                                <Select
                                                                    mode="multiple"
                                                                    placeholder={t('dataAnalysis.config.linear.xVars.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    maxTagCount="responsive"
                                                                    allowClear
                                                                    style={{ minHeight: '32px' }}
                                                                    tagRender={(props) => {
                                                                        const { label, closable, onClose } = props;
                                                                        return (
                                                                            <Tag
                                                                                color="green"
                                                                                closable={closable}
                                                                                onClose={onClose}
                                                                                style={{ margin: '2px' }}
                                                                            >
                                                                                {label}
                                                                            </Tag>
                                                                        );
                                                                    }}
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : selectedAnalysis === 'logistic_regression' ? (
                                                // 逻辑回归参数
                                                <>
                                                    <Alert
                                                        message={t('dataAnalysis.config.logistic.title')}
                                                        description={t('dataAnalysis.config.logistic.description')}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.logistic.yVar.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.logistic.yVar.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="yVar"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.linear.yVar.required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.logistic.yVar.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.logistic.xVar.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.logistic.xVar.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="xVar"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.logistic.xVar.required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.logistic.xVar.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : selectedAnalysis === 'multinomial_logistic_regression' ? (
                                                // 多分类逻辑回归参数
                                                <>
                                                    <Alert
                                                        message={t('dataAnalysis.config.multinomial.title')}
                                                        description={t('dataAnalysis.config.multinomial.description')}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.multinomial.yVar.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.multinomial.yVar.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="yVar"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.linear.yVar.required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.multinomial.yVar.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={
                                                                    <span>
                                                                        {t('dataAnalysis.config.multinomial.xVars.label')}
                                                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                            {t('dataAnalysis.config.multinomial.xVars.hint')}
                                                                        </Text>
                                                                    </span>
                                                                }
                                                                name="xVars"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.multinomial.xVars.required') }]}
                                                            >
                                                                <Select
                                                                    mode="multiple"
                                                                    placeholder={t('dataAnalysis.config.multinomial.xVars.placeholder')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    maxTagCount="responsive"
                                                                    allowClear
                                                                    style={{ minHeight: '32px' }}
                                                                    tagRender={(props) => {
                                                                        const { label, closable, onClose } = props;
                                                                        return (
                                                                            <Tag
                                                                                color="blue"
                                                                                closable={closable}
                                                                                onClose={onClose}
                                                                                style={{ margin: '2px' }}
                                                                            >
                                                                                {label}
                                                                            </Tag>
                                                                        );
                                                                    }}
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Alert
                                                        message={t('common.info')}
                                                        description={t('dataAnalysis.config.multinomial.tip')}
                                                        type="warning"
                                                        showIcon
                                                        style={{ marginTop: 16 }}
                                                    />
                                                </>
                                            ) : ['ttest', 'anova', 'ranksum'].includes(selectedAnalysis) ? (
                                                // T检验、ANOVA、秩和检验参数
                                                <>
                                                    <Alert
                                                        message={t(`dataAnalysis.config.${selectedAnalysis}.title`)}
                                                        description={t(`dataAnalysis.config.${selectedAnalysis}.description`)}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={<span style={{ color: '#333' }}>{t('dataAnalysis.config.groupCol')}</span>}
                                                                name="groupCol"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.groupColRequired') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.selectGroupCol')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={<span style={{ color: '#333' }}>{t('dataAnalysis.config.valueCol')}</span>}
                                                                name="valueCol"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.valueColRequired') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.selectValueCol')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('numeric')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : selectedAnalysis === 'chisquare' ? (
                                                // 卡方检验参数
                                                <>
                                                    <Alert
                                                        message={t('dataAnalysis.config.chisquare.title')}
                                                        description={t('dataAnalysis.config.chisquare.description')}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={<span style={{ color: '#333' }}>{t('dataAnalysis.config.col1')}</span>}
                                                                name="col1"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.col1Required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.selectCol1')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={<span style={{ color: '#333' }}>{t('dataAnalysis.config.col2')}</span>}
                                                                name="col2"
                                                                rules={[{ required: true, message: t('dataAnalysis.config.col2Required') }]}
                                                            >
                                                                <Select
                                                                    placeholder={t('dataAnalysis.config.selectCol2')}
                                                                    disabled={!fileInfo}
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    allowClear
                                                                >
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : selectedAnalysis === 'rcs' ? (
                                                // RCS Parameters
                                                <>
                                                    <Alert
                                                        message={t('dataAnalysis.config.rcs.title')}
                                                        description={t('dataAnalysis.config.rcs.description')}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label={t('dataAnalysis.config.rcs.modelType')}
                                                                name="modelType"
                                                                initialValue="logistic"
                                                                rules={[{ required: true }]}
                                                            >
                                                                <Select>
                                                                    <Option value="linear">{t('dataAnalysis.config.rcs.options.linear')}</Option>
                                                                    <Option value="logistic">{t('dataAnalysis.config.rcs.options.logistic')}</Option>
                                                                    <Option value="cox">{t('dataAnalysis.config.rcs.options.cox')}</Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={8}>
                                                            <Form.Item
                                                                label={t('dataAnalysis.config.rcs.knots')}
                                                                name="knots"
                                                                initialValue={4}
                                                            >
                                                                <Select>
                                                                    <Option value={3}>{t('dataAnalysis.config.rcs.knotOptions', { count: 3 })}</Option>
                                                                    <Option value={4}>{t('dataAnalysis.config.rcs.knotOptions', { count: 4 })}</Option>
                                                                    <Option value={5}>{t('dataAnalysis.config.rcs.knotOptions', { count: 5 })}</Option>
                                                                    <Option value={6}>{t('dataAnalysis.config.rcs.knotOptions', { count: 6 })}</Option>
                                                                    <Option value={7}>{t('dataAnalysis.config.rcs.knotOptions', { count: 7 })}</Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Row gutter={16}>
                                                        <Col xs={24} md={12}>
                                                            {/* Dynamic Y Variable Label based on model type? */}
                                                            <Form.Item
                                                                label={t('dataAnalysis.config.rcs.yVar')}
                                                                name="yVar"
                                                                tooltip={t('dataAnalysis.config.rcs.yVarTooltip')}
                                                                rules={[{ required: true }]}
                                                            >
                                                                <Select showSearch optionFilterProp="children">
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item
                                                                label={t('dataAnalysis.config.rcs.xVar')}
                                                                name="xVar"
                                                                rules={[{ required: true }]}
                                                            >
                                                                <Select showSearch optionFilterProp="children">
                                                                    {renderColumnOptions('numeric')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Form.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues.modelType !== currentValues.modelType}
                                                    >
                                                        {({ getFieldValue }) =>
                                                            getFieldValue('modelType') === 'cox' ? (
                                                                <Row gutter={16}>
                                                                    <Col xs={24} md={12}>
                                                                        <Form.Item
                                                                            label={t('dataAnalysis.config.rcs.timeVar')}
                                                                            name="timeVar"
                                                                            rules={[{ required: true, message: t('dataAnalysis.config.rcs.timeVarRequired') }]}
                                                                        >
                                                                            <Select showSearch optionFilterProp="children">
                                                                                {renderColumnOptions('numeric')}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </Col>
                                                                </Row>
                                                            ) : null
                                                        }
                                                    </Form.Item>
                                                    <Row gutter={16}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                label={t('dataAnalysis.config.rcs.covariates')}
                                                                name="covariates"
                                                            >
                                                                <Select mode="multiple" showSearch optionFilterProp="children" allowClear>
                                                                    {renderColumnOptions('all')}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : null}
                                        </Form>

                                    </div>
                                </div>




                                <Divider />

                                <div style={{
                                    marginTop: 32,
                                    background: 'rgba(255, 255, 255, 0.4)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    padding: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '16px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '16px',
                                            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
                                        }}>
                                            <PlayCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
                                        </div>
                                        <div>
                                            <Title level={4} style={{ margin: 0 }}>{t('dataAnalysis.analysis.start')}</Title>
                                            <Text type="secondary">
                                                {t('dataAnalysis.analysis.currentMethod')}: <Text strong style={{ color: '#6366f1' }}>{getAnalysisTypes(t).find(type => type.key === selectedAnalysis)?.name}</Text>
                                            </Text>
                                        </div>
                                    </div>

                                    <Space wrap>
                                        {analyzing && showAnalysisTimeoutWarning && (
                                            <>
                                                <Button
                                                    danger
                                                    icon={<StopOutlined />}
                                                    onClick={handleCancelAnalysis}
                                                    size="large"
                                                    style={{ borderRadius: '20px', height: '40px' }}
                                                >
                                                    {t('dataAnalysis.analysis.cancel')}
                                                </Button>
                                                <Button
                                                    icon={<ReloadOutlined />}
                                                    onClick={handleRetryAnalysis}
                                                    size="large"
                                                    style={{ borderRadius: '20px', height: '40px' }}
                                                >
                                                    {t('dataAnalysis.analysis.retry')}
                                                </Button>
                                            </>
                                        )}

                                        <Button
                                            type="primary"
                                            icon={analyzing ? <LoadingOutlined /> : <PlayCircleOutlined />}
                                            onClick={() => {
                                                console.log('按钮被点击');
                                                console.log('当前状态:', {
                                                    selectedAnalysis,
                                                    fileInfo: !!fileInfo,
                                                    uploadedFile: !!uploadedFile,
                                                    analyzing
                                                });
                                                handleRunAnalysis();
                                            }}
                                            size="large"
                                            disabled={!fileInfo && (selectedAnalysis === 'cox_regression' || selectedAnalysis === 'multinomial_logistic_regression') || analyzing}
                                            loading={analyzing && !showAnalysisTimeoutWarning}
                                            style={{
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                                height: '48px',
                                                padding: '0 32px',
                                                borderRadius: '24px',
                                                fontWeight: 600,
                                                fontSize: '16px',
                                                minWidth: '160px'
                                            }}
                                        >
                                            {analyzing ? t('dataAnalysis.analysis.running') : t('dataAnalysis.analysis.start')}
                                        </Button>
                                    </Space>
                                </div>

                                {
                                    !analyzing && (!fileInfo && selectedAnalysis === 'cox_regression') && (
                                        <Alert
                                            message={t('dataAnalysis.analysis.needUpload')}
                                            type="warning"
                                            showIcon
                                            style={{ marginTop: 16, borderRadius: '12px' }}
                                        />
                                    )
                                }
                            </div>
                        </TabPane >

                        <TabPane tab={t('dataAnalysis.results.tab')} key="results">
                            {analyzing ? (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <Progress
                                        type="circle"
                                        percent={progress}
                                        style={{ marginBottom: 16 }}
                                    />
                                    <div>
                                        <Text>{t('dataAnalysis.analysis.progress')} {getAnalysisTypes(t).find(type => type.key === selectedAnalysis)?.name}...</Text>
                                        {showAnalysisTimeoutWarning && (
                                            <div style={{ marginTop: 16, maxWidth: 400, margin: '16px auto' }}>
                                                <Alert
                                                    message={t('dataAnalysis.analysis.timeoutWarning.title')}
                                                    description={t('dataAnalysis.analysis.timeoutWarning.waitMessage')}
                                                    type="warning"
                                                    showIcon
                                                    action={
                                                        <Space direction="vertical">
                                                            <Button
                                                                size="small"
                                                                danger
                                                                onClick={handleCancelAnalysis}
                                                            >
                                                                {t('dataAnalysis.analysis.cancel')}
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                onClick={handleRetryAnalysis}
                                                            >
                                                                {t('dataAnalysis.analysis.retry')}
                                                            </Button>
                                                        </Space>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : errorMsg ? (
                                <div style={{ padding: '24px' }}>
                                    <Alert
                                        message={t('common.error')}
                                        description={
                                            <div>
                                                <Paragraph>
                                                    <strong>{getFriendlyErrorMessage(errorMsg)}</strong>
                                                </Paragraph>
                                                <Paragraph type="secondary" style={{ fontSize: '12px' }}>
                                                    {t('dataAnalysis.errors.originalError')}: {errorMsg}
                                                </Paragraph>
                                                <Button type="primary" onClick={() => setActiveTab('config')}>
                                                    {t('dataAnalysis.config.title')}
                                                </Button>
                                            </div>
                                        }
                                        type="error"
                                        showIcon
                                    />
                                </div>
                            ) : results ? (
                                <div>
                                    <Row gutter={24}>
                                        <Col xs={24} lg={selectedAnalysis === 'cox_regression' ? 24 : 18}>
                                            <div style={{ marginBottom: 24 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: 8,
                                                        marginBottom: 16
                                                    }}
                                                >
                                                    <Title level={5} style={{ margin: 0 }}>
                                                        {`${getAnalysisTypes(t).find(type => type.key === selectedAnalysis)?.name} ${t('dataAnalysis.results.title')}`}
                                                    </Title>
                                                    <Space>
                                                        <Tooltip title={t('common.comingSoon') || '功能开发中，敬请期待'}>
                                                            <Button
                                                                icon={<DownloadOutlined />}
                                                                size="middle"
                                                                style={{ borderRadius: '20px' }}
                                                                disabled
                                                            >
                                                                {t('dataAnalysis.results.export')}
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip title={t('common.comingSoon') || '功能开发中，敬请期待'}>
                                                            <Button
                                                                icon={<FileTextOutlined />}
                                                                size="middle"
                                                                style={{ borderRadius: '20px' }}
                                                                disabled
                                                            >
                                                                {t('dataAnalysis.results.generateReport')}
                                                            </Button>
                                                        </Tooltip>
                                                    </Space>
                                                </div>
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.4)',
                                                    borderRadius: '12px',
                                                    padding: '24px',
                                                    minHeight: '320px'
                                                }}>
                                                    {renderResults()}
                                                </div>
                                            </div>
                                        </Col>

                                        {selectedAnalysis !== 'cox_regression' && (
                                            <Col xs={24} lg={6}>
                                                <div style={{ marginBottom: 24 }}>
                                                    <Title level={5} style={{ marginBottom: 16 }}>{t('dataAnalysis.results.info.title')}</Title>
                                                    <div style={{
                                                        background: 'rgba(255,255,255,0.4)',
                                                        borderRadius: '12px',
                                                        padding: '24px'
                                                    }}>
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            <div>
                                                                <Text strong style={{ color: '#333' }}>{t('dataAnalysis.results.info.method')}</Text>
                                                                <br />
                                                                <Text style={{ color: '#333' }}>{getAnalysisTypes(t).find(type => type.key === selectedAnalysis)?.name}</Text>
                                                            </div>

                                                            <div>
                                                                <Text strong style={{ color: '#333' }}>{t('dataAnalysis.results.info.dataSource')}</Text>
                                                                <br />
                                                                <Text style={{ color: '#333' }}>{fileInfo?.filename || t('dataAnalysis.results.info.simulatedData')}</Text>
                                                            </div>

                                                            <div>
                                                                <Text strong style={{ color: '#333' }}>{t('dataAnalysis.results.info.sampleSize')}</Text>
                                                                <br />
                                                                <Text style={{ color: '#333' }}>{fileInfo?.file_stats.total_rows?.toLocaleString() || '9,460'} {t('dataAnalysis.results.info.people')}</Text>
                                                            </div>

                                                            <div>
                                                                <Text strong style={{ color: '#333' }}>{t('dataAnalysis.results.info.analysisTime')}</Text>
                                                                <br />
                                                                <Text style={{ color: '#333' }}>{new Date().toLocaleString()}</Text>
                                                            </div>
                                                        </Space>

                                                    </div>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <Text type="secondary">{t('dataAnalysis.results.noResults')}</Text>
                                </div>
                            )}
                        </TabPane>
                    </Tabs >
                </div >
            </div >
        </div >
    );
};

export default DataAnalysis;
