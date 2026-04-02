import { useState, useEffect } from "react";
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
  Avatar,
  Badge,
  Statistic,
  Row,
  Col,
  Tooltip,
  Divider,
  Empty,
  Input as AntInput,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MahallasPage = () => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, ctx] = message.useMessage();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [allMahallas, setAllMahallas] = useState([]);
  const [total, setTotal] = useState(0);
  const [filteredMahallas, setFilteredMahallas] = useState([]);

  // GET all Mahallas
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ["mahallas"],
    queryFn: async () => {
      let allResults = [];
      let currentPage = 1;
      let hasMore = true;
      let nextUrl = null;

      while (hasMore) {
        const url = nextUrl || `/v1/mahallas/?page=${currentPage}`;
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
      
      setAllMahallas(allResults);
      setTotal(allResults.length);
      setFilteredMahallas(allResults);
      return allResults;
    },
  });

  // Filter mahallas by search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredMahallas(allMahallas);
    } else {
      const filtered = allMahallas.filter(
        (m) =>
          m.name?.toLowerCase().includes(search.toLowerCase()) ||
          m.district?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMahallas(filtered);
      setPage(1);
    }
  }, [search, allMahallas]);

  // Get current page mahallas
  const getCurrentPageMahallas = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredMahallas.slice(start, end);
  };

  const currentMahallas = getCurrentPageMahallas();
  const totalFiltered = filteredMahallas.length;

  // Statistics
  const uniqueDistricts = [...new Set(allMahallas.map(m => m.district))];

  // POST Mahalla
  const addMutation = useMutation({
    mutationFn: async (newData) => {
      const res = await baseURL.post("/v1/mahallas/", newData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mahallas"]);
      setModal(false);
      messageApi.success("Mahalla muvaffaqiyatli qo'shildi");
      form.resetFields();
    },
    onError: () => {
      messageApi.error("Mahalla qo'shishda xatolik yuz berdi");
      form.resetFields();
    },
  });

  // PATCH Mahalla
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await baseURL.patch(`/v1/mahallas/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mahallas"]);
      setModal(false);
      setEditing(null);
      messageApi.success("Mahalla ma'lumotlari yangilandi");
      form.resetFields();
    },
    onError: () => {
      messageApi.error("Yangilashda xatolik yuz berdi");
    },
  });

  // DELETE Mahalla
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await baseURL.delete(`/v1/mahallas/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mahallas"]);
      messageApi.success("Mahalla o'chirildi");
    },
    onError: () => {
      messageApi.error("O'chirishda xatolik yuz berdi");
    },
  });

  // Modal open
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

  // SAVE
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

  // Columns
  const columns = [
    {
      title: "№",
      dataIndex: "id",
      width: 80,
      render: (_, __, index) => (
        <Badge 
          count={index + 1 + (page - 1) * pageSize}
          style={{ backgroundColor: "#f0f0f0", color: "#666" }}
        />
      ),
    },
    {
      title: "Mahalla",
      dataIndex: "name",
      width: 250,
      render: (name) => (
        <div className="flex items-center gap-2">
          <Avatar 
            icon={<HomeOutlined />} 
            className="bg-blue-50"
            style={{ color: "#3b82f6" }}
            size={32}
          />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: "Tuman",
      dataIndex: "district",
      width: 200,
      render: (district) => (
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-gray-400" />
          <Text>{district}</Text>
        </div>
      ),
    },
    {
      title: "Yaratilgan sana",
      dataIndex: "created_at",
      width: 180,
      render: (d) => (
        <Tooltip title={dayjs(d).format("DD.MM.YYYY HH:mm:ss")}>
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-gray-400" />
            <Text>{dayjs(d).format("DD.MM.YYYY")}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Amallar",
      width: 100,
      render: (_, record) => (
        <Space>
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
                  title: "Mahallani o'chirish",
                  content: (
                    <div>
                      <Text>
                        <Text strong>{record.name}</Text> mahallasini o'chirmoqchimisiz?
                      </Text>
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <Text type="warning" className="text-sm">
                          ⚠️ Diqqat! Ushbu mahallaga bog'liq ma'lumotlar o'chiriladi.
                        </Text>
                      </div>
                    </div>
                  ),
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
      {ctx}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HomeOutlined className="text-blue-500 text-xl" />
                <Title level={3} className="!mb-0">
                  Mahallalar ({allMahallas.length})
                </Title>
              </div>
              <Text type="secondary">
                Tuman va mahallalarni boshqaring
              </Text>
            </div>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openAdd}
              size="large"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              Yangi mahalla
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">

        {/* Main Card */}
        <Card className="shadow-sm rounded-xl border-0">
          {/* Search */}
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
            
            <AntInput
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Mahalla yoki tuman nomi bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="large"
              className="rounded-lg"
            />
          </div>

          <Divider className="my-3" />

          {/* Info Bar */}
          <div className="flex items-center justify-between mb-4">
            <Badge 
              count={totalFiltered} 
              showZero 
            />
            <Text type="secondary" className="text-sm">
              {totalFiltered === 0 
                ? "Hech qanday mahalla topilmadi" 
                : `${totalFiltered} ta mahalla ko'rsatilmoqda`}
            </Text>
          </div>

          {/* Table */}
          <Table
            dataSource={currentMahallas}
            columns={columns}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalFiltered,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Mahallalar mavjud emas"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-8"
                />
              ),
            }}
          />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {editing ? (
              <EditOutlined className="text-blue-500" />
            ) : (
              <PlusOutlined className="text-blue-500" />
            )}
            <span>{editing ? "Mahallani tahrirlash" : "Yangi mahalla qo'shish"}</span>
          </div>
        }
        open={modal}
        onOk={handleSave}
        onCancel={() => {
          setModal(false);
          setEditing(null);
          form.resetFields();
        }}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={addMutation.isPending || updateMutation.isPending}
        width={500}
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Mahalla nomi"
            rules={[{ required: true, message: "Mahalla nomini kiriting" }]}
          >
            <Input 
              prefix={<HomeOutlined className="text-gray-400" />}
              placeholder="Masalan: Olmazor mahallasi"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="district"
            label="Tuman nomi"
            rules={[{ required: true, message: "Tuman nomini kiriting" }]}
          >
            <Input 
              prefix={<EnvironmentOutlined className="text-gray-400" />}
              placeholder="Masalan: Chilonzor tumani"
              size="large"
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <Text type="secondary" className="text-xs">
              ℹ️ Mahalla qo'shilgandan so'ng, ushbu mahallaga oqsoqol biriktirishingiz mumkin.
            </Text>
          </div>
        </Form>
      </Modal>

      <style jsx>{`
        :global(.ant-table-thead > tr > th) {
          background: #f8fafc !important;
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
        }
        
        :global(.ant-table-tbody > tr:hover > td) {
          background: #f8fafc !important;
        }
        
        :global(.ant-table-cell) {
          padding: 14px 16px !important;
        }
      `}</style>
    </div>
  );
};

export default MahallasPage;