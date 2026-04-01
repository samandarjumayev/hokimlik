import { useState } from "react";
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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";

const { Title, Text } = Typography;

// 🔹 Role map
const roleMap = {
  super_admin: "Super Admin",
  hokim: "Hokim",
  xodim: "Xodim",
  oqsoqol: "Oqsoqol",
};

const roleColor = {
  super_admin: "red",
  hokim: "gold",
  xodim: "blue",
  oqsoqol: "green",
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 📦 GET USER
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/users/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  // ✏️ UPDATE
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await baseURL.patch(`/v1/users/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user", id]);
      messageApi.success("Yangilandi");
      setModal(false);
    },
    onError: () => {
      messageApi.error("Xatolik yuz berdi");
    },
  });

  // 🗑 DELETE
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await baseURL.delete(`/v1/users/${id}/`);
    },
    onSuccess: () => {
      messageApi.success("O‘chirildi");
      navigate("/dashboard/users");
    },
    onError: () => {
      messageApi.error("O‘chirishda xatolik");
    },
  });

  // 🔄 Loading
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // ❌ Error
  if (isError || !user) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  // ✏️ Edit open
  const openEdit = () => {
    const names = user.full_name?.split(" ") || [];
    form.setFieldsValue({
      first_name: names[0] || "",
      last_name: names[1] || "",
      username: user.username,
      phone: user.phone,
      role: user.role,
    });
    setModal(true);
  };

  // 💾 Save
  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        username: values.username,
        full_name: `${values.first_name || ""} ${values.last_name || ""}`.trim(),
        phone: values.phone,
        role: values.role,
      };

      updateMutation.mutate(payload);
    });
  };

  return (
    <div>
      {contextHolder}

      {/* 🔷 HEADER */}
      <div
        className="flex justify-between items-center mb-5 px-4 py-3 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
          border: "1px solid #e5e7eb",
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ borderRadius: 8 }}
        >
          Orqaga
        </Button>

        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={openEdit}
            style={{
              borderRadius: 8,
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
            }}
          >
            Tahrirlash
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            style={{ borderRadius: 8 }}
            onClick={() =>
              Modal.confirm({
                title: "Foydalanuvchini o‘chirmoqchimisiz?",
                okText: "Ha",
                cancelText: "Yo‘q",
                onOk: () => deleteMutation.mutate(),
              })
            }
          >
            O‘chirish
          </Button>
        </Space>
      </div>

      {/* 🔷 CARD */}
      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          background: "linear-gradient(135deg, #ffffff, #f9fafb)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
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
              {user.full_name}
            </Title>

            <Text type="secondary">@{user.username}</Text>

            <div style={{ marginTop: 8 }}>
              <Tag
                color={roleColor[user.role]}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontWeight: 500,
                }}
              >
                {roleMap[user.role] || user.role}
              </Tag>
            </div>
          </div>
        </div>

        <Divider />

        <Descriptions column={2} size="middle">
          <Descriptions.Item label="Telefon">
            {user.phone || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {user.email || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Yaratilgan sana">
            {user.created_at
              ? new Date(user.created_at).toLocaleString()
              : "-"}
          </Descriptions.Item>

          <Descriptions.Item label="User ID">
            {user.id}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 🔷 EDIT MODAL */}
      <Modal
        title="Foydalanuvchini tahrirlash"
        open={modal}
        onOk={handleSave}
        onCancel={() => setModal(false)}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="first_name" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="last_name" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Telefon">
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Rol" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "super_admin", label: "Super Admin" },
                { value: "hokim", label: "Hokim" },
                { value: "xodim", label: "Xodim" },
                { value: "oqsoqol", label: "Oqsoqol" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}