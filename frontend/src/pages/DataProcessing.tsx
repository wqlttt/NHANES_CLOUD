import React, { useState } from 'react';
import { Typography, Row, Col, Card, Space, Button, Tabs, Steps } from 'antd';
import {
    ToolOutlined,
    FilterOutlined,
    CalculatorOutlined,
    MedicineBoxOutlined,
    ArrowRightOutlined,
    RocketOutlined,
    InboxOutlined,
    FileTextOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    DownloadOutlined,
    ReloadOutlined,
    LockOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { message, Upload, UploadProps, Table, Tag, Empty, Divider, Form, Select, Radio, Checkbox, Input, Modal } from 'antd';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';

interface FileInfo {
    filename: string;
    filepath?: string; // Server side path
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
    last_updated?: string;
}

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Dragger } = Upload;

const DataProcessing: React.FC = () => {
    const { t } = useTranslation();
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [originalFileInfo, setOriginalFileInfo] = useState<FileInfo | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('imputation');
    const [uploadLoading, setUploadLoading] = useState(false);

    // Imputation State
    const [imputationForm] = Form.useForm();
    const [imputationMethod, setImputationMethod] = useState('mean');
    const [imputationLoading, setImputationLoading] = useState(false);

    // Filtering State
    const [filterForm] = Form.useForm();
    const [filterLoading, setFilterLoading] = useState(false);
    const [filterResult, setFilterResult] = useState<{ original: number; removed: number; remaining: number } | null>(null);

    // Calculation State
    const [calculationForm] = Form.useForm();
    const [calculationLoading, setCalculationLoading] = useState(false);

    const handleImputation = async () => {
        if (!fileInfo?.filepath) {
            message.error(t('dataProcessing.upload.error'));
            return;
        }

        try {
            const values = await imputationForm.validateFields();
            setImputationLoading(true);

            const response = await fetch(getApiUrl(API_ENDPOINTS.PROCESS_IMPUTE), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filepath: fileInfo.filepath,
                    method: values.method,
                    columns: values.columns
                })
            });

            const result = await response.json();
            if (result.success) {
                message.success('Imputation successful');
                // Update file info with new processed file
                setFileInfo(prev => ({
                    ...prev!,
                    filepath: result.filepath,
                    file_stats: result.stats,
                    preview_data: result.stats.preview_data,
                    columns_info: result.stats.columns_info // Refresh stats
                }));
            } else {
                message.error(result.error || 'Imputation failed');
            }
        } catch (error) {
            console.error(error);
            message.error('Imputation failed');
        } finally {
            setImputationLoading(false);
        }
    };

    const handleFilter = async () => {
        console.log('handleFilter called', { fileInfo });
        if (!fileInfo?.filepath) {
            message.error('File path error: No filepath found');
            return;
        }

        try {
            console.log('Validating fields...');
            const values = await filterForm.validateFields();
            console.log('Form values:', values);
            setFilterLoading(true);

            // Transform filters to format expected by backend
            const filters = values.filters.map((f: any) => ({
                column: f.column,
                operator: f.operator,
                value: f.value
            }));

            console.log('Sending request to:', getApiUrl(API_ENDPOINTS.PROCESS_FILTER));
            const response = await fetch(getApiUrl(API_ENDPOINTS.PROCESS_FILTER), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filepath: fileInfo.filepath,
                    filters: filters
                })
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response result:', result);

            if (result.success) {
                const newTime = new Date().toLocaleTimeString();
                const originalCount = fileInfo.file_stats.total_rows;
                const newCount = result.stats.total_rows;
                const removedCount = originalCount - newCount;

                setFilterResult({
                    original: originalCount,
                    removed: removedCount,
                    remaining: newCount
                });

                message.success('Filter applied successfully');

                setFileInfo(prev => ({
                    ...prev!,
                    filepath: result.filepath,
                    file_stats: result.stats,
                    preview_data: result.stats.preview_data,
                    columns_info: result.stats.columns_info,
                    last_updated: newTime
                }));
            } else {
                message.error(result.error || 'Filter failed');
            }
        } catch (error) {
            console.error('Filter error:', error);
            message.error('Filter failed: ' + ((error as any).message || String(error)));
        } finally {
            setFilterLoading(false);
        }
    };

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
                setOriginalFileInfo(result);
                message.success(t('dataProcessing.upload.success'));
            } else {
                message.error(t('dataProcessing.upload.error'));
            }
        } catch (error) {
            console.error('File upload error:', error);
            message.error(t('dataProcessing.upload.error'));
        } finally {
            setUploadLoading(false);
        }
        return false;
    };

    const handleDownload = () => {
        console.log('Downloading file:', fileInfo?.filepath);
        if (!fileInfo?.filepath) {
            message.warning('No file to download');
            return;
        }
        // Add timestamp to prevent caching
        const downloadUrl = `${getApiUrl(API_ENDPOINTS.PROCESS_DOWNLOAD)}?filepath=${encodeURIComponent(fileInfo.filepath)}&t=${new Date().getTime()}`;
        console.log('Download URL:', downloadUrl);
        window.open(downloadUrl, '_blank');
    };

    const handleReset = () => {
        if (!originalFileInfo) return;
        setFileInfo(originalFileInfo);
        setFilterResult(null);
        message.success('Data reset to original state');
    };

    return (
        <div className="page-entry visible" style={{ paddingBottom: '60px' }}>
            {/* Hero Section */}
            <div className="hero-section">
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                    <RocketOutlined /> {t('dataProcessing.hero.tag')}
                </div>
                <Title level={1} className="hero-title">
                    {t('dataProcessing.hero.title')}
                </Title>
                <Text className="hero-subtitle">
                    {t('dataProcessing.hero.subtitle')}
                </Text>
            </div>

            {/* Main Content */}
            <div className="main-content-layout">
                {/* Data Source Upload Section */}
                <div className="glass-card static-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            background: 'rgba(24, 144, 255, 0.1)',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1890ff', fontSize: '1.2rem',
                            marginRight: '12px'
                        }}>
                            <FileTextOutlined />
                        </div>
                        <Title level={4} style={{ margin: 0 }}>{t('dataProcessing.upload.title')}</Title>
                    </div>

                    <Dragger
                        name="file"
                        multiple={false}
                        maxCount={1}
                        accept=".csv"
                        beforeUpload={handleFileUpload}
                        onRemove={() => {
                            setUploadedFile(null);
                            setFileInfo(null);
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

                    {fileInfo && (
                        <div style={{ marginTop: 24 }}>
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
                                <Title level={5} style={{ margin: 0 }}>{t('dataProcessing.preview.title')}</Title>
                                <div style={{ flex: 1 }} />
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '20px',
                                        marginLeft: '12px'
                                    }}
                                >
                                    Reset Data
                                </Button>
                            </div>

                            <div style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(10px)',
                                padding: '20px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.5)'
                            }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Space size="middle" wrap>
                                        <Text strong style={{ fontSize: '16px' }}>{fileInfo.filename}</Text>
                                        <Text type="secondary">({(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB)</Text>
                                        <Divider type="vertical" />
                                        <Tag color="blue" style={{ borderRadius: '6px', border: 'none', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                                            Numeric: {fileInfo.file_stats.numeric_columns_count}
                                        </Tag>
                                        <Tag color="green" style={{ borderRadius: '6px', border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                                            Categorical: {fileInfo.file_stats.categorical_columns_count}
                                        </Tag>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {t('dataProcessing.preview.totalData')}: {fileInfo.file_stats.total_rows}
                                        </Text>
                                        {fileInfo.last_updated && (
                                            <Tag color="purple" style={{ borderRadius: '6px', border: 'none', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}>
                                                Updated: {fileInfo.last_updated}
                                            </Tag>
                                        )}
                                    </Space>
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
                                        bordered
                                        style={{
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            background: 'rgba(255,255,255,0.6)',
                                            fontSize: '12px'
                                        }}
                                    />
                                ) : (
                                    <Empty description={t('dataProcessing.preview.unavailable')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </div>
                        </div>
                    )}


                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    className="glass-tabs"
                    size="large"
                    items={[
                        {
                            label: (
                                <span>
                                    <MedicineBoxOutlined />
                                    {t('dataProcessing.tabs.imputation')}
                                </span>
                            ),
                            key: 'imputation',
                            children: (
                                <div className="glass-card static-card" style={{ padding: '32px' }}>
                                    <Row gutter={[48, 32]} align="middle">
                                        <Col xs={24} md={14}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px',
                                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                    borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: '1.2rem',
                                                    marginRight: '16px',
                                                    boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)'
                                                }}>
                                                    <MedicineBoxOutlined />
                                                </div>
                                                <Title level={3} style={{ margin: 0 }}>{t('dataProcessing.imputation.title')}</Title>
                                            </div>

                                            <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: '32px', maxWidth: '600px' }}>
                                                {t('dataProcessing.imputation.description')}
                                            </Paragraph>

                                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
                                                <Form form={imputationForm} layout="vertical">
                                                    <Title level={5}>{t('dataProcessing.imputation.configuration')}</Title>

                                                    <Form.Item
                                                        label={t('dataProcessing.imputation.selectColumns')}
                                                        name="columns"
                                                        rules={[{ required: true, message: 'Please select columns' }]}
                                                        help={!fileInfo ? "Please upload a file first" : null}
                                                    >
                                                        <Select
                                                            mode="multiple"
                                                            placeholder={t('dataProcessing.imputation.selectColumns')}
                                                            disabled={!fileInfo || imputationLoading}
                                                            style={{ width: '100%' }}
                                                            maxTagCount="responsive"
                                                        >
                                                            {fileInfo?.columns.map(col => (
                                                                <Select.Option key={col} value={col}>
                                                                    {col}
                                                                    {fileInfo.columns_info.find(info => info.name === col)?.null_count ?
                                                                        <Tag color="warning" style={{ marginLeft: 8 }}>Missing: {fileInfo.columns_info.find(info => info.name === col)?.null_count}</Tag> : null}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={t('dataProcessing.imputation.selectMethod')}
                                                        name="method"
                                                        initialValue="mean"
                                                    >
                                                        <Radio.Group onChange={e => setImputationMethod(e.target.value)} value={imputationMethod} disabled={!fileInfo || imputationLoading}>
                                                            <Space direction="vertical">
                                                                <Radio value="drop">
                                                                    <Space>
                                                                        <Text strong>{t('dataProcessing.imputation.completeCase.title')}</Text>
                                                                        <Text type="secondary">- {t('dataProcessing.imputation.completeCase.desc')}</Text>
                                                                    </Space>
                                                                </Radio>
                                                                <Radio value="mean">
                                                                    <Space>
                                                                        <Text strong>{t('dataProcessing.imputation.meanMedian.title')}</Text>
                                                                        <Text type="secondary">- {t('dataProcessing.imputation.meanMedian.desc')}</Text>
                                                                    </Space>
                                                                </Radio>
                                                                <Radio value="mice">
                                                                    <Space>
                                                                        <Text strong>{t('dataProcessing.imputation.mice.title')}</Text>
                                                                        <Text type="secondary">- {t('dataProcessing.imputation.mice.desc')}</Text>
                                                                    </Space>
                                                                </Radio>
                                                            </Space>
                                                        </Radio.Group>
                                                    </Form.Item>

                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        icon={<ArrowRightOutlined />}
                                                        loading={imputationLoading}
                                                        disabled={!fileInfo}
                                                        onClick={handleImputation}
                                                        style={{
                                                            marginTop: '20px',
                                                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 15px rgba(24, 144, 255, 0.4)',
                                                            padding: '0 40px',
                                                            height: '48px',
                                                            borderRadius: '24px'
                                                        }}
                                                    >
                                                        {t('dataProcessing.imputation.startBtn')}
                                                    </Button>
                                                </Form>
                                            </div>
                                        </Col>
                                        <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '300px',
                                                    height: '300px',
                                                    background: 'radial-gradient(circle, rgba(24,144,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                                                    borderRadius: '50%',
                                                    zIndex: 0
                                                }} />
                                                <MedicineBoxOutlined style={{ position: 'relative', fontSize: '200px', opacity: 0.8, color: 'rgba(24, 144, 255, 0.2)', zIndex: 1 }} />
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )
                        },
                        {
                            label: (
                                <span>
                                    <FilterOutlined />
                                    {t('dataProcessing.tabs.filtering')}
                                </span>
                            ),
                            key: 'filtering',
                            children: (
                                <div className="glass-card static-card" style={{ padding: '32px' }}>
                                    <Row gutter={[48, 32]} align="middle">
                                        <Col xs={24} md={14}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px',
                                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                    borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: '1.2rem',
                                                    marginRight: '16px',
                                                    boxShadow: '0 4px 10px rgba(82, 196, 26, 0.3)'
                                                }}>
                                                    <FilterOutlined />
                                                </div>
                                                <Title level={3} style={{ margin: 0 }}>{t('dataProcessing.filtering.title')}</Title>
                                            </div>

                                            <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: '32px' }}>
                                                {t('dataProcessing.filtering.description')}
                                            </Paragraph>

                                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
                                                <Form form={filterForm} layout="vertical">
                                                    <Title level={5} style={{ marginBottom: 24 }}>{t('dataProcessing.filtering.configuration')}</Title>
                                                    <Form.List name="filters" initialValue={[{}]}>
                                                        {(fields, { add, remove }) => (
                                                            <>
                                                                {fields.map(({ key, name, ...restField }) => (
                                                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'column']}
                                                                            rules={[{ required: true, message: 'Missing column' }]}
                                                                            style={{ width: 150 }}
                                                                        >
                                                                            <Select placeholder={t('dataProcessing.filtering.steps.selectVariables')} disabled={!fileInfo}>
                                                                                {fileInfo?.columns.map(col => (
                                                                                    <Select.Option key={col} value={col}>{col}</Select.Option>
                                                                                ))}
                                                                            </Select>
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'operator']}
                                                                            rules={[{ required: true, message: 'Missing operator' }]}
                                                                            style={{ width: 150 }}
                                                                        >
                                                                            <Select placeholder="Operator" disabled={!fileInfo}>
                                                                                <Select.Option value="gt">{t('dataProcessing.filtering.operators.gt')}</Select.Option>
                                                                                <Select.Option value="lt">{t('dataProcessing.filtering.operators.lt')}</Select.Option>
                                                                                <Select.Option value="eq">{t('dataProcessing.filtering.operators.eq')}</Select.Option>
                                                                                <Select.Option value="neq">{t('dataProcessing.filtering.operators.neq')}</Select.Option>
                                                                                <Select.Option value="gte">{t('dataProcessing.filtering.operators.gte')}</Select.Option>
                                                                                <Select.Option value="lte">{t('dataProcessing.filtering.operators.lte')}</Select.Option>
                                                                                <Select.Option value="contains">{t('dataProcessing.filtering.operators.contains')}</Select.Option>
                                                                            </Select>
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'value']}
                                                                            rules={[{ required: true, message: 'Missing value' }]}
                                                                            style={{ width: 150 }}
                                                                        >
                                                                            <Input placeholder="Value" disabled={!fileInfo} />
                                                                        </Form.Item>
                                                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                                                    </Space>
                                                                ))}
                                                                <Form.Item>
                                                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={!fileInfo}>
                                                                        {t('dataProcessing.filtering.addRule')}
                                                                    </Button>
                                                                </Form.Item>
                                                            </>
                                                        )}
                                                    </Form.List>

                                                    <Space>
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            loading={filterLoading}
                                                            disabled={!fileInfo}
                                                            onClick={handleFilter}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                                border: 'none',
                                                                boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)',
                                                                borderRadius: '24px',
                                                                padding: '0 32px'
                                                            }}
                                                        >
                                                            {t('dataProcessing.filtering.applyFilter')}
                                                        </Button>
                                                        <Button size="large" onClick={() => message.info("Preview count logic coming soon")}>
                                                            {t('dataProcessing.filtering.previewCohort')}
                                                        </Button>
                                                    </Space>
                                                </Form>
                                            </div>
                                        </Col>
                                        <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                                            {filterResult ? (
                                                <div className="glass-card" style={{
                                                    padding: '32px',
                                                    background: 'rgba(255, 255, 255, 0.4)',
                                                    textAlign: 'left'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                                        <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '12px' }} />
                                                        <Title level={4} style={{ margin: 0 }}>Filtering Results</Title>
                                                    </div>

                                                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text type="secondary">Original Cohort</Text>
                                                            <Text strong style={{ fontSize: '18px' }}>{filterResult.original.toLocaleString()}</Text>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text type="secondary">Excluded Items</Text>
                                                            <Tag color="error" style={{ fontSize: '16px', padding: '4px 12px' }}>
                                                                -{filterResult.removed.toLocaleString()}
                                                            </Tag>
                                                        </div>

                                                        <Divider style={{ margin: '8px 0' }} />

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text type="secondary">Final Cohort</Text>
                                                            <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                                                                {filterResult.remaining.toLocaleString()}
                                                            </Text>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                                            <Button
                                                                type="primary"
                                                                icon={<DownloadOutlined />}
                                                                onClick={handleDownload}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                                    border: 'none',
                                                                    borderRadius: '20px',
                                                                    boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)'
                                                                }}
                                                            >
                                                                Download Data
                                                            </Button>
                                                        </div>
                                                    </Space>
                                                </div>
                                            ) : (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: '300px',
                                                        height: '300px',
                                                        background: 'radial-gradient(circle, rgba(82,196,26,0.1) 0%, rgba(255,255,255,0) 70%)',
                                                        borderRadius: '50%',
                                                        zIndex: 0
                                                    }} />
                                                    <FilterOutlined style={{ position: 'relative', fontSize: '200px', opacity: 0.8, color: 'rgba(82, 196, 26, 0.2)', zIndex: 1 }} />
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            )
                        },
                        {
                            label: (
                                <span>
                                    <CalculatorOutlined />
                                    {t('dataProcessing.tabs.calculation')}
                                </span>
                            ),
                            key: 'calculation',
                            children: (
                                <div className="glass-card static-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                                    {/* Overlay for Under Development */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        backdropFilter: 'blur(4px)',
                                        zIndex: 1000,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'inherit'
                                    }}>
                                        <div style={{
                                            padding: '40px',
                                            background: 'rgba(255,255,255,0.8)',
                                            borderRadius: '24px',
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255,255,255,0.9)'
                                        }}>
                                            <LockOutlined style={{ fontSize: '48px', color: '#8c8c8c', marginBottom: '24px' }} />
                                            <Title level={3} style={{ color: '#262626', margin: '0 0 8px 0' }}>功能开发中</Title>
                                            <Text type="secondary" style={{ fontSize: '16px' }}>此模块正在开发中，敬请期待。</Text>
                                        </div>
                                    </div>
                                    <Row gutter={[48, 32]} align="middle">
                                        <Col xs={24} md={14}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px',
                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d46b08 100%)',
                                                    borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: '1.2rem',
                                                    marginRight: '16px',
                                                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                                }}>
                                                    <CalculatorOutlined />
                                                </div>
                                                <Title level={3} style={{ margin: 0 }}>{t('dataProcessing.calculation.title')}</Title>
                                            </div>

                                            <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: '32px' }}>
                                                {t('dataProcessing.calculation.description')}
                                            </Paragraph>

                                            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
                                                <Form form={calculationForm} layout="vertical">
                                                    <Title level={5}>{t('dataProcessing.calculation.configuration')}</Title>

                                                    <Form.Item
                                                        label={t('dataProcessing.calculation.newVariableName')}
                                                        name="new_variable_name"
                                                        rules={[{ required: true, message: 'Please enter a variable name' }]}
                                                    >
                                                        <Input placeholder={t('dataProcessing.calculation.newVariableName')} disabled={!fileInfo} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={t('dataProcessing.calculation.formula')}
                                                        name="formula"
                                                        rules={[{ required: true, message: 'Please enter a formula' }]}
                                                    >
                                                        <Input.TextArea
                                                            rows={4}
                                                            placeholder={t('dataProcessing.calculation.formulaPlaceholder')}
                                                            disabled={!fileInfo}
                                                            style={{ fontFamily: 'monospace' }}
                                                        />
                                                    </Form.Item>

                                                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
                                                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>{t('dataProcessing.calculation.examples')}</Text>
                                                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                                                            <Text code style={{ fontSize: '12px' }}>BMI = Weight / (Height/100)**2</Text>
                                                            <Text code style={{ fontSize: '12px' }}>IsElderly = Age {'>'} 65</Text>
                                                        </Space>
                                                    </div>

                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        icon={<CalculatorOutlined />}
                                                        loading={calculationLoading}
                                                        disabled={!fileInfo}
                                                        onClick={() => message.info("Calculation logic connected in next step")}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d46b08 100%)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                                                            padding: '0 40px',
                                                            height: '48px',
                                                            borderRadius: '24px'
                                                        }}
                                                    >
                                                        {t('dataProcessing.calculation.defineBtn')}
                                                    </Button>
                                                </Form>
                                            </div>
                                        </Col>
                                        <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '300px',
                                                    height: '300px',
                                                    background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, rgba(255,255,255,0) 70%)',
                                                    borderRadius: '50%',
                                                    zIndex: 0
                                                }} />
                                                <CalculatorOutlined style={{ position: 'relative', fontSize: '200px', opacity: 0.8, color: 'rgba(245, 158, 11, 0.2)', zIndex: 1 }} />
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default DataProcessing;
