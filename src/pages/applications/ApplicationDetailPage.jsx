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
  ArchiveRestore,
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
import { useSelector } from "react-redux";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const { Title, Text, Paragraph } = Typography;

// Status Map - Correct workflow order
const statusMap = {
  new: { label: "Yangi", color: "blue", icon: <FileText size={14} />, status: "processing", step: 0, percent: 0 },
  in_review: { label: "Ko'rib chiqilmoqda", color: "orange", icon: <Eye size={14} />, status: "active", step: 1, percent: 20 },
  sent_to_mahalla: { label: "Mahallaga yuborilgan", color: "green", icon: <Send size={14} />, status: "active", step: 2, percent: 40 },
  acknowledged: { label: "Qabul qilindi", color: "cyan", icon: <CheckCircle size={14} />, status: "active", step: 3, percent: 60 },
  inspected: { label: "Tekshirildi", color: "purple", icon: <CheckCircle size={14} />, status: "active", step: 4, percent: 80 },
  closed: { label: "Yopilgan", color: "red", icon: <CheckCircle size={14} />, status: "success", step: 5, percent: 100 },
  archived: { label: "Arxivlangan", color: "default", icon: <Archive size={14} />, status: "default", step: 5, percent: 100 },
  reopened: { label: "Qayta ochilgan", color: "orange", icon: <RotateCcw size={14} />, status: "warning", step: 1, percent: 20 },
  "send-to-mahalla": { label: "Mahallaga yuborilgan", color: "green", icon: <Send size={14} />, status: "success", step: 2, percent: 40 },
};

const priorityMap = {
  urgent: { label: "Shoshilinch", color: "error", icon: <AlertCircle size={14} />, gradient: "from-red-500 to-red-600" },
  high: { label: "Yuqori", color: "error", icon: <AlertCircle size={14} />, gradient: "from-red-500 to-red-600" },
  medium: { label: "O‘rta", color: "warning", icon: <Clock size={14} />, gradient: "from-orange-500 to-orange-600" },
  low: { label: "Past", color: "default", icon: <Info size={14} />, gradient: "from-gray-500 to-gray-600" },
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useSelector((state) => state.backend);

  const [messageApi, contextHolder] = message.useMessage();
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Check permissions based on role
  const canEdit = role === "super_admin";
  const canUpload = role === "super_admin" || role === "hokim";
  const canViewTimeline = role === "super_admin" || role === "hokim";
  const canArchive = role === "super_admin" || role === "hokim";
  const canClose = role === "super_admin" || role === "hokim";
  const canReopen = role === "super_admin" || role === "hokim";
  const canSendToMahalla = role === "super_admin" || role === "hokim";

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
      if(role !== "service_staff"){
        const res = await baseURL.get(`/v1/mahallas/${data.mahalla}/`);
        return res.data;
      }
    },
  });

  const { data: appTypes = [] } = useQuery({
    queryKey: ["appTypes"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/application-types/");
      return res.data.results || res.data;
    },
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/applications/${id}/attachments/`);
      console.log("Attachments response:", res.data);
      return res.data;
    },
    enabled: canViewTimeline,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ["timeline", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/applications/${id}/timeline/`);
      return res.data;
    },
    enabled: canViewTimeline,
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
    onError: (error) => {
      console.error("Action error:", error);
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

  // ================= HELPERS =================
  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if ("xls", "xlsx".includes(ext)) return "excel";
    return "file";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("DD.MM.YYYY HH:mm");
  };

  const getCurrentStatusData = () => {
    return statusMap[data?.status] || { label: data?.status || "Noma'lum", color: "default", icon: <FileText size={14} />, step: 0, percent: 0 };
  };

  const getProgressPercent = () => {
    const statusData = statusMap[data?.status];
    if (!statusData) return 0;
    return statusData.percent;
  };

  const getCurrentStep = () => {
    const statusData = statusMap[data?.status];
    if (!statusData) return 0;
    return statusData.step;
  };

  const getProgressStatus = () => {
    if (data?.status === "closed") return "success";
    if (data?.status === "reopened") return "exception";
    if (data?.status === "archived") return "success";
    return "active";
  };

  // Steps items in correct order:
  // 1. Yangi
  // 2. Ko'rib chiqilmoqda
  // 3. Mahallaga yuborildi
  // 4. Qabul qilindi
  // 5. Tekshirildi
  // 6. Yopildi
  const stepsItems = [
    { title: "Yangi", description: formatDate(data?.created_at) },
    { title: "Ko'rib chiqilmoqda" },
    { title: "Mahallaga yuborildi" },
    { title: "Qabul qilindi" },
    { title: "Tekshirildi" },
    { title: "Yopildi" },
  ];

  // Check if buttons should be shown based on current status
  const showArchive = data?.status !== "archived" && data?.status !== "archive";
  const showClose = data?.status !== "closed" && data?.status !== "archived" && data?.status !== "archive";
  const showReopen = data?.status === "closed" || data?.status === "archived" || data?.status === "archive";
  const showSendToMahalla = data?.status !== "sent_to_mahalla" && data?.status !== "send-to-mahalla" && data?.status !== "closed" && data?.status !== "archived" && data?.status !== "archive";
  
  // Check if application is archived
  const isArchived = data?.status === "archived" || data?.status === "archive";

  // ================= UI =================
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  const statusData = getCurrentStatusData();
  const progressPercent = getProgressPercent();
  const currentStep = getCurrentStep();
  const progressStatus = getProgressStatus();
  const priority = priorityMap[data.priority] || { label: data.priority || "Oddiy", color: "default", icon: <Info size={14} /> };
  const isOverdue = data.deadline && dayjs(data.deadline).isBefore(dayjs());

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {contextHolder}

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm rounded-t-xl">
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
                <div className="flex items-center gap-3 flex-wrap">
                  <Title level={4} className="!mb-0">
                    Ariza #{data.app_number || data.id}
                  </Title>
                  <Space size="small" wrap>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                      statusData.color === "blue" ? "bg-blue-50 text-blue-700" : 
                      statusData.color === "orange" ? "bg-orange-50 text-orange-700" : 
                      statusData.color === "green" ? "bg-green-50 text-green-700" : 
                      statusData.color === "cyan" ? "bg-cyan-50 text-cyan-700" : 
                      statusData.color === "purple" ? "bg-purple-50 text-purple-700" : 
                      statusData.color === "red" ? "bg-red-50 text-red-700" : 
                      "bg-gray-50 text-gray-700"
                    }`}>
                      {statusData.icon}
                      <span className="text-xs font-medium">{statusData.label}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                      priority.color === "error" ? "bg-red-50 text-red-700" : 
                      priority.color === "warning" ? "bg-orange-50 text-orange-700" : 
                      "bg-gray-50 text-gray-700"
                    }`}>
                      {priority.icon}
                      <span className="text-xs font-medium">{priority.label}</span>
                    </div>
                  </Space>
                </div>
                <Text type="secondary" className="text-sm">
                  Yaratilgan: {formatDate(data.created_at)}
                </Text>
              </div>
            </Space>

            <Space size="small" wrap>
              {/* Tahrirlash - only for super_admin */}
              {canEdit && (
                <Tooltip title="Tahrirlash">
                  <Button 
                    icon={<Edit2 size={16} />} 
                    onClick={() => setEditOpen(true)}
                  >
                    Tahrirlash
                  </Button>
                </Tooltip>
              )}
              
              {/* Arxivlash - for super_admin and hokim */}
              {canArchive && showArchive && (
                <Tooltip title="Arxivlash">
                  <Button 
                    icon={<Archive size={16} />} 
                    onClick={() => actionMutation.mutate("archive")}
                  >
                    Arxiv
                  </Button>
                </Tooltip>
              )}
              
              {/* Yopish - for super_admin and hokim */}
              {canClose && showClose && (
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
              
              {/* Mahallaga yuborish - for super_admin and hokim */}
              {canSendToMahalla && showSendToMahalla && (
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

      {/* Ariza matni */}
      <div className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Content */}
            <Card className="shadow-sm rounded-xl border-0 !mb-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-blue-500" />
                <Title level={5} className="!mb-0">Ariza matni</Title>
              </div>
              <Paragraph className="text-gray-700 leading-relaxed">
                {data.content}
              </Paragraph>
              
              <Divider className="my-4" />
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <Text type="secondary">Bajarish muddati:</Text>
                    <Text className={isOverdue ? "text-red-500 font-medium" : ""}>
                      {formatDate(data.deadline)}
                      {isOverdue && " (Muddat o'tgan)"}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <Text type="secondary">Yopilgan vaqt:</Text>
                    <Text>{data.closed_at ? formatDate(data.closed_at) : "-"}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Attachments - only if user has permission */}
            {canViewTimeline && (
              <Card className="shadow-sm rounded-xl border-0">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Paperclip size={20} className="text-blue-500" />
                    <Title level={5} className="!mb-0">Fayllar</Title>
                    <Badge count={attachments.length} showZero />
                  </div>
                  {canUpload && (
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
                  )}
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
                          <Avatar size={40}  className="bg-blue-100" icon={<FileText size={20} className="text-blue-500" />} />
                          <div className="flex-1 min-w-0">
                            <Text className="font-medium truncate block">
                              {file.file?.split("/").pop() || "Fayl"}
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
                            onClick={() => console.log(file)}
                              type="text" 
                              size="small"
                              icon={<Download size={16} />}
                              href={file.file}
                              target="_blank"
                            />
                          </Tooltip>
                        </Space>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
            
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-1">
            {/* Citizen Information */}
            <Card className="shadow-sm rounded-xl border-0 !mb-4">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-500" />
                <Title level={5} className="!mb-0">Fuqaro ma'lumotlari</Title>
              </div>
              
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<Space><User size={14} /> Ism</Space>}>
                  <Text strong>{data.citizen_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><Phone size={14} /> Telefon</Space>}>
                  <Text>{data.citizen_phone || "-"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><Home size={14} /> Manzil</Space>}>
                  <Text>{data.address_text}</Text>
                </Descriptions.Item>
                {role !== "service_staff" && (
                  <>
                    <Descriptions.Item label={<Space><Building size={14} /> Mahalla</Space>}>
                      <Text>{mahalla?.name || "-"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Space><MapPin size={14} /> Tuman</Space>}>
                      <Text>{mahalla?.district || "-"}</Text>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* Progress Section */}
            <Card className="shadow-sm rounded-xl border-0">
              <div className="flex items-center gap-2 mb-4">
                {isArchived ? (
                  <ArchiveRestore size={20} className="text-orange-500" />
                ) : (
                  <Info size={20} className="text-blue-500" />
                )}
                <Title level={5} className="!mb-0">
                  {isArchived ? "Arxivlangan" : "Bajarilish holati"}
                </Title>
              </div>
              
              {isArchived ? (
                <div className="text-center py-3">
                  <ArchiveRestore size={48} className="text-gray-400 mx-auto mb-3" />
                  <Text className="text-gray-500">Bu ariza arxivlangan</Text>
                  <br /> <br />
                  {/* Qayta ochish - for super_admin and hokim (yopilgan yoki arxivlangan) */}
                  {canReopen && showReopen && (
                    <Tooltip>
                      <Button 
                        icon={<RotateCcw size={16} />} 
                        type="primary"
                        onClick={() => actionMutation.mutate("reopen")}
                      >
                        Qayta ochish
                      </Button>
                    </Tooltip>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text type="secondary">Bajarilish foizi</Text>
                      <Text strong className={progressPercent === 100 ? "text-green-600" : ""}>
                        {progressPercent}%
                      </Text>
                    </div>
                    <Progress 
                      percent={progressPercent}
                      status={progressStatus}
                      strokeColor={progressPercent === 100 ? "#10b981" : progressStatus === "exception" ? "#ef4444" : "#3b82f6"}
                      showInfo={false}
                    />
                  </div>
                  
                  <Steps
                    direction="vertical"
                    size="small"
                    current={currentStep}
                    status={progressStatus}
                    items={stepsItems.map((item, idx) => ({
                      title: item.title,
                      description: idx === 0 ? item.description : null,
                      status: idx <= currentStep ? "finish" : "wait",
                    }))}
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal - only visible for super_admin */}
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