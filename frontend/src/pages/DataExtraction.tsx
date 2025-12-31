import React, { useState, useEffect } from 'react';
import {
    Typography,

    Row,
    Col,
    Input,
    Table,
    Button,
    Space,
    Checkbox,
    Select,
    Form,
    InputNumber,
    Tag,
    Divider,
    Progress,
    Modal,
    message,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { getApiUrl, API_ENDPOINTS } from '../utils/api';
import {
    SearchOutlined,
    PlusOutlined,
    DownloadOutlined,
    FilterOutlined,
    DeleteOutlined,
    EditOutlined,
    TableOutlined,
    TagOutlined,
    DatabaseOutlined,
    RocketOutlined,
    ThunderboltOutlined,
    ExperimentOutlined
} from '@ant-design/icons';
import { ListTable } from '@visactor/vtable';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;


// 年份选项
const yearOptions = [
    '1999-2000', '2001-2002', '2003-2004', '2005-2006', '2007-2008',
    '2009-2010', '2011-2012', '2013-2014', '2015-2016', '2017-2018'
];



interface CustomExtractionItem {
    key: string;
    years: string[];
    fileName: string;
    indicators: string;
}

const DataExtraction: React.FC = () => {
    const { t } = useTranslation();

    const commonIndicators = React.useMemo(() => [
        { value: 'phenoage0', label: t('dataExtraction.indicatorLabels.phenoage0.label'), description: t('dataExtraction.indicatorLabels.phenoage0.desc') },
        { value: 'TyG', label: t('dataExtraction.indicatorLabels.TyG.label'), description: t('dataExtraction.indicatorLabels.TyG.desc') },
        { value: 'BMI', label: t('dataExtraction.indicatorLabels.BMI.label'), description: t('dataExtraction.indicatorLabels.BMI.desc') },
        { value: 'TyG_BMI', label: t('dataExtraction.indicatorLabels.TyG_BMI.label'), description: t('dataExtraction.indicatorLabels.TyG_BMI.desc') },
        { value: 'AIP', label: t('dataExtraction.indicatorLabels.AIP.label'), description: t('dataExtraction.indicatorLabels.AIP.desc') },
        { value: 'VAI', label: t('dataExtraction.indicatorLabels.VAI.label'), description: t('dataExtraction.indicatorLabels.VAI.desc') },
        { value: 'UHR', label: t('dataExtraction.indicatorLabels.UHR.label'), description: t('dataExtraction.indicatorLabels.UHR.desc') },
        { value: 'eGFR', label: t('dataExtraction.indicatorLabels.eGFR.label'), description: t('dataExtraction.indicatorLabels.eGFR.desc') },
        { value: 'RAR', label: t('dataExtraction.indicatorLabels.RAR.label'), description: t('dataExtraction.indicatorLabels.RAR.desc') },
        { value: 'BRI', label: t('dataExtraction.indicatorLabels.BRI.label'), description: t('dataExtraction.indicatorLabels.BRI.desc') },
        { value: 'SII', label: t('dataExtraction.indicatorLabels.SII.label'), description: t('dataExtraction.indicatorLabels.SII.desc') },
        { value: 'NPAR', label: t('dataExtraction.indicatorLabels.NPAR.label'), description: t('dataExtraction.indicatorLabels.NPAR.desc') },
        { value: 'MAR', label: t('dataExtraction.indicatorLabels.MAR.label'), description: t('dataExtraction.indicatorLabels.MAR.desc') },
        { value: 'HALP', label: t('dataExtraction.indicatorLabels.HALP.label'), description: t('dataExtraction.indicatorLabels.HALP.desc') },
        { value: 'NLR', label: t('dataExtraction.indicatorLabels.NLR.label'), description: t('dataExtraction.indicatorLabels.NLR.desc') },
        { value: 'HRR', label: t('dataExtraction.indicatorLabels.HRR.label'), description: t('dataExtraction.indicatorLabels.HRR.desc') },
        { value: 'FIB4', label: t('dataExtraction.indicatorLabels.FIB4.label'), description: t('dataExtraction.indicatorLabels.FIB4.desc') },
        { value: 'CKMStage', label: t('dataExtraction.indicatorLabels.CKMStage.label'), description: t('dataExtraction.indicatorLabels.CKMStage.desc') }
    ], [t]);

    const mortalityIndicators = React.useMemo(() => [
        { value: '1999-2000', label: t('dataExtraction.mortalityLabels.1999-2000.label'), description: t('dataExtraction.mortalityLabels.1999-2000.desc') },
        { value: '2001-2002', label: t('dataExtraction.mortalityLabels.2001-2002.label'), description: t('dataExtraction.mortalityLabels.2001-2002.desc') },
        { value: '2003-2004', label: t('dataExtraction.mortalityLabels.2003-2004.label'), description: t('dataExtraction.mortalityLabels.2003-2004.desc') },
        { value: '2005-2006', label: t('dataExtraction.mortalityLabels.2005-2006.label'), description: t('dataExtraction.mortalityLabels.2005-2006.desc') },
        { value: '2007-2008', label: t('dataExtraction.mortalityLabels.2007-2008.label'), description: t('dataExtraction.mortalityLabels.2007-2008.desc') },
        { value: '2009-2010', label: t('dataExtraction.mortalityLabels.2009-2010.label'), description: t('dataExtraction.mortalityLabels.2009-2010.desc') },
        { value: '2011-2012', label: t('dataExtraction.mortalityLabels.2011-2012.label'), description: t('dataExtraction.mortalityLabels.2011-2012.desc') },
        { value: '2013-2014', label: t('dataExtraction.mortalityLabels.2013-2014.label'), description: t('dataExtraction.mortalityLabels.2013-2014.desc') },
        { value: '2015-2016', label: t('dataExtraction.mortalityLabels.2015-2016.label'), description: t('dataExtraction.mortalityLabels.2015-2016.desc') },
        { value: '2017-2018', label: t('dataExtraction.mortalityLabels.2017-2018.label'), description: t('dataExtraction.mortalityLabels.2017-2018.desc') }
    ], [t]);

    const presetVariableGroups = React.useMemo(() => [
        { value: 'covariates', label: t('dataExtraction.presetGroupLabels.basic_demographics.label'), description: t('dataExtraction.presetGroupLabels.basic_demographics.desc'), variables: ['SEQN', 'RIAGENDR', 'RIDAGEYR', 'DMDEDUC3', 'DMDEDUC2', 'DMDMARTL', 'INDFMPIR', 'RACE', 'SMQ020', 'ALQ130'] }
    ], [t]);

    const mockCommonIndicatorData = React.useMemo(() => ({
        phenoage0: {
            columns: [
                { field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 },
                { field: 'Phenoage', title: t('dataExtraction.columns.phenoage'), width: 100 },
                { field: 'Albumin', title: t('dataExtraction.columns.albumin'), width: 100 },
                { field: 'Creatinine', title: t('dataExtraction.columns.creatinine'), width: 100 },
                { field: 'Glucose', title: t('dataExtraction.columns.glucose'), width: 100 },
                { field: 'LnCRP', title: t('dataExtraction.columns.lncrp'), width: 100 },
                { field: 'LymphocytePct', title: t('dataExtraction.columns.lymphocytePct'), width: 100 },
                { field: 'MCV', title: t('dataExtraction.columns.mcv'), width: 100 },
                { field: 'RDW', title: t('dataExtraction.columns.rdw'), width: 100 },
                { field: 'WBC', title: t('dataExtraction.columns.wbc'), width: 100 },
                { field: 'Age', title: t('dataExtraction.columns.age'), width: 100 }
            ],
            records: [{ SEQN: '109266', Phenoage: '42.5', Albumin: '45', Creatinine: '80', Glucose: '95', LnCRP: '0.5', LymphocytePct: '30', MCV: '90', RDW: '12', WBC: '6.5', Age: '45' }]
        },
        TyG: {
            columns: [
                { field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 },
                { field: 'TyG', title: t('dataExtraction.columns.tyg'), width: 100 },
                { field: 'Triglycerides', title: t('dataExtraction.columns.tg'), width: 100 },
                { field: 'FPG', title: t('dataExtraction.columns.fbg'), width: 100 },
                { field: 'FastingStatus', title: t('dataExtraction.columns.fasting'), width: 100 }
            ],
            records: [{ SEQN: '109266', TyG: '4.5', Triglycerides: '150', FPG: '100', FastingStatus: 'Yes' }]
        },
        BMI: {
            columns: [
                { field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 },
                { field: 'BMI', title: t('dataExtraction.columns.bmi'), width: 100 },
                { field: 'Height', title: t('dataExtraction.columns.height'), width: 150 },
                { field: 'Weight', title: t('dataExtraction.columns.weight'), width: 150 },
                { field: 'Category', title: t('dataExtraction.columns.category'), width: 150 }
            ],
            records: [{ SEQN: '109263', BMI: '25.5', Height: '170.5', Weight: '75.2', Category: 'Overweight' }]
        },
        TyG_BMI: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'TyG_BMI', title: t('dataExtraction.columns.tyg'), width: 100 }], records: [] },
        AIP: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'AIP', title: t('dataExtraction.columns.aip'), width: 100 }], records: [] },
        VAI: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'VAI', title: t('dataExtraction.columns.vai'), width: 100 }], records: [] },
        UHR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'UHR', title: t('dataExtraction.columns.uhr'), width: 100 }], records: [] },
        eGFR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'eGFR', title: t('dataExtraction.columns.egfr'), width: 100 }], records: [] },
        RAR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'RAR', title: t('dataExtraction.columns.rar'), width: 100 }], records: [] },
        BRI: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'BRI', title: t('dataExtraction.columns.bri'), width: 100 }], records: [] },
        SII: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'SII', title: t('dataExtraction.columns.sii'), width: 100 }], records: [] },
        NPAR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'NPAR', title: t('dataExtraction.columns.npar'), width: 100 }], records: [] },
        MAR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'MAR', title: t('dataExtraction.columns.mar'), width: 100 }], records: [] },
        HALP: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'HALP', title: t('dataExtraction.columns.halp'), width: 100 }], records: [] },
        NLR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'NLR', title: t('dataExtraction.columns.nlr'), width: 100 }], records: [] },
        HRR: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'HRR', title: t('dataExtraction.columns.hrr'), width: 100 }], records: [] },
        FIB4: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'FIB4', title: t('dataExtraction.columns.fib4'), width: 100 }], records: [] },
        CKMStage: { columns: [{ field: 'SEQN', title: t('dataExtraction.columns.seqn'), width: 100 }, { field: 'CKMStage', title: t('dataExtraction.columns.ckm'), width: 100 }], records: [] }
    }), [t]);

    // 移除 mockPresetGroupData，改用 state 存储真实数据
    const [presetPaginationState, setPresetPaginationState] = useState({
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const [currentPresetData, setCurrentPresetData] = useState<any>(null);
    const [loadingPresetData, setLoadingPresetData] = useState(false);

    const [customExtractions, setCustomExtractions] = useState<CustomExtractionItem[]>([]);
    const [editingItem, setEditingItem] = useState<string | null>(null); // 正在编辑的项目key
    const [editForm, setEditForm] = useState<{
        years: string[];
        fileName: string;
        indicators: string;
    }>({ years: [], fileName: '', indicators: '' }); // 编辑表单数据
    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [indicators, setIndicators] = useState('');
    const [selectedCommonIndicator, setSelectedCommonIndicator] = useState('');
    const [selectedMortalityIndicator, setSelectedMortalityIndicator] = useState('');
    const [selectedPresetGroup, setSelectedPresetGroup] = useState('');
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
    const [downloadingStates, setDownloadingStates] = useState({
        custom: false,
        common: false,
        mortality: false,
        preset: false,
        batchCustom: false,
        exportAll: false
    });

    // VTable 实例和ResizeObserver
    const [commonTable, setCommonTable] = useState<ListTable | null>(null);
    const [mortalityTable, setMortalityTable] = useState<ListTable | null>(null);
    const [presetTable, setPresetTable] = useState<ListTable | null>(null);
    const [observersRef] = useState<{ observers: ResizeObserver[], timeouts: NodeJS.Timeout[] }>({
        observers: [],
        timeouts: []
    });

    // 加载状态管理
    const [loadingIndicatorData, setLoadingIndicatorData] = useState(false);

    // 分页状态管理
    const [paginationState, setPaginationState] = useState({
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const [mortalityPaginationState, setMortalityPaginationState] = useState({
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });

    // 当前显示的数据
    const [currentIndicatorData, setCurrentIndicatorData] = useState<any>(null);
    const [currentMortalityData, setCurrentMortalityData] = useState<any>(null);
    const [loadingMortalityData, setLoadingMortalityData] = useState(false);

    // 变量搜索状态
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSearchRows, setSelectedSearchRows] = useState<any[]>([]);

    // 设置特定下载状态
    const setDownloadingState = (type: string, loading: boolean) => {
        setDownloadingStates(prev => ({
            ...prev,
            [type]: loading
        }));
    };

    // 创建VTable实例
    const createVTable = (containerId: string, data: any, headerBgColor: string = 'rgba(99, 102, 241, 0.85)', hoverBgColor: string = 'rgba(99, 102, 241, 0.1)') => {
        const container = document.getElementById(containerId);
        if (!container || !data) return null;

        // 清除之前的表格
        container.innerHTML = '';

        // 根据容器ID确定表格类型，清理对应的旧实例和观察器
        if (containerId === 'common-indicator-table' && commonTable) {
            try {
                commonTable.release();
            } catch (e) {
                console.warn('清理常见指标表格实例时出错:', e);
            }
        } else if (containerId === 'mortality-table' && mortalityTable) {
            try {
                mortalityTable.release();
            } catch (e) {
                console.warn('清理死亡数据表格实例时出错:', e);
            }
        } else if (containerId === 'preset-group-table' && presetTable) {
            try {
                presetTable.release();
            } catch (e) {
                console.warn('清理预设组表格实例时出错:', e);
            }
        }

        // 清理容器相关的观察器和定时器
        const existingObserver = (container as any).__resizeObserver;
        const existingTimeout = (container as any).__resizeTimeout;

        if (existingObserver) {
            try {
                existingObserver.disconnect();
                // 从全局列表中移除
                const index = observersRef.observers.indexOf(existingObserver);
                if (index > -1) {
                    observersRef.observers.splice(index, 1);
                }
            } catch (e) {
                console.warn('清理ResizeObserver时出错:', e);
            }
        }

        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // 优化列配置 - 设置更宽的初始宽度，确保完整显示数值
        const adaptiveColumns = data.columns.map((col: any, index: number) => {
            let width = 180; // 增加默认宽度以显示完整数值

            // 根据列名设置合适的初始宽度
            const fieldName = col.field.toLowerCase();
            if (fieldName.includes('seqn') || fieldName.includes('id')) {
                width = 120; // ID类字段
            } else if (fieldName.includes('age') || fieldName.includes('年龄')) {
                width = 100; // 年龄字段
            } else if (fieldName.includes('phenoage') && fieldName.includes('advance')) {
                width = 220; // 长数值字段更宽
            } else if (fieldName.includes('phenoage')) {
                width = 200; // phenoage字段
            } else {
                // 对于包含小数点的数值字段，设置更宽的列宽
                width = 180; // 数值字段默认宽度
            }

            return {
                ...col,
                width, // 使用固定宽度，不设置最小最大值限制
                // 移除 minWidth 和 maxWidth 限制，让用户自由调整
                // 确保文本不被截断
                style: {
                    textOverflow: 'visible', // 不使用省略号
                    whiteSpace: 'nowrap',    // 不换行
                    overflow: 'visible'      // 允许溢出显示
                }
            };
        });

        const tableInstance = new ListTable(container, {
            columns: adaptiveColumns,
            records: data.records,
            widthMode: 'standard', // 使用标准宽度模式，允许用户调整
            heightMode: 'autoHeight', // 自动计算高度，配合容器滚动
            autoWrapText: false, // 禁用自动换行，保持所有内容在一行显示
            autoFillWidth: false,   // 关闭自动填充宽度，让用户自由调整
            autoFillHeight: false,  // 关闭自动填充高度，使用固定行高
            // 允许用户自由调整列宽
            columnWidthComputeMode: 'only-header',

            theme: {
                defaultStyle: {
                    fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
                    fontSize: 14,
                    color: '#000',
                    bgColor: 'rgba(255, 255, 255, 0.4)', // Semi-transparent
                    autoWrapText: false,
                    textOverflow: 'visible',
                    textAlign: 'left',
                    borderColor: 'rgba(0,0,0,0.05)'
                },
                headerStyle: {
                    fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    bgColor: headerBgColor, // Dynamic color
                    autoWrapText: false,
                    textOverflow: 'visible',
                    textAlign: 'center',
                    borderColor: 'rgba(255,255,255,0.1)'
                },
                bodyStyle: {
                    hover: {
                        cellBgColor: hoverBgColor // Dynamic hover color
                    },
                    autoWrapText: false,
                    textOverflow: 'visible'
                }
            },
            defaultRowHeight: 46,
            defaultHeaderRowHeight: 50,
            columnResizeMode: 'all',
            allowFrozenColCount: 1,
            transpose: false,
            showHeader: true,
            showFrozenIcon: true,
            select: {
                headerSelectMode: 'inline'
            },
            hover: {
                highlightMode: 'cross'
            }
        });

        // 防抖函数
        let resizeTimeout: NodeJS.Timeout;
        let lastWidth = container.clientWidth;
        let lastHeight = container.clientHeight;

        // 监听窗口大小变化，使用防抖避免无限循环
        const resizeObserver = new ResizeObserver(() => {
            // 清除之前的定时器
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // 使用防抖，300ms 后执行
            resizeTimeout = setTimeout(() => {
                try {
                    if (!container || !container.isConnected) {
                        resizeObserver.disconnect();
                        return;
                    }

                    if (tableInstance) {
                        const newWidth = container.clientWidth;
                        const newHeight = container.clientHeight;

                        // 只有当尺寸确实发生变化时才更新
                        if (Math.abs(newWidth - lastWidth) > 5 || Math.abs(newHeight - lastHeight) > 5) {
                            lastWidth = newWidth;
                            lastHeight = newHeight;

                            // 使用 requestAnimationFrame 确保在下一帧执行
                            requestAnimationFrame(() => {
                                try {
                                    if (tableInstance && container && container.isConnected) {
                                        tableInstance.resize();
                                    }
                                } catch (error) {
                                    console.warn('VTable resize RAF error:', error);
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.warn('VTable resize error:', error);
                }
            }, 300);
        });

        // 延迟观察，避免初始化时的冲突
        const delayTimeout = setTimeout(() => {
            if (container && resizeObserver) {
                resizeObserver.observe(container);
                // 为每个表格单独管理观察器
                observersRef.observers.push(resizeObserver);

                // 给容器添加一个标识，用于清理时识别
                (container as any).__resizeObserver = resizeObserver;
                (container as any).__resizeTimeout = resizeTimeout;
            }
        }, 100);

        observersRef.timeouts.push(delayTimeout);

        return tableInstance;
    };

    // 加载死亡数据页面的函数
    const loadMortalityPage = async (mortalityYear: string, page: number = 1, pageSize?: number) => {
        if (!mortalityYear) return;

        setLoadingMortalityData(true);

        // 先显示加载状态
        const loadingContainer = document.getElementById('mortality-table');
        if (loadingContainer) {
            loadingContainer.innerHTML = `<div style="text-align: center; padding: 20px;">${t('common.loading')}</div>`;
        }

        try {
            const currentPageSize = pageSize || mortalityPaginationState.pageSize;
            console.log(`加载死亡数据: 年份=${mortalityYear}, 页码=${page}, 每页=${currentPageSize}`);
            const data = await fetchMortalityData(mortalityYear, page, currentPageSize);
            if (data) {
                setCurrentMortalityData(data);
                setTimeout(() => {
                    const table = createVTable('mortality-table', data, 'rgba(245, 34, 45, 0.85)', 'rgba(245, 34, 45, 0.1)'); // Red theme
                    setMortalityTable(table);
                    setLoadingMortalityData(false);
                }, 100);
            }
        } catch (error) {
            console.error('加载死亡数据失败:', error);
            setLoadingMortalityData(false);
        }
    };

    // 变量搜索函数
    const handleSearch = async (value: string) => {
        if (!value.trim()) {
            message.warning('请输入搜索关键词');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.SEARCH_VARIABLES), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: value }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setSearchResults(data.results);
                if (data.results.length === 0) {
                    message.info('未找到匹配的变量');
                }
            } else {
                message.error(data.error || '搜索失败');
            }
        } catch (error) {
            console.error('搜索变量失败:', error);
            message.error('搜索变量失败，请检查网络连接');
        } finally {
            setIsSearching(false);
        }
    };

    // 加载指定页面数据的函数
    const loadIndicatorPage = async (indicatorName: string, page: number = 1, pageSize?: number) => {
        if (!indicatorName) return;

        setLoadingIndicatorData(true);

        // 先显示加载状态
        const loadingContainer = document.getElementById('common-indicator-table');
        if (loadingContainer) {
            loadingContainer.innerHTML = `<div style="text-align: center; padding: 20px;">${t('common.loading')}</div>`;
        }

        try {
            const currentPageSize = pageSize || paginationState.pageSize;
            console.log(`加载数据: 指标=${indicatorName}, 页码=${page}, 每页=${currentPageSize}`);
            const data = await fetchIndicatorData(indicatorName, page, currentPageSize);
            if (data) {
                setCurrentIndicatorData(data);
                setTimeout(() => {
                    const table = createVTable('common-indicator-table', data, 'rgba(24, 144, 255, 0.85)', 'rgba(24, 144, 255, 0.1)'); // Blue theme
                    setCommonTable(table);
                    setLoadingIndicatorData(false);
                }, 100);
            }
        } catch (error) {
            console.error('加载指标数据失败:', error);
            setLoadingIndicatorData(false);
        }
    };

    // 监听选择变化，重置分页并加载第一页数据
    useEffect(() => {
        if (selectedCommonIndicator) {
            setPaginationState(prev => ({
                ...prev,
                currentPage: 1
            }));
            loadIndicatorPage(selectedCommonIndicator, 1);
        }
    }, [selectedCommonIndicator]);

    // 监听分页变化，加载对应页面数据
    useEffect(() => {
        if (selectedCommonIndicator && paginationState.currentPage > 1) {
            loadIndicatorPage(selectedCommonIndicator, paginationState.currentPage);
        }
    }, [paginationState.currentPage]);

    // 注：页面大小变化的处理已移到Select的onChange中，避免状态更新延迟问题

    // 监听死亡数据选择变化，重置分页并加载第一页数据
    useEffect(() => {
        if (selectedMortalityIndicator) {
            setMortalityPaginationState(prev => ({
                ...prev,
                currentPage: 1
            }));
            loadMortalityPage(selectedMortalityIndicator, 1);
        }
    }, [selectedMortalityIndicator]);

    // 监听死亡数据分页变化，加载对应页面数据
    useEffect(() => {
        if (selectedMortalityIndicator && mortalityPaginationState.currentPage > 1) {
            loadMortalityPage(selectedMortalityIndicator, mortalityPaginationState.currentPage);
        }
    }, [mortalityPaginationState.currentPage]);

    // 加载预设组数据
    const loadPresetPage = async (groupName: string, page: number = 1, pageSize?: number) => {
        if (!groupName) return;

        setLoadingPresetData(true);
        console.log(`加载预设组数据: ${groupName}, page=${page}`);

        const loadingContainer = document.getElementById('preset-group-table');
        if (loadingContainer) {
            loadingContainer.innerHTML = `<div style="text-align: center; padding: 20px;">${t('common.loading')}</div>`;
        }

        try {
            const currentPageSize = pageSize || presetPaginationState.pageSize;
            // 复用 get_indicator_data 接口，因为后端已经修改为支持预设组名称
            const data = await fetchIndicatorData(groupName, page, currentPageSize);

            if (data) {
                setCurrentPresetData(data);
                setTimeout(() => {
                    // 使用琥珀色主题
                    const table = createVTable('preset-group-table', data, 'rgba(245, 158, 11, 0.85)', 'rgba(245, 158, 11, 0.1)');
                    setPresetTable(table);
                    setLoadingPresetData(false);
                }, 100);
            }
        } catch (error) {
            console.error('加载预设组数据失败:', error);
            setLoadingPresetData(false);
            if (loadingContainer) {
                loadingContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">加载失败，请重试</div>`;
            }
        }
    };

    // 监听预设组选择变化
    useEffect(() => {
        if (selectedPresetGroup) {
            setPresetPaginationState(prev => ({
                ...prev,
                currentPage: 1
            }));
            loadPresetPage(selectedPresetGroup, 1);
        }
    }, [selectedPresetGroup]);

    // 监听预设组分页
    useEffect(() => {
        if (selectedPresetGroup && presetPaginationState.currentPage > 1) {
            loadPresetPage(selectedPresetGroup, presetPaginationState.currentPage);
        }
    }, [presetPaginationState.currentPage]);


    // 组件卸载时清理表格实例和观察器
    useEffect(() => {
        return () => {
            // 清理表格实例
            if (commonTable) commonTable.release();
            if (mortalityTable) mortalityTable.release();
            if (presetTable) presetTable.release();

            // 清理ResizeObserver
            observersRef.observers.forEach(observer => {
                observer.disconnect();
            });
            observersRef.observers.length = 0;

            // 清理定时器
            observersRef.timeouts.forEach(timeout => {
                clearTimeout(timeout);
            });
            observersRef.timeouts.length = 0;
        };
    }, []); // 移除依赖项，只在组件卸载时执行

    // 添加自定义提取项
    const addCustomExtraction = () => {
        if (selectedYears.length === 0 || !fileName || !indicators) {
            Modal.warning({
                title: t('dataExtraction.messages.completeInfo'),
                content: t('dataExtraction.messages.completeInfoContent')
            });
            return;
        }

        const newItem: CustomExtractionItem = {
            key: Date.now().toString(),
            years: [...selectedYears],
            fileName: fileName,
            indicators: indicators
        };

        setCustomExtractions([...customExtractions, newItem]);
        setSelectedYears([]);
        setFileName('');
        setIndicators('');

        Modal.success({
            title: t('dataExtraction.messages.addSuccess'),
            content: t('dataExtraction.messages.addSuccessContent')
        });
    };

    // 删除自定义提取项
    const deleteCustomExtraction = (key: string) => {
        setCustomExtractions(customExtractions.filter(item => item.key !== key));
    };

    // 开始编辑
    const startEdit = (record: CustomExtractionItem) => {
        setEditingItem(record.key);
        setEditForm({
            years: record.years,
            fileName: record.fileName,
            indicators: record.indicators
        });
    };

    // 保存编辑
    const saveEdit = () => {
        if (!editingItem) return;

        setCustomExtractions(prev => prev.map(item =>
            item.key === editingItem
                ? { ...item, ...editForm }
                : item
        ));

        // 重置编辑状态
        setEditingItem(null);
        setEditForm({ years: [], fileName: '', indicators: '' });

        message.success('修改成功');
    };

    // 取消编辑
    const cancelEdit = () => {
        setEditingItem(null);
        setEditForm({ years: [], fileName: '', indicators: '' });
    };





    // 导出CSV功能
    const exportToCSV = (data: any, filename: string) => {
        if (!data || !data.records || data.records.length === 0) {
            message.warning(t('dataExtraction.messages.noDataToExport'));
            return;
        }

        const recordCount = data.records.length;

        // 显示导出进度提示
        const hide = message.loading(t('dataExtraction.messages.exportProgress', { count: recordCount }), 0);

        try {
            // 构建CSV内容
            const headers = data.columns.map((col: any) => col.title || col.field);
            const csvContent = [
                // 表头
                headers.join(','),
                // 数据行
                ...data.records.map((record: any) =>
                    data.columns.map((col: any) => {
                        const value = record[col.field];
                        // 处理包含逗号、引号或换行符的值
                        if (value === null || value === undefined) {
                            return '';
                        }
                        const stringValue = String(value);
                        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                            return `"${stringValue.replace(/"/g, '""')}"`;
                        }
                        return stringValue;
                    }).join(',')
                )
            ].join('\n');

            // 创建下载链接
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset-utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 清理URL对象
            setTimeout(() => URL.revokeObjectURL(url), 100);

            hide();
            message.success(t('dataExtraction.messages.exportSuccess', { count: recordCount }));
        } catch (error) {
            hide();
            console.error('导出失败:', error);
            message.error(t('dataExtraction.messages.exportFailed'));
        }
    };

    // 指标标准化：若未包含 SEQN，则自动加入并置于首位
    const normalizeIndicators = (indicators: string): string => {
        if (!indicators || !indicators.trim()) return 'seqn';
        const parts = indicators
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        const filtered = parts.filter(p => p.toLowerCase() !== 'SEQN');
        return ['seqn', ...filtered].join(',');
    };

    // 下载自定义单个文件
    const downloadCustomFile = async (record: CustomExtractionItem) => {
        setDownloadingState('custom', true);

        try {
            console.log('下载自定义文件:', {
                type: 'custom',
                data: {
                    years: record.years,
                    fileName: record.fileName,
                    indicators: record.indicators.split(',')
                }
            });

            // 构造请求数据 - 为每个年份创建一个项目
            const items = record.years.map(year => ({
                year: year,
                file: record.fileName,
                indicator: normalizeIndicators(record.indicators)
            }));

            // 调用后端API
            const response = await fetch(getApiUrl(API_ENDPOINTS.PROCESS_NHANES), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.csv_data) {
                // 创建CSV文件下载
                const blob = new Blob(['\uFEFF' + result.csv_data], {
                    type: 'text/csv;charset=utf-8;'
                });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                const suggested = (result && result.suggested_filename) ? String(result.suggested_filename) : `${record.fileName}.csv`;
                link.setAttribute('download', suggested);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);

                setDownloadingState('custom', false);
                Modal.success({
                    title: t('dataExtraction.messages.downloadSuccess'),
                    content: t('dataExtraction.messages.downloadSuccessContent')
                });
            } else {
                throw new Error(result.error || '数据处理失败');
            }
        } catch (error) {
            console.error('下载自定义文件失败:', error);
            setDownloadingState('custom', false);
            Modal.error({
                title: '下载失败',
                content: `下载自定义文件时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
            });
        }
    };

    // 下载常见指标
    // 下载常见指标
    const downloadCommonIndicator = async () => {
        if (!selectedCommonIndicator) return;

        setDownloadingState('common', true);

        try {
            const indicatorName = selectedCommonIndicator;
            // 调用后端API获取全部数据（不分页）
            const response = await fetch(getApiUrl(API_ENDPOINTS.INDICATOR_DATA(indicatorName)) + '?export_all=true');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                const indicatorLabel = commonIndicators.find(item => item.value === indicatorName)?.label || indicatorName;
                const exportData = {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records
                };

                exportToCSV(exportData, `${indicatorLabel}_全部数据.csv`);
            } else {
                message.error(t('dataExtraction.messages.fetchDataFailed'));
            }
        } catch (error) {
            console.error('导出全部数据失败:', error);
            message.error(t('dataExtraction.messages.exportFailed'));
        } finally {
            setDownloadingState('common', false);
        }
    };

    // 下载死亡指标
    const downloadMortalityData = async () => {
        if (!selectedMortalityIndicator) return;

        setDownloadingState('mortality', true);

        try {
            const mortalityYear = selectedMortalityIndicator;
            // 调用后端API获取全部死亡数据（不分页）
            const response = await fetch(getApiUrl(API_ENDPOINTS.MORTALITY_DATA(mortalityYear)) + '?export_all=true');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                const mortalityLabel = mortalityIndicators.find(item => item.value === mortalityYear)?.label || mortalityYear;
                const exportData = {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records
                };

                exportToCSV(exportData, `${mortalityLabel}_全部数据.csv`);
            } else {
                message.error('获取全部死亡数据失败');
            }
        } catch (error) {
            console.error('导出全部死亡数据失败:', error);
            message.error('导出全部死亡数据失败，请检查网络连接');
        } finally {
            setDownloadingState('mortality', false);
        }
    };

    // 下载预设变量组 - 改为真实下载
    const downloadPresetGroup = async () => {
        if (!selectedPresetGroup) return;

        setDownloadingState('preset', true);

        try {
            const groupName = selectedPresetGroup;
            // 同样复用 fetchIndicatorData 的逻辑，带上 export_all=true
            // 注意：fetchIndicatorData 是内部 helper，这里直接构造请求
            const response = await fetch(getApiUrl(API_ENDPOINTS.INDICATOR_DATA(groupName)) + '?export_all=true');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                const selectedItem = presetVariableGroups.find(item => item.value === selectedPresetGroup);
                const label = selectedItem?.label || selectedPresetGroup;

                const exportData = {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records
                };

                exportToCSV(exportData, `${label}_全部数据.csv`);
                message.success(t('dataExtraction.messages.downloadSuccess'));
            } else {
                message.error(t('dataExtraction.messages.fetchDataFailed'));
            }

        } catch (error) {
            console.error('下载预设组失败:', error);
            message.error(t('dataExtraction.messages.exportFailed'));
        } finally {
            setDownloadingState('preset', false);
        }
    };


    // 批量下载所有自定义文件（后端按 seqn 合并，返回单一文件）
    const downloadAllCustomFiles = async () => {
        if (customExtractions.length === 0) {
            Modal.warning({
                title: t('common.noData'),
                content: t('dataExtraction.messages.noDataToDownload')
            });
            return;
        }

        setDownloadingState('batchCustom', true);

        try {
            console.log('批量下载自定义文件:', {
                type: 'batch_custom',
                data: {
                    files: customExtractions.map(item => ({
                        years: item.years,
                        fileName: item.fileName,
                        indicators: item.indicators.split(',')
                    }))
                }
            });

            // 构造所有请求项目（由后端进行合并）
            const allItems: Array<{ year: string, file: string, indicator: string }> = [];
            customExtractions.forEach(record => {
                record.years.forEach(year => {
                    allItems.push({
                        year: year,
                        file: record.fileName,
                        indicator: normalizeIndicators(record.indicators)
                    });
                });
            });

            // 调用后端批量合并接口
            const response = await fetch(getApiUrl(API_ENDPOINTS.PROCESS_NHANES_BATCH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: allItems })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.csv_data) {
                // 创建合并后的CSV文件下载
                const blob = new Blob(['\uFEFF' + result.csv_data], {
                    type: 'text/csv;charset=utf-8;'
                });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                const suggested = (result && result.suggested_filename) ? String(result.suggested_filename) : `batch_custom_extraction_${new Date().toISOString().split('T')[0]}.csv`;
                link.setAttribute('download', suggested);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 清理URL对象
                setTimeout(() => URL.revokeObjectURL(url), 100);

                setDownloadingState('batchCustom', false);
                Modal.success({
                    title: t('dataExtraction.messages.batchDownloadSuccess'),
                    content: t('dataExtraction.messages.batchDownloadSuccessContent', { count: customExtractions.length })
                });
            } else {
                throw new Error(result.error || '批量数据处理失败');
            }
        } catch (error) {
            console.error('批量下载自定义文件失败:', error);
            setDownloadingState('batchCustom', false);
            Modal.error({
                title: '批量下载失败',
                content: `批量下载自定义文件时发生错误: ${error instanceof Error ? error.message : '未知错误'}`
            });
        }
    };

    // 获取死亡数据的函数
    const fetchMortalityData = async (mortalityYear: string, page: number = 1, limit: number = 10) => {
        try {
            // 调用后端API获取死亡数据
            const response = await fetch(getApiUrl(API_ENDPOINTS.MORTALITY_DATA(mortalityYear)) + `?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                // 更新分页状态
                if (apiData.pagination) {
                    setMortalityPaginationState(prev => ({
                        ...prev,
                        currentPage: apiData.pagination.page,
                        pageSize: apiData.pagination.limit,
                        total: apiData.pagination.total,
                        totalPages: apiData.pagination.total_pages
                    }));
                }

                // 转换API响应数据为VTable格式
                return {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records,
                    pagination: apiData.pagination
                };
            } else {
                throw new Error('API响应格式不正确');
            }
        } catch (error) {
            console.error('获取死亡数据失败:', error);
            // 如果API失败，设置空数据
            setMortalityPaginationState(prev => ({
                ...prev,
                currentPage: 1,
                pageSize: 0,
                total: 0,
                totalPages: 0
            }));
            return null;
        }
    };

    // API调用函数
    const fetchIndicatorData = async (indicatorName: string, page: number = 1, limit: number = 10) => {
        try {
            // 调用后端API获取真实数据
            const response = await fetch(getApiUrl(API_ENDPOINTS.INDICATOR_DATA(indicatorName)) + `?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();

            if (apiData.success && apiData.columns && apiData.records) {
                // 更新分页状态
                if (apiData.pagination) {
                    setPaginationState(prev => ({
                        ...prev,
                        currentPage: apiData.pagination.page,
                        pageSize: apiData.pagination.limit,
                        total: apiData.pagination.total,
                        totalPages: apiData.pagination.total_pages
                    }));
                }

                // 转换API响应数据为VTable格式
                return {
                    columns: apiData.columns.map((col: any) => ({
                        field: col.field,
                        title: col.title || col.field,
                        width: 'auto'
                    })),
                    records: apiData.records,
                    pagination: apiData.pagination
                };
            } else {
                throw new Error('API响应格式不正确');
            }
        } catch (error) {
            console.error('获取指标数据失败:', error);
            // 如果API失败，回退到模拟数据
            const fallbackData = mockCommonIndicatorData[indicatorName as keyof typeof mockCommonIndicatorData];
            if (fallbackData) {
                console.log('使用模拟数据作为备选方案');
                // 为模拟数据设置分页信息
                setPaginationState(prev => ({
                    ...prev,
                    currentPage: 1,
                    pageSize: fallbackData.records.length,
                    total: fallbackData.records.length,
                    totalPages: 1
                }));
                return fallbackData;
            } else {
                // 如果没有模拟数据，返回空数据结构
                setPaginationState(prev => ({
                    ...prev,
                    currentPage: 1,
                    pageSize: 0,
                    total: 0,
                    totalPages: 0
                }));
                return {
                    columns: [
                        { field: 'message', title: '提示', width: 'auto' }
                    ],
                    records: [
                        { message: `暂无 ${indicatorName} 指标数据` }
                    ]
                };
            }
        }
    };

    // 自定义提取表格列
    const customColumns = [
        {
            title: t('common.yearRange'),
            dataIndex: 'years',
            key: 'years',
            width: 150,
            render: (years: string[], record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;
                return isEditing ? (
                    <Checkbox.Group
                        value={editForm.years}
                        onChange={(values) => setEditForm(prev => ({ ...prev, years: values as string[] }))}
                        style={{ fontSize: '12px' }}
                    >
                        <div style={{ maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                            <Space direction="vertical" size={2}>
                                {yearOptions.map(year => (
                                    <Checkbox key={year} value={year} style={{ fontSize: '11px' }}>
                                        {year}
                                    </Checkbox>
                                ))}
                            </Space>
                        </div>
                    </Checkbox.Group>
                ) : (
                    <div>
                        {years.map(year => (
                            <Tag key={year} style={{ margin: '1px', fontSize: '10px' }}>
                                {year}
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: t('common.fileName'),
            dataIndex: 'fileName',
            key: 'fileName',
            width: 150,
            render: (fileName: string, record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;
                return isEditing ? (
                    <Input
                        size="small"
                        value={editForm.fileName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, fileName: e.target.value }))}
                        placeholder="文件名"
                    />
                ) : (
                    <Tag color="blue">{fileName}</Tag>
                );
            }
        },
        {
            title: t('common.indicators'),
            dataIndex: 'indicators',
            key: 'indicators',
            render: (indicators: string, record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;
                return isEditing ? (
                    <Input
                        size="small"
                        value={editForm.indicators}
                        onChange={(e) => setEditForm(prev => ({ ...prev, indicators: e.target.value }))}
                        placeholder="指标，用逗号分隔"
                    />
                ) : (
                    <div style={{ maxWidth: '200px' }}>
                        {indicators.split(',').map((indicator, index) => (
                            <Tag key={index} style={{ margin: '1px' }}>
                                {indicator.trim()}
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: CustomExtractionItem) => {
                const isEditing = editingItem === record.key;

                if (isEditing) {
                    return (
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space size="small">
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={saveEdit}
                                    style={{ fontSize: '11px' }}
                                >
                                    {t('common.save')}
                                </Button>
                                <Button
                                    size="small"
                                    onClick={cancelEdit}
                                    style={{ fontSize: '11px' }}
                                >
                                    {t('common.cancel')}
                                </Button>
                            </Space>
                        </Space>
                    );
                }

                return (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space size="small">
                            <Button
                                type="default"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => startEdit(record)}
                                style={{ fontSize: '11px' }}
                            >
                                {t('common.edit')}
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => deleteCustomExtraction(record.key)}
                                style={{ fontSize: '11px' }}
                            >
                                {t('common.delete')}
                            </Button>
                        </Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => downloadCustomFile(record)}
                            loading={downloadingStates.custom}
                            block
                            style={{ fontSize: '11px' }}
                        >
                            {t('common.download')}
                        </Button>
                    </Space>
                );
            }
        }
    ];

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={`page-entry ${isVisible ? 'visible' : ''}`} style={{ paddingBottom: '60px' }}>
            <div className="hero-section">
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                    <DatabaseOutlined /> NHANES Data Extraction
                </div>
                <Title level={1} className="hero-title">
                    {t('dataExtraction.title')}
                </Title>
                <Text className="hero-subtitle">
                    {t('dataExtraction.subtitle')}
                </Text>
            </div>

            <div className="main-content-layout">
                {/* 变量搜索 */}
                <div className="glass-card static-card" style={{ marginBottom: 32, padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '1.2rem',
                            marginRight: '16px',
                            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                        }}>
                            <SearchOutlined />
                        </div>
                        <Title level={4} style={{ margin: 0 }}>
                            {t('dataExtraction.variableSearch.title', '变量搜索')}
                        </Title>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Input.Search
                            placeholder={t('dataExtraction.variableSearch.placeholder', '输入关键词搜索变量 (如: HDL, Glucose)')}
                            enterButton={t('common.search', '搜索')}
                            size="large"
                            onSearch={handleSearch}
                            loading={isSearching}
                        />
                    </div>

                    {searchResults.length > 0 && (
                        <>
                            <Table
                                dataSource={searchResults}
                                columns={[
                                    { title: t('common.year', 'Year'), dataIndex: 'year', key: 'year', width: 100 },
                                    { title: t('common.fileName', 'File Name'), dataIndex: 'file', key: 'file', width: 150 },
                                    { title: t('common.variable', 'Variable'), dataIndex: 'variable', key: 'variable', width: 120 },
                                    { title: t('common.label', 'Label'), dataIndex: 'label', key: 'label' },
                                    { title: t('common.description', 'Description'), dataIndex: 'description', key: 'description', ellipsis: true }
                                ]}
                                rowKey={(record) => `${record.year}-${record.variable}`}
                                rowSelection={{
                                    type: 'checkbox',
                                    onChange: (selectedRowKeys, selectedRows) => {
                                        setSelectedSearchRows(selectedRows);
                                    },
                                }}
                                pagination={{ pageSize: 10 }}
                                size="small"
                                scroll={{ x: 'max-content' }}
                            />
                            {selectedSearchRows.length > 0 && (
                                <div style={{ marginTop: 16, textAlign: 'right' }}>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            // Helper function to extract base name and suffix
                                            const parseFileName = (fileName: string): { base: string, suffix: string } => {
                                                // Match pattern: base_letter or just base
                                                const match = fileName.match(/^(.+?)(_[a-z])?$/i);
                                                if (match) {
                                                    return {
                                                        base: match[1],
                                                        suffix: match[2] || ''
                                                    };
                                                }
                                                return { base: fileName, suffix: '' };
                                            };

                                            // Group by file name first
                                            const fileGroups: { [key: string]: { years: Set<string>, file: string, variables: Set<string> }[] } = {};

                                            selectedSearchRows.forEach(row => {
                                                const key = row.file;
                                                if (!fileGroups[key]) {
                                                    fileGroups[key] = [];
                                                }

                                                // Find if there's already a group for this year
                                                let yearGroup = fileGroups[key].find(g => g.years.has(row.year));
                                                if (!yearGroup) {
                                                    yearGroup = {
                                                        years: new Set([row.year]),
                                                        file: row.file,
                                                        variables: new Set()
                                                    };
                                                    fileGroups[key].push(yearGroup);
                                                }
                                                yearGroup.variables.add(row.variable);
                                            });

                                            // Try to merge groups with similar file names (NHANES pattern)
                                            const allFiles = Object.keys(fileGroups);
                                            const mergedGroups: { years: Set<string>, fileName: string, variables: Set<string> }[] = [];

                                            // Group files by base name
                                            const baseGroups: { [base: string]: string[] } = {};
                                            allFiles.forEach(file => {
                                                const { base } = parseFileName(file);
                                                if (!baseGroups[base]) {
                                                    baseGroups[base] = [];
                                                }
                                                baseGroups[base].push(file);
                                            });

                                            // Process each base group
                                            Object.entries(baseGroups).forEach(([base, files]) => {
                                                if (files.length > 1) {
                                                    // Check if all files follow the pattern: base, base_b, base_c, etc.
                                                    const allFollowPattern = files.every(f => {
                                                        const { base: fBase, suffix } = parseFileName(f);
                                                        return fBase === base && (suffix === '' || /^_[a-z]$/i.test(suffix));
                                                    });

                                                    if (allFollowPattern) {
                                                        // Merge these files
                                                        const mergedYears = new Set<string>();
                                                        const mergedVariables = new Set<string>();

                                                        files.forEach(f => {
                                                            fileGroups[f].forEach(group => {
                                                                group.years.forEach(y => mergedYears.add(y));
                                                                group.variables.forEach(v => mergedVariables.add(v));
                                                            });
                                                        });

                                                        mergedGroups.push({
                                                            years: mergedYears,
                                                            fileName: base + '_', // Use base_ to indicate a merged file set
                                                            variables: mergedVariables
                                                        });
                                                    } else {
                                                        // Don't merge, keep separate
                                                        files.forEach(f => {
                                                            fileGroups[f].forEach(group => {
                                                                mergedGroups.push({
                                                                    years: group.years,
                                                                    fileName: f,
                                                                    variables: group.variables
                                                                });
                                                            });
                                                        });
                                                    }
                                                } else {
                                                    // Single file, keep as is
                                                    fileGroups[files[0]].forEach(group => {
                                                        mergedGroups.push({
                                                            years: group.years,
                                                            fileName: files[0],
                                                            variables: group.variables
                                                        });
                                                    });
                                                }
                                            });

                                            // Add each merged group as a custom extraction
                                            mergedGroups.forEach(group => {
                                                const newItem: CustomExtractionItem = {
                                                    key: Date.now().toString() + Math.random(),
                                                    years: Array.from(group.years),
                                                    fileName: group.fileName,
                                                    indicators: Array.from(group.variables).join(',')
                                                };
                                                setCustomExtractions(prev => [...prev, newItem]);
                                            });

                                            message.success(`已添加 ${selectedSearchRows.length} 个变量到自定义提取列表`);
                                            setSelectedSearchRows([]);
                                        }}
                                    >
                                        添加到自定义提取 ({selectedSearchRows.length})
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 自定义提取 */}
                <div className="glass-card static-card" style={{ marginBottom: 32, padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '1.2rem',
                            marginRight: '16px',
                            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                        }}>
                            <PlusOutlined />
                        </div>
                        <Title level={4} style={{ margin: 0 }}>
                            {t('dataExtraction.customExtraction.title')}
                        </Title>
                    </div>

                    {/* 添加新项目表单 */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(10px)',
                        padding: '24px',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <Row gutter={isMobile ? [8, 12] : [16, 16]}>
                            <Col span={24}>
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        📅 {t('dataExtraction.customExtraction.yearRange')}
                                    </Text>
                                </div>
                                <Checkbox.Group
                                    value={selectedYears}
                                    onChange={setSelectedYears}
                                    style={{ width: '100%' }}
                                >
                                    <Row gutter={[6, 6]}>
                                        {yearOptions.map(year => (
                                            <Col span={isMobile ? 12 : 4} key={year}>
                                                <Checkbox
                                                    value={year}
                                                    style={{
                                                        fontSize: isMobile ? '11px' : '13px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {year}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Col>
                        </Row>

                        <Row gutter={isMobile ? [8, 12] : [16, 16]} style={{ marginTop: 16 }}>
                            <Col xs={24} sm={24} md={8}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        📁 {t('dataExtraction.customExtraction.fileName')}
                                    </Text>
                                </div>
                                <Input
                                    placeholder={t('dataExtraction.customExtraction.fileNamePlaceholder')}
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    style={{ borderRadius: '6px' }}
                                    size={isMobile ? 'small' : 'middle'}
                                />
                            </Col>
                            <Col xs={24} sm={24} md={10}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        📊 {t('dataExtraction.customExtraction.indicators')}
                                    </Text>
                                </div>
                                <Input
                                    placeholder={t('dataExtraction.customExtraction.indicatorsPlaceholder')}
                                    value={indicators}
                                    onChange={(e) => setIndicators(e.target.value)}
                                    style={{ borderRadius: '6px' }}
                                    size={isMobile ? 'small' : 'middle'}
                                />
                                <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '12px' }}>
                                    {t('dataExtraction.customExtraction.indicatorsHint')}
                                </Text>
                            </Col>
                            <Col xs={24} sm={24} md={6}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong style={{ color: '#262626', fontSize: isMobile ? '13px' : '14px' }}>
                                        ⚡ {t('dataExtraction.customExtraction.actions')}
                                    </Text>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addCustomExtraction}
                                    block
                                    size={isMobile ? 'middle' : 'large'}
                                    style={{
                                        borderRadius: '6px',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                                    }}
                                >
                                    {t('dataExtraction.customExtraction.addToList')}
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {/* 数据预览表格 */}
                    {customExtractions.length > 0 ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16
                            }}>
                                <div>
                                    <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                                        📋 {t('dataExtraction.customExtraction.previewList')}
                                    </Text>
                                    <Text type="secondary" style={{ marginLeft: 8 }}>
                                        {t('dataExtraction.customExtraction.totalItems', { count: customExtractions.length })}
                                    </Text>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={downloadAllCustomFiles}
                                    loading={downloadingStates.batchCustom}
                                    size="large"
                                    style={{
                                        borderRadius: '6px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                                    }}
                                >
                                    {t('dataExtraction.customExtraction.batchDownload')}
                                </Button>
                            </div>
                            <Table
                                columns={customColumns}
                                dataSource={customExtractions}
                                pagination={false}
                                size="middle"
                                bordered
                                style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}
                                scroll={{ x: 'max-content' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            border: '2px dashed #d9d9d9'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                {t('dataExtraction.customExtraction.noData')}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                {t('dataExtraction.customExtraction.noDataHint')}
                            </Text>
                        </div>
                    )}
                </div>

                {/* 快速提取选项 */}
                <Row gutter={isMobile ? [8, 16] : [24, 24]}>
                    <Col xs={24} sm={24} md={8}>
                        <div className="glass-card static-card" style={{ height: '100%', minHeight: 220, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.2rem',
                                    marginRight: '12px',
                                    boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)'
                                }}>
                                    <TableOutlined />
                                </div>
                                <Title level={5} style={{ margin: 0 }}>{t('dataExtraction.commonIndicators.title')}</Title>
                            </div>
                            <Select
                                placeholder={t('dataExtraction.commonIndicators.placeholder')}
                                style={{ width: '100%', marginBottom: 16 }}
                                value={selectedCommonIndicator}
                                onChange={setSelectedCommonIndicator}
                                showSearch
                            >
                                {commonIndicators.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                block
                                disabled={!selectedCommonIndicator}
                                loading={downloadingStates.common}
                                onClick={downloadCommonIndicator}
                            >
                                {t('dataExtraction.commonIndicators.downloadButton')}
                            </Button>
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={8}>
                        <div className="glass-card static-card" style={{ height: '100%', minHeight: 220, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    background: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.2rem',
                                    marginRight: '12px',
                                    boxShadow: '0 4px 10px rgba(245, 34, 45, 0.3)'
                                }}>
                                    <TagOutlined style={{ transform: 'rotate(45deg)' }} />
                                </div>
                                <Title level={5} style={{ margin: 0 }}>{t('dataExtraction.mortalityData.title')}</Title>
                            </div>
                            <Select
                                placeholder={t('dataExtraction.mortalityData.placeholder')}
                                style={{ width: '100%', marginBottom: 16 }}
                                value={selectedMortalityIndicator}
                                onChange={setSelectedMortalityIndicator}
                            >
                                {mortalityIndicators.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                block
                                disabled={!selectedMortalityIndicator}
                                loading={downloadingStates.mortality}
                                onClick={downloadMortalityData}
                            >
                                {t('dataExtraction.mortalityData.downloadButton')}
                            </Button>
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={8}>
                        <div className="glass-card static-card" style={{ height: '100%', minHeight: 220, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.2rem',
                                    marginRight: '12px',
                                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <DatabaseOutlined />
                                </div>
                                <Title level={5} style={{ margin: 0 }}>{t('dataExtraction.presetGroups.title')}</Title>
                            </div>
                            <Select
                                placeholder={t('dataExtraction.presetGroups.placeholder')}
                                style={{ width: '100%', marginBottom: 16 }}
                                value={selectedPresetGroup}
                                onChange={setSelectedPresetGroup}
                            >
                                {presetVariableGroups.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                block
                                disabled={!selectedPresetGroup}
                                loading={downloadingStates.preset}
                                onClick={downloadPresetGroup}
                            >
                                {t('dataExtraction.presetGroups.downloadButton')}
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* 分别显示三个选择项的详细信息 */}
                <div style={{ marginTop: 16 }}>


                    {/* 常见指标详细信息 */}
                    {/* Common Indicator Details */}
                    {selectedCommonIndicator && (
                        <div className="glass-card static-card" style={{ marginBottom: 32, padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.2rem',
                                    marginRight: '16px',
                                    boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)'
                                }}>
                                    <TableOutlined />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {commonIndicators.find(item => item.value === selectedCommonIndicator)?.label}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {t('dataExtraction.commonIndicators.title')}
                                    </Text>
                                </div>
                            </div>

                            <div style={{ marginBottom: 24, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                {commonIndicators.find(item => item.value === selectedCommonIndicator)?.description}
                            </div>

                            {/* Export Button */}


                            {/* Pagination and Table */}
                            {paginationState.total > 0 && (
                                <div style={{
                                    marginBottom: 16,
                                    padding: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Space split={<Divider type="vertical" />}>
                                                <Text>{t('common.pagination.total', { total: paginationState.total })}</Text>
                                                <Text>{t('common.pagination.page')} <strong style={{ color: '#1890ff' }}>{paginationState.currentPage}</strong> / {paginationState.totalPages}</Text>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Text>{t('common.pagination.pageSize')}:</Text>
                                                <Select
                                                    size="small"
                                                    value={paginationState.pageSize}
                                                    onChange={(value) => {
                                                        setPaginationState(prev => ({
                                                            ...prev,
                                                            pageSize: value,
                                                            currentPage: 1
                                                        }));
                                                        if (selectedCommonIndicator) {
                                                            loadIndicatorPage(selectedCommonIndicator, 1, value);
                                                        }
                                                    }}
                                                    disabled={loadingIndicatorData}
                                                    style={{ width: 100 }}
                                                >
                                                    <Option value={10}>10 / page</Option>
                                                    <Option value={20}>20 / page</Option>
                                                    <Option value={50}>50 / page</Option>
                                                    <Option value={100}>100 / page</Option>
                                                    <Option value={200}>200 / page</Option>
                                                </Select>
                                            </Space>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Table Container */}
                            <div
                                id="common-indicator-table"
                                style={{
                                    width: '100%',
                                    height: paginationState.pageSize <= 10 ? '450px' :
                                        paginationState.pageSize <= 20 ? `${50 + paginationState.pageSize * 46}px` : '850px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    background: 'rgba(255,255,255,0.3)'
                                }}
                            />

                            {/* Pagination */}
                            {paginationState.totalPages > 1 && (
                                <div style={{
                                    marginTop: 24,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Space size="middle">
                                        <Button
                                            disabled={paginationState.currentPage <= 1 || loadingIndicatorData}
                                            onClick={() => setPaginationState(prev => ({ ...prev, currentPage: 1 }))}
                                        >
                                            {t('common.pagination.first')}
                                        </Button>
                                        <Button
                                            disabled={paginationState.currentPage <= 1 || loadingIndicatorData}
                                            onClick={() => setPaginationState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                        >
                                            {t('common.pagination.prev')}
                                        </Button>

                                        {/* Page Numbers */}
                                        <Space>
                                            {(() => {
                                                const { currentPage, totalPages } = paginationState;
                                                const pageNumbers = [];
                                                const maxDisplayPages = 5;

                                                let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
                                                let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

                                                if (endPage - startPage + 1 < maxDisplayPages) {
                                                    startPage = Math.max(1, endPage - maxDisplayPages + 1);
                                                }

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pageNumbers.push(
                                                        <Button
                                                            key={i}
                                                            type={i === currentPage ? 'primary' : 'default'}
                                                            className={i !== currentPage ? 'glass-button' : ''}
                                                            disabled={loadingIndicatorData}
                                                            onClick={() => setPaginationState(prev => ({ ...prev, currentPage: i }))}
                                                            size="small"
                                                            style={i === currentPage ? { background: '#1890ff' } : {}}
                                                        >
                                                            {i}
                                                        </Button>
                                                    );
                                                }
                                                return pageNumbers;
                                            })()}
                                        </Space>

                                        <Button
                                            disabled={paginationState.currentPage >= paginationState.totalPages || loadingIndicatorData}
                                            onClick={() => setPaginationState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                        >
                                            {t('common.pagination.next')}
                                        </Button>
                                        <Button
                                            disabled={paginationState.currentPage >= paginationState.totalPages || loadingIndicatorData}
                                            onClick={() => setPaginationState(prev => ({ ...prev, currentPage: prev.totalPages }))}
                                        >
                                            {t('common.pagination.last')}
                                        </Button>

                                        {/* Jump */}
                                        <Space>
                                            <Text>{t('common.pagination.jump')}</Text>
                                            <InputNumber
                                                size="small"
                                                min={1}
                                                max={paginationState.totalPages}
                                                value={paginationState.currentPage}
                                                onChange={(value) => {
                                                    if (value && value !== paginationState.currentPage) {
                                                        setPaginationState(prev => ({ ...prev, currentPage: value }));
                                                    }
                                                }}
                                                disabled={loadingIndicatorData}
                                                style={{ width: 60 }}
                                            />
                                            <Text>{t('common.pagination.page')}</Text>
                                        </Space>
                                    </Space>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 死亡指标详细信息 */}
                    {selectedMortalityIndicator && (
                        <div className="glass-card static-card" style={{ marginBottom: 32, padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.2rem',
                                    marginRight: '16px',
                                    boxShadow: '0 4px 10px rgba(245, 34, 45, 0.3)'
                                }}>
                                    <TagOutlined style={{ transform: 'rotate(45deg)' }} />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {mortalityIndicators.find(item => item.value === selectedMortalityIndicator)?.label}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {t('dataExtraction.mortalityData.title')}
                                    </Text>
                                </div>
                            </div>

                            <div style={{ marginBottom: 24, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                {mortalityIndicators.find(item => item.value === selectedMortalityIndicator)?.description}
                            </div>

                            {/* Export Button */}


                            {/* Pagination and Table Info */}
                            {mortalityPaginationState.total > 0 && (
                                <div style={{
                                    marginBottom: 16,
                                    padding: '16px',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Space split={<Divider type="vertical" />}>
                                                <Text>{t('common.pagination.total', { total: mortalityPaginationState.total })}</Text>
                                                <Text>{t('common.pagination.page')} <strong style={{ color: '#f5222d' }}>{mortalityPaginationState.currentPage}</strong> / {mortalityPaginationState.totalPages}</Text>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Text>{t('common.pagination.pageSize')}:</Text>
                                                <Select
                                                    size="small"
                                                    value={mortalityPaginationState.pageSize}
                                                    onChange={(value) => {
                                                        setMortalityPaginationState(prev => ({
                                                            ...prev,
                                                            currentPage: 1,
                                                            pageSize: value
                                                        }));
                                                        if (selectedMortalityIndicator) {
                                                            loadMortalityPage(selectedMortalityIndicator, 1, value);
                                                        }
                                                    }}
                                                    disabled={loadingMortalityData}
                                                    style={{ width: 100 }}
                                                >
                                                    <Option value={10}>10 / page</Option>
                                                    <Option value={20}>20 / page</Option>
                                                    <Option value={50}>50 / page</Option>
                                                    <Option value={100}>100 / page</Option>
                                                    <Option value={200}>200 / page</Option>
                                                </Select>
                                            </Space>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Table Container */}
                            <div
                                id="mortality-table"
                                style={{
                                    width: '100%',
                                    height: mortalityPaginationState.pageSize <= 10 ? '450px' :
                                        mortalityPaginationState.pageSize <= 20 ? `${50 + mortalityPaginationState.pageSize * 46}px` : '850px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    background: 'rgba(255,255,255,0.3)',
                                    position: 'relative'
                                }}
                            />

                            {/* Pagination */}
                            {mortalityPaginationState.totalPages > 1 && (
                                <div style={{
                                    marginTop: 24,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Space size="middle">
                                        <Button
                                            disabled={mortalityPaginationState.currentPage <= 1 || loadingMortalityData}
                                            onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: 1 }))}
                                        >
                                            {t('common.pagination.first')}
                                        </Button>
                                        <Button
                                            disabled={mortalityPaginationState.currentPage <= 1 || loadingMortalityData}
                                            onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                        >
                                            {t('common.pagination.prev')}
                                        </Button>

                                        {/* Page Numbers */}
                                        <Space>
                                            {(() => {
                                                const { currentPage, totalPages } = mortalityPaginationState;
                                                const pageNumbers = [];
                                                const maxDisplayPages = 5;

                                                let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
                                                let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

                                                if (endPage - startPage + 1 < maxDisplayPages) {
                                                    startPage = Math.max(1, endPage - maxDisplayPages + 1);
                                                }

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pageNumbers.push(
                                                        <Button
                                                            key={i}
                                                            type={i === currentPage ? 'primary' : 'default'}
                                                            className={i !== currentPage ? 'glass-button' : ''}
                                                            disabled={loadingMortalityData}
                                                            onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: i }))}
                                                            size="small"
                                                            style={i === currentPage ? { background: '#f5222d' } : {}}
                                                        >
                                                            {i}
                                                        </Button>
                                                    );
                                                }
                                                return pageNumbers;
                                            })()}
                                        </Space>

                                        <Button
                                            disabled={mortalityPaginationState.currentPage >= mortalityPaginationState.totalPages || loadingMortalityData}
                                            onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                        >
                                            {t('common.pagination.next')}
                                        </Button>
                                        <Button
                                            disabled={mortalityPaginationState.currentPage >= mortalityPaginationState.totalPages || loadingMortalityData}
                                            onClick={() => setMortalityPaginationState(prev => ({ ...prev, currentPage: prev.totalPages }))}
                                        >
                                            {t('common.pagination.last')}
                                        </Button>

                                        {/* Jump */}
                                        <Space>
                                            <Text>{t('common.pagination.jump')}</Text>
                                            <InputNumber
                                                size="small"
                                                min={1}
                                                max={mortalityPaginationState.totalPages}
                                                value={mortalityPaginationState.currentPage}
                                                onChange={(value) => {
                                                    if (value && value !== mortalityPaginationState.currentPage) {
                                                        setMortalityPaginationState(prev => ({ ...prev, currentPage: value }));
                                                    }
                                                }}
                                                disabled={loadingMortalityData}
                                                style={{ width: 60 }}
                                            />
                                            <Text>{t('common.pagination.page')}</Text>
                                        </Space>
                                    </Space>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 预设变量组详细信息 */}
                    {selectedPresetGroup && (
                        <div className="glass-card static-card" style={{ marginBottom: 32, padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.2rem',
                                    marginRight: '16px',
                                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <DatabaseOutlined />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {presetVariableGroups.find(item => item.value === selectedPresetGroup)?.label}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {t('dataExtraction.presetGroups.title')}
                                    </Text>
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                                    {presetVariableGroups.find(item => item.value === selectedPresetGroup)?.description}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ marginRight: '8px' }}>包含变量：</Text>
                                    {presetVariableGroups.find(item => item.value === selectedPresetGroup)?.variables.map(variable => (
                                        <Tag key={variable} color="blue" style={{ margin: '2px' }}>{variable}</Tag>
                                    ))}
                                </div>
                            </div>
                            <div
                                id="preset-group-table"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    minHeight: '300px',
                                    maxHeight: '500px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    resize: 'vertical',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    background: 'rgba(255,255,255,0.3)',
                                    marginBottom: '16px'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataExtraction; 