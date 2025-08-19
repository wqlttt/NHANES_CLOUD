import React, { useState } from 'react';
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
const analysisTypes = [
    {
        key: 'linear_regression',
        name: '线性回归',
        icon: <LineChartOutlined />,
        description: '建立连续型因变量与自变量间的线性关系',
    },
    {
        key: 'logistic_regression',
        name: '逻辑回归',
        icon: <ExperimentOutlined />,
        description: '建立二分类因变量与自变量间的逻辑关系',
    },
    {
        key: 'cox_regression',
        name: 'Cox回归分析',
        icon: <FundOutlined />,
        description: 'Cox比例风险模型，用于生存分析',
    },
    {
        key: 'multinomial_logistic_regression',
        name: '多分类逻辑回归',
        icon: <ExperimentOutlined />,
        description: '多分类逻辑回归，适用于CKMStage等多分类因变量',
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
                message.success(`文件上传成功！${result.message}`);

                // 清空之前的分析结果
                setResults(null);
                setCoxResult(null);
                setLinearResult(null);
                setLogisticResult(null);
                setMultinomialResult(null);

                // 重置表单
                form.resetFields();
            } else {
                message.error(`文件上传失败：${result.error}`);
            }
        } catch (error) {
            console.error('文件上传错误:', error);
            message.error('文件上传失败，请检查网络连接');
        } finally {
            setUploadLoading(false);
        }

        return false; // 阻止antd默认上传行为
    };

    // 取消分析
    const handleCancelAnalysis = () => {
        if (analysisAbortController) {
            analysisAbortController.abort();
            message.info('正在取消分析...');
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
            message.error('请先上传CSV文件');
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('表单数据:', formValues);
        const { covariateVars, timeVar, eventVar } = formValues;

        // 验证必要参数
        if (!covariateVars || covariateVars.length === 0) {
            message.error('请选择协变量');
            return;
        }
        if (!timeVar) {
            message.error('请选择时间变量');
            return;
        }
        if (!eventVar) {
            message.error('请选择事件变量');
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
                message.success('Cox回归分析完成！');
            } else {
                message.error(`Cox回归分析失败：${result.error}`);
                setResults(null);
                setCoxResult(null);
            }
        } catch (error: any) {
            clearInterval(progressInterval);
            console.error('Cox回归分析错误:', error);
            if (error.name === 'AbortError') {
                message.warning('Cox回归分析已取消');
            } else {
                message.error('Cox回归分析失败，请检查网络连接');
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
            message.error('请先上传CSV文件');
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('线性回归表单数据:', formValues);
        const { xVars, yVar } = formValues;

        if (!xVars || xVars.length === 0) {
            message.error('请选择至少一个自变量');
            return;
        }

        if (!yVar) {
            message.error('请选择因变量');
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
                message.success('线性回归分析完成！');
                setActiveTab('results');
            } else {
                message.error(`线性回归分析失败：${result.error}`);
            }
        } catch (error) {
            console.error('线性回归分析错误:', error);
            message.error('线性回归分析失败，请检查网络连接');
        } finally {
            setAnalyzing(false);
        }
    };

    // 运行逻辑回归分析
    const handleLogisticRegression = async () => {
        if (!uploadedFile) {
            message.error('请先上传CSV文件');
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('逻辑回归表单数据:', formValues);
        const { xVar, yVar } = formValues;

        if (!xVar) {
            message.error('请选择自变量');
            return;
        }

        if (!yVar) {
            message.error('请选择因变量');
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
                message.success('逻辑回归分析完成！');
                setActiveTab('results');
            } else {
                message.error(`逻辑回归分析失败：${result.error}`);
            }
        } catch (error) {
            console.error('逻辑回归分析错误:', error);
            message.error('逻辑回归分析失败，请检查网络连接');
        } finally {
            setAnalyzing(false);
        }
    };

    // 运行多分类逻辑回归分析
    const handleMultinomialLogisticRegression = async () => {
        if (!uploadedFile) {
            message.error('请先上传CSV文件');
            return;
        }

        const formValues = form.getFieldsValue();
        console.log('多分类逻辑回归表单数据:', formValues);
        const { xVars, yVar } = formValues;

        if (!xVars || xVars.length === 0) {
            message.error('请选择至少一个自变量');
            return;
        }

        if (!yVar) {
            message.error('请选择因变量');
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
                message.success('多分类逻辑回归分析完成！');
                setActiveTab('results');
            } else {
                message.error(`多分类逻辑回归分析失败：${result.error}`);
            }
        } catch (error) {
            console.error('多分类逻辑回归分析错误:', error);
            message.error('多分类逻辑回归分析失败，请检查网络连接');
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
                message.error('请完整填写Cox回归分析参数');
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
        message.error('请选择有效的分析方法');
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
            title: '协变量',
            dataIndex: 'covariate',
            key: 'covariate',
            width: '30%',
        },
        {
            title: '风险比 (HR)',
            dataIndex: 'hr',
            key: 'hr',
            width: '25%',
            render: (val: any) => {
                if (val === null || val === 'N/A') return 'N/A';
                return typeof val === 'number' ? val.toFixed(4) : val;
            }
        },
        {
            title: '95% CI 下限',
            dataIndex: 'ci_lower',
            key: 'ci_lower',
            width: '25%',
            render: (val: any) => {
                if (val === null || val === 'N/A') return 'N/A';
                return typeof val === 'number' ? val.toFixed(4) : val;
            }
        },
        {
            title: '95% CI 上限',
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
                                <Card title="森林图" size="small">
                                    <div style={{ textAlign: 'center' }}>
                                        <Image
                                            src={coxResult.plot}
                                            alt="Cox回归森林图"
                                            style={{ maxWidth: '100%', height: 'auto' }}
                                            preview={{
                                                mask: '点击查看大图'
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="风险比结果" size="small">
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
                            message="Cox回归分析结果"
                            description={`分析了${coxResult.covariates.length}个协变量的风险比。森林图展示了各协变量的风险比及其95%置信区间。`}
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
                            variable: index === 0 ? linearResult.x_var : '截距',
                            coefficient: coef,
                            description: index === 0 ? '自变量系数' : '回归截距'
                        };
                    } else {
                        return {
                            key: index,
                            variable: linearResult.x_vars?.[index] || '截距',
                            coefficient: coef,
                            description: '回归系数'
                        };
                    }
                });

                // 添加截距项
                linearTableData.push({
                    key: linearTableData.length,
                    variable: '截距',
                    coefficient: linearResult.intercept,
                    description: '回归截距'
                });

                const linearColumns = [
                    { title: '变量', dataIndex: 'variable', key: 'variable' },
                    { title: '系数值', dataIndex: 'coefficient', key: 'coefficient', render: (val: number) => val.toFixed(4) },
                    { title: '说明', dataIndex: 'description', key: 'description' },
                ];

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <Card title="回归图" size="small">
                                    <div style={{ textAlign: 'center' }}>
                                        {linearResult.plot ? (
                                            <Image
                                                src={linearResult.plot}
                                                alt="线性回归图"
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                preview={{
                                                    mask: '点击查看大图'
                                                }}
                                                onError={(e) => {
                                                    console.error('线性回归图片加载失败:', e);
                                                    console.log('图片URL:', linearResult.plot?.substring(0, 100));
                                                }}
                                            />
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                                图片数据缺失
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="回归统计" size="small">
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={12}>
                                            <Statistic title="R² 决定系数" value={linearResult.r2_score} precision={4} />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title="MSE 均方误差" value={linearResult.mse} precision={4} />
                                        </Col>
                                    </Row>
                                    {linearResult.correlation && (
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col span={12}>
                                                <Statistic title="相关系数" value={linearResult.correlation} precision={4} />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic title="样本数量" value={linearResult.sample_size} />
                                            </Col>
                                        </Row>
                                    )}
                                    <Divider />
                                    <Text strong>回归方程：</Text>
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

                        <Card title="回归系数" size="small" style={{ marginBottom: 16 }}>
                            <Table
                                columns={linearColumns}
                                dataSource={linearTableData}
                                pagination={false}
                                size="small"
                            />
                        </Card>

                        <Alert
                            message="线性回归分析结果"
                            description={`
                                ${linearResult.regression_type === 'linear_simple' ? '单变量' : '多变量'}线性回归分析完成。
                                R² = ${linearResult.r2_score.toFixed(4)}，表示模型解释了因变量 ${(linearResult.r2_score * 100).toFixed(2)}% 的方差。
                                样本量：${linearResult.sample_size}
                            `}
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
                        description: '自变量系数'
                    },
                    {
                        key: 1,
                        variable: '截距',
                        coefficient: logisticResult.intercept,
                        description: '回归截距'
                    }
                ];

                const logisticColumns = [
                    { title: '变量', dataIndex: 'variable', key: 'variable' },
                    { title: '系数值', dataIndex: 'coefficient', key: 'coefficient', render: (val: number) => val.toFixed(4) },
                    { title: '说明', dataIndex: 'description', key: 'description' },
                ];

                return (
                    <div>
                        <Row gutter={24} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <Card title="逻辑回归图" size="small">
                                    <div style={{ textAlign: 'center' }}>
                                        {logisticResult.plot ? (
                                            <Image
                                                src={logisticResult.plot}
                                                alt="逻辑回归图"
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                preview={{
                                                    mask: '点击查看大图'
                                                }}
                                                onError={(e) => {
                                                    console.error('逻辑回归图片加载失败:', e);
                                                    console.log('图片URL:', logisticResult.plot?.substring(0, 100));
                                                }}
                                            />
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                                图片数据缺失
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="分类统计" size="small">
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={24}>
                                            <Statistic title="分类准确率" value={logisticResult.accuracy * 100} precision={2} suffix="%" />
                                        </Col>
                                    </Row>
                                    <Divider />
                                    <div>
                                        <Text strong>模型说明：</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text>自变量：{logisticResult.x_var}</Text><br />
                                            <Text>因变量：{logisticResult.y_var}</Text><br />
                                            <Text>模型类型：二分类逻辑回归</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Card title="回归系数" size="small" style={{ marginBottom: 16 }}>
                            <Table
                                columns={logisticColumns}
                                dataSource={logisticTableData}
                                pagination={false}
                                size="small"
                            />
                        </Card>

                        <Alert
                            message="逻辑回归分析结果"
                            description={`
                                二分类逻辑回归分析完成。
                                模型准确率：${(logisticResult.accuracy * 100).toFixed(2)}%。
                                自变量 ${logisticResult.x_var} 对因变量 ${logisticResult.y_var} 的预测效果${logisticResult.accuracy > 0.7 ? '较好' : '一般'}。
                            `}
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
                                <Card title="多分类回归分析图" size="small">
                                    <div style={{ textAlign: 'center' }}>
                                        {multinomialResult.plot ? (
                                            <Image
                                                src={multinomialResult.plot}
                                                alt="多分类逻辑回归图"
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                preview={{
                                                    mask: '点击查看大图'
                                                }}
                                                onError={(e) => {
                                                    console.error('多分类回归图片加载失败:', e);
                                                    console.log('图片URL:', multinomialResult.plot?.substring(0, 100));
                                                }}
                                            />
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                                图片数据缺失
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="分类统计" size="small">
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={12}>
                                            <Statistic title="分类准确率" value={multinomialResult.accuracy * 100} precision={2} suffix="%" />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic title="类别数量" value={multinomialResult.n_classes} />
                                        </Col>
                                    </Row>
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={24}>
                                            <Statistic title="样本数量" value={multinomialResult.sample_size} />
                                        </Col>
                                    </Row>
                                    <Divider />
                                    <div>
                                        <Text strong>模型说明：</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text>自变量：{multinomialResult.x_vars.join(', ')}</Text><br />
                                            <Text>因变量：{multinomialResult.y_var}</Text><br />
                                            <Text>类别标签：{multinomialResult.class_labels.join(', ')}</Text><br />
                                            <Text>模型类型：多分类逻辑回归</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Alert
                            message="多分类逻辑回归分析结果"
                            description={`
                                多分类逻辑回归分析完成。
                                模型准确率：${(multinomialResult.accuracy * 100).toFixed(2)}%。
                                成功分类 ${multinomialResult.n_classes} 个类别（${multinomialResult.class_labels.join(', ')}）。
                                适用于CKMStage等多分类因变量的分析。
                            `}
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
            <Title level={2}>数据分析</Title>
            <Text type="secondary">
                上传数据文件，选择统计分析方法，配置参数并查看分析结果
            </Text>

            <Card style={{ marginTop: 24 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="分析配置" key="config">
                        {/* 数据上传区域 */}
                        <Card title="数据上传" size="small" style={{ marginBottom: 16 }}>
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
                                            {uploadedFile ? '重新上传CSV文件' : '上传CSV文件'}
                                        </Button>
                                    </Upload>
                                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                        支持格式：CSV文件，最大50MB
                                    </Text>
                                </Col>
                                <Col span={12}>
                                    {fileInfo && (
                                        <div>
                                            <Text strong>文件信息：</Text>
                                            <div style={{ marginTop: 8 }}>
                                                <Text>文件名：{fileInfo.filename}</Text><br />
                                                <Text>数据行数：{fileInfo.file_stats.total_rows}</Text><br />
                                                <Text>列数：{fileInfo.file_stats.total_columns}
                                                    (数值型: {fileInfo.file_stats.numeric_columns_count},
                                                    分类型: {fileInfo.file_stats.categorical_columns_count})
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
                                        <span>数据预览</span>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            (显示前10行数据)
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
                                                <Text>总数据: <strong>{fileInfo.file_stats.total_rows.toLocaleString()}</strong> 行</Text>
                                                <Text>|</Text>
                                                <Text>总列数: <strong>{fileInfo.file_stats.total_columns}</strong> 列</Text>
                                                <Text>|</Text>
                                                <Text>文件大小: <strong>{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB</strong></Text>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Tag color="blue">数值型: {fileInfo.file_stats.numeric_columns_count}</Tag>
                                                <Tag color="green">分类型: {fileInfo.file_stats.categorical_columns_count}</Tag>
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
                                        <Text type="secondary">数据预览暂不可用</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            请确保上传的CSV文件格式正确
                                        </Text>
                                    </div>
                                )}
                            </Card>
                        )}

                        <Row gutter={24}>
                            <Col span={8}>
                                <Card title="1. 选择分析方法" size="small">
                                    <List
                                        dataSource={analysisTypes}
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
                                <Card title="分析参数配置" size="small" style={{ marginBottom: 16 }}>
                                    <Form
                                        form={form}
                                        layout="vertical"
                                    >
                                        {selectedAnalysis === 'cox_regression' ? (
                                            // Cox回归特殊参数
                                            <>
                                                <Alert
                                                    message="Cox回归分析说明"
                                                    description="协变量：影响生存的因素；时间变量：生存时间（必须为正数）；事件变量：事件状态（0=删失，1=发生事件）"
                                                    type="info"
                                                    showIcon
                                                    style={{ marginBottom: 16 }}
                                                />
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            label={
                                                                <span>
                                                                    协变量
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (可多选，影响生存的因素)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="covariateVars"
                                                            rules={[{ required: true, message: '请选择协变量' }]}
                                                        >
                                                            <Select
                                                                mode="multiple"
                                                                placeholder="选择协变量（可多选，如：年龄、性别、治疗方式等）"
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
                                                                    时间变量
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (生存时间，数值型)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="timeVar"
                                                            rules={[{ required: true, message: '请选择时间变量' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择生存时间变量（如：survival_time）"
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
                                                                    事件变量
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (0=删失，1=事件)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="eventVar"
                                                            rules={[{ required: true, message: '请选择事件变量' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择事件状态变量（如：event_status）"
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
                                                                    显著性水平
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (统计检验的α水平)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="alpha"
                                                            initialValue="0.05"
                                                        >
                                                            <Select>
                                                                <Option value="0.01">α = 0.01 (99%置信度)</Option>
                                                                <Option value="0.05">α = 0.05 (95%置信度，推荐)</Option>
                                                                <Option value="0.10">α = 0.10 (90%置信度)</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </>
                                        ) : selectedAnalysis === 'linear_regression' ? (
                                            // 线性回归参数
                                            <>
                                                <Alert
                                                    message="线性回归分析说明"
                                                    description="线性回归用于分析连续型因变量与一个或多个自变量的线性关系。因变量必须是连续型数值变量（如身高、体重、收入、年龄等）。如果因变量是分类变量（如性别、是否通过等），请使用逻辑回归。"
                                                    type="info"
                                                    showIcon
                                                    style={{ marginBottom: 16 }}
                                                />
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            label={
                                                                <span>
                                                                    因变量 (Y)
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (连续型变量，必须为数值型)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="yVar"
                                                            rules={[{ required: true, message: '请选择因变量' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择因变量（如：身高、体重、收入等）"
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
                                                                    自变量 (X)
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (可多选，数值型或分类型)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="xVars"
                                                            rules={[{ required: true, message: '请选择自变量' }]}
                                                        >
                                                            <Select
                                                                mode="multiple"
                                                                placeholder="选择自变量（如：年龄、性别、教育程度等）"
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
                                                    message="逻辑回归分析说明"
                                                    description="逻辑回归用于分析二分类因变量与自变量的关系。因变量应包含两个分类（如：0/1，是/否，成功/失败）。"
                                                    type="info"
                                                    showIcon
                                                    style={{ marginBottom: 16 }}
                                                />
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            label={
                                                                <span>
                                                                    因变量 (Y)
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (二分类变量，如：0/1，成功/失败)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="yVar"
                                                            rules={[{ required: true, message: '请选择因变量' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择因变量（如：是否患病、是否通过等）"
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
                                                                    自变量 (X)
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (数值型或分类型变量)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="xVar"
                                                            rules={[{ required: true, message: '请选择自变量' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择自变量（如：年龄、性别、教育程度等）"
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
                                                    message="多分类逻辑回归分析说明"
                                                    description="多分类逻辑回归用于分析多分类因变量与自变量的关系。因变量应包含3个或更多分类（如：CKMStage的0,1,2,3,4等级）。适用于分析有序或无序的多分类问题。"
                                                    type="info"
                                                    showIcon
                                                    style={{ marginBottom: 16 }}
                                                />
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            label={
                                                                <span>
                                                                    因变量 (Y)
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (多分类变量，如：CKMStage的0,1,2,3,4)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="yVar"
                                                            rules={[{ required: true, message: '请选择因变量' }]}
                                                        >
                                                            <Select
                                                                placeholder="选择因变量（如：CKMStage、疾病严重程度等）"
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
                                                                    自变量 (X)
                                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                                                        (可多选，数值型或分类型)
                                                                    </Text>
                                                                </span>
                                                            }
                                                            name="xVars"
                                                            rules={[{ required: true, message: '请选择自变量' }]}
                                                        >
                                                            <Select
                                                                mode="multiple"
                                                                placeholder="选择自变量（如：年龄、性别、BMI等）"
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
                                                    message="提示"
                                                    description="多分类逻辑回归会自动处理缺失值，并标准化数值型特征。模型将输出每个类别的预测概率和整体分类准确率。"
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
                                        开始分析
                                    </Button>

                                    {analyzing && showAnalysisTimeoutWarning && (
                                        <Space>
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                                onClick={handleCancelAnalysis}
                                                size="large"
                                            >
                                                取消分析
                                            </Button>
                                            <Button
                                                type="default"
                                                icon={<ReloadOutlined />}
                                                onClick={handleRetryAnalysis}
                                                size="large"
                                            >
                                                重新分析
                                            </Button>
                                        </Space>
                                    )}

                                    {!analyzing && (
                                        <Text style={{ color: '#666' }}>
                                            当前分析方法：{analysisTypes.find(t => t.key === selectedAnalysis)?.name}
                                            {selectedAnalysis === 'cox_regression' && !fileInfo && ' (需要先上传数据文件)'}
                                        </Text>
                                    )}
                                </Space>

                                {showAnalysisTimeoutWarning && (
                                    <Alert
                                        message="分析时间较长"
                                        description={
                                            <div>
                                                数据分析正在处理中，可能由于数据量较大或计算复杂。
                                                <br />
                                                您可以选择继续等待、取消当前操作或重新分析。
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

                    <TabPane tab="分析结果" key="results">
                        {analyzing ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <Progress
                                    type="circle"
                                    percent={progress}
                                    style={{ marginBottom: 16 }}
                                />
                                <div>
                                    <Text>正在进行{analysisTypes.find(t => t.key === selectedAnalysis)?.name}...</Text>
                                    {showAnalysisTimeoutWarning && (
                                        <div style={{ marginTop: 16, maxWidth: 400, margin: '16px auto' }}>
                                            <Alert
                                                message="分析时间较长"
                                                description="数据分析正在处理中，可能由于数据量较大或计算复杂，请耐心等待或返回配置页面取消操作"
                                                type="warning"
                                                showIcon
                                                action={
                                                    <Space direction="vertical">
                                                        <Button
                                                            size="small"
                                                            danger
                                                            onClick={handleCancelAnalysis}
                                                        >
                                                            取消分析
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            onClick={handleRetryAnalysis}
                                                        >
                                                            重新分析
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
                                            title={`${analysisTypes.find(t => t.key === selectedAnalysis)?.name}结果`}
                                            extra={
                                                <Space>
                                                    <Button icon={<DownloadOutlined />} size="small">
                                                        导出结果
                                                    </Button>
                                                    <Button icon={<FileTextOutlined />} size="small">
                                                        生成报告
                                                    </Button>
                                                </Space>
                                            }
                                        >
                                            {renderResults()}
                                        </Card>
                                    </Col>

                                    {selectedAnalysis !== 'cox_regression' && (
                                        <Col span={6}>
                                            <Card title="分析信息" size="small">
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <div>
                                                        <Text strong style={{ color: '#333' }}>分析方法：</Text>
                                                        <br />
                                                        <Text style={{ color: '#333' }}>{analysisTypes.find(t => t.key === selectedAnalysis)?.name}</Text>
                                                    </div>

                                                    <div>
                                                        <Text strong style={{ color: '#333' }}>数据源：</Text>
                                                        <br />
                                                        <Text style={{ color: '#333' }}>{fileInfo?.filename || '模拟数据'}</Text>
                                                    </div>

                                                    <div>
                                                        <Text strong style={{ color: '#333' }}>样本量：</Text>
                                                        <br />
                                                        <Text style={{ color: '#333' }}>{fileInfo?.file_stats.total_rows?.toLocaleString() || '9,460'} 人</Text>
                                                    </div>

                                                    <div>
                                                        <Text strong style={{ color: '#333' }}>分析时间：</Text>
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
                                <Text type="secondary">请在配置页面选择分析方法并开始分析</Text>
                            </div>
                        )}
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default DataAnalysis; 
