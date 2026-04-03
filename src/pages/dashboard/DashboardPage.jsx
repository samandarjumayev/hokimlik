import {
  Clock,
  Send,
  CheckCircle,
  Layers,
  Calendar,
  Eye,
  MessageSquareOff,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";
import { Table, Tag, Card, Progress, Empty, Tooltip, Badge, Avatar } from "antd";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/uz-latn';

dayjs.extend(relativeTime);
dayjs.locale('uz-latn');

// Enhanced STATUS MAP - Matches API data
const statusMap = {
  new: { label: "Yangi", color: "blue", icon: <FileText size={14} />, bgColor: "bg-blue-50", textColor: "text-blue-700" },
  in_review: { label: "Ko'rib chiqilmoqda", color: "orange", icon: <Eye size={14} />, bgColor: "bg-orange-50", textColor: "text-orange-700" },
  sent_to_mahalla: { label: "Mahallaga yuborilgan", color: "green", icon: <Send size={14} />, bgColor: "bg-green-50", textColor: "text-green-700" },
  acknowledged: { label: "Qabul qilindi", color: "cyan", icon: <CheckCircle size={14} />, bgColor: "bg-cyan-50", textColor: "text-cyan-700" },
  inspected: { label: "Tekshirildi", color: "purple", icon: <CheckCircle size={14} />, bgColor: "bg-purple-50", textColor: "text-purple-700" },
  closed: { label: "Yopilgan", color: "red", icon: <CheckCircle size={14} />, bgColor: "bg-red-50", textColor: "text-red-700" },
  archived: { label: "Arxivlangan", color: "gray", icon: <Layers size={14} />, bgColor: "bg-gray-50", textColor: "text-gray-700" },
  reopened: { label: "Qayta ochilgan", color: "orange", icon: <Activity size={14} />, bgColor: "bg-orange-50", textColor: "text-orange-700" },
  send_to_mahalla: { label: "Mahallaga yuborilgan", color: "green", icon: <Send size={14} />, bgColor: "bg-green-50", textColor: "text-green-700" },
};

// PRIORITY MAP - Matches API data
const priorityMap = {
  urgent: { label: "Shoshilinch", color: "red", icon: <AlertTriangle size={12} /> },
  high: { label: "Yuqori", color: "red", icon: <AlertTriangle size={12} /> },
  medium: { label: "O‘rta", color: "orange", icon: <Clock size={12} /> },
  low: { label: "Past", color: "default", icon: <CheckCircle size={12} /> },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("week");

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
      console.log("Applications API response:", res.data);
      return res.data.results || [];
    },
  });

  // Calculate delayed applications (kechikkan) based on deadline
  const delayedCount = useMemo(() => {
    const today = dayjs().startOf('day');
    return applications.filter(app => {
      if (!app.deadline) return false;
      const deadline = dayjs(app.deadline);
      // Check if deadline is in the past and application is not closed
      return deadline.isBefore(today) && app.status !== "closed";
    }).length;
  }, [applications]);

  // Loader
  if(isLoadingSummary || isLoadingApplications){
    return <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <Loader />
    </div>
  }

  // Error
  if(isErrorSummary || isErrorApplications){
    return <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <ErrorComponent />
    </div>
  }

  // Process status data from API
  const statusData = summary?.statuslar_boyicha || [];
  const statusCounts = {};
  statusData.forEach(item => {
    statusCounts[item.status] = item.count;
  });

  // Enhanced stats with actual data
  const stats = [
    {
      title: "Jami hisobotlar",
      value: summary?.jami_murojaatlar || 0,
      icon: Layers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+12%",
    },
    {
      title: "Yangi hisobotlar",
      value: statusCounts.new || 0,
      icon: FileText,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: "+5%",
    },
    {
      title: "Mahallaga yuborilgan",
      value: statusCounts.sent_to_mahalla || 0,
      icon: Send,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "+8%",
    },
    {
      title: "Yopilgan",
      value: statusCounts.closed || 0,
      icon: CheckCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      trend: "-3%",
    },
    {
      title: "Kechikkanlar",
      value: delayedCount,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: "+2%",
    },
    {
      title: "Bugungi",
      value: summary?.bugungi_murojaatlar || 0,
      icon: Calendar,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      trend: "0%",
    },
  ];

  // Last 4 applications
  const last4 = [...applications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  // Chart data from statuslar_boyicha
  const chartData = statusData.map(item => ({
    status: statusMap[item.status]?.label || item.status,
    count: item.count,
    color: statusMap[item.status]?.color || "gray",
  }));

  // Table columns - Fixed status and priority render
  const columns = [
    {
      title: "#",
      dataIndex: "id",
      width: 60,
      render: (v) => (
        <Badge 
          count={`${v}`} 
          style={{ backgroundColor: "#f0f0f0", color: "#666" }}
          className="font-mono"
        />
      ),
    },
    {
      title: "Fuqaro",
      dataIndex: "citizen_name",
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <Avatar size={32} className="bg-blue-100">
            {name?.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-400">{record.citizen_phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Holat",
      dataIndex: "status",
      render: (s) => {
        const st = statusMap[s] || { label: s || "Noma'lum", color: "default", icon: <FileText size={14} />, bgColor: "bg-gray-50", textColor: "text-gray-700" };
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${st.bgColor} ${st.textColor}`}>
            {st.icon}
            <span className="text-xs font-medium">{st.label}</span>
          </div>
        );
      },
    },
    {
      title: "Muhimlik",
      dataIndex: "priority",
      render: (p) => {
        const pr = priorityMap[p] || { label: p || "Oddiy", color: "default", icon: <CheckCircle size={12} /> };
        const getBgColor = () => {
          if (pr.color === "red") return "bg-red-50 text-red-700";
          if (pr.color === "orange") return "bg-orange-50 text-orange-700";
          return "bg-gray-50 text-gray-700";
        };
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getBgColor()}`}>
            {pr.icon}
            <span className="text-xs font-medium">{pr.label}</span>
          </div>
        );
      },
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      render: (d) => (
        <Tooltip title={dayjs(d).format("DD.MM.YYYY HH:mm")}>
          <div className="flex flex-col">
            <span className="text-sm">{dayjs(d).format("DD.MM.YYYY")}</span>
            <span className="text-xs text-gray-400">{dayjs(d).fromNow()}</span>
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="py-5">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Boshqaruv paneli
              </h1>
              <p className="text-gray-500">
                hisobotlar statistikasi va tahlili
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={i} 
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden"
                  bodyStyle={{ padding: "16px" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={stat.iconColor} size={20} />
                    </div>
                    <Badge 
                      count={stat.trend} 
                      style={{ backgroundColor: stat.trend.startsWith('+') ? '#10b981' : '#ef4444' }}
                      className="text-xs"
                    />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stat.title}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Status Distribution */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                <span className="font-medium">Holat taqsimoti</span>
              </div>
            }
            className="border-0 shadow-sm rounded-xl"
          >
            {chartData.length === 0 ? (
              <Empty description="Ma'lumot mavjud emas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="space-y-3">
                {chartData.map((item, idx) => {
                  const percent = (item.count / (summary?.jami_murojaatlar || 1)) * 100;
                  const getColor = () => {
                    if (item.color === "blue") return "#3b82f6";
                    if (item.color === "orange") return "#f59e0b";
                    if (item.color === "green") return "#10b981";
                    if (item.color === "cyan") return "#06b6d4";
                    if (item.color === "purple") return "#8b5cf6";
                    if (item.color === "red") return "#ef4444";
                    return "#6b7280";
                  };
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getColor() }} />
                          <span className="text-sm text-gray-600">{item.status}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                      </div>
                      <Progress 
                        percent={percent} 
                        showInfo={false}
                        strokeColor={getColor()}
                        size="small"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Applications Table */}
        <Card 
          className="border-0 shadow-sm rounded-xl"
          title={
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-green-500" />
                <span className="font-medium">Oxirgi hisobotlar</span>
              </div>
              <button
                onClick={() => navigate("/dashboard/applications")}
                className="text-blue-600 text-sm hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                Barchasini ko'rish
                <TrendingUp size={14} />
              </button>
            </div>
          }
        >
          {last4.length === 0 ? (
            <Empty 
              description="Hech qanday hisobot topilmadi" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            />
          ) : (
            <Table
              dataSource={last4}
              columns={columns}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/dashboard/applications/${record.id}`),
                className: "cursor-pointer hover:bg-gray-50 transition-colors",
              })}
              className="applications-table"
            />
          )}
        </Card>
      </div>

      <style jsx>{`
        .applications-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .applications-table :global(.ant-table-tbody > tr:hover > td) {
          background: #f8fafc;
        }
        
        .applications-table :global(.ant-table-cell) {
          padding: 12px 16px !important;
        }
        
        :root {
          --blue-500: #3b82f6;
          --green-500: #10b981;
          --purple-500: #8b5cf6;
          --orange-500: #f59e0b;
          --red-500: #ef4444;
          --gray-500: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;