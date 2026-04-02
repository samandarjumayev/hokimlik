import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// Enhanced Role map with colors and icons - 4 roles
const roleMap = {
  super_admin: { 
    label: "Super Admin", 
    color: "red", 
    icon: <TeamOutlined />,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200"
  },
  hokim: { 
    label: "Hokim", 
    color: "blue", 
    icon: <UserOutlined />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200"
  },
  service_staff: { 
    label: "Xodim", 
    color: "green", 
    icon: <UserOutlined />,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  oqsoqol: { 
    label: "Oqsoqol", 
    color: "purple", 
    icon: <UserOutlined />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200"
  },
};

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Watch role changes
  const watchRole = Form.useWatch('role', form);

  useEffect(() => {
    setSelectedRole(watchRole);
  }, [watchRole]);

  // GET users with custom pagination handling
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      let allResults = [];
      let currentPage = 1;
      let hasMore = true;
      let nextUrl = null;

      while (hasMore) {
        const url = nextUrl || `/v1/users/?page=${currentPage}`;
        const res = await baseURL.get(url);
        const data = res.data;
        
        allResults = [...allResults, ...(data.results || [])];
        
        if (data.next) {
          nextUrl = data.next;
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      setTotal(allResults.length);
      setAllUsers(allResults);
      setFilteredUsers(allResults);
      return allResults;
    },
  });

  // Filter users based on search (from all users)
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.phone?.includes(search) ||
          u.username?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
      setPage(1); // Reset to first page when search changes
    }
  }, [search, allUsers]);

  // GET mahallas
  const { data: mahallas = [], isLoading: isMahallaLoading, isError: isMahallaError } = useQuery({
    queryKey: ["mahallas"],
    queryFn: async () => {  
      const res = await baseURL.get("/v1/mahallas/");
      return res.data.results || [];
    }
  });

  // GET services - ONLY ACTIVE SERVICES
  const { data: services = [], isLoading: isServicesLoading, isError: isServicesError } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/services/");
      const allServices = res.data.results || [];
      return allServices.filter(service => service.is_active === true);
    } 
  });

  // Get current page users (10 items per page) from filtered users
  const getCurrentPageUsers = () => {
    const start = (page - 1) * 10;
    const end = start + 10;
    return filteredUsers.slice(start, end);
  };

  const users = getCurrentPageUsers();
  const totalUsers = filteredUsers.length;

  // Statistics - updated for 4 roles (from all users, not filtered)
  const statistics = {
    total: allUsers.length,
    superAdmins: allUsers.filter(u => u.role === "super_admin").length,
    hokims: allUsers.filter(u => u.role === "hokim").length,
    xodims: allUsers.filter(u => u.role === "service_staff").length,
    oqsoqols: allUsers.filter(u => u.role === "oqsoqol").length,
  };

  // POST user
  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const res = await baseURL.post("/v1/users/", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setModal(false);
      messageApi.success({
        content: "Foydalanuvchi muvaffaqiyatli qo'shildi",
        icon: <UserOutlined />,
        duration: 3,
      });
      form.resetFields();
      setSelectedRole(null);
    },
    onError: (err) => {
      if (err.response?.status === 401) messageApi.error("Login qilinmagan (401)");
      else if (err.response?.status === 403) messageApi.error("Ruxsat yo'q (403)");
      else if (err.response?.data?.password) messageApi.error("Password majburiy");
      else messageApi.error("Xatolik yuz berdi");
    },
  });

  // PATCH user
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await baseURL.patch(`/v1/users/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setModal(false);
      setEditingUser(null);
      messageApi.success("Foydalanuvchi ma'lumotlari yangilandi");
      form.resetFields();
      setSelectedRole(null);
    },
    onError: () => {
      messageApi.error("O'zgartirishda xatolik yuz berdi");
    },
  });

  // DELETE user
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await baseURL.delete(`/v1/users/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      messageApi.success("Foydalanuvchi o'chirildi");
    },
    onError: () => {
      messageApi.error("O'chirishda xatolik yuz berdi");
    },
  });

  // Modal open
  const openAdd = () => {
    form.resetFields();
    setEditingUser(null);
    setSelectedRole(null);
    setModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    form.setFieldsValue({
      first_name: user.full_name?.split(" ")[0] || "",
      last_name: user.full_name?.split(" ")[1] || "",
      username: user.username,
      phone: user.phone,
      role: user.role,
      password: "",
      mahalla: user.mahalla || null,
      service: user.service || null,
    });
    setModal(true);
  };

  // SAVE
  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        username: values.username,
        full_name: `${values.first_name} ${values.last_name}`,
        phone: values.phone,
        role: values.role,
      };
      if (values.password) payload.password = values.password;
      
      // Add conditional fields based on role
      if (values.role === "oqsoqol" && values.mahalla) {
        payload.mahalla = values.mahalla;
      }
      if (values.role === "service_staff" && values.service) {
        payload.service = values.service;
      }

      if (editingUser) updateMutation.mutate({ id: editingUser.id, data: payload });
      else addMutation.mutate(payload);
    });
  };

  // Enhanced Columns
  const columns = [
    {
      title: "Foydalanuvchi",
      dataIndex: "full_name",
      width: 250,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={<UserOutlined />} 
            className="bg-gradient-to-br from-blue-500 to-blue-600"
            size={40}
          />
          <div>
            <Text strong className="block text-base">
              {name}
            </Text>
            <Text type="secondary" className="text-xs">
              @{record.username}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Rol",
      dataIndex: "role",
      width: 150,
      render: (r) => {
        const role = roleMap[r] || { label: r, color: "default", icon: <UserOutlined /> };
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${role.bgColor} ${role.textColor}`}>
            {role.icon}
            <span className="text-sm font-medium">{role.label}</span>
          </div>
        );
      },
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      width: 150,
      render: (phone) => (
        <div className="flex items-center gap-2">
          <PhoneOutlined className="text-gray-400" />
          <Text>{phone || "—"}</Text>
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
                  title: "Foydalanuvchini o'chirish",
                  content: `${record.full_name} foydalanuvchisini o'chirmoqchimisiz?`,
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

  // Loader
  if(isLoading){
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Error
  if(isError){
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
              <Title level={3} className="!mb-1">
                Foydalanuvchilar ({allUsers.length})
              </Title>
              <Text type="secondary">
                Tizim foydalanuvchilarini boshqaring va nazorat qiling
              </Text>
            </div>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openAdd}
              size="large"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              Yangi foydalanuvchi
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Statistics Cards - updated for 4 roles */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Super Adminlar"
                value={statistics.superAdmins}
                prefix={<TeamOutlined className="text-red-500" />}
                valueStyle={{ color: "#ef4444" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Hokimlar"
                value={statistics.hokims}
                prefix={<UserOutlined className="text-blue-500" />}
                valueStyle={{ color: "#3b82f6" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Xodimlar"
                value={statistics.xodims}
                prefix={<UserOutlined className="text-green-500" />}
                valueStyle={{ color: "#10b981" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-0">
              <Statistic
                title="Oqsoqollar"
                value={statistics.oqsoqols}
                prefix={<UserOutlined className="text-purple-500" />}
                valueStyle={{ color: "#8b5cf6" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Card */}
        <Card className="shadow-sm rounded-xl border-0">
          {/* Search and Filters */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <Space>
                <SearchOutlined className="text-gray-400" />
                <Text strong>Qidiruv</Text>
              </Space>
              <Button 
                type="text" 
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  refetch();
                }}
                size="small"
              >
                Tozalash
              </Button>
            </div>
            
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Qidirish (ism, telefon, username)"
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
              count={totalUsers} 
              showZero 
            />
            <Text type="secondary" className="text-sm">
              {totalUsers === 0 ? "Hech qanday foydalanuvchi topilmadi" : `${totalUsers} ta foydalanuvchi ko'rsatilmoqda`}
            </Text>
          </div>

          {/* Table */}
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => navigate(`/dashboard/users/${record.id}`),
              className: "cursor-pointer hover:bg-gray-50 transition-colors",
            })}
            pagination={{
              current: page,
              pageSize: 10,
              total: totalUsers,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
              className: "mt-4",
            }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <Empty
                  description="Hech qanday foydalanuvchi topilmadi"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-8"
                />
              ),
            }}
            className="users-table"
          />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {editingUser ? (
              <EditOutlined className="text-blue-500" />
            ) : (
              <PlusOutlined className="text-blue-500" />
            )}
            <span>{editingUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"}</span>
          </div>
        }
        open={modal}
        onOk={handleSave}
        onCancel={() => {
          setModal(false);
          setEditingUser(null);
          setSelectedRole(null);
          form.resetFields();
        }}
        confirmLoading={addMutation.isPending || updateMutation.isPending}
        width={600}
        okText="Saqlash"
        cancelText="Bekor qilish"
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="first_name" 
                label="Ism" 
                rules={[{ required: true, message: "Ismni kiriting" }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Ism"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="last_name" 
                label="Familiya" 
                rules={[{ required: true, message: "Familiyani kiriting" }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Familiya"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="username" 
            label="Username" 
            rules={[{ required: true, message: "Usernameni kiriting" }]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={editingUser ? [] : [{ required: true, message: "Parolni kiriting" }]}
            extra={editingUser ? "Agar o'zgartirmoqchi bo'lmasangiz, bo'sh qoldiring" : ""}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder={editingUser ? "Yangi parol (ixtiyoriy)" : "Parol"}
            />
          </Form.Item>

          <Form.Item 
            name="phone" 
            label="Telefon raqami"
          >
            <Input 
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="+998 90 123 45 67"
            />
          </Form.Item>

          <Form.Item 
            name="role" 
            label="Rol" 
            rules={[{ required: true, message: "Rolni tanlang" }]}
          >
            <Select
              placeholder="Rolni tanlang"
              onChange={(value) => {
                setSelectedRole(value);
                form.setFieldsValue({ mahalla: null, service: null });
              }}
              options={[
                { 
                  value: "super_admin", 
                  label: (
                    <Space>
                      <TeamOutlined className="text-red-500" />
                      <span>Super Admin</span>
                    </Space>
                  )
                },
                { 
                  value: "hokim", 
                  label: (
                    <Space>
                      <UserOutlined className="text-blue-500" />
                      <span>Hokim</span>
                    </Space>
                  )
                },
                { 
                  value: "service_staff", 
                  label: (
                    <Space>
                      <UserOutlined className="text-green-500" />
                      <span>Xodim</span>
                    </Space>
                  )
                },
                { 
                  value: "oqsoqol", 
                  label: (
                    <Space>
                      <UserOutlined className="text-purple-500" />
                      <span>Oqsoqol</span>
                    </Space>
                  )
                },
              ]}
            />
          </Form.Item>

          {/* Conditional field for Oqsoqol - Mahalla */}
          {selectedRole === "oqsoqol" && (
            <Form.Item 
              name="mahalla" 
              label="Mahalla" 
              rules={[{ required: true, message: "Mahallani tanlang" }]}
            >
              <Select
                showSearch
                placeholder="Mahallani tanlang"
                loading={isMahallaLoading}
                options={mahallas.map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.district})`,
                }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          )}

          {/* Conditional field for Xodim - Service (ONLY ACTIVE SERVICES) */}
          {selectedRole === "service_staff" && (
            <Form.Item 
              name="service" 
              label="Xizmat turi" 
              rules={[{ required: true, message: "Xizmat turini tanlang" }]}
            >
              <Select
                showSearch
                placeholder="Xizmat turini tanlang"
                loading={isServicesLoading}
                options={services.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <style jsx>{`
        .users-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .users-table :global(.ant-table-tbody > tr:hover > td) {
          background: #f8fafc;
        }
        
        .users-table :global(.ant-table-cell) {
          padding: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default UsersPage;