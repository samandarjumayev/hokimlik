import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Space,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";

const { Title } = Typography;

const MahallasPage = () => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, ctx] = message.useMessage();
  const queryClient = useQueryClient();

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10; // backend 3 ta item qaytaryapti

  // 📦 GET Mahallas with server-side pagination
  const { data, isLoading, isError, } = useQuery({
    queryKey: ["mahallas", page],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/mahallas/?page=${page}`);
      console.log(res.data)
      return res.data;
    },
    keepPreviousData: true,
  });

  const mahallas = data?.results || [];
  const total = data?.count || 0;

  // ➕ POST Mahalla
  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const res = await baseURL.post("/v1/mahallas/", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mahallas"]);
      setModal(false);
      messageApi.success("Muvaffaqiyatli qo'shildi");
      form.resetFields();
    },
    onError: () => {
      queryClient.invalidateQueries(["mahallas"]);
      setModal(false);
      messageApi.error("Xatolik yuz berdi");
      form.resetFields();
    },
  });

  // ✏️ PATCH Mahalla
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await baseURL.patch(`/v1/mahallas/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mahallas"]);
      setModal(false);
      setEditing(null);
      messageApi.success("O'zgartirildi");
      form.resetFields();
    },
    onError: () => {
      queryClient.invalidateQueries(["mahallas"]);
      setModal(false);
      setEditing(null);
      messageApi.error("O'zgartirishda xatolik yuz berdi");
      form.resetFields();
    },
  });

  // 🗑 DELETE Mahalla
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await baseURL.delete(`/v1/mahallas/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mahallas"]);
      messageApi.success("O'chirildi");
    },
  });

  // ➕ Modal open (add yoki edit)
  const openAdd = () => {
    form.resetFields();
    setEditing(null);
    setModal(true);
  };

  const openEdit = (mahalla) => {
    setEditing(mahalla);
    form.setFieldsValue({
      name: mahalla.name,
      district: mahalla.district,
    });
    setModal(true);
  };

  // 💾 SAVE (POST yoki PATCH)
  const handleSave = () => {
    form.validateFields()
      .then((values) => {
        if (editing) updateMutation.mutate({ id: editing.id, data: values });
        else addMutation.mutate(values);
      })
      .catch(() => {
        messageApi.error("Iltimos barcha majburiy maydonlarni to'ldiring");
      });
  };

  // 📊 Columns
  const columns = [
    { title: "Tuman", dataIndex: "district", key: "district" },
    { title: "Mahalla", dataIndex: "name", key: "name" },
    {
      title: "Yaratilgan sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, r) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(r)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() =>
              Modal.confirm({
                title: "Haqiqatan ham o'chirmoqchimisiz?",
                onOk: () => deleteMutation.mutate(r.id),
              })
            }
          />
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
    <div>
      {ctx}

      {/* 🔝 Header */}
      <div className="flex justify-between mb-5">
        <Title level={4}>Mahallalar</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Qo'shish
        </Button>
      </div>

      {/* Jami mahallalar */}
      <div className="mb-2 text-gray-600">
        Jami mahallalar: {total}
      </div>

      {/* 📋 Table */}
      <Card bordered={false}>
        <Table
          dataSource={mahallas}
          columns={columns}
          size="middle"
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      {/* 🧾 Modal */}
      <Modal
        title={editing ? "Mahallani tahrirlash" : "Yangi mahalla"}
        open={modal}
        onOk={handleSave}
        onCancel={() => {
          setModal(false);
          setEditing(null);
        }}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={addMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nomi"
            rules={[{ required: true, message: "Nomini kiriting" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="district"
            label="Tuman"
            rules={[{ required: true, message: "Tumanni kiriting" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MahallasPage;