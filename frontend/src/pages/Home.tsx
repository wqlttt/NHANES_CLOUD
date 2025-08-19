import React, { useState, useEffect } from 'react';
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
            title: '数据提取',
            subtitle: 'Data Extraction',
            description: '从NHANES数据库中提取所需变量和样本，支持多种筛选条件和导出格式',
            icon: <DatabaseOutlined style={{ fontSize: '52px', color: '#1890ff' }} />,
            features: [
                { name: '自定义提取', detail: '灵活选择年份、文件名和指标' },
                { name: '预设变量组', detail: '快速选择常用变量组合' },
                { name: '二级指标提取', detail: '人口学、体格测量等分类指标' },
                { name: '死亡数据提取', detail: '获取死亡跟踪随访数据' }
            ],
            stats: { samples: '100万+', variables: '15000+', cycles: '20+' },
            action: () => onNavigate('extraction'),
            color: '#1890ff',
            gradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
        },
        {
            title: '数据可视化',
            subtitle: 'Data Visualization',
            description: '创建专业的统计图表和数据可视化，直观展示数据模式和趋势',
            icon: <BarChartOutlined style={{ fontSize: '52px', color: '#52c41a' }} />,
            features: [
                { name: '多种图表类型', detail: '柱状图、散点图、折线图等' },
                { name: '交互式配置', detail: '拖拽式变量配置界面' },
                { name: '实时预览', detail: '即时查看图表效果' },
                { name: '高质量导出', detail: '支持多种格式输出' }
            ],
            stats: { charts: '15+', formats: '5+', resolution: '4K' },
            action: () => onNavigate('visualization'),
            color: '#52c41a',
            gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
        },
        {
            title: '数据分析',
            subtitle: 'Statistical Analysis',
            description: '执行专业的统计分析方法，获得科学可靠的研究结论和洞察',
            icon: <FundOutlined style={{ fontSize: '52px', color: '#faad14' }} />,
            features: [
                { name: '描述性统计', detail: '均值、标准差、分布分析' },
                { name: '假设检验', detail: 'T检验、卡方检验等' },
                { name: '回归建模', detail: '线性、逻辑回归分析' },
                { name: '生存分析', detail: 'Cox回归、Kaplan-Meier' }
            ],
            stats: { methods: '20+', models: '10+', precision: '99.9%' },
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
                    NHANES 数据处理系统
                </Title>
                <Text style={{ fontSize: isMobile ? '14px' : '16px', color: '#666' }}>
                    美国国家健康与营养检查调查数据库处理平台
                </Text>
            </div>

            {/* 主要功能模块 */}
            <div>
                <Row gutter={[16, 24]} justify="center">
                    {mainFeatures.map((feature, index) => (
                        <Col key={index} xs={24} sm={24} md={12} lg={8} xl={8}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    height: isMobile ? 'auto' : '520px',
                                    minHeight: isMobile ? '400px' : undefined,
                                    borderRadius: '16px',
                                    border: `2px solid ${feature.color}`,
                                    background: '#fff',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    boxShadow: `0 8px 32px ${feature.color}20`
                                }}
                                hoverable
                                bodyStyle={{
                                    padding: isMobile ? '20px 16px' : '28px 20px',
                                    height: isMobile ? 'auto' : '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
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
                                    <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: '16px' }}>
                                        {feature.features.map((item, idx) => (
                                            <div key={idx} style={{
                                                padding: isMobile ? '8px 10px' : '10px 12px',
                                                background: '#f5f5f5',
                                                borderRadius: '8px',
                                                border: `1px solid ${feature.color}25`,
                                                textAlign: 'left'
                                            }}>
                                                <div style={{
                                                    fontSize: isMobile ? '12px' : '13px',
                                                    fontWeight: 600,
                                                    color: '#333',
                                                    marginBottom: '2px'
                                                }}>
                                                    {item.name}
                                                </div>
                                                <div style={{
                                                    fontSize: isMobile ? '10px' : '11px',
                                                    color: '#666',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {item.detail}
                                                </div>
                                            </div>
                                        ))}
                                    </Space>

                                    {/* 统计数据 */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-around',
                                        padding: isMobile ? '10px' : '12px',
                                        background: `${feature.color}08`,
                                        borderRadius: '8px',
                                        marginBottom: '16px'
                                    }}>
                                        {Object.entries(feature.stats).map(([key, value]) => (
                                            <div key={key} style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    fontSize: isMobile ? '12px' : '14px',
                                                    fontWeight: 'bold',
                                                    color: feature.color
                                                }}>
                                                    {value}
                                                </div>
                                                <div style={{
                                                    fontSize: isMobile ? '9px' : '10px',
                                                    color: '#666',
                                                    textTransform: 'capitalize'
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
                                    size={isMobile ? 'middle' : 'large'}
                                    style={{
                                        background: feature.gradient,
                                        borderColor: feature.color,
                                        marginTop: '16px',
                                        height: isMobile ? '36px' : '44px',
                                        fontSize: isMobile ? '13px' : '15px',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                    icon={<ArrowRightOutlined />}
                                >
                                    进入{feature.title}
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
                }}>功能简介</Title>
                <Row gutter={[isMobile ? 16 : 24, 16]}>
                    <Col xs={24} md={8}>
                        <Text strong style={{
                            color: '#1890ff',
                            fontSize: isMobile ? '14px' : undefined
                        }}>数据提取：</Text>
                        <br />
                        <Text style={{
                            color: '#666',
                            fontSize: isMobile ? '13px' : undefined
                        }}>快速筛选和导出NHANES数据库中的目标数据</Text>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{
                            color: '#52c41a',
                            fontSize: isMobile ? '14px' : undefined
                        }}>数据可视化：</Text>
                        <br />
                        <Text style={{
                            color: '#666',
                            fontSize: isMobile ? '13px' : undefined
                        }}>生成专业的统计图表，直观展示数据规律</Text>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{
                            color: '#faad14',
                            fontSize: isMobile ? '14px' : undefined
                        }}>数据分析：</Text>
                        <br />
                        <Text style={{
                            color: '#666',
                            fontSize: isMobile ? '13px' : undefined
                        }}>执行各种统计分析方法，获得科学结论</Text>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Home; 