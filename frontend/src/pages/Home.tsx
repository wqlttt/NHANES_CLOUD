import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Typography,
    Card,
    Row,
    Col,
    Button,
    Space,
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
    const [isMobile, setIsMobile] = useState(false);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const mainFeatures = [
        {
            title: t('home.features.dataExtraction.title'),
            subtitle: t('home.features.dataExtraction.subtitle'),
            description: t('home.features.dataExtraction.description'),
            icon: <DatabaseOutlined style={{ fontSize: '52px', color: '#1890ff' }} />,
            features: [
                {
                    name: t('home.features.dataExtraction.features.customExtraction.name'),
                    detail: t('home.features.dataExtraction.features.customExtraction.detail')
                },
                {
                    name: t('home.features.dataExtraction.features.presetVariables.name'),
                    detail: t('home.features.dataExtraction.features.presetVariables.detail')
                },
                {
                    name: t('home.features.dataExtraction.features.secondaryIndicators.name'),
                    detail: t('home.features.dataExtraction.features.secondaryIndicators.detail')
                },
                {
                    name: t('home.features.dataExtraction.features.mortalityData.name'),
                    detail: t('home.features.dataExtraction.features.mortalityData.detail')
                }
            ],
            stats: {
                samples: t('home.features.dataExtraction.stats.samples'),
                variables: t('home.features.dataExtraction.stats.variables'),
                cycles: t('home.features.dataExtraction.stats.cycles')
            },
            action: () => onNavigate('extraction'),
            color: '#1890ff',
            gradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
        },
        {
            title: t('home.features.visualization.title'),
            subtitle: t('home.features.visualization.subtitle'),
            description: t('home.features.visualization.description'),
            icon: <BarChartOutlined style={{ fontSize: '52px', color: '#52c41a' }} />,
            features: [
                {
                    name: t('home.features.visualization.features.chartTypes.name'),
                    detail: t('home.features.visualization.features.chartTypes.detail')
                },
                {
                    name: t('home.features.visualization.features.interactiveConfig.name'),
                    detail: t('home.features.visualization.features.interactiveConfig.detail')
                },
                {
                    name: t('home.features.visualization.features.realTimePreview.name'),
                    detail: t('home.features.visualization.features.realTimePreview.detail')
                },
                {
                    name: t('home.features.visualization.features.highQualityExport.name'),
                    detail: t('home.features.visualization.features.highQualityExport.detail')
                }
            ],
            stats: {
                charts: t('home.features.visualization.stats.charts'),
                formats: t('home.features.visualization.stats.formats'),
                resolution: t('home.features.visualization.stats.resolution')
            },
            action: () => onNavigate('visualization'),
            color: '#52c41a',
            gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
        },
        {
            title: t('home.features.analysis.title'),
            subtitle: t('home.features.analysis.subtitle'),
            description: t('home.features.analysis.description'),
            icon: <FundOutlined style={{ fontSize: '52px', color: '#faad14' }} />,
            features: [
                {
                    name: t('home.features.analysis.features.descriptiveStats.name'),
                    detail: t('home.features.analysis.features.descriptiveStats.detail')
                },
                {
                    name: t('home.features.analysis.features.hypothesisTesting.name'),
                    detail: t('home.features.analysis.features.hypothesisTesting.detail')
                },
                {
                    name: t('home.features.analysis.features.regression.name'),
                    detail: t('home.features.analysis.features.regression.detail')
                },
                {
                    name: t('home.features.analysis.features.survivalAnalysis.name'),
                    detail: t('home.features.analysis.features.survivalAnalysis.detail')
                }
            ],
            stats: {
                methods: t('home.features.analysis.stats.methods'),
                models: t('home.features.analysis.stats.models'),
                precision: t('home.features.analysis.stats.precision')
            },
            action: () => onNavigate('analysis'),
            color: '#faad14',
            gradient: 'linear-gradient(135deg, #faad14 0%, #ffd666 100%)'
        }
    ];

    return (
        <div style={{
            padding: isMobile ? '20px 8px' : '60px 24px',
            background: 'transparent',
            minHeight: 'calc(100vh - 128px)',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            {/* 头部标题 */}
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '30px' : '60px' }}>
                <Title level={isMobile ? 2 : 1} style={{
                    color: '#1890ff',
                    marginBottom: '16px',
                    fontSize: isMobile ? '24px' : undefined
                }}>
                    {t('home.title')}
                </Title>
                <Text style={{ fontSize: isMobile ? '14px' : '16px', color: '#666' }}>
                    {t('home.subtitle')}
                </Text>
            </div>

            {/* 主要功能模块 */}
            <div>
                <Row gutter={[24, 24]} justify="center" align="stretch" style={{ margin: '0 -12px' }}>
                    {mainFeatures.map((feature, index) => (
                        <Col key={index} xs={24} sm={24} md={8} lg={8} xl={8} style={{ display: 'flex' }}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    width: '100%',
                                    borderRadius: '16px',
                                    border: `2px solid ${feature.color}`,
                                    background: '#fff',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    boxShadow: `0 8px 32px ${feature.color}20`,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                hoverable
                                bodyStyle={{
                                    padding: '24px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '16px'
                                }}
                                onClick={feature.action}
                            >
                                <div>
                                    {/* 图标和标题区域 */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            background: `${feature.color}15`,
                                            borderRadius: '50%',
                                            width: isMobile ? '60px' : '80px',
                                            height: isMobile ? '60px' : '80px',
                                            margin: '0 auto 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {React.cloneElement(feature.icon, {
                                                style: {
                                                    fontSize: isMobile ? '40px' : '52px',
                                                    color: feature.color
                                                }
                                            })}
                                        </div>

                                        <Title level={3} style={{
                                            color: feature.color,
                                            marginBottom: '4px',
                                            fontSize: isMobile ? '18px' : '20px'
                                        }}>
                                            {feature.title}
                                        </Title>

                                        <Text style={{
                                            fontSize: isMobile ? '11px' : '12px',
                                            color: '#999',
                                            fontWeight: 500,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {feature.subtitle}
                                        </Text>
                                    </div>

                                    {/* 描述文字 */}
                                    <Text style={{
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: '#666',
                                        marginBottom: '20px',
                                        display: 'block',
                                        lineHeight: '1.5'
                                    }}>
                                        {feature.description}
                                    </Text>

                                    {/* 功能特性列表 */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        width: '100%',
                                        marginBottom: '24px'
                                    }}>
                                        {feature.features.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="feature-item"
                                                style={{
                                                    padding: '12px 16px',
                                                    background: '#f8f8f8',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${feature.color}15`,
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    minHeight: '64px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: feature.color,
                                                    marginBottom: '4px'
                                                }}>
                                                    {item.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    lineHeight: '1.5',
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {item.detail}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 统计数据 */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '24px',
                                        gap: '12px'
                                    }}>
                                        {Object.entries(feature.stats).map(([key, value]) => (
                                            <div key={key} style={{
                                                textAlign: 'center',
                                                flex: 1,
                                                padding: '12px 8px',
                                                background: `${feature.color}05`,
                                                borderRadius: '8px',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    fontSize: '22px',
                                                    fontWeight: 'bold',
                                                    color: feature.color,
                                                    marginBottom: '4px',
                                                    lineHeight: 1
                                                }}>
                                                    {value}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    textTransform: 'capitalize',
                                                    fontWeight: 500
                                                }}>
                                                    {key}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{
                                        background: feature.gradient,
                                        borderColor: feature.color,
                                        height: '48px',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    icon={<ArrowRightOutlined style={{ fontSize: '16px' }} />}
                                >
                                    {t(`home.features.${feature === mainFeatures[0] ? 'dataExtraction' : feature === mainFeatures[1] ? 'visualization' : 'analysis'}.button`)}
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 底部说明 */}
            <div style={{
                textAlign: 'center',
                marginTop: isMobile ? '30px' : '60px',
                padding: isMobile ? '16px' : '24px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <Title level={4} style={{
                    marginBottom: '16px',
                    color: '#333',
                    fontSize: isMobile ? '16px' : undefined
                }}>{t('home.introduction.title')}</Title>
                <Row gutter={[isMobile ? 16 : 24, 16]}>
                    <Col xs={24} md={8}>
                        <Text strong style={{
                            color: '#1890ff',
                            fontSize: isMobile ? '14px' : undefined
                        }}>{t('home.introduction.dataExtraction.title')}</Text>
                        <br />
                        <Text style={{
                            color: '#666',
                            fontSize: isMobile ? '13px' : undefined
                        }}>{t('home.introduction.dataExtraction.description')}</Text>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{
                            color: '#52c41a',
                            fontSize: isMobile ? '14px' : undefined
                        }}>{t('home.introduction.visualization.title')}</Text>
                        <br />
                        <Text style={{
                            color: '#666',
                            fontSize: isMobile ? '13px' : undefined
                        }}>{t('home.introduction.visualization.description')}</Text>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{
                            color: '#faad14',
                            fontSize: isMobile ? '14px' : undefined
                        }}>{t('home.introduction.analysis.title')}</Text>
                        <br />
                        <Text style={{
                            color: '#666',
                            fontSize: isMobile ? '13px' : undefined
                        }}>{t('home.introduction.analysis.description')}</Text>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Home; 