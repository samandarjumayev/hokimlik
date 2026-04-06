import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { baseURL } from "../../auth/api/api";
import {
  Card,
  Typography,
  Tag,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Avatar,
  Divider,
  Row,
  Col,
  Statistic,
  Tooltip,
  Timeline,
  Badge,
  Alert,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  BuildOutlined,
  LockOutlined,
} from "@ant-design/icons";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

// Enhanced Role map with colors, icons, and styles
const roleMap = {
  super_admin: { 
    label: "Super Admin", 
    color: "red", 
    icon: <UserOutlined />,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    gradient: "from-red-500 to-red-600"
  },
  hokim: { 
    label: "Hokim", 
    color: "gold", 
    icon: <UserOutlined />,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    gradient: "from-yellow-500 to-yellow-600"
  },
  service_staff: { 
    label: "Xodim", 
    color: "blue", 
    icon: <UserOutlined />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-blue-600"
  },
  oqsoqol: { 
    label: "Oqsoqol", 
    color: "green", 
    icon: <UserOutlined />,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    gradient: "from-green-500 to-green-600"
  },
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role: currentUserRole } = useSelector((state) => state.backend);

  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRole, setSelectedRole] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);

  // GET USER
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/users/${id}/`);
      console.log("Fetched user data:", res.data);
      return res.data;
    },
    enabled: !!id,
  });

  // Check if editing user is super_admin
  const isEditingSuperAdmin = user?.role === "super_admin";
  // Check if can delete (super_admin cannot be deleted)
  const canDelete = user?.role !== "super_admin";

  // GET MAHALLAS
  const { data: mahallas = [] } = useQuery({
    queryKey: ["mahallas"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/mahallas/");
      return res.data.results || [];
    },
  });

  // GET SERVICES - ONLY ACTIVE SERVICES
  const { data: services = [], isLoading: isServicesLoading, isError: isServicesError } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/services/");
      const allServices = res.data.results || [];
      return allServices.filter(service => service.is_active === true);
    },
  });

  // GET MAHALLA DETAIL if user is oqsoqol
  const { data: mahallaDetail } = useQuery({
    queryKey: ["mahalla", user?.mahalla],
    queryFn: async () => {
      if (!user?.mahalla) return null;
      const res = await baseURL.get(`/v1/mahallas/${user.mahalla}/`);
      return res.data;
    },
    enabled: !!user?.mahalla && user?.role === "oqsoqol",
  });

  // GET SERVICE DETAIL if user is service_staff
  const { data: serviceDetail } = useQuery({
    queryKey: ["service", user?.service],
    queryFn: async () => {
      if (!user?.service) return null;
      const res = await baseURL.get(`/v1/services/${user.service}/`);
      return res.data;
    },
    enabled: !!user?.service && user?.role === "service_staff",
  });

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      if (user.role === "oqsoqol" && mahallaDetail) {
        setAdditionalData({ name: mahallaDetail.name, district: mahallaDetail.district });
      } else if (user.role === "service_staff" && serviceDetail) {
        setAdditionalData({ name: serviceDetail.name });
      } else {
        setAdditionalData(null);
      }
    }
  }, [user, mahallaDetail, serviceDetail]);

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await baseURL.patch(`/v1/users/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user", id]);
      messageApi.success({
        content: "Foydalanuvchi ma'lumotlari yangilandi",
        icon: <CheckCircleOutlined />,
        duration: 3,
      });
      setModal(false);
      refetch();
    },
    onError: (err) => {
      console.error("Update error:", err);
      messageApi.error("Yangilashda xatolik yuz berdi");
    },
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await baseURL.delete(`/v1/users/${id}/`);
    },
    onSuccess: () => {
      messageApi.success("Foydalanuvchi o'chirildi");
      navigate("/dashboard/users");
    },
    onError: () => {
      messageApi.error("O'chirishda xatolik yuz berdi");
    },
  });

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Error
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  // Edit open
  const openEdit = () => {
    const names = user.full_name?.split(" ") || [];
    form.setFieldsValue({
      first_name: names[0] || "",
      last_name: names[1] || "",
      username: user.username,
      phone: user.phone,
      role: user.role,
      mahalla_id: user.mahalla || null,
      service_id: user.service || null,
      password: "",
    });
    setSelectedRole(user.role);
    setModal(true);
  };

  // Save
  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        username: values.username,
        full_name: `${values.first_name || ""} ${values.last_name || ""}`.trim(),
        phone: values.phone,
        role: values.role,
      };
      
      if (values.password && values.password.trim()) {
        payload.password = values.password;
      }
      
      if (values.role === "oqsoqol" && values.mahalla_id) {
        payload.mahalla = values.mahalla_id;
      }
      if (values.role === "service_staff" && values.service_id) {
        payload.service = values.service_id;
      }
      
      updateMutation.mutate(payload);
    });
  };

  const role = roleMap[user.role] || { 
    label: user.role, 
    color: "default", 
    icon: <UserOutlined />,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700"
  };

  // Timeline data
  const timelineItems = [
    { action: "Foydalanuvchi yaratildi", date: user.created_at, icon: <UserOutlined /> },
    ...(user.updated_at && user.updated_at !== user.created_at 
      ? [{ action: "Ma'lumotlar yangilandi", date: user.updated_at, icon: <EditOutlined /> }]
      : []),
  ];

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {contextHolder}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10 pr-5">
        <div className="py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className=""
              size="large"
            >
              Orqaga
            </Button>

            <Space size="middle">
              <Tooltip title="Tahrirlash">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={openEdit}
                  size="large"
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  Tahrirlash
                </Button>
              </Tooltip>

              {/* Delete button - only show if user is not super_admin */}
              {canDelete && (
                <Tooltip title="O'chirish">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="large"
                    onClick={() =>
                      Modal.confirm({
                        title: "Foydalanuvchini o'chirish",
                        content: (
                          <div>
                            <Paragraph>
                              <Text strong>{user.full_name}</Text> foydalanuvchisini o'chirmoqchimisiz?
                            </Paragraph>
                            <Alert
                              message="Diqqat!"
                              description="Bu amalni qaytarib bo'lmaydi. Foydalanuvchi va unga tegishli barcha ma'lumotlar butunlay o'chiriladi."
                              type="warning"
                              showIcon
                              className="mt-3"
                            />
                          </div>
                        ),
                        okText: "Ha, o'chirish",
                        cancelText: "Bekor qilish",
                        okButtonProps: { danger: true, size: "large" },
                        cancelButtonProps: { size: "large" },
                        width: 500,
                        onOk: () => deleteMutation.mutate(),
                      })
                    }
                  >
                    O'chirish
                  </Button>
                </Tooltip>
              )}
            </Space>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-sm rounded-xl border-0 overflow-hidden">
              <div className="relative">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
                
                {/* Profile Info */}
                <div className="px-6 pb-6 relative">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-4">
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      className="border-4 border-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${role.gradient || "#6366f1"})`,
                      }}
                    />
                    <div className="text-center sm:text-left flex-1">
                      <Title level={3} className="!mb-1">
                        {user.full_name}
                      </Title>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <Text type="secondary" className="text-sm">
                          @{user.username}
                        </Text>
                        <Badge 
                          count={role.label} 
                          style={{ 
                            backgroundColor: role.bgColor,
                            color: role.textColor,
                            border: `1px solid ${role.borderColor}`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  {/* Stats */}
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8}>
                      <Statistic
                        title="User ID"
                        value={user.id}
                        prefix={<IdcardOutlined className="text-blue-500" />}
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col xs={12} sm={8}>
                      <Statistic
                        title="Telefon"
                        value={user.phone || "—"}
                        prefix={<PhoneOutlined className="text-green-500" />}
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col xs={12} sm={8}>
                      <Statistic
                        title="Qo'shilgan"
                        value={dayjs(user.created_at).format("DD.MM.YYYY")}
                        prefix={<CalendarOutlined className="text-purple-500" />}
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>

            {/* Additional Info Card */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                <FileTextOutlined className="text-blue-500 text-lg" />
                <Title level={5} className="!mb-0">Qo'shimcha ma'lumotlar</Title>
              </div>
              
              <Descriptions column={1} size="middle" bordered>
                <Descriptions.Item label="To'liq ism">
                  <Text strong>{user.full_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Username">
                  <Text code>@{user.username}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Rol">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${role.bgColor} ${role.textColor}`}>
                    {role.icon}
                    <span>{role.label}</span>
                  </div>
                </Descriptions.Item>
                
                {/* Conditional fields for Oqsoqol */}
                {user.role === "oqsoqol" && additionalData && (
                  <>
                    <Descriptions.Item label="Mahalla">
                      <Space>
                        <HomeOutlined className="text-green-500" />
                        <Text>{additionalData.name}</Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tuman">
                      <Space>
                        <BuildOutlined className="text-blue-500" />
                        <Text>{additionalData.district}</Text>
                      </Space>
                    </Descriptions.Item>
                  </>
                )}
                
                {/* Conditional fields for Service Staff */}
                {user.role === "service_staff" && additionalData && (
                  <Descriptions.Item label="Xizmat turi">
                    <Space>
                      <BuildOutlined className="text-blue-500" />
                      <Text>{additionalData.name}</Text>
                    </Space>
                  </Descriptions.Item>
                )}
                
                <Descriptions.Item label="Yaratilgan vaqt">
                  <div className="flex flex-col">
                    <Text>{dayjs(user.created_at).format("DD.MM.YYYY HH:mm:ss")}</Text>
                    <Text type="secondary" className="text-xs">
                      {dayjs(user.created_at).fromNow()}
                    </Text>
                  </div>
                </Descriptions.Item>
                {user.updated_at && user.updated_at !== user.created_at && (
                  <Descriptions.Item label="Oxirgi yangilanish">
                    <div className="flex flex-col">
                      <Text>{dayjs(user.updated_at).format("DD.MM.YYYY HH:mm:ss")}</Text>
                      <Text type="secondary" className="text-xs">
                        {dayjs(user.updated_at).fromNow()}
                      </Text>
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="space-y-6">
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                <ClockCircleOutlined className="text-blue-500 text-lg" />
                <Title level={5} className="!mb-0">Faoliyat tarixi</Title>
              </div>
              
              <Timeline
                items={timelineItems.map((item, index) => ({
                  dot: item.icon || <ClockCircleOutlined />,
                  color: index === 0 ? "green" : "blue",
                  children: (
                    <div className="pb-2">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <Text strong>{item.action}</Text>
                        <Text type="secondary" className="text-xs">
                          {dayjs(item.date).format("DD.MM.YYYY HH:mm")}
                        </Text>
                      </div>
                      <Text type="secondary" className="text-sm">
                        {dayjs(item.date).fromNow()}
                      </Text>
                    </div>
                  ),
                }))}
              />

              <Divider className="my-4" />

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <UserOutlined className="text-blue-500" />
                  <Text strong className="text-blue-700">Statistika</Text>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text type="secondary">Yaratilgan arizalar</Text>
                    <Text strong>0</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Yopilgan arizalar</Text>
                    <Text strong>0</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Faol arizalar</Text>
                    <Text strong>0</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal - Two Column Layout */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-500" />
            <span>Foydalanuvchini tahrirlash</span>
          </div>
        }
        open={modal}
        onOk={handleSave}
        onCancel={() => {
          setModal(false);
          setSelectedRole(null);
          form.resetFields();
        }}
        confirmLoading={updateMutation.isPending}
        width={700}
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
                  size="large"
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
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="username" 
                label="Username" 
                rules={[{ required: true, message: "Usernameni kiriting" }]}
              >
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="username"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="phone" 
                label="Telefon raqami"
              >
                <Input 
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="+998 90 123 45 67"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="password" 
            label="Password"
            extra="Agar o'zgartirmoqchi bo'lmasangiz, bo'sh qoldiring"
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Yangi parol (ixtiyoriy)"
              size="large"
            />
          </Form.Item>

          {/* Role field - only show if not editing super_admin */}
          {!isEditingSuperAdmin && (
            <Form.Item 
              name="role" 
              label="Rol" 
              rules={[{ required: true, message: "Rolni tanlang" }]}
            >
              <Select
                placeholder="Rolni tanlang"
                size="large"
                onChange={(value) => {
                  setSelectedRole(value);
                  form.setFieldsValue({ mahalla_id: null, service_id: null });
                }}
                options={[
                  { 
                    value: "hokim", 
                    label: (
                      <Space>
                        <UserOutlined className="text-yellow-500" />
                        <span>Hokim</span>
                      </Space>
                    )
                  },
                  { 
                    value: "service_staff", 
                    label: (
                      <Space>
                        <UserOutlined className="text-blue-500" />
                        <span>Xodim</span>
                      </Space>
                    )
                  },
                  { 
                    value: "oqsoqol", 
                    label: (
                      <Space>
                        <UserOutlined className="text-green-500" />
                        <span>Oqsoqol</span>
                      </Space>
                    )
                  },
                ]}
              />
            </Form.Item>
          )}

          {/* Conditional field for Oqsoqol - Mahalla */}
          {selectedRole === "oqsoqol" && (
            <Form.Item 
              name="mahalla_id" 
              label="Mahalla" 
              rules={[{ required: true, message: "Mahallani tanlang" }]}
            >
              <Select
                showSearch
                placeholder="Mahallani tanlang"
                size="large"
                defaultValue={user?.mahalla}
                value={form.getFieldValue('mahalla_id') || user?.mahalla}
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

          {/* Conditional field for Service Staff - Service */}
          {selectedRole === "service_staff" && (
            <Form.Item 
              name="service_id" 
              label="Xizmat turi" 
              rules={[{ required: true, message: "Xizmat turini tanlang" }]}
            >
              <Select
                showSearch
                placeholder="Xizmat turini tanlang"
                size="large"
                defaultValue={user?.service}
                value={form.getFieldValue('service_id') || user?.service}
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
        .ant-descriptions-item-label {
          background: #f8fafc;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}