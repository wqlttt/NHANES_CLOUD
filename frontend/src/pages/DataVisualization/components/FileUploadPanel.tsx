import { Upload, Button, Alert, Space, Typography, Tag, Table, Spin } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { FileInfo } from '../types';

const { Text, Title } = Typography;

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
            <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 16 }}>{t('dataVisualization.upload.title')}</Title>
                <div style={{
                    padding: '24px',
                    border: '2px dashed rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.3)',
                    textAlign: 'center'
                }}>
                    <Upload
                        accept=".csv"
                        showUploadList={false}
                        beforeUpload={handleUpload}
                        disabled={uploadLoading}
                    >
                        <Space direction="vertical" size="large">
                            {uploadLoading ? <Spin /> : <img src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg" alt="upload" style={{ height: 60, opacity: 0.5 }} />}
                            <div>
                                <Button
                                    type="primary"
                                    icon={<UploadOutlined />}
                                    loading={uploadLoading}
                                    style={{ borderRadius: '20px' }}
                                >
                                    {t('dataVisualization.upload.button')}
                                </Button>
                                <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    {t('dataVisualization.upload.supportFormat')}
                                </div>
                            </div>
                        </Space>
                    </Upload>
                </div>

                {fileInfo && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message={
                                <Space>
                                    <FileTextOutlined />
                                    <Text strong>{fileInfo.filename}</Text>
                                    <Tag color="blue">{fileInfo.file_stats.total_rows} rows</Tag>
                                    <Tag color="cyan">{fileInfo.file_stats.total_columns} cols</Tag>
                                    <Tag color="geekblue">{(fileInfo.file_stats.file_size / 1024 / 1024).toFixed(2)} MB</Tag>
                                </Space>
                            }
                            description={
                                <div style={{ marginTop: 8, fontSize: '13px', color: 'rgba(0,0,0,0.6)' }}>
                                    {t('dataVisualization.upload.numeric')}: {fileInfo.file_stats.numeric_columns_count}, {t('dataVisualization.upload.categorical')}: {fileInfo.file_stats.categorical_columns_count}
                                </div>
                            }
                            type="info"
                            showIcon={false}
                            style={{ borderRadius: '8px', border: '1px solid #bae7ff', background: '#e6f7ff' }}
                        />
                    </div>
                )}
            </div>

            {/* Data Preview */}
            {fileInfo && (
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            <Space>
                                <FileTextOutlined />
                                <span>{t('dataVisualization.preview.title')}</span>
                            </Space>
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {t('dataVisualization.preview.showFirst')}
                        </Text>
                    </div>

                    {/* Preview Table */}
                    {fileInfo.preview_data ? (
                        <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(0,0,0,0.05)',
                            background: 'rgba(255,255,255,0.4)'
                        }}>
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
                                style={{
                                    fontSize: '12px'
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <Text type="secondary">{t('dataVisualization.preview.unavailable')}</Text>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default FileUploadPanel;
