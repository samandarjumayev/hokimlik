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
} from "antd";
import { SearchOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// STATUS MAP (keyinchalik yangi status qo'shish oson)
const statusMap = {
  new: { label: "Yangi", color: "blue" },
  archive: { label: "Arxiv", color: "gray" },
  closed: { label: "Yopilgan", color: "red" },
  reopen: { label: "Qayta ochilgan", color: "orange" },
  "send-to-mahalla": { label: "Mahallaga yuborilgan", color: "green" },
  attachment: { label: "Fayl qo‘shilgan", color: "purple" },
};

// PRIORITY
const priorityMap = {
  high: { label: "Yuqori", color: "red" },
  medium: { label: "O‘rta", color: "blue" },
  low: { label: "Past", color: "default" },
};

const appTypeOptions = [
  { value: 1, label: "Oddiy" },
  { value: 2, label: "Shoshilinch" },
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

  // FETCH APPLICATIONS
  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/applications/");
      return res.data.results;
    },
  });

  // FETCH MAHALLA LIST
  const { data: mahallaList = [] } = useQuery({
    queryKey: ["mahallaList"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/mahallas/");
      return res.data.results;
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
      messageApi.success("Murojaat qo‘shildi");
      setModalOpen(false);
      form.resetFields();
    },
  });

  // STATUS ACTION
  const statusMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      const res = await baseURL.post(`/v1/applications/${id}/${action}/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      messageApi.success("Status yangilandi");
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
    attachments: "Fayllar",
  };

  // FILTERING
  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchSearch =
        !search ||
        a.citizen_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(a.id).includes(search);

      const matchStatus = !statusFilter || a.status === statusFilter;

      const created = new Date(a.created_at).getTime();
      const matchDate =
        !dateRange.length ||
        (created >= dateRange[0]?.startOf("day").valueOf() &&
          created <= dateRange[1]?.endOf("day").valueOf());

      return matchSearch && matchStatus && matchDate;
    });
  }, [applications, search, statusFilter, dateRange]);

  // CREATE HANDLER
  const handleCreate = () => {
    form.validateFields().then((values) => {
      createMutation.mutate({
        ...values,
        deadline: values.deadline?.format("YYYY-MM-DD"),
      });
    });
  };

  // ACTION HANDLER
  const handleAction = (e, id, action) => {
    e.stopPropagation(); // ROW CLICKNI TO'XTATISH
    if (action === "attachments") {
      navigate(`/dashboard/applications/${id}`);
    } else {
      statusMutation.mutate({ id, action });
    }
  };

  // TABLE COLUMNS
  const columns = [
    { title: "№", dataIndex: "id", render: (v) => <b>#{v}</b> },
    { title: "Fuqaro", dataIndex: "citizen_name" },
    { title: "Telefon", dataIndex: "citizen_phone" },
    {
      title: "Holat",
      dataIndex: "status",
      render: (s) => {
        const st = statusMap[s] || { label: s, color: "default" };
        return <Tag color={st.color}>{st.label}</Tag>;
      },
    },
    {
      title: "Muhimlik",
      dataIndex: "priority",
      render: (p) => {
        const pr = priorityMap[p] || { label: p, color: "default" };
        return <Tag color={pr.color}>{pr.label}</Tag>;
      },
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Amallar",
      render: (_, record) => {
        const actions = getMenuItemsByRole(role);

        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: actions.map((action) => ({
                key: action,
                label: (
                  <Button
                    type="text"
                    style={{ width: "100%", textAlign: "left" }}
                    onClick={(e) => handleAction(e, record.id, action)}
                  >
                    {actionLabels[action]}
                  </Button>
                ),
              })),
            }}
          >
            <Button icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        );
      },
    },
  ];

  if (isLoading) return <Loader />;
  if (isError) return <ErrorComponent />;

  return (
    <div>
      {contextHolder}

      <div className="flex justify-between mb-5">
        <Title level={4}>Murojaatlar</Title>

        {(role === "xodim" || role === "super_admin") && (
          <Button type="primary" onClick={() => setModalOpen(true)}>
            + Yangi murojaat
          </Button>
        )}
      </div>

      <Card>
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>

          <Col xs={12} sm={5}>
            <Select
              placeholder="Holat"
              allowClear
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(statusMap).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
            />
          </Col>

          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(v) => setDateRange(v || [])}
            />
          </Col>
        </Row>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => navigate(`/dashboard/applications/${record.id}`),
          })}
        />
      </Card>

      {/* MODAL */}
      <Modal
        title="Yangi murojaat"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="app_number" label="Ariza raqami" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="service" label="Service" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="app_type" label="Murojaat turi" rules={[{ required: true }]}>
            <Select options={appTypeOptions} />
          </Form.Item>

          <Form.Item name="content" label="Matn" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="citizen_name" label="Fuqaro" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="citizen_phone" label="Telefon">
            <Input />
          </Form.Item>

          <Form.Item name="address_text" label="Manzil" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="mahalla" label="Mahalla" rules={[{ required: true }]}>
            <Select
              options={mahallaList.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
            />
          </Form.Item>

          <Form.Item name="priority" label="Muhimlik" rules={[{ required: true }]}>
            <Select
              options={Object.entries(priorityMap).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
            />
          </Form.Item>

          <Form.Item name="deadline" label="Muddat" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApplicationsPage;