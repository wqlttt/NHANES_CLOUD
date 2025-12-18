import React from 'react';
import { Card, Form, Radio, Space, Select, Input, Checkbox, Alert, FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import { FileInfo } from '../types';
import { CHART_TYPES, COLOR_THEMES } from '../constants';

const { Option } = Select;

interface ChartConfigPanelProps {
    form: FormInstance;
    fileInfo: FileInfo | null;
    chartType: string;
    onChartTypeChange: (type: string) => void;
}

const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
    form,
    fileInfo,
    chartType,
    onChartTypeChange
}) => {
    const { t } = useTranslation();

    // Helper to render column options
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

    const currentChartConfig = CHART_TYPES.find(c => c.value === chartType);
    const requirements = currentChartConfig?.requirements || {};

    return (
        <>
            {/* Chart Type Selection */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>{t('dataVisualization.chartType.title')}</div>
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '12px' }}>
                    <Radio.Group
                        value={chartType}
                        onChange={(e) => onChartTypeChange(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {CHART_TYPES.map(type => (
                                <Radio key={type.value} value={type.value}>
                                    <Space>
                                        {type.icon}
                                        {t(type.labelKey)}
                                    </Space>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>

                    <Alert
                        message={t(`dataVisualization.chartType.requirements.${chartType}`)}
                        type="info"
                        style={{ marginTop: 12, fontSize: '12px', border: 'none', background: 'rgba(230, 247, 255, 0.5)' }}
                    />
                </div>
            </div>

            {/* Variable Selection */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>{t('dataVisualization.variables.title')}</div>
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px' }}>
                    <Form form={form} layout="vertical">
                        {/* Correlation Heatmap Specifics */}
                        {requirements.columns && (
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
                                    >
                                        {renderColumnOptions('numeric')}
                                    </Select>
                                </Form.Item>
                                {requirements.method && (
                                    <Form.Item
                                        label={t('dataVisualization.variables.method')}
                                        name="method"
                                        initialValue="pearson"
                                    >
                                        <Select>
                                            <Option value="pearson">Pearson</Option>
                                            <Option value="kendall">Kendall</Option>
                                            <Option value="spearman">Spearman</Option>
                                        </Select>
                                    </Form.Item>
                                )}
                            </>
                        )}

                        {/* QQ Plot Specifics */}
                        {requirements.distribution && (
                            <Form.Item
                                label={t('dataVisualization.variables.distribution')}
                                name="distribution"
                                initialValue="norm"
                            >
                                <Select>
                                    <Option value="norm">Normal</Option>
                                    <Option value="uniform">Uniform</Option>
                                    <Option value="t">Student's t</Option>
                                    <Option value="expon">Exponential</Option>
                                    <Option value="chi2">Chi-Squared</Option>
                                </Select>
                            </Form.Item>
                        )}

                        {/* Bar Plot Specifics */}
                        {requirements.show_percentage && (
                            <Form.Item
                                name="show_percentage"
                                valuePropName="checked"
                                initialValue={false}
                            >
                                <Checkbox>{t('dataVisualization.variables.showPercentage')}</Checkbox>
                            </Form.Item>
                        )}

                        {/* Standard Axes (X, Y, Group) */}
                        {!requirements.columns && (
                            <>
                                {/* X Axis */}
                                <Form.Item
                                    label={t('dataVisualization.variables.xAxis')}
                                    name="xVar"
                                    rules={[{ required: !!requirements.x, message: t('dataVisualization.variables.required', { axis: 'X' }) }]}
                                    style={{ display: requirements.x ? 'block' : 'none' }}
                                >
                                    <Select placeholder={t('dataVisualization.variables.selectX')} disabled={!fileInfo}>
                                        {currentChartConfig?.allowedXTypes?.includes('categorical')
                                            ? renderColumnOptions('categorical')
                                            : renderColumnOptions('numeric')
                                        }
                                    </Select>
                                </Form.Item>

                                {/* Y Axis */}
                                <Form.Item
                                    label={t('dataVisualization.variables.yAxis')}
                                    name="yVar"
                                    rules={[{ required: !!requirements.y, message: t('dataVisualization.variables.required', { axis: 'Y' }) }]}
                                    style={{ display: requirements.y ? 'block' : 'none' }}
                                >
                                    <Select placeholder={t('dataVisualization.variables.selectY')} disabled={!fileInfo}>
                                        {currentChartConfig?.allowedYTypes?.includes('categorical')
                                            ? renderColumnOptions('categorical')
                                            : renderColumnOptions('numeric')
                                        }
                                    </Select>
                                </Form.Item>

                                {/* Group Variable */}
                                <Form.Item
                                    label={t('dataVisualization.variables.group')}
                                    name="groupVar"
                                    style={{ display: requirements.group ? 'block' : 'none' }}
                                >
                                    <Select placeholder={t('dataVisualization.variables.selectGroup')} allowClear disabled={!fileInfo}>
                                        {renderColumnOptions('categorical')}
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                    </Form>
                </div>
            </div>

            {/* Settings */}
            <div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: 16 }}>{t('dataVisualization.settings.title')}</div>
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px' }}>
                    <Form form={form} layout="vertical">
                        <Form.Item label={t('dataVisualization.settings.chartTitle')} name="chartTitleType" initialValue="auto">
                            <Select
                                defaultValue="auto"
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

                        {/* Custom Title Input */}
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
                                            maxLength={50}
                                        />
                                    </Form.Item>
                                ) : null;
                            }}
                        </Form.Item>

                        <Form.Item label={t('dataVisualization.settings.colorTheme.label')} name="colorTheme" initialValue="blue">
                            <Select defaultValue="blue">
                                {COLOR_THEMES.map(theme => (
                                    <Option key={theme.value} value={theme.value}>
                                        <Space>
                                            <div style={{
                                                width: 12,
                                                height: 12,
                                                backgroundColor: theme.color,
                                                borderRadius: 2
                                            }} />
                                            {t(theme.labelKey)}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default ChartConfigPanel;
