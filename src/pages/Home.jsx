import { Input, Button, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Facebook, Instagram, LogIn, Send, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";
import { loginSchema } from "../auth/validations/loginSchema";
import { useDispatch } from "react-redux";
import { login } from "../redux/slice";
import { baseURL } from "../auth/api/api";

const { Title, Text } = Typography;

export default function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();

    const {
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormik({
        initialValues: {
            username: "",
            password: ""
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            try {
                let resp = await baseURL.post("/v1/auth/login/", values);

                dispatch(
                    login({
                        access: resp.data.access,
                        refresh: resp.data.refresh,
                        user: values.username,
                        role: resp.data.role,
                    })
                );

                messageApi.success("Muvaffaqiyatli kirildi ✅");
                navigate("/dashboard");

            } catch (err) {
                messageApi.error("Login yoki parol noto‘g‘ri ❌");
            }
        }
    });

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            {/* 🔥 Toast context */}
            {contextHolder}

            {/* TOP BAR */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-6 py-1 flex justify-between">
                    <div className="flex gap-3 items-center text-[16px]">
                        <span>📢 Davlat xizmatlari monitoring tizimi</span>
                        <span className="opacity-90">
                            Barcha murojaatlarni yagona platformada boshqaring
                        </span>
                    </div>

                    <div className="flex gap-5">
                        <button className="cursor-pointer">Telegram</button>
                        <button className="cursor-pointer">Facebook</button>
                        <button className="cursor-pointer">Instagram</button>
                        <button className="cursor-pointer">Youtube</button>
                        <button
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-2 border rounded-lg py-2 px-4 cursor-pointer transition-all duration-200 active:duration-75 active:scale-95"
                        >
                            <p className="font-semibold">Kirish</p>
                            <LogIn size={19} />
                        </button>
                    </div>
                </div>
            </div>

            {/* NAVBAR */}
            <div className="bg-white border-b border-zinc-500/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-xl font-bold">
                        Hokimlik Monitoring Tizimi
                    </div>

                    <div className="flex gap-6 text-gray-600">
                        <button className="cursor-pointer border border-zinc-700/20 py-2 px-4 rounded-full">
                            📞 1242
                        </button>
                        <button className="cursor-pointer border border-zinc-700/20 py-2 px-4 rounded-full">
                            Yordam
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <div className="max-w-7xl mx-auto py-10 flex gap-6 px-6">

                {/* LEFT */}
                <div className="flex-[2] bg-white rounded-2xl py-8">
                    <div className="max-w-md">
                        <Title level={2}>
                            Davlat xizmatlari monitoring tizimi
                        </Title>

                        <Text className="text-gray-500 block mb-6">
                            Fuqarolar murojaatlarini qabul qilish, nazorat qilish va
                            tahlil qilish uchun yagona platforma
                        </Text>

                        <form onSubmit={handleSubmit} className="mt-4">

                            <label className="block mb-1">Username</label>
                            <Input
                                name="username"
                                value={values.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ padding: "10px" }}
                                placeholder="Username kiriting"
                            />
                            <p className="text-red-500 text-sm">
                                {touched.username && errors.username}
                            </p>

                            <label className="block mt-4 mb-1">Password</label>
                            <Input.Password
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ padding: "10px" }}
                                placeholder="Password kiriting"
                                iconRender={(visible) =>
                                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                }
                            />
                            <p className="text-red-500 text-sm">
                                {touched.password && errors.password}
                            </p>

                            <Button
                                htmlType="submit"
                                type="primary"
                                block
                                loading={isSubmitting}
                                className="mt-6"
                                style={{
                                    padding: "21px",
                                    fontSize: "16px",
                                    fontWeight: "600"
                                }}
                            >
                                {isSubmitting ? "Kuting..." : "Tizimga kirish"}
                            </Button>

                        </form>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[420px]">
                    <img
                        src="https://images.unsplash.com/photo-1553877522-43269d4ea984"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-blue-900/70" />

                    <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                        <div className="flex flex-col">
                            <Title level={4} style={{ color: "#fff" }}>
                                Hokimlik boshqaruv va monitoring tizimi
                            </Title>

                            <div className="text-sm opacity-90">
                                Tizim orqali murojaatlar, mahallalar va xizmatlar faoliyati nazorat qilinadi
                            </div>
                        </div>

                        <div className="flex gap-4 text-sm">
                            <button onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer">
                                <Send size={17} /> Telegram
                            </button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer">
                                <Youtube size={17} /> Youtube
                            </button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer">
                                <Facebook size={17} /> Facebook
                            </button>
                            <button onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer">
                                <Instagram size={17} /> Instagram
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="bg-[#0b3c91] text-white text-sm">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <span>© 2026 Hokimlik monitoring tizimi</span>
                    <span className="flex items-center gap-2">
                        <p className="font-semibold text-[16px]">Call-markaz:</p>
                        <button className="cursor-pointer border py-2 px-4 rounded-full">
                            📞 1242
                        </button>
                    </span>
                </div>
            </div>

        </div>
    );
}