import React, { useState, useEffect } from 'react';
import { Typography, Card, Tabs, Row, Col, Button, Space, Form, Alert } from 'antd';
import { EyeOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
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
                                <FileUploadPanel
                                    uploadLoading={uploadLoading}
                                    fileInfo={fileInfo}
                                    onFileUpload={handleFileUpload}
                                />
                            </Col>

                            <Col span={12}>
                                <ChartConfigPanel
                                    form={form}
                                    fileInfo={fileInfo}
                                    chartType={chartType}
                                    onChartTypeChange={setChartType}
                                />
                            </Col>
                        </Row>

                        <div style={{ marginTop: 24 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={handleGenerateClick}
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
                                                onClick={cancelGeneration}
                                                size="large"
                                            >
                                                {t('dataVisualization.generate.cancel')}
                                            </Button>
                                            <Button
                                                type="default"
                                                icon={<ReloadOutlined />}
                                                onClick={handleRetry}
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
                        <ChartResultPanel
                            loading={loading}
                            chartResult={chartResult}
                            fileInfo={fileInfo}
                            showTimeoutWarning={showTimeoutWarning}
                            chartType={chartType}
                            onCancel={cancelGeneration}
                            onRetry={handleRetry}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default DataVisualization;
