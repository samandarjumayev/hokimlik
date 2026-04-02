import { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Avatar,
  Badge,
  Statistic,
  Row,
  Col,
  Tooltip,
  Divider,
  Empty,
  Radio,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ApiOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const Services = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState("active"); // 'all', 'active', 'inactive'
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // GET services with server-side pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["services", page],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/services/?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const services = data?.results || [];
  const total = data?.count || 0;

  // Statistics
  const statistics = {
    total: total,
    active: services.filter(s => s.is_active === true).length,
    inactive: services.filter(s => s.is_active === false).length,
  };

  // POST service
  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const res = await baseURL.post("/v1/services/", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      setModal(false);
      messageApi.success({
        content: "Xizmat muvaffaqiyatli qo'shildi",
        icon: <ApiOutlined />,
        duration: 3,
      });
      form.resetFields();
    },
    onError: (err) => {
      if (err.response?.status === 401) messageApi.error("Login qilinmagan (401)");
      else if (err.response?.status === 403) messageApi.error("Ruxsat yo'q (403)");
      else messageApi.error("Xatolik yuz berdi");
    },
  });

  // PATCH service
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await baseURL.patch(`/v1/services/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      setModal(false);
      setEditingService(null);
      messageApi.success("Xizmat ma'lumotlari yangilandi");
      form.resetFields();
    },
    onError: () => {
      messageApi.error("O'zgartirishda xatolik yuz berdi");
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const res = await baseURL.patch(`/v1/services/${id}/`, { is_active: !isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      messageApi.success("Xizmat holati o'zgartirildi");
    },
    onError: () => {
      messageApi.error("Holatni o'zgartirishda xatolik yuz berdi");
    },
  });

  // DELETE service
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await baseURL.delete(`/v1/services/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      messageApi.success("Xizmat o'chirildi");
    },
    onError: () => {
      messageApi.error("O'chirishda xatolik yuz berdi");
    },
  });

  // Modal open
  const openAdd = () => {
    form.resetFields();
    setEditingService(null);
    setModal(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
    });
    setModal(true);
  };

  // SAVE
  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        name: values.name,
        is_active: true, // Default active when creating
      };

      if (editingService) {
        updateMutation.mutate({ id: editingService.id, data: payload });
      } else {
        addMutation.mutate(payload);
      }
    });
  };

  // Filter by status and search
  const filtered = services?.filter((s) => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "active" ? s.is_active === true :
      statusFilter === "inactive" ? s.is_active === false : true;
    return matchesSearch && matchesStatus;
  });

  // Table columns
  const columns = [
    {
      title: "№",
      dataIndex: "id",
      width: 80,
      render: (v, _, index) => (
        <Badge 
          count={index + 1 + (page - 1) * pageSize}
          style={{ backgroundColor: "#f0f0f0", color: "#666" }}
        />
      ),
    },
    {
      title: "Xizmat nomi",
      dataIndex: "name",
      width: 300,
      render: (name) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={<ApiOutlined />} 
            className="bg-gradient-to-br from-blue-500 to-blue-600"
            size={40}
          />
          <div>
            <Text strong className="block text-base">
              {name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Holat",
      dataIndex: "is_active",
      width: 120,
      render: (isActive, record) => (
        <div className="flex items-center gap-2">
          <Tag color={isActive ? "green" : "red"} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {isActive ? "Faol" : "Nofaol"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Yaratilgan",
      dataIndex: "created_at",
      width: 180,
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
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(record)}
              className="hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() =>
                Modal.confirm({
                  title: "Xizmatni o'chirish",
                  content: `${record.name} xizmatini o'chirmoqchimisiz?`,
                  okText: "Ha, o'chirish",
                  cancelText: "Bekor qilish",
                  okButtonProps: { danger: true },
                  onOk: () => deleteMutation.mutate(record.id),
                })
              }
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
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
        <div className="px-5 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ApiOutlined className="text-blue-500 text-xl" />
                <Title level={3} className="!mb-0">
                  Xizmatlar ({total})
                </Title>
              </div>
              <Text type="secondary">
                Davlat xizmatlarini boshqaring va nazorat qiling
              </Text>
            </div>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openAdd}
              size="large"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              Yangi xizmat
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Main Card */}
        <Card className="shadow-sm rounded-xl border-0">
          {/* Filter Tabs */}
          <div className="mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Radio.Group 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="all">
                  <Space>
                    <ApiOutlined />
                    Barchasi
                  </Space>
                </Radio.Button>
                <Radio.Button value="active">
                  <Space>
                    <CheckCircleOutlined />
                    Faol xizmatlar
                  </Space>
                </Radio.Button>
                <Radio.Button value="inactive">
                  <Space>
                    <CloseCircleOutlined />
                    Nofaol xizmatlar
                  </Space>
                </Radio.Button>
              </Radio.Group>
              
              <Button 
                type="text" 
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  refetch();
                }}
                size="small"
              >
                Tozalash
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Xizmat nomi bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg"
              allowClear
              size="large"
            />
          </div>

          <Divider className="my-4" />

          {/* Info Bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <Badge 
              count={filtered.length} 
              showZero 
            />
            <Text type="secondary" className="text-sm">
              {filtered.length === 0 
                ? `Hech qanday ${statusFilter === "active" ? "faol" : statusFilter === "inactive" ? "nofaol" : ""} xizmat topilmadi` 
                : `${filtered.length} ta xizmat ko'rsatilmoqda`}
            </Text>
          </div>

          {/* Table */}
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
              className: "mt-4",
            }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    statusFilter === "active" 
                      ? "Faol xizmatlar mavjud emas"
                      : statusFilter === "inactive"
                      ? "Nofaol xizmatlar mavjud emas"
                      : "Hech qanday xizmat topilmadi"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-8"
                />
              ),
            }}
            className="services-table"
          />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {editingService ? (
              <EditOutlined className="text-blue-500" />
            ) : (
              <PlusOutlined className="text-blue-500" />
            )}
            <span>{editingService ? "Xizmatni tahrirlash" : "Yangi xizmat qo'shish"}</span>
          </div>
        }
        open={modal}
        onOk={handleSave}
        onCancel={() => {
          setModal(false);
          setEditingService(null);
          form.resetFields();
        }}
        confirmLoading={addMutation.isPending || updateMutation.isPending}
        width={500}
        okText="Saqlash"
        cancelText="Bekor qilish"
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item 
            name="name" 
            label="Xizmat nomi" 
            rules={[{ required: true, message: "Xizmat nomini kiriting" }]}
          >
            <Input 
              prefix={<ApiOutlined className="text-gray-400" />}
              placeholder="Masalan: 102, 103, IIB"
              size="large"
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <Text type="secondary" className="text-xs">
              ℹ️ Xizmat qo'shilgandan so'ng, ushbu xizmatga xodim biriktirishingiz mumkin.
            </Text>
          </div>
        </Form>
      </Modal>

      <style jsx>{`
        .services-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .services-table :global(.ant-table-tbody > tr:hover > td) {
          background: #f8fafc;
        }
        
        .services-table :global(.ant-table-cell) {
          padding: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default Services;