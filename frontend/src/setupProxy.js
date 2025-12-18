const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // 获取后端地址，如果是 Docker 环境则使用 backend:5000，否则使用 localhost:5001
    const target = process.env.BACKEND_URL || 'http://localhost:5001';

    app.use(
        '/api',
        createProxyMiddleware({
            target: target,
            changeOrigin: true,
            pathRewrite: {
                '^/api': '', // Remove based on your server needs, usually keep it if server expects /api
            },
        })
    );

    // 代理之前在 nginx-dev.conf 中定义的其他 API 路径
    const otherPaths = [
        '/search_variables',
        '/process_nhanes',
        '/process_nhanes_batch_merge',
        '/download',
        '/get_csvfile',
        '/get_csv_info',
        '/get_file_columns',
        '/generate_visualization',
        '/draw_boxplot',
        '/draw_histogram',
        '/draw_heatmap',
        '/draw_scatterplot',
        '/logisticRegression',
        '/multinomialLogisticRegression',
        '/linearRegression',
        '/CoxRegression'
    ];

    otherPaths.forEach(path => {
        app.use(
            path,
            createProxyMiddleware({
                target: target,
                changeOrigin: true,
            })
        );
    });
};
