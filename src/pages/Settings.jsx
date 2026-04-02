import {
  Card,
  Typography,
  Form,
  Input,
  Select,
  Button,
  message,
  Avatar,
  Tag,
  Divider,
  Row,
  Col,
  Modal,
} from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../auth/api/api";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";
import ErrorComponent from "../components/ui/ErrorComponent";

const { Title, Text } = Typography;

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "hokim", label: "Hokim" },
  { value: "xodim", label: "Xodim" },
];

const roleColor = {
  super_admin: "red",
  hokim: "gold",
  xodim: "blue",
};

const Settings = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useSelector((state) => state.backend);

  // 🔹 GET USER
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/users/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  // 🔹 SET DEFAULT VALUES
  useEffect(() => {
    if (user) {
      const names = user.full_name?.split(" ") || [];
      form.setFieldsValue({
        first_name: names[0] || "",
        last_name: names[1] || "",
        username: user.username,
        phone: user.phone,
        role: user.role,
      });
    }
  }, [user]);

  // 🔹 UPDATE
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await baseURL.patch(`/v1/users/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      messageApi.success("Ma'lumotlar muvaffaqiyatli o‘zgartirildi ✅");
      queryClient.invalidateQueries(["user", id]);
    },
    onError: () => {
      messageApi.error("Xatolik yuz berdi ❌");
    },
  });

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          username: values.username,
          full_name: `${values.first_name || ""} ${values.last_name || ""}`.trim(),
          phone: values.phone,
          role: values.role,
        };

        if (values.password) payload.password = values.password;

        updateMutation.mutate(payload);
      })
      .catch(() => {
        messageApi.error("Majburiy maydonlarni to‘ldiring");
      });
  };

  // 🔹 LOGOUT CONFIRM
  const handleLogout = () => {
    Modal.confirm({
      title: "Chiqish",
      content: "Rostan chiqasizmi?",
      okText: "Ha",
      cancelText: "Yo‘q",
      onOk: () => {
        // ❗ Token/State tozalash kerak bo‘lsa shu yerga qo‘shish mumkin
        navigate("/login");
      },
    });
  };

  // Loader
  if(isLoading){
    return <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <Loader />
    </div>
  }

  // Error
  if(isError){
    return <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <ErrorComponent />
    </div>
  }

  return (
    <div>
      {contextHolder}

      {/* 🔷 PROFILE PREVIEW */}
      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          marginBottom: 20,
          background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar
              size={70}
              icon={<UserOutlined />}
              style={{
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              }}
            />

            <div>
              <Title level={4} style={{ margin: 0 }}>
                {user.full_name || "No Name"}
              </Title>

              <Text type="secondary">@{user.username}</Text>

              <div style={{ marginTop: 8 }}>
                <Tag color={roleColor[user.role]}>
                  {roleOptions.find((r) => r.value === user.role)?.label}
                </Tag>
              </div>
            </div>
          </div>

          <Button
            icon={<LogoutOutlined />}
            danger
            onClick={handleLogout}
            style={{ borderRadius: 8 }}
          >
            Chiqish
          </Button>
        </div>

        <Divider />

        <div className="flex gap-10">
          <Text>📞 {user.phone || "-"}</Text>
          <Text>📅 {new Date(user.created_at).toLocaleString()}</Text>
        </div>
      </Card>

      {/* 🔷 FORM */}
      <Card
        title="Profilni tahrirlash"
        style={{
          borderRadius: 18,
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="Ism"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Familiya"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="phone" label="Telefon">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="password" label="Parol">
                <Input.Password placeholder="Yangi parol (ixtiyoriy)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[{ required: true }]}
              >
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              type="primary"
              onClick={handleSave}
              loading={updateMutation.isPending}
              style={{
                borderRadius: 8,
                padding: "6px 24px",
              }}
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;