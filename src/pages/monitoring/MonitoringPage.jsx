import { Card, Table, Tag, Typography, Progress } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "../../auth/api/api";

const { Title } = Typography;

// 🔹 Mock data
const mockMonitoringData = [
  {
    key: "1",
    name: "Hasanov Akmal",
    mahalla: "Navruz",
    received: 50,
    viewed: 45,
    inspected: 40,
    avgTime: "2 kun",
    late: 3,
  },
  {
    key: "2",
    name: "Qodirov Bobur",
    mahalla: "Tinchlik",
    received: 60,
    viewed: 55,
    inspected: 52,
    avgTime: "1.5 kun",
    late: 1,
  },
  {
    key: "3",
    name: "Tursunov Jasur",
    mahalla: "Bog'iston",
    received: 40,
    viewed: 30,
    inspected: 25,
    avgTime: "3 kun",
    late: 5,
  },
];

// 📊 Columns
const columns = [
  {
    title: "Rahbar",
    dataIndex: "name",
    render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
  },
  { title: "Mahalla", dataIndex: "mahalla" },
  { title: "Qabul qilingan", dataIndex: "received", align: "center" },
  { title: "Ko'rilgan", dataIndex: "viewed", align: "center" },
  { title: "Tekshirilgan", dataIndex: "inspected", align: "center" },
  {
    title: "Bajarilish",
    align: "center",
    render: (_, r) => {
      const pct = Math.round((r.inspected / r.received) * 100);

      return (
        <Progress
          percent={pct}
          size="small"
          strokeColor={
            pct > 80 ? "#16a34a" : pct > 50 ? "#d4930d" : "#ff4d4f"
          }
        />
      );
    },
  },
  { title: "O'rtacha vaqt", dataIndex: "avgTime", align: "center" },
  {
    title: "Kechikkan",
    dataIndex: "late",
    align: "center",
    render: (v) =>
      v > 0 ? (
        <Tag color="red" icon={<WarningOutlined />}>
          {v}
        </Tag>
      ) : (
        <Tag color="green">0</Tag>
      ),
  },
];

// 🔻 Kechikkan murojaatlar
const lateApplications = [
  {
    key: "1",
    id: 1023,
    service: "Yer ajratish",
    citizen: "Toshmatov Bobur",
    mahalla: "Navruz",
    days: 5,
    leader: "Hasanov Akmal",
  },
  {
    key: "2",
    id: 1031,
    service: "Ijtimoiy yordam",
    citizen: "Ergasheva Malika",
    mahalla: "Tinchlik",
    days: 3,
    leader: "Qodirov Bobur",
  },
  {
    key: "3",
    id: 1045,
    service: "Kommunal xizmat",
    citizen: "Abdullayev Jasur",
    mahalla: "Bog'iston",
    days: 7,
    leader: "Tursunov Jasur",
  },
];

const lateColumns = [
  {
    title: "ID",
    dataIndex: "id",
    render: (v) => `#${v}`,
  },
  { title: "Xizmat", dataIndex: "service" },
  { title: "Fuqaro", dataIndex: "citizen" },
  { title: "Mahalla", dataIndex: "mahalla" },
  { title: "Rahbar", dataIndex: "leader" },
  {
    title: "Kechikish (kun)",
    dataIndex: "days",
    render: (v) => <Tag color="red">{v} kun</Tag>,
  },
];

// 🚀 Page
const MonitoringPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['service'],
    queryFn: async () => {
      let res = await baseURL.get('/v1/services/');
      console.log(res.data)
      return res.data
    }
  })

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Monitoring
      </Title>

      <Card
        bordered={false}
        title="Mahalla rahbarlari faoliyati"
        style={{ marginBottom: 16 }}
      >
        <Table
          dataSource={mockMonitoringData}
          columns={columns}
          pagination={false}
          size="middle"
          rowKey="key"
        />
      </Card>

      <Card
        bordered={false}
        title={
          <span>
            <WarningOutlined
              style={{ color: "#ff4d4f", marginRight: 8 }}
            />
            Kechikkan murojaatlar
          </span>
        }
      >
        <Table
          dataSource={lateApplications}
          columns={lateColumns}
          pagination={false}
          size="middle"
          rowKey="key"
        />
      </Card>
    </div>
  );
};

export default MonitoringPage;