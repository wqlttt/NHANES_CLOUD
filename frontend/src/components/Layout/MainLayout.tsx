import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Typography, Space, Tooltip } from 'antd';
import {
  DatabaseOutlined,
  BarChartOutlined,
  FundOutlined,
  HomeOutlined,
  GlobalOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Header, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/extraction',
      icon: <DatabaseOutlined />,
      label: t('home.features.dataExtraction.title'),
    },
    {
      key: '/visualization',
      icon: <BarChartOutlined />,
      label: t('home.features.visualization.title'),
    },
    {
      key: '/analysis',
      icon: <FundOutlined />,
      label: t('home.features.analysis.title'),
    },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(nextLang);
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const currentPath = location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`;

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        className={`app-header ${isScrolled ? 'scrolled' : ''}`}
        style={{
          background: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
          transition: 'all 0.3s ease',
          padding: isMobile ? '0 16px' : '0 32px'
        }}
      >
        <div className="header-content">
          <Space size="large">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '1.2rem' }} />}
                onClick={() => setDrawerVisible(true)}
                style={{ marginRight: 8 }}
              />
            )}

            <div
              className="logo-container"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div style={{
                width: '36px', height: '36px',
                background: 'var(--gradient-primary)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
              }}>
                <DatabaseOutlined />
              </div>
              {!isMobile && (
                <span className="logo-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  NHANES<span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>Cloud</span>
                </span>
              )}
            </div>

            {!isMobile && (
              <div style={{ marginLeft: '40px' }}>
                <Menu
                  mode="horizontal"
                  selectedKeys={[currentPath]}
                  items={menuItems}
                  onClick={({ key }) => handleMenuClick(key)}
                  style={{
                    background: 'transparent',
                    borderBottom: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    minWidth: '400px'
                  }}
                />
              </div>
            )}
          </Space>

          <Space>
            <Tooltip title="Switch Language">
              <Button
                type="default"
                shape="round"
                icon={<GlobalOutlined />}
                onClick={toggleLanguage}
                style={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {i18n.language === 'zh' ? 'EN' : '中文'}
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Header>

      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ borderRight: 0 }}
        />
      </Drawer>

      <Content style={{ padding: 0 }}>
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;
