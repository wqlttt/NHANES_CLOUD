import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, Typography, Space, Button, Drawer } from 'antd';
import { DatabaseOutlined, BarChartOutlined, FundOutlined, HomeOutlined, GlobalOutlined, MenuOutlined } from '@ant-design/icons';
import Home from './pages/Home';
import DataExtraction from './pages/DataExtraction';
import DataVisualization from './pages/DataVisualization';
import DataAnalysis from './pages/DataAnalysis';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

type PageKey = 'home' | 'extraction' | 'visualization' | 'analysis';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { t, i18n } = useTranslation();

  // 检测屏幕尺寸变化
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

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('home.features.dataExtraction.title'),
    },
    {
      key: 'extraction',
      icon: <DatabaseOutlined />,
      label: t('home.features.dataExtraction.title'),
    },
    {
      key: 'visualization',
      icon: <BarChartOutlined />,
      label: t('home.features.visualization.title'),
    },
    {
      key: 'analysis',
      icon: <FundOutlined />,
      label: t('home.features.analysis.title'),
    },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(nextLang);
  };

  const handleMenuClick = (key: string) => {
    setCurrentPage(key as PageKey);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'extraction':
        return <DataExtraction />;
      case 'visualization':
        return <DataVisualization />;
      case 'analysis':
        return <DataAnalysis />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: isMobile ? '0 16px' : '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <Space>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ marginRight: 8 }}
              />
            )}
            <DatabaseOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#1890ff' }} />
            <Title level={3} style={{
              margin: 0,
              color: '#1890ff',
              fontSize: isMobile ? '16px' : '20px'
            }}>
              {isMobile ? 'NHANES' : t('home.title')}
            </Title>
          </Space>
          <Space>
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              style={{
                color: '#000',
                fontSize: isMobile ? '12px' : '14px'
              }}
              size={isMobile ? 'small' : 'middle'}
            >
              {i18n.language === 'zh' ? 'EN' : '中文'}
            </Button>
          </Space>
        </div>
      </Header>

      <Layout>
        {/* 桌面端侧边栏 */}
        {!isMobile && (
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              selectedKeys={[currentPage]}
              style={{
                height: '100%',
                borderRight: 0,
                background: '#fff'
              }}
              theme="light"
              items={menuItems}
              onClick={({ key }) => handleMenuClick(key)}
            />
          </Sider>
        )}

        {/* 移动端抽屉菜单 */}
        <Drawer
          title={t('home.title')}
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            style={{
              height: '100%',
              borderRight: 0,
              background: '#fff'
            }}
            theme="light"
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Drawer>

        <Layout style={{
          padding: isMobile ? '12px' : '24px',
          background: '#f5f5f5'
        }}>
          <Content
            style={{
              background: '#fff',
              padding: isMobile ? 12 : 24,
              margin: 0,
              minHeight: 280,
              borderRadius: '8px',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
