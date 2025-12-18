import React, { useState, useEffect } from 'react';
import { Typography, Card, Tabs, Row, Col, Button, Space, Form, Alert } from 'antd';
import { EyeOutlined, StopOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { useChartVisualization } from './hooks/useChartVisualization';
import FileUploadPanel from './components/FileUploadPanel';
import ChartConfigPanel from './components/ChartConfigPanel';
import ChartResultPanel from './components/ChartResultPanel';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DataVisualization: React.FC = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    // Local UI State
    const [activeTab, setActiveTab] = useState('config');
    const [chartType, setChartType] = useState('histogram');

    // Business Logic Hook
    const {
        fileInfo,
        chartResult,
        loading,
        uploadLoading,
        showTimeoutWarning,
        handleFileUpload,
        generateChart,
        cancelGeneration
    } = useChartVisualization();

    // Handle Chart Generation
    const handleGenerateClick = async () => {
        try {
            const values = await form.validateFields();

            // Custom validation for correlation heatmap
            if (chartType === 'correlation_heatmap') {
                if (!values.columns || values.columns.length < 2) {
                    // This should be caught by form rules, but double check
                    return;
                }
            }

            const success = await generateChart({
                ...values,
                chartType
            });

            if (success) {
                setActiveTab('result');
            }
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const handleRetry = () => {
        handleGenerateClick();
    };

    // Reset form when file changes
    useEffect(() => {
        if (fileInfo) {
            form.resetFields(['xVar', 'yVar', 'groupVar', 'columns']);
        }
    }, [fileInfo, form]);

    return (
        <div className="page-entry visible" style={{ paddingBottom: '60px' }}>
            <div className="hero-section" style={{ padding: '40px 0 60px', textAlign: 'center', minHeight: 'auto' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <BarChartOutlined /> NHANES Visualization Lab
                </div>
                <Title level={1} className="hero-title" style={{ fontSize: '3rem', marginBottom: '16px', fontWeight: 800, background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('dataVisualization.title')}
                </Title>
                <Text className="hero-subtitle" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', margin: '0 auto', display: 'block', maxWidth: '700px', lineHeight: 1.6 }}>
                    {t('dataVisualization.subtitle')}
                </Text>
            </div>

            <div className="main-content-layout">
                <div className="glass-card static-card" style={{ padding: '30px', minHeight: '600px' }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" centered>
                        <TabPane tab={<span><EyeOutlined /> {t('dataVisualization.config.tab')}</span>} key="config">
                            <div style={{ marginTop: 20 }}>
                                <Row gutter={32}>
                                    <Col span={10}>
                                        <FileUploadPanel
                                            uploadLoading={uploadLoading}
                                            fileInfo={fileInfo}
                                            onFileUpload={handleFileUpload}
                                        />
                                    </Col>

                                    <Col span={14}>
                                        <ChartConfigPanel
                                            form={form}
                                            fileInfo={fileInfo}
                                            chartType={chartType}
                                            onChartTypeChange={setChartType}
                                        />
                                    </Col>
                                </Row>

                                <div style={{ marginTop: 32, textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <Button
                                                type="primary"
                                                icon={<EyeOutlined />}
                                                onClick={handleGenerateClick}
                                                loading={loading && !showTimeoutWarning}
                                                size="large"
                                                disabled={!fileInfo || loading}
                                                style={{
                                                    height: '48px',
                                                    padding: '0 40px',
                                                    fontSize: '16px',
                                                    borderRadius: '24px',
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    border: 'none',
                                                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                                                }}
                                            >
                                                {t('dataVisualization.generate.button')}
                                            </Button>

                                            {loading && showTimeoutWarning && (
                                                <Space>
                                                    <Button
                                                        danger
                                                        icon={<StopOutlined />}
                                                        onClick={cancelGeneration}
                                                        size="large"
                                                        shape="round"
                                                    >
                                                        {t('dataVisualization.generate.cancel')}
                                                    </Button>
                                                    <Button
                                                        type="default"
                                                        icon={<ReloadOutlined />}
                                                        onClick={handleRetry}
                                                        size="large"
                                                        shape="round"
                                                    >
                                                        {t('dataVisualization.generate.retry')}
                                                    </Button>
                                                </Space>
                                            )}
                                        </Space>

                                        {!loading && (
                                            <Text type="secondary">
                                                {t('dataVisualization.generate.hint')}
                                            </Text>
                                        )}

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
                                                style={{ marginTop: 16, textAlign: 'left' }}
                                            />
                                        )}
                                    </Space>
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab={<span><BarChartOutlined /> {t('dataVisualization.result.tab')}</span>} key="result">
                            <div style={{ marginTop: 20 }}>
                                <ChartResultPanel
                                    loading={loading}
                                    chartResult={chartResult}
                                    fileInfo={fileInfo}
                                    showTimeoutWarning={showTimeoutWarning}
                                    chartType={chartType}
                                    onCancel={cancelGeneration}
                                    onRetry={handleRetry}
                                />
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default DataVisualization;
