import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import {
  HeartOutlined,
  GithubOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SafetyOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const { Text, Title, Link } = Typography;
const { Footer } = Layout;

const AppFooter = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const location = useLocation();

  // Check if we're on login page or admin pages
  const isLoginPage = location.pathname === "/login" || location.pathname === "/";
  const isAdminPage = location.pathname.includes("/dashboard");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Navigation links for admin pages
  const adminLinks = [
    { title: "Bosh sahifa", path: "/dashboard" },
    { title: "Murojaatlar", path: "/dashboard/applications" },
    { title: "Foydalanuvchilar", path: "/dashboard/users" },
    { title: "Statistika", path: "/dashboard/statistics" },
    { title: "Hisobotlar", path: "/dashboard/reports" },
  ];

  const serviceLinks = [
    { title: "IIB / Militsiya", path: "#" },
    { title: "Tez tibbiy yordam", path: "#" },
    { title: "Favqulodda vaziyatlar", path: "#" },
    { title: "Kommunal xizmatlar", path: "#" },
    { title: "Qurilish va arxitektura", path: "#" },
  ];

  const supportLinks = [
    { title: "Yordam markazi", path: "#" },
    { title: "Qo'llanma", path: "#" },
    { title: "FAQ", path: "#" },
    { title: "Aloqa", path: "#" },
    { title: "Texnik yordam", path: "#" },
  ];

  const socialLinks = [
    { icon: <MailOutlined />, name: "Email", link: "mailto:support@hms.uz" },
    { icon: <PhoneOutlined />, name: "Telefon", link: "tel:+998712345678" },
    { icon: <GlobalOutlined />, name: "Website", link: "#" },
    { icon: <GithubOutlined />, name: "GitHub", link: "#" },
  ];

  // Minimal footer for login page
  if (isLoginPage) {
    return (
      <Footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <SafetyOutlined className="text-blue-500 text-lg" />
              <Text type="secondary" className="text-sm">
                © {currentYear} Tuman Hokimligi Xizmatlar Monitoring Tizimi
              </Text>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-blue-500 text-sm">
                Maxfiylik siyosati
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-500 text-sm">
                Foydalanish shartlari
              </Link>
            </div>
          </div>
        </div>
      </Footer>
    );
  }

  return (
    <Footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-auto">
      {/* Scroll to top button */}
      {showScrollButton && (
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 shadow-lg z-50"
          size="large"
        />
      )}

      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Main Footer Content */}
        <Row gutter={[32, 32]}>
          {/* Brand Column */}
          <Col xs={24} md={8}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <SafetyOutlined className="text-blue-600 text-2xl" />
                <Title level={4} className="!mb-0 text-blue-600">
                  Xizmatlar Monitoring Tizimi
                </Title>
              </div>
              <Text className="text-gray-600 text-sm leading-relaxed">
                Fuqarolar murojaatlarini raqamli boshqarish va monitoring qilish tizimi.
                Hokimlik va xizmatlar o'rtasida samarali hamkorlik.
              </Text>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <EnvironmentOutlined className="text-gray-500" />
                <Text className="text-gray-600 text-sm">
                  O'zbekiston Respublikasi, Tuman Hokimligi
                </Text>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ClockCircleOutlined className="text-gray-500" />
                <Text className="text-gray-600 text-sm">
                  Ish vaqti: Du - Jum, 09:00 - 18:00
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <HeartOutlined className="text-red-500" />
                <Text className="text-gray-600 text-sm">
                  Xalq xizmatida
                </Text>
              </div>
            </div>
          </Col>

          {/* Admin Links */}
          {isAdminPage && (
            <Col xs={24} sm={12} md={4}>
              <Title level={5} className="!mb-4 text-gray-800">
                Navigatsiya
              </Title>
              <ul className="list-none p-0 m-0 space-y-2">
                {adminLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.path}
                      className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>
          )}

          {/* Services Links */}
          <Col xs={24} sm={12} md={4}>
            <Title level={5} className="!mb-4 text-gray-800">
              Xizmatlar
            </Title>
            <ul className="list-none p-0 m-0 space-y-2">
              {serviceLinks.map((service, index) => (
                <li key={index}>
                  <Link
                    href={service.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Support Links */}
          <Col xs={24} sm={12} md={4}>
            <Title level={5} className="!mb-4 text-gray-800">
              Yordam
            </Title>
            <ul className="list-none p-0 m-0 space-y-2">
              {supportLinks.map((support, index) => (
                <li key={index}>
                  <Link
                    href={support.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                  >
                    {support.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Contact Column */}
          <Col xs={24} sm={12} md={4}>
            <Title level={5} className="!mb-4 text-gray-800">
              Bog'lanish
            </Title>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MailOutlined className="text-gray-500" />
                <Link href="mailto:support@hms.uz" className="text-gray-600 hover:text-blue-600 text-sm">
                  support@hms.uz
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-gray-500" />
                <Link href="tel:+998712345678" className="text-gray-600 hover:text-blue-600 text-sm">
                  +998 71 234-56-78
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-gray-500" />
                <Text className="text-gray-600 text-sm">
                  Ishonch telefoni: 1146
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Divider className="my-8" />

        {/* Bottom Bar */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div className="flex flex-wrap items-center gap-3">
              <Text className="text-gray-500 text-sm">
                © {currentYear} Tuman Hokimligi Xizmatlar Monitoring Tizimi
              </Text>
              <span className="text-gray-300 hidden md:inline">|</span>
              <Text className="text-gray-500 text-sm">
                Barcha huquqlar himoyalangan
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex flex-wrap justify-start md:justify-end gap-4">
              <Link href="#" className="text-gray-500 hover:text-blue-600 text-sm">
                Maxfiylik siyosati
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 text-sm">
                Foydalanish shartlari
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 text-sm">
                Cookie siyosati
              </Link>
            </div>
          </Col>
        </Row>

        {/* Trust Badge */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <SafetyOutlined className="text-green-500 text-lg" />
              <Text className="text-gray-500 text-xs">SSL Sertifikatlangan</Text>
            </div>
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-blue-500 text-lg" />
              <Text className="text-gray-500 text-xs">24/7 Texnik qo'llab-quvvatlash</Text>
            </div>
            <div className="flex items-center gap-2">
              <HeartOutlined className="text-red-500 text-lg" />
              <Text className="text-gray-500 text-xs">O'zbekiston davlat standarti</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient bar */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
    </Footer>
  );
};

export default AppFooter;