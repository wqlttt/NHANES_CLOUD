import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { getApiUrl, API_ENDPOINTS } from '../../../utils/api';
import { FileInfo, ChartResult, ChartConfig } from '../types';

export const useChartVisualization = () => {
    const { t } = useTranslation();

    // State
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [chartResult, setChartResult] = useState<ChartResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [chartGenerated, setChartGenerated] = useState(false);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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

                // Reset chart state
                setChartResult(null);
                setChartGenerated(false);
                return true;
            } else {
                message.error(t('dataVisualization.upload.error', { error: result.error }));
                return false;
            }
        } catch (error) {
            console.error('File upload error:', error);
            message.error(t('dataVisualization.upload.networkError'));
            return false;
        } finally {
            setUploadLoading(false);
        }
    };

    const generateChart = async (config: ChartConfig) => {
        if (!uploadedFile) {
            message.error(t('dataVisualization.generate.errors.noFile'));
            return;
        }

        setLoading(true);
        setShowTimeoutWarning(false);

        // Setup abort controller
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Setup timeout warning
        loadingTimeoutRef.current = setTimeout(() => {
            setShowTimeoutWarning(true);
        }, 15000);

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('chart_type', config.chartType);

        // Append optional fields if they exist
        if (config.xVar) formData.append('x_var', config.xVar);
        if (config.yVar) formData.append('y_var', config.yVar);
        if (config.groupVar) formData.append('hue', config.groupVar);

        // Send columns as comma-separated string for correlation heatmap
        if (config.columns && config.columns.length > 0) {
            formData.append('columns', config.columns.join(','));
        }

        if (config.method) formData.append('method', config.method);
        if (config.distribution) formData.append('distribution', config.distribution);
        if (config.show_percentage) formData.append('show_percentage', 'true');

        // Color theme
        const colorMap: Record<string, string> = {
            'blue': '#1890ff',
            'green': '#52c41a',
            'orange': '#fa8c16',
            'purple': '#722ed1'
        };
        formData.append('color', colorMap[config.colorTheme] || '#1890ff');

        // Title
        if (config.chartTitleType === 'custom' && config.customTitle?.trim()) {
            formData.append('title', config.customTitle.trim());
        } else {
            // Auto title logic
            let autoTitle = '';
            const { xVar, yVar } = config;

            switch (config.chartType) {
                case 'histogram':
                    autoTitle = t('dataVisualization.chartTitles.histogram', { x: xVar });
                    break;
                case 'boxplot':
                    autoTitle = yVar
                        ? t('dataVisualization.chartTitles.boxplotGrouped', { x: xVar, y: yVar })
                        : t('dataVisualization.chartTitles.boxplot', { x: xVar });
                    break;
                case 'violinplot':
                    autoTitle = yVar
                        ? t('dataVisualization.chartTitles.violinplotGrouped', { x: xVar, y: yVar })
                        : t('dataVisualization.chartTitles.violinplot', { x: xVar });
                    break;
                case 'qqplot':
                    autoTitle = t('dataVisualization.chartTitles.qqplot', { x: xVar });
                    break;
                case 'barplot':
                    autoTitle = t('dataVisualization.chartTitles.barplot', { x: xVar });
                    break;
                case 'scatter':
                    autoTitle = t('dataVisualization.chartTitles.scatter', { x: xVar, y: yVar });
                    break;
                case 'jointplot':
                    autoTitle = t('dataVisualization.chartTitles.jointplot', { x: xVar, y: yVar });
                    break;
                case 'correlation_heatmap':
                    autoTitle = t('dataVisualization.chartTitles.correlation_heatmap');
                    break;
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
                message.success(t('dataVisualization.generate.success'));
                return true;
            } else {
                message.error(t('dataVisualization.generate.errors.failed', { error: result.error }));
                return false;
            }
        } catch (error: any) {
            console.error('Chart generation error:', error);
            if (error.name === 'AbortError') {
                message.warning(t('dataVisualization.generate.errors.cancelled'));
            } else {
                message.error(t('dataVisualization.generate.errors.networkError'));
            }
            return false;
        } finally {
            setLoading(false);
            setShowTimeoutWarning(false);
            abortControllerRef.current = null;
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
            }
        }
    };

    const cancelGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            message.info(t('dataVisualization.generate.errors.cancelling'));
        }
    };

    return {
        uploadedFile,
        fileInfo,
        chartResult,
        loading,
        uploadLoading,
        chartGenerated,
        showTimeoutWarning,
        handleFileUpload,
        generateChart,
        cancelGeneration
    };
};
