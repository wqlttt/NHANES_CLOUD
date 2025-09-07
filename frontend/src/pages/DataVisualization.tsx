import React, { useState } from 'react';
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
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// 图表类型配置 - 匹配后端支持的类型
const getChartTypes = (t: any) => [
    { value: 'histogram', label: t('dataVisualization.chartType.histogram'), icon: <BarChartOutlined /> },
    { value: 'scatter', label: t('dataVisualization.chartType.scatter'), icon: <DotChartOutlined /> },
    { value: 'heatmap', label: t('dataVisualization.chartType.heatmap'), icon: <PieChartOutlined /> },
    { value: 'boxplot', label: t('dataVisualization.chartType.boxplot'), icon: <LineChartOutlined /> },
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
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [chartGenerated, setChartGenerated] = useState(false);
    const [activeTab, setActiveTab] = useState('config');
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

    // 生成图表
    const handleGenerateChart = async () => {
        if (!uploadedFile) {
            message.error(t('dataVisualization.generate.errors.noFile'));
            return;
        }

        const formValues = form.getFieldsValue();
        const { xVar, yVar, groupVar, chartTitleType, customTitle, colorTheme } = formValues;

        // 验证必要参数
        if (!xVar && chartType !== 'histogram') {
            message.error(t('dataVisualization.generate.errors.noXVar'));
            return;
        }

        if ((chartType === 'scatter' || chartType === 'heatmap') && !yVar) {
            message.error(t('dataVisualization.generate.errors.noYVar'));
            return;
        }

        // 验证自定义标题
        if (chartTitleType === 'custom' && !customTitle?.trim()) {
            message.error(t('dataVisualization.settings.customTitle.required'));
            return;
        }

        setLoading(true);
        setShowTimeoutWarning(false);

        // 创建取消控制器
        const controller = new AbortController();
        setAbortController(controller);

        // 设置15秒超时警告
        const timeout = setTimeout(() => {
            setShowTimeoutWarning(true);
        }, 15000);
        setLoadingTimeout(timeout);

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('chart_type', chartType);

        if (xVar) formData.append('x_var', xVar);
        if (yVar) formData.append('y_var', yVar);

        // 处理颜色主题
        const colorMap: Record<string, string> = {
            'blue': '#1890ff',
            'green': '#52c41a',
            'orange': '#fa8c16',
            'purple': '#722ed1'
        };
        formData.append('color', colorMap[colorTheme] || '#1890ff');

        // 处理图表标题
        if (chartTitleType === 'custom' && customTitle?.trim()) {
            formData.append('title', customTitle.trim());
        } else {
            // 自动生成标题
            let autoTitle = '';
            if (chartType === 'histogram') {
                autoTitle = t('dataVisualization.chartTitles.histogram', { x: xVar });
            } else if (chartType === 'scatter') {
                autoTitle = t('dataVisualization.chartTitles.scatter', { x: xVar, y: yVar });
            } else if (chartType === 'heatmap') {
                autoTitle = t('dataVisualization.chartTitles.heatmap', { x: xVar, y: yVar });
            } else if (chartType === 'boxplot') {
                autoTitle = yVar
                    ? t('dataVisualization.chartTitles.boxplotGrouped', { x: xVar, y: yVar })
                    : t('dataVisualization.chartTitles.boxplot', { x: xVar });
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
                message.error(t('dataVisualization.generate.errors.failed', { error: result.error }));
            }
        } catch (error: any) {
            console.error('图表生成错误:', error);
            if (error.name === 'AbortError') {
                message.warning(t('dataVisualization.generate.errors.cancelled'));
            } else {
                message.error(t('dataVisualization.generate.errors.networkError'));
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
        <div>
            <Title level={2}>{t('dataVisualization.title')}</Title>
            <Text type="secondary">
                {t('dataVisualization.subtitle')}
            </Text>

            <Card style={{ marginTop: 24 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab={t('dataVisualization.config.tab')} key="config">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Card title={t('dataVisualization.upload.title')} size="small" style={{ marginBottom: 16 }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Upload
                                            accept=".csv"
                                            showUploadList={false}
                                            beforeUpload={handleFileUpload}
                                            disabled={uploadLoading}
                                        >
                                            <Button
                                                icon={<UploadOutlined />}
                                                size="small"
                                                loading={uploadLoading}
                                            >
                                                {t('dataVisualization.upload.button')}
                                            </Button>
                                        </Upload>

                                        {fileInfo && (
                                            <Alert
                                                message={t('dataVisualization.upload.fileInfo')}
                                                description={
                                                    <div>
                                                        <Text strong>{t('dataVisualization.upload.fileName')}</Text>{fileInfo.filename}<br />
                                                        <Text strong>{t('dataVisualization.upload.rowCount')}</Text>{fileInfo.file_stats.total_rows}<br />
                                                        <Text strong>{t('dataVisualization.upload.columnCount')}</Text>{fileInfo.file_stats.total_columns}
                                                        ({t('dataVisualization.upload.numeric')}: {fileInfo.file_stats.numeric_columns_count},
                                                        {t('dataVisualization.upload.categorical')}: {fileInfo.file_stats.categorical_columns_count})<br />
                                                        <Text strong>{t('dataVisualization.upload.fileSize')}</Text>{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                }
                                                type="info"
                                                showIcon
                                                icon={<FileTextOutlined />}
                                            />
                                        )}

                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {t('dataVisualization.upload.supportFormat')}
                                        </Text>
                                    </Space>
                                </Card>

                                {/* 数据预览 */}
                                {fileInfo && (
                                    <Card
                                        title={
                                            <Space>
                                                <FileTextOutlined />
                                                <span>{t('dataVisualization.preview.title')}</span>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {t('dataVisualization.preview.showFirst')}
                                                </Text>
                                            </Space>
                                        }
                                        size="small"
                                        style={{ marginBottom: 16 }}
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
                                                        <Text>{t('dataVisualization.preview.totalData')}: <strong>{fileInfo.file_stats.total_rows.toLocaleString()}</strong> {t('dataVisualization.preview.rows')}</Text>
                                                        <Text>|</Text>
                                                        <Text>{t('dataVisualization.preview.totalColumns')}: <strong>{fileInfo.file_stats.total_columns}</strong> {t('dataVisualization.preview.columns')}</Text>
                                                        <Text>|</Text>
                                                        <Text>{t('dataVisualization.preview.fileSize')}: <strong>{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB</strong></Text>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    <Space>
                                                        <Tag color="blue">{t('dataVisualization.upload.numeric')}: {fileInfo.file_stats.numeric_columns_count}</Tag>
                                                        <Tag color="green">{t('dataVisualization.upload.categorical')}: {fileInfo.file_stats.categorical_columns_count}</Tag>
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
                                                <Text type="secondary">{t('dataVisualization.preview.unavailable')}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {t('dataVisualization.preview.checkFormat')}
                                                </Text>
                                            </div>
                                        )}
                                    </Card>
                                )}

                                <Card title={t('dataVisualization.chartType.title')} size="small" style={{ marginBottom: 16 }}>
                                    <Radio.Group
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {chartTypes.map(type => (
                                                <Radio key={type.value} value={type.value}>
                                                    <Space>
                                                        {type.icon}
                                                        {type.label}
                                                    </Space>
                                                </Radio>
                                            ))}
                                        </Space>
                                    </Radio.Group>

                                    <Alert
                                        message={t(`dataVisualization.chartType.requirements.${chartType}`)}
                                        type="info"
                                        style={{ marginTop: 8, fontSize: '12px' }}
                                    />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card title={t('dataVisualization.variables.title')} size="small" style={{ marginBottom: 16 }}>
                                    <Form form={form} layout="vertical" size="small">
                                        <Form.Item
                                            label={t('dataVisualization.variables.xAxis')}
                                            name="xVar"
                                            rules={[
                                                {
                                                    required: chartType !== 'boxplot',
                                                    message: t('dataVisualization.variables.required', { axis: 'X' })
                                                }
                                            ]}
                                        >
                                            <Select
                                                placeholder={t('dataVisualization.variables.selectX')}
                                                disabled={!fileInfo}
                                            >
                                                {chartType === 'boxplot'
                                                    ? renderColumnOptions('categorical')
                                                    : renderColumnOptions('numeric')
                                                }
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label={t('dataVisualization.variables.yAxis')}
                                            name="yVar"
                                            rules={[
                                                {
                                                    required: ['scatter', 'heatmap'].includes(chartType) ||
                                                        (chartType === 'boxplot'),
                                                    message: t('dataVisualization.variables.required', { axis: 'Y' })
                                                }
                                            ]}
                                        >
                                            <Select
                                                placeholder={t('dataVisualization.variables.selectY')}
                                                disabled={!fileInfo}
                                            >
                                                {chartType === 'boxplot'
                                                    ? renderColumnOptions('numeric')
                                                    : renderColumnOptions('numeric')
                                                }
                                            </Select>
                                        </Form.Item>

                                        <Form.Item label={t('dataVisualization.variables.group')} name="groupVar">
                                            <Select
                                                placeholder={t('dataVisualization.variables.selectGroup')}
                                                allowClear
                                                disabled={!fileInfo}
                                            >
                                                {renderColumnOptions('categorical')}
                                            </Select>
                                        </Form.Item>
                                    </Form>
                                </Card>

                                <Card title={t('dataVisualization.settings.title')} size="small">
                                    <Form form={form} layout="vertical" size="small">
                                        <Form.Item label={t('dataVisualization.settings.chartTitle')} name="chartTitleType" initialValue="auto">
                                            <Select
                                                defaultValue="auto"
                                                size="small"
                                                onChange={(value) => {
                                                    if (value === 'auto') {
                                                        form.setFieldsValue({ customTitle: '' });
                                                    }
                                                }}
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
                                                            size="small"
                                                            maxLength={50}
                                                        />
                                                    </Form.Item>
                                                ) : null;
                                            }}
                                        </Form.Item>

                                        <Form.Item label={t('dataVisualization.settings.colorTheme.label')} name="colorTheme" initialValue="blue">
                                            <Select defaultValue="blue" size="small">
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
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={handleGenerateChart}
                                        loading={loading && !showTimeoutWarning}
                                        size="large"
                                        disabled={!fileInfo || loading}
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
                    </TabPane>

                    <TabPane tab={t('dataVisualization.result.tab')} key="result">
                        <Row gutter={24}>
                            <Col span={18}>
                                <Card
                                    title={t('dataVisualization.result.display')}
                                    extra={
                                        <Space>
                                            <Button icon={<DownloadOutlined />} size="small" disabled={!chartResult}>
                                                {t('dataVisualization.result.download.image')}
                                            </Button>
                                            <Button icon={<DownloadOutlined />} size="small" disabled={!fileInfo}>
                                                {t('dataVisualization.result.download.data')}
                                            </Button>
                                        </Space>
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
                                    ) : (
                                        renderChart()
                                    )}
                                </Card>
                            </Col>

                            <Col span={6}>
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
            </Card>
        </div>
    );
};

export default DataVisualization; 