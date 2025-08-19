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
const chartTypes = [
    { value: 'histogram', label: '直方图', icon: <BarChartOutlined /> },
    { value: 'scatter', label: '散点图', icon: <DotChartOutlined /> },
    { value: 'heatmap', label: '热力图', icon: <PieChartOutlined /> },
    { value: 'boxplot', label: '箱型图', icon: <LineChartOutlined /> },
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
            const response = await fetch('http://localhost:5000/get_csvfile', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setUploadedFile(file);
                setFileInfo(result);
                message.success(`文件上传成功！${result.message}`);

                // 清空之前的图表结果
                setChartResult(null);
                setChartGenerated(false);

                // 重置表单变量选择
                form.resetFields(['xVar', 'yVar', 'groupVar']);
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

    // 生成图表
    const handleGenerateChart = async () => {
        if (!uploadedFile) {
            message.error('请先上传CSV文件');
            return;
        }

        const formValues = form.getFieldsValue();
        const { xVar, yVar, groupVar, chartTitleType, customTitle, colorTheme } = formValues;

        // 验证必要参数
        if (!xVar && chartType !== 'histogram') {
            message.error('请选择X轴变量');
            return;
        }

        if ((chartType === 'scatter' || chartType === 'heatmap') && !yVar) {
            message.error('散点图和热力图需要选择Y轴变量');
            return;
        }

        // 验证自定义标题
        if (chartTitleType === 'custom' && !customTitle?.trim()) {
            message.error('请输入自定义图表标题');
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
                autoTitle = `${xVar} 分布直方图`;
            } else if (chartType === 'scatter') {
                autoTitle = `${xVar} vs ${yVar} 散点图`;
            } else if (chartType === 'heatmap') {
                autoTitle = `${xVar} vs ${yVar} 热力图`;
            } else if (chartType === 'boxplot') {
                autoTitle = yVar ? `${xVar} 按 ${yVar} 分组箱型图` : `${xVar} 箱型图`;
            }
            if (autoTitle) {
                formData.append('title', autoTitle);
            }
        }

        try {
            const response = await fetch('http://localhost:5000/generate_visualization', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            const result = await response.json();

            if (result.success) {
                setChartResult(result);
                setChartGenerated(true);
                setActiveTab('result');
                message.success('图表生成成功！');
            } else {
                message.error(`图表生成失败：${result.error}`);
            }
        } catch (error: any) {
            console.error('图表生成错误:', error);
            if (error.name === 'AbortError') {
                message.warning('图表生成已取消');
            } else {
                message.error('图表生成失败，请检查网络连接');
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
            message.info('正在取消图表生成...');
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
            return <Empty description="暂无图表数据" />;
        }

        return (
            <div style={{ width: '100%', textAlign: 'center' }}>
                <Image
                    src={chartResult.plot}
                    alt={`${chartResult.chart_type}图表`}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    preview={{
                        mask: '点击预览大图'
                    }}
                />
            </div>
        );
    };

    // 获取图表类型对应的变量需求说明
    const getVariableRequirement = (type: string) => {
        switch (type) {
            case 'histogram':
                return 'X轴变量（数值型）';
            case 'scatter':
                return 'X轴和Y轴变量（数值型）';
            case 'heatmap':
                return 'X轴和Y轴变量（数值型）';
            case 'boxplot':
                return 'Y轴变量（数值型），X轴变量可选（分类型）';
            default:
                return '请选择变量';
        }
    };

    return (
        <div>
            <Title level={2}>数据可视化</Title>
            <Text type="secondary">
                上传CSV文件，创建各种类型的统计图表
            </Text>

            <Card style={{ marginTop: 24 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="图表配置" key="config">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Card title="1. 数据源" size="small" style={{ marginBottom: 16 }}>
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
                                                选择CSV文件
                                            </Button>
                                        </Upload>

                                        {fileInfo && (
                                            <Alert
                                                message="文件信息"
                                                description={
                                                    <div>
                                                        <Text strong>文件名：</Text>{fileInfo.filename}<br />
                                                        <Text strong>数据行数：</Text>{fileInfo.file_stats.total_rows}<br />
                                                        <Text strong>列数：</Text>{fileInfo.file_stats.total_columns}
                                                        (数值型: {fileInfo.file_stats.numeric_columns_count},
                                                        分类型: {fileInfo.file_stats.categorical_columns_count})<br />
                                                        <Text strong>文件大小：</Text>{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                }
                                                type="info"
                                                showIcon
                                                icon={<FileTextOutlined />}
                                            />
                                        )}

                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            支持格式：CSV文件，最大50MB
                                        </Text>
                                    </Space>
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

                                <Card title="2. 图表类型" size="small" style={{ marginBottom: 16 }}>
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
                                        message={getVariableRequirement(chartType)}
                                        type="info"
                                        style={{ marginTop: 8, fontSize: '12px' }}
                                    />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card title="3. 变量配置" size="small" style={{ marginBottom: 16 }}>
                                    <Form form={form} layout="vertical" size="small">
                                        <Form.Item
                                            label="X轴变量"
                                            name="xVar"
                                            rules={[
                                                { required: chartType !== 'boxplot', message: '请选择X轴变量' }
                                            ]}
                                        >
                                            <Select
                                                placeholder="选择X轴变量"
                                                disabled={!fileInfo}
                                            >
                                                {chartType === 'boxplot'
                                                    ? renderColumnOptions('categorical')
                                                    : renderColumnOptions('numeric')
                                                }
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label="Y轴变量"
                                            name="yVar"
                                            rules={[
                                                {
                                                    required: ['scatter', 'heatmap'].includes(chartType) ||
                                                        (chartType === 'boxplot'),
                                                    message: '请选择Y轴变量'
                                                }
                                            ]}
                                        >
                                            <Select
                                                placeholder="选择Y轴变量"
                                                disabled={!fileInfo}
                                            >
                                                {chartType === 'boxplot'
                                                    ? renderColumnOptions('numeric')
                                                    : renderColumnOptions('numeric')
                                                }
                                            </Select>
                                        </Form.Item>

                                        <Form.Item label="分组变量（可选）" name="groupVar">
                                            <Select
                                                placeholder="选择分组变量"
                                                allowClear
                                                disabled={!fileInfo}
                                            >
                                                {renderColumnOptions('categorical')}
                                            </Select>
                                        </Form.Item>
                                    </Form>
                                </Card>

                                <Card title="4. 图表设置" size="small">
                                    <Form form={form} layout="vertical" size="small">
                                        <Form.Item label="图表标题" name="chartTitleType" initialValue="auto">
                                            <Select
                                                defaultValue="auto"
                                                size="small"
                                                onChange={(value) => {
                                                    if (value === 'auto') {
                                                        form.setFieldsValue({ customTitle: '' });
                                                    }
                                                }}
                                            >
                                                <Option value="auto">自动生成</Option>
                                                <Option value="custom">自定义标题</Option>
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
                                                        label="自定义标题"
                                                        name="customTitle"
                                                        rules={[
                                                            { required: true, message: '请输入图表标题' }
                                                        ]}
                                                    >
                                                        <Input
                                                            placeholder="请输入图表标题"
                                                            size="small"
                                                            maxLength={50}
                                                        />
                                                    </Form.Item>
                                                ) : null;
                                            }}
                                        </Form.Item>

                                        <Form.Item label="颜色主题" name="colorTheme" initialValue="blue">
                                            <Select defaultValue="blue" size="small">
                                                <Option value="blue">
                                                    <Space>
                                                        <div style={{
                                                            width: 12,
                                                            height: 12,
                                                            backgroundColor: '#1890ff',
                                                            borderRadius: 2
                                                        }} />
                                                        蓝色系
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
                                                        绿色系
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
                                                        橙色系
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
                                                        紫色系
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
                                        生成图表
                                    </Button>

                                    {loading && showTimeoutWarning && (
                                        <Space>
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                                onClick={handleCancelGeneration}
                                                size="large"
                                            >
                                                取消生成
                                            </Button>
                                            <Button
                                                type="default"
                                                icon={<ReloadOutlined />}
                                                onClick={handleRetryGeneration}
                                                size="large"
                                            >
                                                重新生成
                                            </Button>
                                        </Space>
                                    )}

                                    {!loading && (
                                        <Text type="secondary">
                                            上传CSV文件并配置参数后，点击生成图表
                                        </Text>
                                    )}
                                </Space>

                                {showTimeoutWarning && (
                                    <Alert
                                        message="生成时间较长"
                                        description={
                                            <div>
                                                图表生成正在处理中，可能由于数据量较大或网络较慢。
                                                <br />
                                                您可以选择继续等待、取消当前操作或重新生成。
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

                    <TabPane tab="图表结果" key="result">
                        <Row gutter={24}>
                            <Col span={18}>
                                <Card
                                    title="图表展示"
                                    extra={
                                        <Space>
                                            <Button icon={<DownloadOutlined />} size="small" disabled={!chartResult}>
                                                下载图片
                                            </Button>
                                            <Button icon={<DownloadOutlined />} size="small" disabled={!fileInfo}>
                                                下载数据
                                            </Button>
                                        </Space>
                                    }
                                >
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                            <Spin size="large" />
                                            <div style={{ marginTop: 16 }}>
                                                <Text>正在生成图表...</Text>
                                                {showTimeoutWarning && (
                                                    <div style={{ marginTop: 16 }}>
                                                        <Alert
                                                            message="生成时间较长"
                                                            description="图表生成需要较长时间，请耐心等待或返回配置页面取消操作"
                                                            type="warning"
                                                            showIcon
                                                            action={
                                                                <Space direction="vertical">
                                                                    <Button
                                                                        size="small"
                                                                        danger
                                                                        onClick={handleCancelGeneration}
                                                                    >
                                                                        取消生成
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        type="primary"
                                                                        onClick={handleRetryGeneration}
                                                                    >
                                                                        重新生成
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
                                <Card title="图表信息" size="small">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <div>
                                            <Text strong>图表类型：</Text>
                                            <br />
                                            <Text>{chartTypes.find(t => t.value === chartType)?.label || '未知'}</Text>
                                        </div>

                                        <div>
                                            <Text strong>数据源：</Text>
                                            <br />
                                            <Text>{fileInfo?.filename || '未上传文件'}</Text>
                                        </div>

                                        <div>
                                            <Text strong>样本量：</Text>
                                            <br />
                                            <Text>{fileInfo?.file_stats.total_rows?.toLocaleString() || '0'} 行</Text>
                                        </div>

                                        <div>
                                            <Text strong>生成时间：</Text>
                                            <br />
                                            <Text>{chartResult ? new Date().toLocaleString() : '暂未生成'}</Text>
                                        </div>

                                        {chartResult && (
                                            <div>
                                                <Text strong>使用变量：</Text>
                                                <br />
                                                <Text>
                                                    X: {chartResult.variables_used.x_var || '无'}
                                                    {chartResult.variables_used.y_var &&
                                                        `, Y: ${chartResult.variables_used.y_var}`
                                                    }
                                                </Text>
                                            </div>
                                        )}
                                    </Space>
                                </Card>

                                {fileInfo && (
                                    <Card title="数据摘要" size="small" style={{ marginTop: 16 }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div>
                                                <Text strong>总列数：</Text>
                                                <Text> {fileInfo.file_stats.total_columns}</Text>
                                            </div>
                                            <div>
                                                <Text strong>数值列：</Text>
                                                <Text> {fileInfo.file_stats.numeric_columns_count}</Text>
                                            </div>
                                            <div>
                                                <Text strong>分类列：</Text>
                                                <Text> {fileInfo.file_stats.categorical_columns_count}</Text>
                                            </div>
                                            <div>
                                                <Text strong>文件大小：</Text>
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