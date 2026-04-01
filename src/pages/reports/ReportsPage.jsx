import { Card, Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";
import Loader from "../../components/ui/Loader";
import ErrorComponent from "../../components/ui/ErrorComponent";

const { Title } = Typography;

// 🔹 Columns
const columns = [
  {
    title: "Murojaat №",
    dataIndex: "application",
    render: (v) => <span>#{v}</span>,
  },
  {
    title: "Rahbar",
    dataIndex: "oqsoqol_name",
  },
  {
    title: "Amaliyot",
    dataIndex: "action_type",
    render: (v) => <Tag color="blue">{v}</Tag>,
  },
  {
    title: "Izoh",
    dataIndex: "comment_text",
    ellipsis: true,
  },
  {
    title: "Telegram ID",
    dataIndex: "telegram_message_id",
  },
  {
    title: "Sana",
    dataIndex: "created_at",
    render: (d) => new Date(d).toLocaleString(),
  },
];

// 🚀 Page
const ReportsPage = () => {
  const { data: reports = [], isLoading, isError } = useQuery({
    queryKey: ["reports-with-users"],
    queryFn: async () => {
      // 1. Reportsni olish
      const res = await baseURL.get("/v1/mahalla-reports/");
      console.log(res.data)
      const reportsData = res.data.results;

      // 2. Unique oqsoqol IDlar
      const userIds = [...new Set(reportsData.map((r) => r.oqsoqol))];

      // 3. Har bir userni olish
      const users = await Promise.all(
        userIds.map((id) =>
          baseURL.get(`/v1/users/${id}/`).then((res) => res.data)
        )
      );

      // 4. Map qilish (id -> user)
      const userMap = {};
      users.forEach((u) => {
        userMap[u.id] = u;
      });

      // 5. Reportsga qo‘shish
      return reportsData.map((r) => ({
        ...r,
        key: r.id,
        oqsoqol_name:
          userMap[r.oqsoqol]?.full_name ||
          userMap[r.oqsoqol]?.username ||
          `ID: ${r.oqsoqol}`,
      }));
    },
  });

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
      <Title level={4} style={{ marginBottom: 24 }}>
        Mahalla hisobotlari
      </Title>

      <Card bordered={false}>
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="key"
          pagination={{
            pageSize: 10,
            showTotal: (t) => `Jami: ${t}`,
          }}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;