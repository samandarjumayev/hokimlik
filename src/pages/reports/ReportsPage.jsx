import { Card, Table, Tag, Typography, Space, Avatar, Badge, Tooltip, Button, Modal, Descriptions, Row, Col, Empty, Divider, Progress, Timeline, Statistic } from "antd";
import { 
  EyeOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  MessageOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/uz-latn';

dayjs.extend(relativeTime);
dayjs.locale('uz-latn');

const { Title, Text, Paragraph } = Typography;

// Action type mapping
const actionTypeMap = {
  acknowledged: { 
    label: "Ko'rdim", 
    color: "blue", 
    icon: <EyeOutlined />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700"
  },
  inspected: { 
    label: "Joyida o'rgandim", 
    color: "green", 
    icon: <CheckCircleOutlined />,
    bgColor: "bg-green-50",
    textColor: "text-green-700"
  },
  commented: { 
    label: "Izoh qoldirildi", 
    color: "orange", 
    icon: <MessageOutlined />,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700"
  },
};

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch reports with pagination
  const { data: reportsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports-with-users", page, pageSize],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/mahalla-reports/?page=${page}&page_size=${pageSize}`);
      const reportsData = res.data.results || [];
      const totalCount = res.data.count || 0;
      const nextPage = res.data.next;
      const previousPage = res.data.previous;
      
      // Get unique oqsoqol IDs
      const userIds = [...new Set(reportsData.map((r) => r.oqsoqol))];

      // Fetch users
      const users = await Promise.all(
        userIds.map((id) =>
          baseURL.get(`/v1/users/${id}/`).then((res) => res.data)
        )
      );

      // Create user map
      const userMap = {};
      users.forEach((u) => {
        userMap[u.id] = u;
      });

      // Enrich reports with user data
      const enrichedReports = reportsData.map((r) => ({
        ...r,
        key: r.id,
        oqsoqol_name: userMap[r.oqsoqol]?.full_name || userMap[r.oqsoqol]?.username || `ID: ${r.oqsoqol}`,
        oqsoqol_phone: userMap[r.oqsoqol]?.phone || "-",
      }));

      return {
        results: enrichedReports,
        count: totalCount,
        next: nextPage,
        previous: previousPage,
      };
    },
    keepPreviousData: true,
  });

  // Fetch application details when modal opens
  const fetchApplicationDetails = async (applicationId) => {
    setLoadingApp(true);
    try {
      const res = await baseURL.get(`/v1/applications/${applicationId}/`);
      setApplicationDetails(res.data);
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoadingApp(false);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
    fetchApplicationDetails(report.application);
  };

  // Status mapping for applications
  const statusMap = {
    new: { label: "Yangi", color: "blue" },
    in_review: { label: "Ko'rib chiqilmoqda", color: "orange" },
    sent_to_mahalla: { label: "Mahallaga yuborilgan", color: "purple" },
    acknowledged: { label: "Oqsoqol ko'rdi", color: "cyan" },
    inspected: { label: "Joyida o'rganildi", color: "green" },
    closed: { label: "Yopilgan", color: "red" },
    archived: { label: "Arxiv", color: "default" },
    reopened: { label: "Qayta ochilgan", color: "orange" },
  };

  const priorityMap = {
    high: { label: "Yuqori", color: "red" },
    medium: { label: "O‘rta", color: "blue" },
    low: { label: "Past", color: "default" },
    urgent: { label: "Shoshilinch", color: "red" },
  };

  // Table columns
  const columns = [
    {
      title: "hisobot №",
      dataIndex: "application",
      width: 100,
      render: (v) => (
        <Badge 
          count={`#${v}`} 
          style={{ backgroundColor: "#f0f0f0", color: "#666" }}
          className="font-mono"
        />
      ),
    },
    {
      title: "Oqsoqol",
      dataIndex: "oqsoqol_name",
      width: 200,
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} className="bg-blue-100" size={32} />
          <div>
            <Text strong className="block">{name}</Text>
            <Text type="secondary" className="text-xs">{record.oqsoqol_phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Amaliyot",
      dataIndex: "action_type",
      width: 150,
      render: (v) => {
        const action = actionTypeMap[v] || { label: v, color: "default", icon: <EyeOutlined /> };
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${action.bgColor} ${action.textColor}`}>
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </div>
        );
      },
    },
    {
      title: "Izoh",
      dataIndex: "comment_text",
      ellipsis: true,
      width: 300,
      render: (text) => (
        <Tooltip title={text}>
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-gray-400" />
            <Text className="text-gray-600">{text || "—"}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Telegram ID",
      dataIndex: "telegram_message_id",
      width: 120,
      render: (id) => (
        <Text code className="text-xs">{id || "—"}</Text>
      ),
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      width: 180,
      render: (d) => (
        <Tooltip title={dayjs(d).format("DD.MM.YYYY HH:mm:ss")}>
          <div className="flex flex-col">
            <Text className="text-sm">{dayjs(d).format("DD.MM.YYYY")}</Text>
            <Text type="secondary" className="text-xs">
              {dayjs(d).fromNow()}
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Amallar",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Batafsil ko'rish">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            className="hover:bg-blue-50"
          />
        </Tooltip>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  const reports = reportsData?.results || [];
  const total = reportsData?.count || 0;

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileTextOutlined className="text-blue-500 text-xl" />
                <Title level={3} className="!mb-0">
                  Mahalla hisobotlari
                </Title>
              </div>
              <Text type="secondary">
                Oqsoqollar tomonidan qoldirilgan hisobot va izohlar
              </Text>
            </div>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
            >
              Yangilash
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Main Table Card */}
        <Card className="border-0 shadow-sm rounded-xl">
          {reports.length === 0 ? (
            <Empty 
              description="Hech qanday hisobot topilmadi"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            />
          ) : (
            <Table
              dataSource={reports}
              columns={columns}
              rowKey="key"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage);
                  if (newPageSize !== pageSize) {
                    setPageSize(newPageSize);
                    setPage(1);
                  }
                },
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
              }}
              scroll={{ x: 1000 }}
              className="reports-table"
            />
          )}
        </Card>
      </div>

      {/* Application Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            <span>hisobot tafsilotlari</span>
            {selectedReport && (
              <Badge 
                count={`#${selectedReport.application}`}
                style={{ backgroundColor: "#f0f0f0", color: "#666" }}
                className="ml-2"
              />
            )}
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedReport(null);
          setApplicationDetails(null);
        }}
        footer={null}
        width={800}
        className="rounded-xl"
      >
        {loadingApp ? (
          <div className="py-12 flex justify-center">
            <Loader />
          </div>
        ) : applicationDetails ? (
          <div className="space-y-6">
            {/* Application Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary" className="text-sm">hisobot raqami</Text>
                  <Title level={4} className="!mb-0">#{applicationDetails.app_number || applicationDetails.id}</Title>
                </Col>
                <Col span={12}>
                  <Text type="secondary" className="text-sm">Holat</Text>
                  <div>
                    {(() => {
                      const st = statusMap[applicationDetails.status] || { label: applicationDetails.status, color: "default" };
                      return <Tag color={st.color}>{st.label}</Tag>;
                    })()}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Citizen Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserOutlined className="text-blue-500" />
                <Title level={5} className="!mb-0">Fuqaro ma'lumotlari</Title>
              </div>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Ism">{applicationDetails.citizen_name}</Descriptions.Item>
                <Descriptions.Item label="Telefon">{applicationDetails.citizen_phone || "-"}</Descriptions.Item>
                <Descriptions.Item label="Manzil" span={2}>{applicationDetails.address_text}</Descriptions.Item>
              </Descriptions>
            </div>

            {/* Application Content */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageOutlined className="text-green-500" />
                <Title level={5} className="!mb-0">hisobot mazmuni</Title>
              </div>
              <Paragraph className="bg-gray-50 p-3 rounded-lg">
                {applicationDetails.content}
              </Paragraph>
            </div>

            {/* Additional Info */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block mb-1">Prioritet</Text>
                  {(() => {
                    const pr = priorityMap[applicationDetails.priority] || { label: applicationDetails.priority || "Oddiy", color: "default" };
                    return <Tag color={pr.color}>{pr.label}</Tag>;
                  })()}
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block mb-1">Muddati</Text>
                  <Text strong>{applicationDetails.deadline ? dayjs(applicationDetails.deadline).format("DD.MM.YYYY") : "-"}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block mb-1">Yaratilgan</Text>
                  <Text>{dayjs(applicationDetails.created_at).format("DD.MM.YYYY HH:mm")}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block mb-1">Yopilgan</Text>
                  <Text>{applicationDetails.closed_at ? dayjs(applicationDetails.closed_at).format("DD.MM.YYYY HH:mm") : "-"}</Text>
                </div>
              </Col>
            </Row>

            {/* Report Info */}
            {selectedReport && (
              <div>
                <Divider />
                <div className="flex items-center gap-2 mb-3">
                  <MessageOutlined className="text-orange-500" />
                  <Title level={5} className="!mb-0">Oqsoqol hisoboti</Title>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar icon={<UserOutlined />} size="small" className="bg-orange-500" />
                    <Text strong>{selectedReport.oqsoqol_name}</Text>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${actionTypeMap[selectedReport.action_type]?.bgColor} ${actionTypeMap[selectedReport.action_type]?.textColor}`}>
                      {actionTypeMap[selectedReport.action_type]?.icon}
                      <span>{actionTypeMap[selectedReport.action_type]?.label}</span>
                    </div>
                  </div>
                  {selectedReport.comment_text && (
                    <Paragraph className="mt-2 mb-0">
                      <Text strong>Izoh: </Text>
                      {selectedReport.comment_text}
                    </Paragraph>
                  )}
                  <Text type="secondary" className="text-xs block mt-2">
                    {dayjs(selectedReport.created_at).format("DD.MM.YYYY HH:mm:ss")}
                  </Text>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Empty description="hisobot ma'lumotlari topilmadi" />
        )}
      </Modal>

      <style jsx>{`
        .reports-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .reports-table :global(.ant-table-tbody > tr:hover > td) {
          background: #f8fafc;
        }
        
        .reports-table :global(.ant-table-cell) {
          padding: 14px 16px !important;
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;