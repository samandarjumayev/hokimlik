import {
  Clock,
  Send,
  CheckCircle,
  Layers,
  Calendar,
  Eye,
  MessageSquareOff,
} from "lucide-react";
import { Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import { useNavigate } from "react-router-dom";

// STATUS
const statusMap = {
  new: { label: "Yangi", color: "blue" },
  process: { label: "Jarayonda", color: "orange" },
  sent: { label: "Yuborilgan", color: "purple" },
  done: { label: "Bajarildi", color: "green" },
  rejected: { label: "Rad etildi", color: "red" },
};

// PRIORITY
const priorityMap = {
  high: { label: "Yuqori", color: "red" },
  medium: { label: "O‘rta", color: "blue" },
  low: { label: "Past", color: "default" },
};

const DashboardPage = () => {
  const navigate = useNavigate();

  // SUMMARY
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/dashboard/summary/");
      return res.data;
    },
  });

  // APPLICATIONS
  const {
    data: applications = [],
    isLoading: isLoadingApplications,
    isError: isErrorApplications,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await baseURL.get("/v1/applications/");
      return res.data.results;
    },
  });

  // 🔥 faqat oxirgi 4 ta
  const last4 = [...applications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  if (isLoadingSummary || isLoadingApplications) return <Loader />;
  if (isErrorSummary || isErrorApplications) return <ErrorComponent />;

  const stats = [
    {
      title: "Jami murojaatlar",
      value: summary?.jami_murojaatlar,
      icon: Layers,
      color: "text-blue-600",
    },
    {
      title: "Bugungi murojaatlar",
      value: summary?.bugungi_murojaatlar,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Ko'rib chiqilmoqda",
      value: summary?.statuslar?.korib_chiqilmoqda,
      icon: Eye,
      color: "text-orange-500",
    },
    {
      title: "Mahallaga yuborilgan",
      value: summary?.statuslar?.mahallaga_yuborilgan,
      icon: Send,
      color: "text-purple-600",
    },
    {
      title: "Yangi murojaatlar",
      value: summary?.statuslar?.yangi,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Yopilgan murojaatlar",
      value: summary?.statuslar?.yopilgan,
      icon: MessageSquareOff,
      color: "text-red-600",
    },
    {
      title: "Kechikkan murojaatlar",
      value: summary?.statuslar?.kechikkan || 0,
      icon: Clock,
      color: "text-red-600",
    },
  ];

  // TABLE COLUMN (ApplicationsPage bilan bir xil)
  const columns = [
    {
      title: "№",
      dataIndex: "id",
      render: (v) => <b>#{v}</b>,
    },
    {
      title: "Fuqaro",
      dataIndex: "citizen_name",
    },
    {
      title: "Telefon",
      dataIndex: "citizen_phone",
    },
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
  ];

  return (
    <div className="p-4">
      {/* TITLE */}
      <h2 className="text-lg font-semibold mb-6">
        Boshqaruv paneli
      </h2>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {stat.title}
                </span>
                <Icon className={stat.color} size={20} />
              </div>
              <div className="text-2xl font-bold mt-2">
                {stat.value || 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* 📊 MIDDLE (SENING DIAGRAMMANG — O‘ZGARMADI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Left */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="font-medium mb-4">
            Xizmat turlari bo'yicha
          </h3>

          {[
            { label: "Nikoh ro'yxati", value: 35 },
            { label: "Yer ajratish", value: 45 },
            { label: "Ijtimoiy yordam", value: 20 },
          ].map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-medium mb-4">
            Holat taqsimoti
          </h3>

          {Object.entries(statusMap).map(([k, v]) => (
            <div key={k} className="flex justify-between mb-2">
              <span
                className={`text-white text-xs px-2 py-1 rounded bg-${v.color}-500`}
              >
                {v.label}
              </span>
              <b>{summary?.statuslar?.[k] || 0}</b>
            </div>
          ))}
        </div>
      </div>

      {/* 📋 OXIRGI MUROJAATLAR */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <div className="flex justify-between mb-4">
          <h3 className="font-medium">
            Oxirgi murojaatlar
          </h3>
          <button
            onClick={() => navigate("/dashboard/applications")}
            className="text-blue-600 text-sm hover:underline"
          >
            Barchasi →
          </button>
        </div>

        <Table
          dataSource={last4}
          columns={columns}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () =>
              navigate(`/dashboard/applications/${record.id}`),
          })}
        />
      </div>
    </div>
  );
};

export default DashboardPage;