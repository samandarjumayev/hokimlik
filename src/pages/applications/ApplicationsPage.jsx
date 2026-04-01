import { useState, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  message,
  Dropdown,
  Space,
  Avatar,
  Badge,
  Statistic,
  Tooltip,
  Tabs,
  Empty,
  Progress,
  Divider,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  PlusOutlined,
  FilterOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  FlagOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  PaperClipOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// STATUS MAP - Fixed for API data
const statusMap = {
  new: { 
    label: "Yangi", 
    color: "blue", 
    icon: <FileTextOutlined />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200"
  },
  in_review: { 
    label: "Ko'rib chiqilmoqda", 
    color: "orange", 
    icon: <EyeOutlined />,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200"
  },
  sent_to_mahalla: { 
    label: "Mahallaga yuborilgan", 
    color: "green", 
    icon: <SendOutlined />,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  acknowledged: { 
    label: "Qabul qilindi", 
    color: "cyan", 
    icon: <CheckCircleOutlined />,
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200"
  },
  inspected: { 
    label: "Tekshirildi", 
    color: "purple", 
    icon: <CheckCircleOutlined />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200"
  },
  closed: { 
    label: "Yopilgan", 
    color: "red", 
    icon: <CloseCircleOutlined />,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200"
  },
  archive: { 
    label: "Arxiv", 
    color: "default", 
    icon: <FileTextOutlined />,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200"
  },
  reopened: { 
    label: "Qayta ochilgan", 
    color: "orange", 
    icon: <ReloadOutlined />,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200"
  },
};

// PRIORITY MAP
const priorityMap = {
  urgent: { 
    label: "Shoshilinch", 
    color: "red", 
    icon: <FlagOutlined />,
    gradient: "from-red-500 to-red-600"
  },
  medium: { 
    label: "O‘rta", 
    color: "orange", 
    icon: <ClockCircleOutlined />,
    gradient: "from-orange-500 to-orange-600"
  },
  low: { 
    label: "Past", 
    color: "default", 
    icon: <CheckCircleOutlined />,
    gradient: "from-gray-500 to-gray-600"
  },
};

const appTypeOptions = [
  { value: 1, label: "Oddiy", icon: <FileTextOutlined /> },
  { value: 2, label: "Shoshilinch", icon: <ClockCircleOutlined /> },
];

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useSelector((state) => state.backend);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState();
  const [dateRange, setDateRange] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  // FETCH APPLICATIONS
  const { data: applications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/applications/");
      console.log(res.data.results);
      return res.data.results || [];
    },
  });

  // FETCH SERVICES
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/services/");
      return res.data.results || [];
    },
  });

  // FETCH MAHALLA LIST
  const { data: mahallaList = [] } = useQuery({
    queryKey: ["mahallaList"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/mahallas/");
      return res.data.results || [];
    },
  });

  // CREATE APPLICATION
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await baseURL.post("/v1/applications/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      messageApi.success({
        content: "Murojaat muvaffaqiyatli qo'shildi",
        icon: <CheckCircleOutlined />,
        duration: 3,
      });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      console.error("Create error:", error);
      messageApi.error("Murojaat qo'shishda xatolik yuz berdi");
    },
  });

  // STATUS ACTION
  const statusMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      const res = await baseURL.post(`/v1/applications/${id}/${action}/`);
      return res.data;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries(["applications"]);
      const actionMessages = {
        archive: "Ariza arxivlandi",
        close: "Ariza yopildi",
        reopen: "Ariza qayta ochildi",
        "send-to-mahalla": "Ariza mahallaga yuborildi",
      };
      messageApi.success(actionMessages[action] || "Status yangilandi");
    },
    onError: () => {
      messageApi.error("Amalni bajarishda xatolik yuz berdi");
    },
  });

  // ROLE BASED ACTIONS
  const getMenuItemsByRole = (role) => {
    if (role === "super_admin") {
      return ["archive", "close", "reopen", "send-to-mahalla", "attachments"];
    }
    if (role === "hokim") {
      return ["close", "reopen", "send-to-mahalla", "attachments"];
    }
    if (role === "xodim") {
      return ["attachments"];
    }
    return [];
  };

  const actionLabels = {
    archive: "Arxivlash",
    close: "Yopish",
    reopen: "Qayta ochish",
    "send-to-mahalla": "Mahallaga yuborish",
    attachments: "Fayllarni ko'rish",
  };

  // Statistics - Fixed division by zero
  const statistics = useMemo(() => {
    const total = applications.length;
    const newCount = applications.filter(a => a.status === "new").length;
    const inReviewCount = applications.filter(a => a.status === "in_review").length;
    const sentToMahallaCount = applications.filter(a => a.status === "sent_to_mahalla").length;
    const acknowledgedCount = applications.filter(a => a.status === "acknowledged").length;
    const inspectedCount = applications.filter(a => a.status === "inspected").length;
    const closedCount = applications.filter(a => a.status === "closed").length;
    const highPriorityCount = applications.filter(a => a.priority === "high" || a.priority === "urgent").length;
    
    const getPercent = (value) => total === 0 ? 0 : (value / total) * 100;
    
    return { total, newCount, inReviewCount, sentToMahallaCount, acknowledgedCount, inspectedCount, closedCount, highPriorityCount, getPercent };
  }, [applications]);

  // FILTERING
  const filtered = useMemo(() => {
    let filteredData = applications.filter((a) => {
      const matchSearch =
        !search ||
        a.citizen_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(a.id).includes(search) ||
        a.app_number?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = !statusFilter || a.status === statusFilter;

      const created = new Date(a.created_at).getTime();
      const matchDate =
        !dateRange.length ||
        (created >= dateRange[0]?.startOf("day").valueOf() &&
          created <= dateRange[1]?.endOf("day").valueOf());

      return matchSearch && matchStatus && matchDate;
    });

    if (activeTab === "new") {
      filteredData = filteredData.filter(a => a.status === "new");
    } else if (activeTab === "in_review") {
      filteredData = filteredData.filter(a => a.status === "in_review");
    } else if (activeTab === "sent_to_mahalla") {
      filteredData = filteredData.filter(a => a.status === "sent_to_mahalla");
    } else if (activeTab === "closed") {
      filteredData = filteredData.filter(a => a.status === "closed");
    } else if (activeTab === "high-priority") {
      filteredData = filteredData.filter(a => a.priority === "high" || a.priority === "urgent");
    }

    return filteredData;
  }, [applications, search, statusFilter, dateRange, activeTab]);

  // CREATE HANDLER
  const handleCreate = () => {
    form.validateFields().then((values) => {
      createMutation.mutate({
        ...values,
        deadline: values.deadline?.format("YYYY-MM-DD"),
        status: "new",
      });
    });
  };

  // ACTION HANDLER
  const handleAction = (e, id, action) => {
    e.stopPropagation();
    if (action === "attachments") {
      navigate(`/dashboard/applications/${id}`);
    } else {
      statusMutation.mutate({ id, action });
    }
  };

  // TABLE COLUMNS
  const columns = [
    {
      title: "№",
      dataIndex: "id",
      width: 80,
      render: (v) => (
        <div className="flex items-center justify-center">
          <Badge 
            count={`#${v}`} 
            style={{ backgroundColor: "#f0f0f0", color: "#666" }}
          />
        </div>
      ),
    },
    {
      title: "Fuqaro",
      dataIndex: "citizen_name",
      width: 200,
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-500" />
          <div>
            <Text strong className="block">{name}</Text>
            <Text type="secondary" className="text-xs">
              {record.citizen_phone || "Telefon yo'q"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Holat",
      dataIndex: "status",
      width: 160,
      render: (s) => {
        const st = statusMap[s] || { label: s || "Noma'lum", color: "default", icon: <FileTextOutlined />, bgColor: "bg-gray-50", textColor: "text-gray-700" };
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${st.bgColor} ${st.textColor}`}>
            {st.icon}
            <span className="text-sm font-medium">{st.label}</span>
          </div>
        );
      },
    },
    {
      title: "Muhimlik",
      dataIndex: "priority",
      width: 120,
      render: (p) => {
        const pr = priorityMap[p] || { label: p || "Oddiy", color: "default", icon: <FileTextOutlined /> };
        return (
          <Tag 
            color={pr.color} 
            icon={pr.icon}
            className="!rounded-full !px-3 !py-1"
          >
            {pr.label}
          </Tag>
        );
      },
    },
    {
      title: "Ariza raqami",
      dataIndex: "app_number",
      width: 120,
      render: (num) => (
        <Text code className="text-sm">{num || "-"}</Text>
      ),
    },
    {
      title: "Yaratilgan sana",
      dataIndex: "created_at",
      width: 160,
      render: (d) => (
        <Tooltip title={dayjs(d).format("DD.MM.YYYY HH:mm")}>
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
      render: (_, record) => {
        const actions = getMenuItemsByRole(role);
        if (actions.length === 0) return null;

        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: actions.map((action) => ({
                key: action,
                label: (
                  <Button
                    type="text"
                    icon={
                      action === "archive" ? <FileTextOutlined /> :
                      action === "close" ? <CloseCircleOutlined /> :
                      action === "reopen" ? <ReloadOutlined /> :
                      action === "send-to-mahalla" ? <SendOutlined /> :
                      <EyeOutlined />
                    }
                    style={{ width: "100%", textAlign: "left" }}
                    onClick={(e) => handleAction(e, record.id, action)}
                  >
                    {actionLabels[action]}
                  </Button>
                ),
              })),
            }}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />}
              className="hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {contextHolder}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className=" sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Title level={3} className="!mb-1">Murojaatlar</Title>
              <Text type="secondary">
                Barcha murojaatlarni boshqaring va kuzating
              </Text>
            </div>
            
            {(role === "xodim" || role === "super_admin") && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                size="large"
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                Yangi murojaat
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Jami murojaatlar"
                value={statistics.total}
                prefix={<DashboardOutlined className="text-blue-500" />}
                valueStyle={{ color: "#3b82f6" }}
              />
              <Progress 
                percent={100} 
                showInfo={false} 
                strokeColor="#3b82f6" 
                size="small" 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Yangi"
                value={statistics.newCount}
                prefix={<FileTextOutlined className="text-blue-500" />}
                valueStyle={{ color: "#3b82f6" }}
              />
              <Progress 
                percent={statistics.getPercent(statistics.newCount)} 
                showInfo={false} 
                strokeColor="#3b82f6" 
                size="small" 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Mahallaga yuborilgan"
                value={statistics.sentToMahallaCount}
                prefix={<SendOutlined className="text-green-500" />}
                valueStyle={{ color: "#10b981" }}
              />
              <Progress 
                percent={statistics.getPercent(statistics.sentToMahallaCount)} 
                showInfo={false} 
                strokeColor="#10b981" 
                size="small" 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Yopilgan"
                value={statistics.closedCount}
                prefix={<CloseCircleOutlined className="text-red-500" />}
                valueStyle={{ color: "#ef4444" }}
              />
              <Progress 
                percent={statistics.getPercent(statistics.closedCount)} 
                showInfo={false} 
                strokeColor="#ef4444" 
                size="small" 
              />
            </Card>
          </Col>
        </Row>

        {/* Main Card */}
        <Card className="shadow-sm rounded-xl border-0">
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: "all", label: "Barchasi" },
              { key: "new", label: "Yangi" },
              { key: "in_review", label: "Ko'rib chiqilmoqda" },
              { key: "sent_to_mahalla", label: "Mahallaga yuborilgan" },
              { key: "closed", label: "Yopilgan" },
              { key: "high-priority", label: "Yuqori muhimlik" },
            ]}
            className="mb-4"
          />

          {/* Filters Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <Space>
                <FilterOutlined className="text-gray-500" />
                <Text strong>Filterlar</Text>
              </Space>
              <Button 
                type="text" 
                size="small"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Yashirish" : "Ko'rsatish"}
              </Button>
            </div>
            
            {showFilters && (
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Qidirish (nomi, ID, raqam)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg"
                    allowClear
                  />
                </Col>

                <Col xs={12} sm={5}>
                  <Select
                    placeholder="Holat bo'yicha"
                    allowClear
                    style={{ width: "100%" }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="rounded-lg"
                    options={Object.entries(statusMap).map(([k, v]) => ({
                      value: k,
                      label: (
                        <Space>
                          {v.icon}
                          {v.label}
                        </Space>
                      ),
                    }))}
                  />
                </Col>

                <Col xs={24} sm={6}>
                  <RangePicker
                    style={{ width: "100%" }}
                    onChange={(v) => setDateRange(v || [])}
                    className="rounded-lg"
                    placeholder={["Boshlanish", "Tugash"]}
                  />
                </Col>

                <Col xs={12} sm={5}>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setSearch("");
                      setStatusFilter(undefined);
                      setDateRange([]);
                      refetch();
                    }}
                    className="w-full"
                  >
                    Tozalash
                  </Button>
                </Col>
              </Row>
            )}
          </div>

          <Divider className="my-4" />

          {/* Table */}
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => navigate(`/dashboard/applications/${record.id}`),
              className: "cursor-pointer hover:bg-gray-50 transition-colors",
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: (
                <Empty
                  description="Hech qanday murojaat topilmadi"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-blue-500" />
            <span>Yangi murojaat qo'shish</span>
          </div>
        }
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending}
        width={700}
        okText="Saqlash"
        cancelText="Bekor qilish"
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="app_number" 
                label="Ariza raqami" 
                rules={[{ required: true, message: "Ariza raqamini kiriting" }]}
              >
                <Input placeholder="Masalan: A-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="service" 
                label="Xizmat turi" 
                rules={[{ required: true, message: "Xizmat turini tanlang" }]}
              >
                <Select
                  placeholder="Xizmat turini tanlang"
                  options={services.map(s => ({ value: s.id, label: s.name }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="app_type" 
            label="Murojaat turi" 
            rules={[{ required: true }]}
          >
            <Select 
              options={appTypeOptions.map(t => ({
                value: t.value,
                label: (
                  <Space>
                    {t.icon}
                    {t.label}
                  </Space>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item 
            name="content" 
            label="Matn" 
            rules={[{ required: true, message: "Matnni kiriting" }]}
          >
            <Input.TextArea rows={3} placeholder="Murojaat matnini kiriting..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="citizen_name" 
                label="Fuqaro ismi" 
                rules={[{ required: true }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ism familiya" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="citizen_phone" label="Telefon raqami">
                <Input prefix={<PhoneOutlined />} placeholder="+998 90 123 45 67" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="address_text" 
            label="Manzil" 
            rules={[{ required: true }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="To'liq manzil" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="mahalla" 
                label="Mahalla" 
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Mahallani tanlang"
                  options={mahallaList.map((m) => ({
                    value: m.id,
                    label: m.name,
                  }))}
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="priority" 
                label="Muhimlik" 
                rules={[{ required: true }]}
              >
                <Select
                  options={Object.entries(priorityMap).map(([k, v]) => ({
                    value: k,
                    label: (
                      <Tag color={v.color} icon={v.icon}>
                        {v.label}
                      </Tag>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="deadline" 
            label="Bajarish muddati" 
            rules={[{ required: true }]}
          >
            <DatePicker 
              style={{ width: "100%" }} 
              format="DD.MM.YYYY"
              placeholder="Muddatni tanlang"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApplicationsPage;