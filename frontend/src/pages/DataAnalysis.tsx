import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
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

    // 文件相关状态
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [coxResult, setCoxResult] = useState<CoxRegressionResult | null>(null);
    const [linearResult, setLinearResult] = useState<LinearRegressionResult | null>(null);
    const [logisticResult, setLogisticResult] = useState<LogisticRegressionResult | null>(null);
    const [multinomialResult, setMultinomialResult] = useState<MultinomialLogisticRegressionResult | null>(null);

    // 处理文件上传
    const handleFileUpload = async (file: File) => {
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/get_csvfile', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setUploadedFile(file);
                setFileInfo(result);
                message.success(t('dataVisualization.upload.success', { message: result.message }));

                // 清空之前的分析结果
                setResults(null);
                setCoxResult(null);
                setLinearResult(null);
                setLogisticResult(null);
                setMultinomialResult(null);

                // 重置表单
                form.resetFields();
            } else {
                message.error(t('dataVisualization.upload.error', { error: result.error }));
            }
        } catch (error) {
            console.error('文件上传错误:', error);
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
        formData.append('file', uploadedFile);

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
            const response = await fetch('http://localhost:5000/CoxRegression', {
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
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.cox_regression.name'), error: result.error }));
                setResults(null);
                setCoxResult(null);
            }
        } catch (error: any) {
            clearInterval(progressInterval);
            console.error('Cox回归分析错误:', error);
            if (error.name === 'AbortError') {
                message.warning(t('dataAnalysis.analysis.messages.analysisCancelled', { method: t('dataAnalysis.methods.cox_regression.name') }));
            } else {
                message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.cox_regression.name') }));
            }
            setResults(null);
            setCoxResult(null);
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
        formData.append('file', uploadedFile);

        // 支持多变量回归
        if (Array.isArray(xVars)) {
            xVars.forEach(x => formData.append('x_vars', x));
        } else {
            formData.append('x_vars', xVars);
        }
        formData.append('y_var', yVar);

        try {
            setProgress(60);
            const response = await fetch('http://localhost:5000/linearRegression', {
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
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.linear_regression.name'), error: result.error }));
            }
        } catch (error) {
            console.error('线性回归分析错误:', error);
            message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.linear_regression.name') }));
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
        formData.append('file', uploadedFile);
        formData.append('x_var', xVar);
        formData.append('y_var', yVar);

        try {
            setProgress(60);
            const response = await fetch('http://localhost:5000/logisticRegression', {
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
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.logistic_regression.name'), error: result.error }));
            }
        } catch (error) {
            console.error('逻辑回归分析错误:', error);
            message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.logistic_regression.name') }));
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
        formData.append('file', uploadedFile);

        // 支持多变量分析
        if (Array.isArray(xVars)) {
            xVars.forEach(x => formData.append('x_vars', x));
        } else {
            formData.append('x_vars', xVars);
        }
        formData.append('y_var', yVar);

        try {
            setProgress(60);
            const response = await fetch('http://localhost:5000/multinomialLogisticRegression', {
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
                message.error(t('dataAnalysis.analysis.messages.analysisFailed', { method: t('dataAnalysis.methods.multinomial_logistic_regression.name'), error: result.error }));
            }
        } catch (error) {
            console.error('多分类逻辑回归分析错误:', error);
            message.error(t('dataAnalysis.analysis.messages.networkError', { method: t('dataAnalysis.methods.multinomial_logistic_regression.name') }));
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
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.cox.forestPlot')} size="small">
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
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.cox.hazardRatios')} size="small">
                                    <Table
                                        columns={coxColumns}
                                        dataSource={coxTableData}
                                        pagination={false}
                                        size="small"
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Alert
                            message={t('dataAnalysis.results.cox.summary.title')}
                            description={t('dataAnalysis.results.cox.summary.description', { count: coxResult.covariates.length })}
                            type="success"
                            showIcon
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
                    { title: t('dataAnalysis.results.linear.columns.coefficient'), dataIndex: 'coefficient', key: 'coefficient', render: (val: number) => val.toFixed(4) },
                    { title: t('dataAnalysis.results.linear.columns.description'), dataIndex: 'description', key: 'description' },
                ];

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.linear.plot')} size="small">
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
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.linear.statistics')} size="small">
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={12}>
                                            <Statistic title={t('dataAnalysis.results.linear.stats.r2')} value={linearResult.r2_score} precision={4} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title={t('dataAnalysis.results.linear.stats.mse')} value={linearResult.mse} precision={4} />
                                        </Col>
                                    </Row>
                                    {linearResult.correlation && (
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col span={12}>
                                                <Statistic title={t('dataAnalysis.results.linear.stats.correlation')} value={linearResult.correlation} precision={4} />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic title={t('dataAnalysis.results.linear.stats.sampleSize')} value={linearResult.sample_size} />
                                            </Col>
                                        </Row>
                                    )}
                                    <Divider />
                                    <Text strong>{t('dataAnalysis.results.linear.equation')}</Text>
                                    <div style={{
                                        backgroundColor: '#f5f5f5',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        marginTop: '8px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {linearResult.equation}
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Card title={t('dataAnalysis.results.linear.coefficients')} size="small" style={{ marginBottom: 16 }}>
                            <Table
                                columns={linearColumns}
                                dataSource={linearTableData}
                                pagination={false}
                                size="small"
                            />
                        </Card>

                        <Alert
                            message={t('dataAnalysis.results.linear.summary.title')}
                            description={t('dataAnalysis.results.linear.summary.description', {
                                type: t(`dataAnalysis.results.linear.summary.types.${linearResult.regression_type === 'linear_simple' ? 'simple' : 'multiple'}`),
                                r2: linearResult.r2_score.toFixed(4),
                                variance: (linearResult.r2_score * 100).toFixed(2),
                                sampleSize: linearResult.sample_size
                            })}
                            type="success"
                            showIcon
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
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.logistic.plot')} size="small">
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
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.logistic.statistics')} size="small">
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
                                </Card>
                            </Col>
                        </Row>

                        <Card title={t('dataAnalysis.results.logistic.coefficients')} size="small" style={{ marginBottom: 16 }}>
                            <Table
                                columns={logisticColumns}
                                dataSource={logisticTableData}
                                pagination={false}
                                size="small"
                            />
                        </Card>

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
                        />
                    </div>
                );

            case 'multinomial_logistic_regression':
                if (!multinomialResult) return null;

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.multinomial.plot')} size="small">
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
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title={t('dataAnalysis.results.multinomial.statistics')} size="small">
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={12}>
                                            <Statistic title={t('dataAnalysis.results.multinomial.stats.accuracy')} value={multinomialResult.accuracy * 100} precision={2} suffix="%" />
                                        </Col>
                                        <Col span={12}>
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
                                </Card>
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
                        />
                    </div>
                );

            default:
                return <Alert message="分析结果" description="分析完成" type="success" />;
        }
    };

    return (
        <div>
            <Title level={2}>{t('dataAnalysis.title')}</Title>
            <Text type="secondary">
                {t('dataAnalysis.subtitle')}
            </Text>

            <Card style={{ marginTop: 24 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab={t('dataAnalysis.config.title')} key="config">
                        {/* 数据上传区域 */}
                        <Card title={t('dataAnalysis.upload.title')} size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Upload
                                        accept=".csv"
                                        showUploadList={false}
                                        beforeUpload={handleFileUpload}
                                        disabled={uploadLoading}
                                    >
                                        <Button
                                            icon={<UploadOutlined />}
                                            loading={uploadLoading}
                                            size="large"
                                        >
                                            {uploadedFile ? t('dataAnalysis.upload.reupload') : t('dataAnalysis.upload.button')}
                                        </Button>
                                    </Upload>
                                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                        {t('dataAnalysis.upload.supportFormat')}
                                    </Text>
                                </Col>
                                <Col span={12}>
                                    {fileInfo && (
                                        <div>
                                            <Text strong>{t('dataAnalysis.upload.fileInfo')}</Text>
                                            <div style={{ marginTop: 8 }}>
                                                <Text>{t('dataAnalysis.upload.fileName')} {fileInfo.filename}</Text><br />
                                                <Text>{t('dataAnalysis.upload.rowCount')} {fileInfo.file_stats.total_rows}</Text><br />
                                                <Text>{t('dataAnalysis.upload.columnCount')} {fileInfo.file_stats.total_columns}
                                                    ({t('dataAnalysis.upload.numericType')}: {fileInfo.file_stats.numeric_columns_count},
                                                    {t('dataAnalysis.upload.categoricalType')}: {fileInfo.file_stats.categorical_columns_count})
                                                </Text>
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card>

                        {/* 数据预览 */}
                        {fileInfo && (
                            <Card
                                title={
                                    <Space>
                                        <FileTextOutlined />
                                        <span>{t('dataAnalysis.preview.title')}</span>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {t('dataAnalysis.preview.showFirst')}
                                        </Text>
                                    </Space>
                                }
                                style={{ marginTop: 16, marginBottom: 16 }}
                                size="small"
                            >
                                {/* 数据统计信息 */}
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
                                                <Text>{t('dataAnalysis.preview.totalData')}: <strong>{fileInfo.file_stats.total_rows.toLocaleString()}</strong> {t('dataVisualization.preview.rows')}</Text>
                                                <Text>|</Text>
                                                <Text>{t('dataAnalysis.preview.totalColumns')}: <strong>{fileInfo.file_stats.total_columns}</strong> {t('dataVisualization.preview.columns')}</Text>
                                                <Text>|</Text>
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

                                {/* 数据预览表格 */}
                                {fileInfo.preview_data ? (
                                    <div style={{ overflowX: 'auto' }}>
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
                                            bordered
                                            style={{
                                                fontSize: '12px'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                        <br />
                                        <Text type="secondary">{t('dataAnalysis.preview.unavailable')}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {t('dataAnalysis.preview.checkFormat')}
                                        </Text>
                                    </div>
                                )}
                            </Card>
                        )}

                        <Row gutter={24}>
                            <Col span={8}>
                                <Card title={t('dataAnalysis.methods.title')} size="small">
                                    <List
                                        dataSource={getAnalysisTypes(t)}
                                        renderItem={(item) => (
                                            <List.Item
                                                key={item.key}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedAnalysis === item.key
                                                        ? '#f0f8ff'
                                                        : 'transparent',
                                                    border: selectedAnalysis === item.key
                                                        ? '1px solid #1890ff'
                                                        : '1px solid #d9d9d9',
                                                    borderRadius: 4,
                                                    padding: 12,
                                                    marginBottom: 8,
                                                    color: '#333',
                                                }}
                                                onClick={() => setSelectedAnalysis(item.key)}
                                            >
                                                <List.Item.Meta
                                                    avatar={<span style={{ color: '#1890ff' }}>{item.icon}</span>}
                                                    title={<span style={{ color: '#333' }}>{item.name}</span>}
                                                    description={
                                                        <Text type="secondary" style={{
                                                            fontSize: '12px',
                                                            color: '#666'
                                                        }}>
                                                            {item.description}
                                                        </Text>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>

                            <Col span={16}>
                                <Card title={t('dataAnalysis.config.title')} size="small" style={{ marginBottom: 16 }}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                                    <Col span={12}>
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
                                        ) : (
                                            // 其他分析方法的参数
                                            <>
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item label={<span style={{ color: '#333' }}>因变量</span>}>
                                                            <Select
                                                                placeholder="选择因变量"
                                                                disabled={!fileInfo}
                                                                showSearch
                                                                optionFilterProp="children"
                                                                allowClear
                                                            >
                                                                {renderColumnOptions('numeric')}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item label={<span style={{ color: '#333' }}>自变量</span>}>
                                                            <Select
                                                                mode="multiple"
                                                                placeholder="选择自变量"
                                                                disabled={!fileInfo}
                                                                showSearch
                                                                optionFilterProp="children"
                                                                maxTagCount="responsive"
                                                                allowClear
                                                            >
                                                                {renderColumnOptions('all')}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>


                                            </>
                                        )}
                                    </Form>
                                </Card>


                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
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
                                    >
                                        {t('dataAnalysis.analysis.start')}
                                    </Button>

                                    {analyzing && showAnalysisTimeoutWarning && (
                                        <Space>
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                                onClick={handleCancelAnalysis}
                                                size="large"
                                            >
                                                {t('dataAnalysis.analysis.cancel')}
                                            </Button>
                                            <Button
                                                type="default"
                                                icon={<ReloadOutlined />}
                                                onClick={handleRetryAnalysis}
                                                size="large"
                                            >
                                                {t('dataAnalysis.analysis.retry')}
                                            </Button>
                                        </Space>
                                    )}

                                    {!analyzing && (
                                        <Text style={{ color: '#666' }}>
                                            {t('dataAnalysis.analysis.currentMethod')} {getAnalysisTypes(t).find(type => type.key === selectedAnalysis)?.name}
                                            {selectedAnalysis === 'cox_regression' && !fileInfo && t('dataAnalysis.analysis.needUpload')}
                                        </Text>
                                    )}
                                </Space>

                                {showAnalysisTimeoutWarning && (
                                    <Alert
                                        message={t('dataAnalysis.analysis.timeoutWarning.title')}
                                        description={
                                            <div>
                                                {t('dataAnalysis.analysis.timeoutWarning.description')}
                                                <br />
                                                {t('dataAnalysis.analysis.timeoutWarning.options')}
                                            </div>
                                        }
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: 8 }}
                                    />
                                )}
                            </Space>
                        </div>
                    </TabPane>

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
                        ) : results ? (
                            <div>
                                <Row gutter={24}>
                                    <Col span={selectedAnalysis === 'cox_regression' ? 24 : 18}>
                                        <Card
                                            title={`${getAnalysisTypes(t).find(type => type.key === selectedAnalysis)?.name} ${t('dataAnalysis.results.title')}`}
                                            extra={
                                                <Space>
                                                    <Button icon={<DownloadOutlined />} size="small">
                                                        {t('dataAnalysis.results.export')}
                                                    </Button>
                                                    <Button icon={<FileTextOutlined />} size="small">
                                                        {t('dataAnalysis.results.generateReport')}
                                                    </Button>
                                                </Space>
                                            }
                                        >
                                            {renderResults()}
                                        </Card>
                                    </Col>

                                    {selectedAnalysis !== 'cox_regression' && (
                                        <Col span={6}>
                                            <Card title={t('dataAnalysis.results.info.title')} size="small">
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
                                            </Card>
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
                </Tabs>
            </Card>
        </div>
    );
};

export default DataAnalysis; 
