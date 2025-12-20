import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Row, Col, Space } from 'antd';
import {
    DatabaseOutlined,
    BarChartOutlined,
    FundOutlined,
    ArrowRightOutlined,
    ExperimentOutlined,
    RocketOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type PageKey = 'home' | 'extraction' | 'visualization' | 'analysis';

interface HomeProps {
    onNavigate: (page: PageKey) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Feature Configuration with specific brand colors
    const features = [
        {
            key: 'extraction',
            title: t('home.features.dataExtraction.title'),
            subtitle: t('home.features.dataExtraction.subtitle'),
            description: t('home.features.dataExtraction.description'),
            icon: <DatabaseOutlined style={{ fontSize: '36px', color: '#fff' }} />,
            bgIcon: <DatabaseOutlined />,
            color: '#6366f1', // Indigo
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            bg: 'rgba(99, 102, 241, 0.1)',
            stats: {
                samples: t('home.features.dataExtraction.stats.samples'),
                variables: t('home.features.dataExtraction.stats.variables'),
            },
            action: () => onNavigate('extraction')
        },
        {
            key: 'visualization',
            title: t('home.features.visualization.title'),
            subtitle: t('home.features.visualization.subtitle'),
            description: t('home.features.visualization.description'),
            icon: <BarChartOutlined style={{ fontSize: '36px', color: '#fff' }} />,
            bgIcon: <BarChartOutlined />,
            color: '#10b981', // Emerald
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            bg: 'rgba(16, 185, 129, 0.1)',
            stats: {
                charts: t('home.features.visualization.stats.charts'),
                formats: t('home.features.visualization.stats.formats'),
            },
            action: () => onNavigate('visualization')
        },
        {
            key: 'analysis',
            title: t('home.features.analysis.title'),
            subtitle: t('home.features.analysis.subtitle'),
            description: t('home.features.analysis.description'),
            icon: <FundOutlined style={{ fontSize: '36px', color: '#fff' }} />,
            bgIcon: <FundOutlined />,
            color: '#f59e0b', // Amber
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            bg: 'rgba(245, 158, 11, 0.1)',
            stats: {
                models: t('home.features.analysis.stats.models'),
                precision: t('home.features.analysis.stats.precision')
            },
            action: () => onNavigate('analysis')
        }
    ];

    return (
        <div className={`page-entry ${isVisible ? 'visible' : ''}`} style={{ paddingBottom: '60px' }}>

            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', marginBottom: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <RocketOutlined /> {t('home.hero.platformName')}
                    </div>

                    <Title level={1} className="hero-title">
                        {t('home.title')}
                    </Title>

                    <p className="hero-subtitle">
                        {t('home.subtitle')}
                    </p>

                    <Space size="large" style={{ marginTop: '20px' }}>
                        <button
                            onClick={() => onNavigate('extraction')}
                            style={{
                                padding: '12px 32px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                border: 'none',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {t('home.hero.getStarted')} <ArrowRightOutlined />
                        </button>

                        <button
                            onClick={() => window.open('https://wwwn.cdc.gov/nchs/nhanes/default.aspx', '_blank')}
                            style={{
                                padding: '12px 32px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                background: 'white',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                            }}
                        >
                            {t('home.hero.viewDocs')}
                        </button>
                    </Space>
                </div>
            </div>

            {/* Features Grid */}
            <div className="main-content-layout feature-grid">
                <Row gutter={[32, 32]} justify="center">
                    {features.map((feature, index) => (
                        <Col key={feature.key} xs={24} md={12} lg={8}>
                            <div
                                className="glass-card"
                                onClick={feature.action}
                                style={{
                                    padding: '40px 32px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`,
                                    opacity: 0,
                                    transform: 'translateY(20px)'
                                }}
                            >
                                {/* Background Decorative Icon */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    fontSize: '150px',
                                    opacity: 0.05,
                                    transform: 'rotate(15deg)',
                                    color: feature.color,
                                    pointerEvents: 'none'
                                }}>
                                    {feature.bgIcon}
                                </div>

                                <div className="feature-icon-wrapper" style={{ background: feature.gradient }}>
                                    {feature.icon}
                                </div>

                                <Title level={3} style={{ textAlign: 'center', marginBottom: '12px', fontSize: '1.5rem' }}>
                                    {feature.title}
                                </Title>

                                <Text style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '32px',
                                    lineHeight: '1.6'
                                }}>
                                    {feature.description}
                                </Text>

                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    paddingTop: '24px',
                                    borderTop: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    {Object.entries(feature.stats).map(([key, value]) => (
                                        <div key={key} className="stat-item">
                                            <div className="stat-value" style={{
                                                background: feature.gradient,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}>
                                                {value}
                                            </div>
                                            <div className="stat-label">{key}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Footer / Stats Section */}
            <div className="footer-section">
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <Title level={4} style={{ marginBottom: '40px', fontWeight: 300, color: 'var(--text-secondary)' }}>
                        {t('home.footer.trustedBy')}
                    </Title>
                    <Row gutter={[48, 24]} justify="center">
                        <Col>
                            <Space align="center" style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                <ThunderboltOutlined style={{ color: 'var(--primary-color)' }} />
                                <span>{t('home.footer.stats.realTime')}</span>
                            </Space>
                        </Col>
                        <Col>
                            <Space align="center" style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                <ExperimentOutlined style={{ color: 'var(--secondary-color)' }} />
                                <span>{t('home.footer.stats.accuracy')}</span>
                            </Space>
                        </Col>
                        <Col>
                            <Space align="center" style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                <DatabaseOutlined style={{ color: 'var(--accent-color)' }} />
                                <span>{t('home.footer.stats.complete')}</span>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default Home;