import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { baseURL } from "../../auth/api/api";
import { Card, Typography, Row, Col, Tag, Divider, Button, Spin } from "antd";
import { ArrowLeft, User, Phone, Home, FileText, Flag, Clock, Calendar } from "lucide-react";

const { Title, Text } = Typography;

const statusMap = {
  new: { label: "Yangi", color: "#0a64a0" },
  closed: { label: "Yopilgan", color: "#0a6400" },
  "send-to-mahalla": { label: "Mahallaga yuborilgan", color: "#b07f0a" },
};

const priorityMap = {
  high: { label: "Yuqori", color: "#a00a0a" },
  medium: { label: "O‘rta", color: "#b07f0a" },
  low: { label: "Past", color: "#0a64a0" },
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const res = await baseURL.get(`/v1/applications/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: mahallaData } = useQuery({
    queryKey: ["mahalla", data?.mahalla],
    queryFn: async () => {
      if (!data?.mahalla) return null;
      const res = await baseURL.get(`/api/v1/mahallas/${data.mahalla}/`);
      return res.data;
    },
    enabled: !!data?.mahalla,
  });

  if (isLoading)
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Spin tip="Yuklanmoqda..." />
      </div>
    );
  if (isError)
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Text type="danger">Xatolik yuz berdi...</Text>
      </div>
    );

  const status = statusMap[data.status] || { label: data.status, color: "#6b7280" };
  const priority = priorityMap[data.priority] || { label: data.priority, color: "#6b7280" };

  const labelStyle = { color: "#374151", fontWeight: 500 };
  const valueStyle = { fontWeight: 600, fontSize: 16 };

  return (
    <div className="px-5 max-w-[900px] mx-auto space-y-6">
      {/* ORTGA TUGMA */}
      <Button
        type="default"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Ortga
      </Button>

      {/* HEADER */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          padding: "20px",
          background: "#f0f4f8",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Title level={3}>Ariza №{data.app_number}</Title>
        <div className="flex gap-2 mt-2">
          <Tag color={status.color}>{status.label}</Tag>
          <Tag color={priority.color}>{priority.label}</Tag>
        </div>
      </Card>

      {/* FUQARO MA'LUMOTLARI */}
      <Card
        title="Fuqaro ma'lumotlari"
        bordered={false}
        style={{ borderRadius: 16, padding: "20px", background: "#ffffff" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text style={labelStyle}><User size={16} className="mr-2" /> Fuqaro:</Text>
            <div style={valueStyle}>{data.citizen_name}</div>
          </Col>
          <Col xs={24} sm={12}>
            <Text style={labelStyle}><Phone size={16} className="mr-2" /> Telefon:</Text>
            <div style={valueStyle}>{data.citizen_phone || "-"}</div>
          </Col>
          <Col xs={24}>
            <Text style={labelStyle}><Home size={16} className="mr-2" /> Manzil:</Text>
            <div style={valueStyle}>{data.address_text}</div>
          </Col>
          <Col xs={24}>
            <Text style={labelStyle}><Flag size={16} className="mr-2" /> Mahalla:</Text>
            <div style={valueStyle}>{mahallaData?.name || "-"}</div>
          </Col>
        </Row>
      </Card>

      {/* ARIZA TAFSILOTLARI */}
      <Card
        title="Ariza tafsilotlari"
        bordered={false}
        style={{ borderRadius: 16, padding: "20px", background: "#ffffff" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Text style={labelStyle}><FileText size={16} className="mr-2" /> Matn:</Text>
            <div style={valueStyle}>{data.content}</div>
          </Col>
          <Col xs={24} sm={12}>
            <Text style={labelStyle}><Clock size={16} className="mr-2" /> Muddat:</Text>
            <div style={valueStyle}>{data.deadline}</div>
          </Col>
          <Col xs={24} sm={12}>
            <Text style={labelStyle}><Calendar size={16} className="mr-2" /> Yopilgan sana:</Text>
            <div style={valueStyle}>{data.closed_at ? new Date(data.closed_at).toLocaleDateString() : "-"}</div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}