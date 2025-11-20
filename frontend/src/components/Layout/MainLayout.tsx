import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Typography, Space } from 'antd';
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

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
      key: '/',
      icon: <HomeOutlined />,
      label: t('home.features.dataExtraction.title'), // Fallback or specific home title
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
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path.startsWith('/extraction')) return '/extraction';
    if (path.startsWith('/visualization')) return '/visualization';
    if (path.startsWith('/analysis')) return '/analysis';
    return '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <div className="header-content">
          <Space>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ marginRight: 8 }}
              />
            )}
            <div className="logo-container">
              <DatabaseOutlined className="logo-icon" />
              <Title level={3} className="logo-text">
                {isMobile ? 'NHANES' : t('home.title')}
              </Title>
            </div>
          </Space>
          <Space>
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              className="lang-switch-btn"
            >
              {i18n.language === 'zh' ? 'EN' : '中文'}
            </Button>
          </Space>
        </div>
      </Header>

      <Layout>
        {!isMobile && (
          <Sider width={240} className="app-sider" theme="light">
            <Menu
              mode="inline"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              onClick={({ key }) => handleMenuClick(key)}
              className="app-menu"
            />
          </Sider>
        )}

        <Drawer
          title={t('home.title')}
          placement="left"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          className="mobile-drawer"
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{ borderRight: 0 }}
          />
        </Drawer>

        <Layout className="main-content-layout">
          <Content className="main-content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
