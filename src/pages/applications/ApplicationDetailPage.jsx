import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Upload,
  Timeline,
  Select,
  Divider,
  Avatar,
  Space,
  Badge,
  Descriptions,
  Tooltip,
  Steps,
  Progress,
  Alert,
} from "antd";
import {
  ArrowLeft,
  User,
  Phone,
  Home,
  FileText,
  Flag,
  Clock,
  Calendar,
  UploadCloud,
  Edit2,
  Archive,
  CheckCircle,
  RotateCcw,
  Send,
  Paperclip,
  History,
  Info,
  AlertCircle,
  MapPin,
  Building,
  Hash,
  Mail,
  Download,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { baseURL } from "../../auth/api/api";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const { Title, Text, Paragraph } = Typography;

const statusMap = {
  new: { label: "Yangi", color: "blue", icon: <FileText size={14} />, status: "processing" },
  closed: { label: "Yopilgan", color: "error", icon: <CheckCircle size={14} />, status: "error" },
  reopened: { label: "Qayta ochilgan", color: "orange", icon: <RotateCcw size={14} />, status: "warning" },
  archive: { label: "Arxiv", color: "default", icon: <Archive size={14} />, status: "default" },
  "send-to-mahalla": { label: "Mahallaga yuborilgan", color: "success", icon: <Send size={14} />, status: "success" },
};

const priorityMap = {
  high: { label: "Yuqori", color: "error", icon: <AlertCircle size={14} />, gradient: "from-red-500 to-red-600" },
  medium: { label: "O‘rta", color: "warning", icon: <Clock size={14} />, gradient: "from-orange-500 to-orange-600" },
  low: { label: "Past", color: "default", icon: <Info size={14} />, gradient: "from-gray-500 to-gray-600" },
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // ================= FETCH =================
  const { data, isLoading, isError } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/applications/${id}/`);
      return res.data;
    },
  });

  const { data: mahalla, isLoading: isMahallaLoading, isError: isMahallaError } = useQuery({
    queryKey: ["mahalla", data?.mahalla],
    enabled: !!data?.mahalla,
    queryFn: async () => {
      const res = await baseURL.get(`/v1/mahallas/${data.mahalla}/`);
      return res.data;
    },
  });

  const { data: appTypes = [], isLoading: isAppTypesLoading, isError: isAppTypesError } = useQuery({
    queryKey: ["appTypes"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/application-types/");
      return res.data.results || res.data;
    },
  });

  const { data: attachments = [], isLoading: isAttachmentsLoading, isError: isAttachmentsError } = useQuery({
    queryKey: ["attachments", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/applications/${id}/attachments/`);
      return res.data.results || res.data;
    },
  });

  const { data: timeline = [], isLoading: isTimelineLoading, isError: isTimelineError } = useQuery({
    queryKey: ["timeline", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/applications/${id}/timeline/`);
      return res.data;
    },
  });

  // ================= MUTATIONS =================
  const updateMutation = useMutation({
    mutationFn: (body) => baseURL.patch(`/v1/applications/${id}/`, body),
    onSuccess: () => {
      queryClient.invalidateQueries(["application", id]);
      messageApi.success("Ariza muvaffaqiyatli yangilandi");
      setEditOpen(false);
    },
    onError: () => {
      messageApi.error("Yangilashda xatolik yuz berdi");
    },
  });

  const actionMutation = useMutation({
    mutationFn: (action) => baseURL.post(`/v1/applications/${id}/${action}/`),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries(["application", id]);
      const actionMessages = {
        archive: "Ariza arxivlandi",
        close: "Ariza yopildi",
        reopen: "Ariza qayta ochildi",
        "send-to-mahalla": "Ariza mahallaga yuborildi",
      };
      messageApi.success(actionMessages[action] || "Status o'zgartirildi");
    },
    onError: () => {
      messageApi.error("Amalni bajarishda xatolik yuz berdi");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return baseURL.post(`/v1/applications/${id}/attachments/`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments", id]);
      messageApi.success("Fayl muvaffaqiyatli yuklandi");
    },
    onError: () => {
      messageApi.error("Fayl yuklashda xatolik yuz berdi");
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => baseURL.delete(`/v1/attachments/${attachmentId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments", id]);
      messageApi.success("Fayl o'chirildi");
    },
  });

  // ================= HELPERS =================
  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx"].includes(ext)) return "excel";
    return "file";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("DD.MM.YYYY HH:mm");
  };

  // ================= UI =================
  // Loader
  if(isLoading ){
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Error
  if(isError || isMahallaError || isAppTypesError || isAttachmentsError || isTimelineError){
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  const status = statusMap[data.status] || { label: data.status, color: "default", icon: <FileText size={14} /> };
  const priority = priorityMap[data.priority] || { label: data.priority, color: "default", icon: <Info size={14} /> };
  const isOverdue = data.deadline && dayjs(data.deadline).isBefore(dayjs());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {contextHolder}

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Space size="middle">
              <Button 
                type="text" 
                icon={<ArrowLeft size={20} />} 
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100"
              >
                Ortga
              </Button>
              <Divider type="vertical" className="h-8" />
              <div>
                <div className="flex items-center gap-3">
                  <Title level={4} className="!mb-0">
                    Ariza #{data.app_number}
                  </Title>
                  <Space size="small">
                    <Badge 
                      status={status.status || "default"} 
                      text={status.label}
                      color={status.color}
                    />
                    <Badge 
                      status="default" 
                      text={priority.label}
                      color={priority.color}
                    />
                  </Space>
                </div>
                <Text type="secondary" className="text-sm">
                  Yaratilgan: {formatDate(data.created_at)}
                </Text>
              </div>
            </Space>

            <Space size="small" wrap>
              <Tooltip title="Tahrirlash">
                <Button 
                  icon={<Edit2 size={16} />} 
                  onClick={() => setEditOpen(true)}
                >
                  Tahrirlash
                </Button>
              </Tooltip>
              {data.status !== "archive" && (
                <Tooltip title="Arxivlash">
                  <Button 
                    icon={<Archive size={16} />} 
                    onClick={() => actionMutation.mutate("archive")}
                  >
                    Arxiv
                  </Button>
                </Tooltip>
              )}
              {data.status !== "closed" && data.status !== "archive" && (
                <Tooltip title="Yopish">
                  <Button 
                    danger
                    icon={<CheckCircle size={16} />} 
                    onClick={() => actionMutation.mutate("close")}
                  >
                    Yopish
                  </Button>
                </Tooltip>
              )}
              {data.status === "closed" && (
                <Tooltip title="Qayta ochish">
                  <Button 
                    icon={<RotateCcw size={16} />} 
                    onClick={() => actionMutation.mutate("reopen")}
                  >
                    Qayta ochish
                  </Button>
                </Tooltip>
              )}
              {data.status !== "send-to-mahalla" && data.status !== "closed" && (
                <Tooltip title="Mahallaga yuborish">
                  <Button 
                    type="primary"
                    icon={<Send size={16} />} 
                    onClick={() => actionMutation.mutate("send-to-mahalla")}
                  >
                    Mahallaga yuborish
                  </Button>
                </Tooltip>
              )}
            </Space>
          </div>
        </div>
      </div>

      <div className=" py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Content */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-blue-500" />
                <Title level={5} className="!mb-0">Ariza matni</Title>
              </div>
              <Paragraph className="text-gray-700 leading-relaxed">
                {data.content}
              </Paragraph>
              
              <Divider className="my-4" />
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <Text type="secondary">Bajarish muddati:</Text>
                    <Text className={isOverdue ? "text-red-500 font-medium" : ""}>
                      {formatDate(data.deadline)}
                      {isOverdue && " (Muddat o'tgan)"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <Text type="secondary">Yopilgan vaqt:</Text>
                    <Text>{data.closed_at ? formatDate(data.closed_at) : "-"}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Attachments */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Paperclip size={20} className="text-blue-500" />
                  <Title level={5} className="!mb-0">Fayllar</Title>
                  <Badge count={attachments.length} showZero />
                </div>
                <Upload
                  beforeUpload={(file) => {
                    uploadMutation.mutate(file);
                    return false;
                  }}
                  showUploadList={false}
                >
                  <Button type="primary" icon={<UploadCloud size={16} />}>
                    Fayl yuklash
                  </Button>
                </Upload>
              </div>

              {attachments.length === 0 ? (
                <Alert
                  message="Hech qanday fayl mavjud emas"
                  description="Fayl yuklash tugmasi orqali fayl qo'shishingiz mumkin"
                  type="info"
                  showIcon
                  className="bg-gray-50"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar 
                          size={40} 
                          className="bg-blue-100"
                          icon={<FileText size={20} className="text-blue-500" />}
                        />
                        <div className="flex-1 min-w-0">
                          <Text className="font-medium truncate block">
                            {file.file.split("/").pop()}
                          </Text>
                          <Text type="secondary" className="text-xs">
                            {formatDate(file.created_at)}
                          </Text>
                        </div>
                      </div>
                      <Space size="small">
                        <Tooltip title="Ko'rish">
                          <Button 
                            type="text" 
                            size="small"
                            icon={<Eye size={16} />}
                            onClick={() => {
                              setPreviewFile(file);
                              setPreviewOpen(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Yuklab olish">
                          <Button 
                            type="text" 
                            size="small"
                            icon={<Download size={16} />}
                            href={file.file}
                            target="_blank"
                          />
                        </Tooltip>
                        <Tooltip title="O'chirish">
                          <Button 
                            type="text" 
                            size="small"
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => deleteAttachmentMutation.mutate(file.id)}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Timeline */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                <History size={20} className="text-blue-500" />
                <Title level={5} className="!mb-0">Tarix</Title>
              </div>
              
              {timeline.length === 0 ? (
                <Alert message="Hech qanday tarix mavjud emas" type="info" showIcon />
              ) : (
                <Timeline
                  items={timeline.map((item, index) => ({
                    color: index === timeline.length - 1 ? "green" : "blue",
                    children: (
                      <div className="pb-2">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <Text strong className="capitalize">
                            {item.action.replace(/-/g, " ")}
                          </Text>
                          <Text type="secondary" className="text-xs">
                            {formatDate(item.created_at)}
                          </Text>
                        </div>
                        {item.note && (
                          <Text type="secondary" className="text-sm">
                            {item.note}
                          </Text>
                        )}
                      </div>
                    ),
                  }))}
                />
              )}
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Citizen Information */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-500" />
                <Title level={5} className="!mb-0">Fuqaro ma'lumotlari</Title>
              </div>
              
              <Descriptions column={1} size="small" className="space-y-2">
                <Descriptions.Item label={<Space><User size={14} /> Ism</Space>}>
                  <Text strong>{data.citizen_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><Phone size={14} /> Telefon</Space>}>
                  <Text>{data.citizen_phone || "-"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><Home size={14} /> Manzil</Space>}>
                  <Text>{data.address_text}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><Building size={14} /> Mahalla</Space>}>
                  <Text>{mahalla?.name || "-"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><MapPin size={14} /> Tuman</Space>}>
                  <Text>{mahalla?.district || "-"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Progress Section */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                <Info size={20} className="text-blue-500" />
                <Title level={5} className="!mb-0">Holat</Title>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Text type="secondary">Bajarilish</Text>
                    <Text strong>
                      {data.status === "closed" ? "100%" : 
                       data.status === "send-to-mahalla" ? "75%" : 
                       data.status === "reopened" ? "25%" : "0%"}
                    </Text>
                  </div>
                  <Progress 
                    percent={
                      data.status === "closed" ? 100 : 
                      data.status === "send-to-mahalla" ? 75 : 
                      data.status === "reopened" ? 25 : 0
                    }
                    status={
                      data.status === "closed" ? "success" : 
                      data.status === "reopened" ? "exception" : "active"
                    }
                    showInfo={false}
                  />
                </div>
                
                <Steps
                  direction="vertical"
                  size="small"
                  current={
                    data.status === "closed" ? 3 :
                    data.status === "send-to-mahalla" ? 2 :
                    data.status === "reopened" ? 1 : 0
                  }
                  items={[
                    { title: "Ariza qabul qilindi", description: formatDate(data.created_at) },
                    { title: "Ko'rib chiqilmoqda" },
                    { title: "Mahallaga yuborildi" },
                    { title: "Yopildi" },
                  ]}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Edit2 size={18} />
            <span>Arizani tahrirlash</span>
          </div>
        }
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={() => form.validateFields().then((values) => updateMutation.mutate(values))}
        okText="Saqlash"
        cancelText="Bekor qilish"
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={data}>
          <Form.Item name="citizen_name" label="Fuqaro ismi" rules={[{ required: true, message: "Iltimos fuqaro ismini kiriting" }]}>
            <Input placeholder="Ism familiya" />
          </Form.Item>

          <Form.Item name="citizen_phone" label="Telefon raqami">
            <Input placeholder="+998 90 123 45 67" />
          </Form.Item>

          <Form.Item name="content" label="Ariza matni" rules={[{ required: true, message: "Iltimos ariza matnini kiriting" }]}>
            <Input.TextArea rows={4} placeholder="Ariza matnini kiriting..." />
          </Form.Item>

          <Form.Item name="app_type" label="Ariza turi">
            <Select
              placeholder="Ariza turini tanlang"
              options={appTypes.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* File Preview Modal */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
        title="Fayl ko'rish"
      >
        {previewFile && (
          <div className="flex justify-center">
            {getFileIcon(previewFile.file) === "image" ? (
              <img src={previewFile.file} alt="Preview" className="max-w-full h-auto" />
            ) : (
              <iframe
                src={previewFile.file}
                title="File Preview"
                className="w-full h-[70vh]"
                frameBorder="0"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}