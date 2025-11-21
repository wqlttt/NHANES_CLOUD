import React from 'react';
import {
    BarChartOutlined,
    LineChartOutlined,
    PieChartOutlined,
    DotChartOutlined,
    HeatMapOutlined,
    FundOutlined,
    AreaChartOutlined,
} from '@ant-design/icons';

export interface ChartTypeConfig {
    value: string;
    labelKey: string;
    icon: React.ReactNode;
    requirements: {
        x?: boolean;
        y?: boolean;
        group?: boolean;
        columns?: boolean; // For heatmap
        method?: boolean; // For heatmap
        distribution?: boolean; // For QQ plot
        show_percentage?: boolean; // For barplot
    };
    allowedXTypes?: ('numeric' | 'categorical')[];
    allowedYTypes?: ('numeric' | 'categorical')[];
}

export const CHART_TYPES: ChartTypeConfig[] = [
    {
        value: 'histogram',
        labelKey: 'dataVisualization.chartType.histogram',
        icon: <BarChartOutlined />,
        requirements: { columns: true }, // Changed to columns to support overlapping histograms
        allowedXTypes: ['numeric']
    },
    {
        value: 'boxplot',
        labelKey: 'dataVisualization.chartType.boxplot',
        icon: <LineChartOutlined />,
        requirements: { x: true, y: true }, // x is grouping, y is value
        allowedXTypes: ['categorical'],
        allowedYTypes: ['numeric']
    },
    {
        value: 'violinplot',
        labelKey: 'dataVisualization.chartType.violinplot',
        icon: <AreaChartOutlined />,
        requirements: { x: true, y: true }, // x is grouping, y is value
        allowedXTypes: ['categorical'],
        allowedYTypes: ['numeric']
    },
    {
        value: 'qqplot',
        labelKey: 'dataVisualization.chartType.qqplot',
        icon: <FundOutlined />,
        requirements: { x: true, distribution: true },
        allowedXTypes: ['numeric']
    },
    {
        value: 'barplot',
        labelKey: 'dataVisualization.chartType.barplot',
        icon: <BarChartOutlined />,
        requirements: { x: true, group: true, show_percentage: true },
        allowedXTypes: ['categorical']
    },
    {
        value: 'scatter',
        labelKey: 'dataVisualization.chartType.scatter',
        icon: <DotChartOutlined />,
        requirements: { x: true, y: true, group: true },
        allowedXTypes: ['numeric'],
        allowedYTypes: ['numeric']
    },
    {
        value: 'jointplot',
        labelKey: 'dataVisualization.chartType.jointplot',
        icon: <PieChartOutlined />,
        requirements: { x: true, y: true, group: true },
        allowedXTypes: ['numeric'],
        allowedYTypes: ['numeric']
    },
    {
        value: 'correlation_heatmap',
        labelKey: 'dataVisualization.chartType.correlation_heatmap',
        icon: <HeatMapOutlined />,
        requirements: { columns: true, method: true }
    },
];

export const COLOR_THEMES = [
    { value: 'blue', color: '#1890ff', labelKey: 'dataVisualization.settings.colorTheme.blue' },
    { value: 'green', color: '#52c41a', labelKey: 'dataVisualization.settings.colorTheme.green' },
    { value: 'orange', color: '#fa8c16', labelKey: 'dataVisualization.settings.colorTheme.orange' },
    { value: 'purple', color: '#722ed1', labelKey: 'dataVisualization.settings.colorTheme.purple' },
];
