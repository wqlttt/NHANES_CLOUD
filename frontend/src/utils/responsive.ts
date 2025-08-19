// 响应式设计工具函数和配置

export interface ResponsiveConfig {
    gutter: [number, number];
    cardPadding: number;
    fontSize: {
        title: number;
        text: number;
        small: number;
    };
    spacing: {
        section: number;
        item: number;
    };
}

export const getResponsiveConfig = (isMobile: boolean): ResponsiveConfig => {
    return {
        gutter: isMobile ? [8, 12] : [16, 24],
        cardPadding: isMobile ? 12 : 20,
        fontSize: {
            title: isMobile ? 16 : 20,
            text: isMobile ? 12 : 14,
            small: isMobile ? 10 : 12,
        },
        spacing: {
            section: isMobile ? 16 : 24,
            item: isMobile ? 8 : 12,
        },
    };
};

// 常用的响应式断点配置
export const responsiveBreakpoints = {
    xs: 24,   // 超小屏：全宽
    sm: 24,   // 小屏：全宽
    md: 12,   // 中等屏：半宽
    lg: 8,    // 大屏：三分之一宽
    xl: 6,    // 超大屏：四分之一宽
};

// 针对不同页面的响应式列配置
export const pageResponsiveConfig = {
    // 首页功能卡片
    homeCards: {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 8,
        xl: 8,
    },
    // 数据提取页面的配置区域
    extractionConfig: {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 12,
        xl: 8,
    },
    // 数据可视化页面的配置和结果区域
    visualizationLayout: {
        config: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 10,
            xl: 8,
        },
        result: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 14,
            xl: 16,
        },
    },
    // 数据分析页面
    analysisLayout: {
        config: {
            xs: 24,
            sm: 24,
            md: 12,
            lg: 8,
            xl: 6,
        },
        result: {
            xs: 24,
            sm: 24,
            md: 12,
            lg: 16,
            xl: 18,
        },
    },
};

// 检测设备类型
export const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
};

// 响应式表格配置
export const getTableScrollConfig = (isMobile: boolean) => {
    return {
        x: isMobile ? 800 : undefined,
        y: isMobile ? 300 : 500,
    };
};

// 响应式按钮大小
export const getButtonSize = (isMobile: boolean): 'small' | 'middle' | 'large' => {
    return isMobile ? 'small' : 'middle';
};

// 响应式表单配置
export const getFormLayout = (isMobile: boolean) => {
    return {
        labelCol: { span: isMobile ? 24 : 6 },
        wrapperCol: { span: isMobile ? 24 : 18 },
        layout: isMobile ? 'vertical' : 'horizontal',
    };
};
