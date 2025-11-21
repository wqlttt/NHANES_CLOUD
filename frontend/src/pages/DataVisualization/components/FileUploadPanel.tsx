import React from 'react';
import { Card, Upload, Button, Alert, Space, Typography, Row, Col, Tag, Table } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { FileInfo } from '../types';

const { Text } = Typography;

interface FileUploadPanelProps {
    uploadLoading: boolean;
    fileInfo: FileInfo | null;
    onFileUpload: (file: File) => Promise<boolean>;
}

const FileUploadPanel: React.FC<FileUploadPanelProps> = ({
    uploadLoading,
    fileInfo,
    onFileUpload
}) => {
    const { t } = useTranslation();

    const handleUpload = async (file: File) => {
        await onFileUpload(file);
        return false; // Prevent default upload behavior
    };

    return (
        <>
            <Card title={t('dataVisualization.upload.title')} size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Upload
                        accept=".csv"
                        showUploadList={false}
                        beforeUpload={handleUpload}
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

            {/* Data Preview */}
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
                    {/* Stats Summary */}
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

                    {/* Preview Table */}
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
        </>
    );
};

export default FileUploadPanel;
