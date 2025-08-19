import { useState, useEffect } from 'react';
import { getResponsiveConfig, detectDeviceType } from '../utils/responsive';

export const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            const mobile = width <= 768;
            const tablet = width > 768 && width <= 1024;

            setIsMobile(mobile);
            setIsTablet(tablet);
            setDeviceType(detectDeviceType());
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const config = getResponsiveConfig(isMobile);

    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        deviceType,
        config,
    };
};
