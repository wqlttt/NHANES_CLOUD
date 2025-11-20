import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Typography,
    Card,
    Row,
    Col,
    Button,
} from 'antd';
import {
    DatabaseOutlined,
    BarChartOutlined,
    FundOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

type PageKey = 'home' | 'extraction' | 'visualization' | 'analysis';

interface HomeProps {
    onNavigate: (page: PageKey) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const mainFeatures = [
        {
            title: t('home.features.dataExtraction.title'),
            subtitle: t('home.features.dataExtraction.subtitle'),
            description: t('home.features.dataExtraction.description'),
            icon: <DatabaseOutlined style={{ fontSize: '48px', color: 'var(--primary-color)' }} />,
            features: [
                t('home.features.dataExtraction.features.customExtraction.name'),
                t('home.features.dataExtraction.features.presetVariables.name'),
                t('home.features.dataExtraction.features.secondaryIndicators.name'),
                t('home.features.dataExtraction.features.mortalityData.name')
            ],
            stats: {
                samples: t('home.features.dataExtraction.stats.samples'),
                variables: t('home.features.dataExtraction.stats.variables'),
                cycles: t('home.features.dataExtraction.stats.cycles')
            },
            action: () => onNavigate('extraction'),
            color: 'var(--primary-color)',
            bg: 'rgba(24, 144, 255, 0.05)'
        },
        {
            title: t('home.features.visualization.title'),
            subtitle: t('home.features.visualization.subtitle'),
            description: t('home.features.visualization.description'),
            icon: <BarChartOutlined style={{ fontSize: '48px', color: 'var(--secondary-color)' }} />,
            features: [
                t('home.features.visualization.features.chartTypes.name'),
                t('home.features.visualization.features.interactiveConfig.name'),
                t('home.features.visualization.features.realTimePreview.name'),
                t('home.features.visualization.features.highQualityExport.name')
            ],
            stats: {
                charts: t('home.features.visualization.stats.charts'),
                formats: t('home.features.visualization.stats.formats'),
                resolution: t('home.features.visualization.stats.resolution')
            },
            action: () => onNavigate('visualization'),
            color: 'var(--secondary-color)',
            bg: 'rgba(82, 196, 26, 0.05)'
        },
        {
            title: t('home.features.analysis.title'),
            subtitle: t('home.features.analysis.subtitle'),
            description: t('home.features.analysis.description'),
            icon: <FundOutlined style={{ fontSize: '48px', color: 'var(--warning-color)' }} />,
            features: [
                t('home.features.analysis.features.descriptiveStats.name'),
                t('home.features.analysis.features.hypothesisTesting.name'),
                t('home.features.analysis.features.regression.name'),
                t('home.features.analysis.features.survivalAnalysis.name')
            ],
            stats: {
                methods: t('home.features.analysis.stats.methods'),
                models: t('home.features.analysis.stats.models'),
                precision: t('home.features.analysis.stats.precision')
            },
            action: () => onNavigate('analysis'),
            color: 'var(--warning-color)',
            bg: 'rgba(250, 173, 20, 0.05)'
        }
    ];

    return (
        <div style={{ padding: '40px 0' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <Title level={1} style={{
                    color: 'var(--primary-color)',
                    marginBottom: '16px',
                    fontSize: '36px',
                    fontWeight: 700
                }}>
                    {t('home.title')}
                </Title>
                <Text style={{
                    fontSize: '18px',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    display: 'block',
                    margin: '0 auto'
                }}>
                    {t('home.subtitle')}
                </Text>
            </div>

            {/* Features Grid */}
            <Row gutter={[32, 32]} justify="center">
                {mainFeatures.map((feature, index) => (
                    <Col key={index} xs={24} lg={8} style={{ display: 'flex' }}>
                        <Card
                            className="glass-card"
                            hoverable
                            style={{
                                width: '100%',
                                borderTop: `4px solid ${feature.color}`,
                                transition: 'transform 0.3s ease'
                            }}
                            bodyStyle={{
                                padding: '32px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px'
                            }}
                            onClick={feature.action}
                        >
                            {/* Header */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    background: feature.bg,
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px'
                                }}>
                                    {feature.icon}
                                </div>
                                <Title level={3} style={{ marginBottom: '8px' }}>{feature.title}</Title>
                                <Text type="secondary">{feature.subtitle}</Text>
                            </div>

                            {/* Description */}
                            <Text style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                {feature.description}
                            </Text>

                            {/* Feature List */}
                            <div style={{
                                background: 'var(--bg-body)',
                                padding: '16px',
                                borderRadius: '8px',
                                flex: 1
                            }}>
                                {feature.features.map((item, idx) => (
                                    <div key={idx} style={{
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px'
                                    }}>
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: feature.color
                                        }} />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                {Object.entries(feature.stats).map(([key, value]) => (
                                    <div key={key} style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            color: feature.color
                                        }}>
                                            {value}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                            {key}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<ArrowRightOutlined />}
                                style={{
                                    height: '48px',
                                    background: feature.color,
                                    borderColor: feature.color,
                                    marginTop: 'auto'
                                }}
                            >
                                {t(`home.features.${feature === mainFeatures[0] ? 'dataExtraction' : feature === mainFeatures[1] ? 'visualization' : 'analysis'}.button`)}
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Footer Info */}
            <div style={{
                marginTop: '60px',
                textAlign: 'center',
                padding: '40px',
                background: 'var(--bg-container)',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Title level={4} style={{ marginBottom: '32px' }}>{t('home.introduction.title')}</Title>
                <Row gutter={[48, 24]}>
                    <Col xs={24} md={8}>
                        <Text strong style={{ color: 'var(--primary-color)', fontSize: '16px' }}>
                            {t('home.introduction.dataExtraction.title')}
                        </Text>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                            {t('home.introduction.dataExtraction.description')}
                        </p>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{ color: 'var(--secondary-color)', fontSize: '16px' }}>
                            {t('home.introduction.visualization.title')}
                        </Text>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                            {t('home.introduction.visualization.description')}
                        </p>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{ color: 'var(--warning-color)', fontSize: '16px' }}>
                            {t('home.introduction.analysis.title')}
                        </Text>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                            {t('home.introduction.analysis.description')}
                        </p>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Home;