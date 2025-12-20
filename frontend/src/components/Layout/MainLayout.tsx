import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Typography, Space, Tooltip } from 'antd';
import {
  DatabaseOutlined,
  BarChartOutlined,
  FundOutlined,
  HomeOutlined,
  GlobalOutlined,
  MenuOutlined,
  ToolOutlined
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
      key: '/processing',
      icon: <ToolOutlined />,
      label: 'Data Processing',
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
      <Header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
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
            >
              <div className="logo-icon-wrapper">
                <DatabaseOutlined />
              </div>
              {!isMobile && (
                <span className="logo-text">
                  NHANES<span>Cloud</span>
                </span>
              )}
            </div>

            {!isMobile && (
              <div style={{ marginLeft: '40px' }}>
                <div className="nav-menu-wrapper">
                  <Menu
                    mode="horizontal"
                    selectedKeys={[currentPath]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                  />
                </div>
              </div>
            )}
          </Space>

          <Space>
            <Tooltip title="Switch Language">
              <Button
                className="lang-switch-btn"
                type="default"
                shape="round"
                icon={<GlobalOutlined />}
                onClick={toggleLanguage}
              />
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
