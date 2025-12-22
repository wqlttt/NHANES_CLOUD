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
    Radio,
    Divider,
    Spin,
    Empty,
    Tabs,
    Upload,
    message,
    Alert,
    Image,
    Table,
    Tag,
    Input,
    Checkbox,
    Result,
    Tooltip,
} from 'antd';
import {
    BarChartOutlined,
    LineChartOutlined,
    PieChartOutlined,
    DotChartOutlined,
    UploadOutlined,
    DownloadOutlined,
    EyeOutlined,
    FileTextOutlined,
    StopOutlined,
    ReloadOutlined,
    HeatMapOutlined,
    FundOutlined,
    AreaChartOutlined,
    AppstoreOutlined,
    SettingOutlined,
    ToolOutlined,
    CloudUploadOutlined,
    InboxOutlined,
    ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// 图表类型配置 - 匹配后端支持的类型
const getChartTypes = (t: any) => [
    { value: 'histogram', label: t('dataVisualization.chartType.histogram'), icon: <BarChartOutlined /> },
    { value: 'boxplot', label: t('dataVisualization.chartType.boxplot'), icon: <LineChartOutlined /> },
    { value: 'violinplot', label: t('dataVisualization.chartType.violinplot'), icon: <AreaChartOutlined /> },
    { value: 'qqplot', label: t('dataVisualization.chartType.qqplot'), icon: <FundOutlined /> },
    { value: 'barplot', label: t('dataVisualization.chartType.barplot'), icon: <BarChartOutlined /> },
    { value: 'scatter', label: t('dataVisualization.chartType.scatter'), icon: <DotChartOutlined /> },
    { value: 'jointplot', label: t('dataVisualization.chartType.jointplot'), icon: <PieChartOutlined /> },
    { value: 'correlation_heatmap', label: t('dataVisualization.chartType.correlation_heatmap'), icon: <HeatMapOutlined /> },
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

interface ChartResult {
    success: boolean;
    chart_type: string;
    plot: string;
    filename: string;
    variables_used: {
        x_var: string;
        y_var: string;
    };
    message: string;
}

const DataVisualization: React.FC = () => {
    const { t } = useTranslation();
    const chartTypes = getChartTypes(t);
    const [form] = Form.useForm();
    const [chartType, setChartType] = useState('histogram');
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [chartGenerated, setChartGenerated] = useState(false);
    const [activeTab, setActiveTab] = useState('config');
    const [isMobile, setIsMobile] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // 检测屏幕尺寸
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // Page enter animation
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // 文件相关状态
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [chartResult, setChartResult] = useState<ChartResult | null>(null);

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

                // 清空之前的图表结果
                setChartResult(null);
                setChartGenerated(false);

                // 重置表单变量选择
                form.resetFields(['xVar', 'yVar', 'groupVar']);
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

    // 加载演示数据
    const handleLoadDemoData = async () => {
        try {
            setUploadLoading(true);
            const response = await fetch(getApiUrl(API_ENDPOINTS.LOAD_DEMO_DATA), {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                message.success(t('dataVisualization.upload.demoSuccess', { defaultValue: 'Demo data loaded successfully!' }));

                setUploadedFile({
                    uid: 'demo-file',
                    name: data.filename,
                    status: 'done',
                    url: data.filepath,
                } as any);

                // 设置文件信息预览
                setFileInfo({
                    filename: data.filename,
                    file_stats: {
                        total_rows: data.total_rows,
                        total_columns: data.total_columns,
                        file_size: 0,
                        numeric_columns_count: data.numeric_columns.length,
                        categorical_columns_count: data.categorical_columns.length
                    },
                    columns: data.columns,
                    numeric_columns: data.numeric_columns,
                    categorical_columns: data.categorical_columns,
                    columns_info: [], // Default empty array as we don't need detailed info right away for visual preview
                    preview_data: data.preview_data
                });

                // 重置之前的图表结果
                setChartResult(null);
                setChartGenerated(false);

                // 重置表单变量选择
                form.resetFields(['xVar', 'yVar', 'groupVar']);
            } else {
                message.error(data.error || t('dataVisualization.upload.demoFailed', { defaultValue: 'Failed to load demo data' }));
            }
        } catch (error) {
            console.error('Error loading demo data:', error);
            message.error(t('dataVisualization.upload.demoFailed', { defaultValue: 'Failed to load demo data' }));
        } finally {
            setUploadLoading(false);
        }
    };

    // 生成图表
    const handleGenerateChart = async () => {
        if (!uploadedFile) {
            message.error(t('dataVisualization.generate.errors.noFile'));
            return;
        }

        const formValues = form.getFieldsValue();
        const { xVar, yVar, groupVar, chartTitleType, customTitle, colorTheme, columns, method, distribution, show_percentage } = formValues;

        // 验证必要参数
        const needsXVar = ['histogram', 'qqplot', 'barplot'];
        const needsYVar = ['boxplot', 'violinplot'];
        const needsBothVars = ['scatter', 'jointplot'];
        const isCorrelationHeatmap = chartType === 'correlation_heatmap';

        if (isCorrelationHeatmap) {
            if (!columns || columns.length < 2) {
                message.error(t('dataVisualization.generate.errors.noColumns'));
                return;
            }
        } else {
            if (needsXVar.includes(chartType) && !xVar) {
                message.error(t('dataVisualization.generate.errors.noXVar'));
                return;
            }

            if (needsYVar.includes(chartType) && !yVar) {
                message.error(t('dataVisualization.generate.errors.noYVar'));
                return;
            }

            if (needsBothVars.includes(chartType) && (!xVar || !yVar)) {
                message.error(t('dataVisualization.generate.errors.noVars'));
                return;
            }
        }

        // 验证自定义标题
        if (chartTitleType === 'custom' && !customTitle?.trim()) {
            message.error(t('dataVisualization.settings.customTitle.required'));
            return;
        }

        setLoading(true);
        setShowTimeoutWarning(false);
        setGenerationError(null);

        // 创建取消控制器
        const controller = new AbortController();
        setAbortController(controller);

        // 设置15秒超时警告
        const timeout = setTimeout(() => {
            setShowTimeoutWarning(true);
        }, 15000);
        setLoadingTimeout(timeout);

        const formData = new FormData();
        // @ts-ignore
        if (uploadedFile.url) {
            // @ts-ignore
            formData.append('filepath', uploadedFile.url);
        } else {
            formData.append('file', uploadedFile);
        }
        formData.append('chart_type', chartType);

        if (xVar) formData.append('x_var', xVar);
        if (yVar) formData.append('y_var', yVar);
        if (groupVar) formData.append('hue', groupVar);

        if (columns) {
            columns.forEach((col: string) => formData.append('columns', col));
        }
        if (method) formData.append('method', method);
        if (distribution) formData.append('distribution', distribution);
        if (show_percentage) formData.append('show_percentage', 'true');

        // 处理颜色主题
        const colorMap = {
            'blue': '#1890ff',
            'green': '#52c41a',
            'orange': '#fa8c16',
            'purple': '#722ed1'
        };
        // @ts-ignore
        formData.append('color', colorMap[colorTheme] || '#1890ff');

        // 处理图表标题
        if (chartTitleType === 'custom' && customTitle?.trim()) {
            formData.append('title', customTitle.trim());
        } else {
            // 自动生成标题
            let autoTitle = '';
            switch (chartType) {
                case 'histogram':
                    autoTitle = t('dataVisualization.chartTitles.histogram', { x: xVar });
                    break;
                case 'boxplot':
                    autoTitle = yVar
                        ? t('dataVisualization.chartTitles.boxplotGrouped', { x: xVar, y: yVar })
                        : t('dataVisualization.chartTitles.boxplot', { x: xVar });
                    break;
                case 'violinplot':
                    autoTitle = yVar
                        ? t('dataVisualization.chartTitles.violinplotGrouped', { x: xVar, y: yVar })
                        : t('dataVisualization.chartTitles.violinplot', { x: xVar });
                    break;
                case 'qqplot':
                    autoTitle = t('dataVisualization.chartTitles.qqplot', { x: xVar });
                    break;
                case 'barplot':
                    autoTitle = t('dataVisualization.chartTitles.barplot', { x: xVar });
                    break;
                case 'scatter':
                    autoTitle = t('dataVisualization.chartTitles.scatter', { x: xVar, y: yVar });
                    break;
                case 'jointplot':
                    autoTitle = t('dataVisualization.chartTitles.jointplot', { x: xVar, y: yVar });
                    break;
                case 'correlation_heatmap':
                    autoTitle = t('dataVisualization.chartTitles.correlation_heatmap');
                    break;
            }
            if (autoTitle) {
                formData.append('title', autoTitle);
            }
        }

        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.GENERATE_VISUALIZATION), {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            const result = await response.json();

            if (result.success) {
                setChartResult(result);
                setChartGenerated(true);
                setActiveTab('result');
                message.success(t('dataVisualization.generate.success'));
            } else {
                const errorMsg = result.error || t('common.unknownError');
                setGenerationError(errorMsg);
                setActiveTab('result');
                message.error(t('dataVisualization.generate.errors.failed', { error: errorMsg }));
            }
        } catch (error: any) {
            console.error('图表生成错误:', error);
            if (error.name === 'AbortError') {
                message.info(t('dataVisualization.generate.cancelled'));
            } else {
                const errorMsg = error.message || t('common.unknownError');
                setGenerationError(errorMsg);
                setActiveTab('result');
                message.error(t('dataVisualization.generate.errors.generic'));
            }
        } finally {
            setLoading(false);
            setShowTimeoutWarning(false);
            setAbortController(null);
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                setLoadingTimeout(null);
            }
        }
    };

    // 取消图表生成
    const handleCancelGeneration = () => {
        if (abortController) {
            abortController.abort();
            message.info(t('dataVisualization.generate.errors.cancelling'));
        }
    };

    // 重试图表生成
    const handleRetryGeneration = () => {
        setShowTimeoutWarning(false);
        handleGenerateChart();
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

    // 渲染图表结果
    const renderChart = () => {
        if (!chartGenerated || !chartResult) {
            return <Empty description={t('dataVisualization.result.noData')} />;
        }

        return (
            <div style={{ width: '100%', textAlign: 'center' }}>
                <Image
                    src={chartResult.plot}
                    alt={`${chartResult.chart_type}${t('dataVisualization.chartType.title')}`}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    preview={{
                        mask: t('dataVisualization.result.previewImage')
                    }}
                />
            </div>
        );
    };

    // 获取图表类型对应的变量需求说明
    const getVariableRequirement = (type: string) => {
        return t(`dataVisualization.chartType.requirements.${type}`);
    };

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
                    <BarChartOutlined /> NHANES Visualization Lab
                </div>
                <Title level={1} className="hero-title">
                    {t('dataVisualization.title')}
                </Title>
                <Text className="hero-subtitle">
                    {t('dataVisualization.subtitle')}
                </Text>
            </div>

            <div className="main-content-layout">
                <div className="glass-card static-card" style={{ padding: '30px', minHeight: '600px' }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} className="glass-tabs" size="large" centered>
                        <TabPane tab={<span><EyeOutlined /> {t('dataVisualization.config.tab')}</span>} key="config">

                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Upload Section */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '1rem',
                                                marginRight: '12px',
                                                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <CloudUploadOutlined />
                                            </div>
                                            <Title level={5} style={{ margin: 0 }}>{t('dataVisualization.upload.title')}</Title>
                                        </div>

                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.4)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            border: '1px dashed rgba(59, 130, 246, 0.4)',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                <Dragger
                                                    name="file"
                                                    multiple={false}
                                                    maxCount={1}
                                                    accept=".csv"
                                                    beforeUpload={handleFileUpload}
                                                    onRemove={() => {
                                                        setUploadedFile(null);
                                                        setFileInfo(null);
                                                        setChartResult(null);
                                                        setChartGenerated(false);
                                                        form.resetFields(['xVar', 'yVar', 'groupVar']);
                                                    }}
                                                    style={{ background: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.1)' }}
                                                    disabled={uploadLoading}
                                                >
                                                    <p className="ant-upload-drag-icon">
                                                        <InboxOutlined style={{ color: '#3b82f6' }} />
                                                    </p>
                                                    <p className="ant-upload-text">{t('dataProcessing.upload.dragText')}</p>
                                                    <p className="ant-upload-hint">
                                                        {t('dataProcessing.upload.hint')}
                                                    </p>
                                                </Dragger>

                                                {fileInfo ? (
                                                    <div style={{
                                                        background: 'rgba(255, 255, 255, 0.5)',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        border: '1px solid rgba(255, 255, 255, 0.6)',
                                                        textAlign: 'left'
                                                    }}>
                                                        <Space align="start">
                                                            <FileTextOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                                                            <div>
                                                                <Text strong style={{ display: 'block', fontSize: '16px' }}>{fileInfo.filename}</Text>
                                                                <Space split={<Divider type="vertical" />} style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                                                                    <span>{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                                    <span>{fileInfo.file_stats.total_rows} Rows</span>
                                                                    <span>{fileInfo.file_stats.total_columns} Cols</span>
                                                                </Space>
                                                            </div>
                                                        </Space>
                                                    </div>
                                                ) : (
                                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                                        {t('dataVisualization.upload.supportFormat')}
                                                    </Text>
                                                )}

                                                <div style={{ marginTop: 16 }}>
                                                    <Button
                                                        icon={<ExperimentOutlined />}
                                                        onClick={handleLoadDemoData}
                                                        loading={uploadLoading}
                                                    >
                                                        {t('dataVisualization.upload.loadDemo', { defaultValue: 'Experience Demo Data' })}
                                                    </Button>
                                                </div>
                                            </Space>
                                        </div>
                                    </div>

                                    {/* Data Preview Section - Liquid Styled */}
                                    {fileInfo && (
                                        <div style={{ marginBottom: 32 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px',
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                    borderRadius: '8px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: '1rem',
                                                    marginRight: '12px',
                                                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                                                }}>
                                                    <EyeOutlined />
                                                </div>
                                                <Title level={5} style={{ margin: 0 }}>{t('dataVisualization.preview.title')}</Title>
                                            </div>

                                            <div style={{
                                                background: 'rgba(255, 255, 255, 0.4)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '20px',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255, 255, 255, 0.5)'
                                            }}>
                                                {/* Stats Tags */}
                                                <div style={{ marginBottom: 16 }}>
                                                    <Space>
                                                        <Tag color="blue" style={{ borderRadius: '6px', border: 'none', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                                                            {t('dataVisualization.upload.numeric')}: {fileInfo.file_stats.numeric_columns_count}
                                                        </Tag>
                                                        <Tag color="green" style={{ borderRadius: '6px', border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                                                            {t('dataVisualization.upload.categorical')}: {fileInfo.file_stats.categorical_columns_count}
                                                        </Tag>
                                                    </Space>
                                                </div>

                                                {/* Data Table */}
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
                                                        bordered
                                                        style={{
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            background: 'rgba(255,255,255,0.6)',
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                ) : (
                                                    <Empty description={t('dataVisualization.preview.unavailable')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Chart Type Section - Liquid Styled */}
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '1rem',
                                                marginRight: '12px',
                                                boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
                                            }}>
                                                <AppstoreOutlined />
                                            </div>
                                            <Title level={5} style={{ margin: 0 }}>{t('dataVisualization.chartType.title')}</Title>
                                        </div>

                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.4)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255, 255, 255, 0.5)'
                                        }}>
                                            <Radio.Group
                                                value={chartType}
                                                onChange={(e) => setChartType(e.target.value)}
                                                style={{ width: '100%' }}
                                                buttonStyle="solid"
                                            >
                                                <Row gutter={[12, 12]}>
                                                    {chartTypes.map(type => (
                                                        <Col span={12} key={type.value}>
                                                            <Radio.Button
                                                                value={type.value}
                                                                style={{
                                                                    width: '100%',
                                                                    textAlign: 'center',
                                                                    height: 'auto',
                                                                    padding: '12px',
                                                                    borderRadius: '12px',
                                                                    border: chartType === type.value ? 'none' : '1px solid rgba(0,0,0,0.06)',
                                                                    background: chartType === type.value ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'rgba(255,255,255,0.6)',
                                                                    color: chartType === type.value ? 'white' : 'inherit',
                                                                    boxShadow: chartType === type.value ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '20px' }}>{type.icon}</span>
                                                                <span style={{ fontSize: '13px' }}>{type.label}</span>
                                                            </Radio.Button>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Radio.Group>

                                            <div style={{ marginTop: 16 }}>
                                                <Alert
                                                    message={t(`dataVisualization.chartType.requirements.${chartType}`)}
                                                    type="info"
                                                    showIcon
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: 'rgba(59, 130, 246, 0.05)',
                                                        color: '#1e40af'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* End of Left Column Content originally - now just continuing vertical stack */}

                                    {/* Variable Config Section */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '1rem',
                                                marginRight: '12px',
                                                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                            }}>
                                                <SettingOutlined />
                                            </div>
                                            <Title level={5} style={{ margin: 0 }}>{t('dataVisualization.variables.title')}</Title>
                                        </div>

                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.4)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255, 255, 255, 0.5)'
                                        }}>
                                            <Form form={form} layout="vertical" size="middle">
                                                {/* Correlation Heatmap Specifics */}
                                                {chartType === 'correlation_heatmap' && (
                                                    <>
                                                        <Form.Item
                                                            label={t('dataVisualization.variables.columns')}
                                                            name="columns"
                                                            rules={[{ required: true, message: t('dataVisualization.variables.required', { axis: 'Columns' }) }]}
                                                        >
                                                            <Select
                                                                mode="multiple"
                                                                placeholder={t('dataVisualization.variables.selectColumns')}
                                                                disabled={!fileInfo}
                                                                maxTagCount="responsive"
                                                                style={{ borderRadius: '8px' }}
                                                            >
                                                                {renderColumnOptions('numeric')}
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item
                                                            label={t('dataVisualization.variables.method')}
                                                            name="method"
                                                            initialValue="pearson"
                                                        >
                                                            <Select style={{ borderRadius: '8px' }}>
                                                                <Option value="pearson">Pearson</Option>
                                                                <Option value="kendall">Kendall</Option>
                                                                <Option value="spearman">Spearman</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </>
                                                )}

                                                {/* QQ Plot Specifics */}
                                                {chartType === 'qqplot' && (
                                                    <Form.Item
                                                        label={t('dataVisualization.variables.distribution')}
                                                        name="distribution"
                                                        initialValue="norm"
                                                    >
                                                        <Select style={{ borderRadius: '8px' }}>
                                                            <Option value="norm">Normal</Option>
                                                            <Option value="uniform">Uniform</Option>
                                                            <Option value="t">Student's t</Option>
                                                            <Option value="expon">Exponential</Option>
                                                            <Option value="chi2">Chi-Squared</Option>
                                                        </Select>
                                                    </Form.Item>
                                                )}

                                                {/* Bar Plot Specifics */}
                                                {chartType === 'barplot' && (
                                                    <Form.Item
                                                        name="show_percentage"
                                                        valuePropName="checked"
                                                        initialValue={false}
                                                    >
                                                        <Checkbox>{t('dataVisualization.variables.showPercentage')}</Checkbox>
                                                    </Form.Item>
                                                )}

                                                {/* Standard Axes (X, Y, Group) - Conditionally Rendered */}
                                                {chartType !== 'correlation_heatmap' && (
                                                    <>
                                                        {/* X Axis */}
                                                        <Form.Item
                                                            label={t('dataVisualization.variables.xAxis')}
                                                            name="xVar"
                                                            rules={[{ required: ['histogram', 'qqplot', 'barplot', 'scatter', 'jointplot'].includes(chartType), message: t('dataVisualization.variables.required', { axis: 'X' }) }]}
                                                            style={{ display: ['boxplot', 'violinplot'].includes(chartType) ? 'block' : (['histogram', 'qqplot', 'barplot', 'scatter', 'jointplot'].includes(chartType) ? 'block' : 'none') }}
                                                        >
                                                            <Select placeholder={t('dataVisualization.variables.selectX')} disabled={!fileInfo} style={{ borderRadius: '8px' }} showSearch>
                                                                {['barplot', 'boxplot', 'violinplot'].includes(chartType)
                                                                    ? renderColumnOptions('categorical')
                                                                    : renderColumnOptions('numeric')
                                                                }
                                                            </Select>
                                                        </Form.Item>

                                                        {/* Y Axis */}
                                                        <Form.Item
                                                            label={t('dataVisualization.variables.yAxis')}
                                                            name="yVar"
                                                            rules={[{ required: ['scatter', 'jointplot', 'boxplot', 'violinplot'].includes(chartType), message: t('dataVisualization.variables.required', { axis: 'Y' }) }]}
                                                            style={{ display: ['scatter', 'jointplot', 'boxplot', 'violinplot'].includes(chartType) ? 'block' : 'none' }}
                                                        >
                                                            <Select placeholder={t('dataVisualization.variables.selectY')} disabled={!fileInfo} style={{ borderRadius: '8px' }} showSearch>
                                                                {renderColumnOptions('numeric')}
                                                            </Select>
                                                        </Form.Item>

                                                        {/* Group Variable */}
                                                        <Form.Item label={t('dataVisualization.variables.group')} name="groupVar">
                                                            <Select placeholder={t('dataVisualization.variables.selectGroup')} allowClear disabled={!fileInfo} style={{ borderRadius: '8px' }} showSearch>
                                                                {renderColumnOptions('categorical')}
                                                            </Select>
                                                        </Form.Item>
                                                    </>
                                                )}</Form>
                                        </div>
                                    </div>

                                    {/* Settings Section */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                                borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '1rem',
                                                marginRight: '12px',
                                                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                            }}>
                                                <ToolOutlined />
                                            </div>
                                            <Title level={5} style={{ margin: 0 }}>{t('dataVisualization.settings.title')}</Title>
                                        </div>

                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.4)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255, 255, 255, 0.5)'
                                        }}>
                                            <Form form={form} layout="vertical" size="middle">
                                                <Form.Item label={t('dataVisualization.settings.chartTitle')} name="chartTitleType" initialValue="auto">
                                                    <Select
                                                        defaultValue="auto"
                                                        size="middle"
                                                        onChange={(value) => {
                                                            if (value === 'auto') {
                                                                form.setFieldsValue({ customTitle: '' });
                                                            }
                                                        }}
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        <Option value="auto">{t('dataVisualization.settings.titleType.auto')}</Option>
                                                        <Option value="custom">{t('dataVisualization.settings.titleType.custom')}</Option>
                                                    </Select>
                                                </Form.Item>

                                                {/* 自定义标题输入框 */}
                                                <Form.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) =>
                                                        prevValues.chartTitleType !== currentValues.chartTitleType
                                                    }
                                                >
                                                    {({ getFieldValue }) => {
                                                        return getFieldValue('chartTitleType') === 'custom' ? (
                                                            <Form.Item
                                                                label={t('dataVisualization.settings.customTitle.label')}
                                                                name="customTitle"
                                                                rules={[
                                                                    { required: true, message: t('dataVisualization.settings.customTitle.required') }
                                                                ]}
                                                            >
                                                                <Input
                                                                    placeholder={t('dataVisualization.settings.customTitle.placeholder')}
                                                                    size="middle"
                                                                    maxLength={50}
                                                                    style={{ borderRadius: '8px' }}
                                                                />
                                                            </Form.Item>
                                                        ) : null;
                                                    }}
                                                </Form.Item>

                                                <Form.Item label={t('dataVisualization.settings.colorTheme.label')} name="colorTheme" initialValue="blue">
                                                    <Select defaultValue="blue" size="middle" style={{ borderRadius: '8px' }}>
                                                        <Option value="blue">
                                                            <Space>
                                                                <div style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    backgroundColor: '#1890ff',
                                                                    borderRadius: 2
                                                                }} />
                                                                {t('dataVisualization.settings.colorTheme.blue')}
                                                            </Space>
                                                        </Option>
                                                        <Option value="green">
                                                            <Space>
                                                                <div style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    backgroundColor: '#52c41a',
                                                                    borderRadius: 2
                                                                }} />
                                                                {t('dataVisualization.settings.colorTheme.green')}
                                                            </Space>
                                                        </Option>
                                                        <Option value="orange">
                                                            <Space>
                                                                <div style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    backgroundColor: '#fa8c16',
                                                                    borderRadius: 2
                                                                }} />
                                                                {t('dataVisualization.settings.colorTheme.orange')}
                                                            </Space>
                                                        </Option>
                                                        <Option value="purple">
                                                            <Space>
                                                                <div style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    backgroundColor: '#722ed1',
                                                                    borderRadius: 2
                                                                }} />
                                                                {t('dataVisualization.settings.colorTheme.purple')}
                                                            </Space>
                                                        </Option>
                                                    </Select>
                                                </Form.Item>
                                            </Form>
                                        </div>
                                    </div>
                                    <Divider />

                                    <div>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Space wrap>
                                                <Button
                                                    type="primary"
                                                    icon={<EyeOutlined />}
                                                    onClick={handleGenerateChart}
                                                    loading={loading && !showTimeoutWarning}
                                                    size="large"
                                                    disabled={!fileInfo || loading}
                                                    style={{
                                                        background: !fileInfo || loading ? undefined : 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                        border: 'none',
                                                        boxShadow: !fileInfo || loading ? 'none' : '0 4px 15px rgba(24, 144, 255, 0.4)',
                                                        height: '48px',
                                                        padding: '0 32px',
                                                        borderRadius: '24px',
                                                        fontWeight: 600,
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    {t('dataVisualization.generate.button')}
                                                </Button>

                                                {loading && showTimeoutWarning && (
                                                    <Space>
                                                        <Button
                                                            danger
                                                            icon={<StopOutlined />}
                                                            onClick={handleCancelGeneration}
                                                            size="large"
                                                            shape="round"
                                                        >
                                                            {t('dataVisualization.generate.cancel')}
                                                        </Button>
                                                        <Button
                                                            type="default"
                                                            icon={<ReloadOutlined />}
                                                            onClick={handleRetryGeneration}
                                                            size="large"
                                                        >
                                                            {t('dataVisualization.generate.retry')}
                                                        </Button>
                                                    </Space>
                                                )}

                                                {!loading && (
                                                    <Text type="secondary">
                                                        {t('dataVisualization.generate.hint')}
                                                    </Text>
                                                )}
                                            </Space>

                                            {showTimeoutWarning && (
                                                <Alert
                                                    message={t('dataVisualization.generate.timeoutWarning.title')}
                                                    description={
                                                        <div>
                                                            {t('dataVisualization.generate.timeoutWarning.description')}
                                                            <br />
                                                            {t('dataVisualization.generate.timeoutWarning.options')}
                                                        </div>
                                                    }
                                                    type="warning"
                                                    showIcon
                                                    style={{ marginTop: 8 }}
                                                />
                                            )}
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab={t('dataVisualization.result.tab')} key="result">
                            <Row gutter={24}>
                                <Col xs={24} lg={18}>
                                    <Card
                                        title={t('dataVisualization.result.display')}
                                        extra={
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 8,
                                                    justifyContent: 'flex-end'
                                                }}
                                            >
                                                <Space>
                                                    <Tooltip title={t('common.comingSoon')}>
                                                        <Button
                                                            icon={<DownloadOutlined />}
                                                            size="small"
                                                            disabled
                                                        >
                                                            {t('dataVisualization.result.download.image')}
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title={t('common.comingSoon')}>
                                                        <Button
                                                            icon={<DownloadOutlined />}
                                                            size="small"
                                                            disabled
                                                        >
                                                            {t('dataVisualization.result.download.data')}
                                                        </Button>
                                                    </Tooltip>
                                                </Space>
                                            </div>
                                        }
                                    >
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                                <Spin size="large" />
                                                <div style={{ marginTop: 16 }}>
                                                    <Text>{t('dataVisualization.generate.loading')}</Text>
                                                    {showTimeoutWarning && (
                                                        <div style={{ marginTop: 16 }}>
                                                            <Alert
                                                                message={t('dataVisualization.generate.timeoutWarning.title')}
                                                                description={t('dataVisualization.generate.timeoutWarning.waitMessage')}
                                                                type="warning"
                                                                showIcon
                                                                action={
                                                                    <Space direction="vertical">
                                                                        <Button
                                                                            size="small"
                                                                            danger
                                                                            onClick={handleCancelGeneration}
                                                                        >
                                                                            {t('dataVisualization.generate.cancel')}
                                                                        </Button>
                                                                        <Button
                                                                            size="small"
                                                                            type="primary"
                                                                            onClick={handleRetryGeneration}
                                                                        >
                                                                            {t('dataVisualization.generate.retry')}
                                                                        </Button>
                                                                    </Space>
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : generationError ? (
                                            <Result
                                                status="error"
                                                title={t('dataVisualization.generate.errors.title')}
                                                subTitle={generationError}
                                                extra={[
                                                    <Button type="primary" key="retry" onClick={handleGenerateChart}>
                                                        {t('dataVisualization.generate.retry')}
                                                    </Button>
                                                ]}
                                            />
                                        ) : (
                                            renderChart()
                                        )}
                                    </Card>
                                </Col>

                                <Col xs={24} lg={6}>
                                    <Card title={t('dataVisualization.result.info.title')} size="small">
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div>
                                                <Text strong>{t('dataVisualization.result.info.type')}</Text>
                                                <br />
                                                <Text>{chartTypes.find(t => t.value === chartType)?.label || t('common.unknown')}</Text>
                                            </div>

                                            <div>
                                                <Text strong>{t('dataVisualization.result.info.dataSource')}</Text>
                                                <br />
                                                <Text>{fileInfo?.filename || t('dataVisualization.result.info.noFile')}</Text>
                                            </div>

                                            <div>
                                                <Text strong>{t('dataVisualization.result.info.sampleSize')}</Text>
                                                <br />
                                                <Text>{fileInfo?.file_stats.total_rows?.toLocaleString() || '0'} {t('dataVisualization.result.info.rows')}</Text>
                                            </div>

                                            <div>
                                                <Text strong>{t('dataVisualization.result.info.generateTime')}</Text>
                                                <br />
                                                <Text>{chartResult ? new Date().toLocaleString() : t('dataVisualization.result.info.notGenerated')}</Text>
                                            </div>

                                            {chartResult && (
                                                <div>
                                                    <Text strong>{t('dataVisualization.result.info.variables')}</Text>
                                                    <br />
                                                    <Text>
                                                        X: {chartResult.variables_used.x_var || t('common.none')}
                                                        {chartResult.variables_used.y_var &&
                                                            `, Y: ${chartResult.variables_used.y_var}`
                                                        }
                                                    </Text>
                                                </div>
                                            )}
                                        </Space>
                                    </Card>

                                    {fileInfo && (
                                        <Card title={t('dataVisualization.result.summary.title')} size="small" style={{ marginTop: 16 }}>
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <div>
                                                    <Text strong>{t('dataVisualization.result.summary.totalColumns')}</Text>
                                                    <Text> {fileInfo.file_stats.total_columns}</Text>
                                                </div>
                                                <div>
                                                    <Text strong>{t('dataVisualization.result.summary.numericColumns')}</Text>
                                                    <Text> {fileInfo.file_stats.numeric_columns_count}</Text>
                                                </div>
                                                <div>
                                                    <Text strong>{t('dataVisualization.result.summary.categoricalColumns')}</Text>
                                                    <Text> {fileInfo.file_stats.categorical_columns_count}</Text>
                                                </div>
                                                <div>
                                                    <Text strong>{t('dataVisualization.result.summary.fileSize')}</Text>
                                                    <Text> {(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB</Text>
                                                </div>
                                            </Space>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default DataVisualization; 