import React from 'react';
import { Card, Row, Col, Space, Button, Spin, Alert, Typography, Image, Empty } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ChartResult, FileInfo } from '../types';
import { CHART_TYPES } from '../constants';

const { Text } = Typography;

interface ChartResultPanelProps {
    loading: boolean;
    chartResult: ChartResult | null;
    fileInfo: FileInfo | null;
    showTimeoutWarning: boolean;
    chartType: string;
    onCancel: () => void;
    onRetry: () => void;
}

const ChartResultPanel: React.FC<ChartResultPanelProps> = ({
    loading,
    chartResult,
    fileInfo,
    showTimeoutWarning,
    chartType,
    onCancel,
    onRetry
}) => {
    const { t } = useTranslation();

    const renderChart = () => {
        if (!chartResult) {
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

    return (
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
                                                        onClick={onCancel}
                                                    >
                                                        {t('dataVisualization.generate.cancel')}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        type="primary"
                                                        onClick={onRetry}
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
                            <Text>{CHART_TYPES.find(t => t.value === chartType)?.labelKey ? t(CHART_TYPES.find(t => t.value === chartType)!.labelKey) : t('common.unknown')}</Text>
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
    );
};

export default ChartResultPanel;
