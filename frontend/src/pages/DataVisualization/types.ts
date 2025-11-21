
export interface FileStats {
    total_rows: number;
    total_columns: number;
    numeric_columns_count: number;
    categorical_columns_count: number;
    file_size: number;
}

export interface ColumnInfo {
    name: string;
    type: string;
    data_type: string;
    non_null_count: number;
    null_count: number;
    unique_count: number;
}

export interface FileInfo {
    filename: string;
    file_stats: FileStats;
    columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    columns_info: ColumnInfo[];
    preview_data?: Array<Record<string, any>>;
}

export interface ChartResult {
    success: boolean;
    chart_type: string;
    plot: string;
    filename: string;
    variables_used: {
        x_var: string;
        y_var: string;
    };
    message: string;
    error?: string;
}

export interface ChartConfig {
    chartType: string;
    xVar?: string;
    yVar?: string;
    groupVar?: string;
    columns?: string[];
    method?: string;
    distribution?: string;
    show_percentage?: boolean;
    chartTitleType: 'auto' | 'custom';
    customTitle?: string;
    colorTheme: string;
}
