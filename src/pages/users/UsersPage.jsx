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
  Select,
  Space,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

// ✅ Role map
const roleMap = {
  super_admin: "Super Admin",
  hokim: "Hokim",
  xodim: "Xodim",
};

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ✅ PAGINATION STATE
  const [page, setPage] = useState(1);
  const pageSize = 10; // backendga mos (API 10 ta item qaytaryapti)

  // 📦 GET users with server-side pagination
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/users/?page=${page}`);
      console.log(res.data);
      return res.data;
    },
    keepPreviousData: true,
  });

  const users = data?.results || [];
  const total = data?.count || 0;

  // ➕ POST user
  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const res = await baseURL.post("/v1/users/", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setModal(false);
      messageApi.success("Qo‘shildi");
      form.resetFields();
    },
    onError: (err) => {
      if (err.response?.status === 401) messageApi.error("Login qilinmagan (401)");
      else if (err.response?.status === 403) messageApi.error("Ruxsat yo‘q (403)");
      else if (err.response?.data?.password) messageApi.error("Password majburiy");
      else messageApi.error("Xatolik yuz berdi");
    },
  });

  // ✏️ PATCH user
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await baseURL.patch(`/v1/users/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setModal(false);
      setEditingUser(null);
      messageApi.success("O'zgartirildi");
      form.resetFields();
    },
    onError: () => {
      messageApi.error("O‘zgartirishda xatolik yuz berdi");
    },
  });

  // 🗑 DELETE user
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await baseURL.delete(`/v1/users/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      messageApi.success("O'chirildi");
    },
    onError: () => {
      messageApi.error("O'chirishda xatolik yuz berdi");
    },
  });

  // ➕ Modal open
  const openAdd = () => {
    form.resetFields();
    setEditingUser(null);
    setModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      first_name: user.full_name?.split(" ")[0] || "",
      last_name: user.full_name?.split(" ")[1] || "",
      username: user.username,
      phone: user.phone,
      role: user.role,
      password: "",
    });
    setModal(true);
  };

  // 💾 SAVE
  const handleSave = () => {
    form.validateFields().then((values) => {
      const payload = {
        username: values.username,
        full_name: `${values.first_name} ${values.last_name}`,
        phone: values.phone,
        role: values.role,
      };
      if (values.password) payload.password = values.password;

      if (editingUser) updateMutation.mutate({ id: editingUser.id, data: payload });
      else addMutation.mutate(payload);
    });
  };

  // 🔍 Filter (faqat current page ichida)
  const filtered = users?.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  // 📊 Columns
  const columns = [
    { title: "Ism", dataIndex: "full_name", render: (v) => <b>{v}</b> },
    { title: "Username", dataIndex: "username" },
    { title: "Rol", dataIndex: "role", render: (r) => <Tag color="blue">{roleMap[r] || r}</Tag> },
    { title: "Telefon", dataIndex: "phone" },
    { title: "Yaratilgan", dataIndex: "created_at", render: (d) => new Date(d).toLocaleDateString() },
    {
      title: "Amal",
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() =>
              Modal.confirm({
                title: "O‘chirmoqchimisiz?",
                onOk: () => deleteMutation.mutate(record.id),
              })
            }
          />
        </Space>
      ),
    },
  ];

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

      {/* Header */}
      <div className="flex justify-between mb-5">
        <Title level={4}>Foydalanuvchilar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Qo‘shish
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />

      {/* Jami foydalanuvchilar */}
      <div className="mb-2 text-gray-600">
        Jami foydalanuvchilar: {total}
      </div>

      {/* Table */}
      <Card bordered={false}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p) => setPage(p),
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/dashboard/users/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"}
        open={modal}
        onOk={handleSave}
        onCancel={() => {
          setModal(false);
          setEditingUser(null);
        }}
        confirmLoading={addMutation.isPending || updateMutation.isPending}
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
          <Form.Item
            name="password"
            label="Password"
            rules={editingUser ? [] : [{ required: true }]}
          >
            <Input.Password placeholder={editingUser ? "Passwordni o'zgartirmoqchi bo'lsangiz" : ""} />
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
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;