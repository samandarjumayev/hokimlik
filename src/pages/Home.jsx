import { Input, Button, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Facebook, Instagram, LogIn, Send, Youtube, Twitter, Linkedin, Shield, CheckCircle, Clock, BarChart3, Users, Building2, Phone, Mail, MapPin, Globe } from "lucide-react";
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
                        id: resp.data.id,
                        service: resp.data.service,
                    })
                );
                messageApi.success("Muvaffaqiyatli kirildi ✅");
                if(resp.data.role === "service_staff") {
                    navigate("/dashboard/applications");
                } else {
                    navigate("/dashboard");
                }
            } catch (err) {
                messageApi.error("Login yoki parol noto‘g‘ri ❌");
            }
        }
    });

    const features = [
        { icon: <Shield size={24} />, title: "Ishonchli tizim", desc: "Ma'lumotlar xavfsizligi kafolatlangan" },
        { icon: <Clock size={24} />, title: "Real vaqt", desc: "Hisobotlar real vaqtda kuzatiladi" },
        { icon: <BarChart3 size={24} />, title: "Tahlil va statistika", desc: "Batafsil hisobot va tahlillar" },
        { icon: <Users size={24} />, title: "Barcha xizmatlar", desc: "IIB, 103, 101 va boshqalar" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {contextHolder}

            {/* TOP BAR */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm">
                <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-3 cursor-context-menu">
                        <Shield size={16} />
                        <span>Davlat xizmatlari monitoring tizimi</span>
                        <span className="hidden md:inline text-blue-200">|</span>
                        <span className="text-blue-100 text-xs">Barcha hisobotlarni yagona platformada boshqaring</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-1.5 px-3 transition-all duration-200 cursor-pointer active:duration-75 active:scale-95"
                        >
                            <LogIn size={16} />
                            <span className="font-medium">Kirish</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* NAVBAR */}
            <div className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-context-menu">
                        <Building2 className="text-blue-600" size={28} />
                        <div>
                            <div className="text-xl font-bold text-gray-800">Hokimlik Monitoring Tizimi</div>
                            <div className="text-xs text-gray-500">Davlat xizmatlari monitoringi</div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 py-2 px-4 rounded-full transition-all duration-200 text-gray-600 hover:text-blue-600 cursor-pointer">
                            <Phone size={16} />
                            <span>1272</span>
                        </button>
                        <button className="flex items-center gap-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 py-2 px-4 rounded-full transition-all duration-200 text-gray-600 hover:text-blue-600 cursor-pointer">
                            <Mail size={16} />
                            <span>Yordam</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT - FLEX GROW */}
            <div className="flex-grow">
                <div className="max-w-7xl mx-auto py-12 px-6">

                    {/* Login & Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT - Login Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col justify-center">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 h-12">
                                    <div className="w-12 h-full bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                        <LogIn className="text-blue-600" size={24} />
                                    </div>
                                    <Title level={2} className="!mb-2 text-gray-800 h-full">
                                        Tizimga kirish
                                    </Title>
                                </div>
                                <Text className="text-gray-500">
                                    Hisobotlarni kuzatish va boshqarish uchun tizimga kiring
                                </Text>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <Input
                                        name="username"
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        size="large"
                                        placeholder="username"
                                        className="rounded-lg"
                                        status={touched.username && errors.username ? "error" : ""}
                                    />
                                    {touched.username && errors.username && (
                                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <Input.Password
                                        name="password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        size="large"
                                        placeholder="••••••••"
                                        className="rounded-lg"
                                        iconRender={(visible) =>
                                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                        }
                                        status={touched.password && errors.password ? "error" : ""}
                                    />
                                    {touched.password && errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    block
                                    loading={isSubmitting}
                                    size="large"
                                    className="h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    {isSubmitting ? "Kuting..." : "Tizimga kirish"}
                                </Button>
                            </form>
                        </div>

                        {/* RIGHT - Hero Section */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
                                alt="Government building"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                            <Building2 size={32} className="text-white" />
                                        </div>
                                        <Title level={2} className="!text-white !leading-[30px]">
                                            Hokimlik boshqaruv <br />va monitoring tizimi
                                        </Title>
                                    </div>
                                    <Text className="!text-white block mb-6">
                                        Fuqarolar hisobotlarini qabul qilish, nazorat qilish va
                                        tahlil qilish uchun yagona platforma
                                    </Text>
                                </div>

                                <div className="flex gap-3 text-sm">
                                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-all cursor-pointer !text-white">
                                        <Send size={16} /> Telegram
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-all cursor-pointer !text-white">
                                        <Youtube size={16} /> Youtube
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-all cursor-pointer !text-white">
                                        <Facebook size={16} /> Facebook
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-all cursor-pointer !text-white">
                                        <Instagram size={16} /> Instagram
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-16">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tizim imkoniyatlari</h2>
                            <p className="text-gray-500">Davlat xizmatlarini raqamli boshqarish tizimi</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-600">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER - Stuck to bottom */}
            <footer className="bg-gray-900 text-white mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 size={24} />
                                <span className="font-bold text-lg">Hokimlik Monitoring</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Davlat xizmatlari monitoring tizimi - fuqarolar hisobotlarini qabul qilish va nazorat qilish platformasi
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Bog'lanish</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Phone size={14} />
                                    <span>1272 - Ishonch telefoni</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <span>info@hokimlik.uz</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <span>Toshkent sh., O'zbekiston</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Xizmatlar</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><button className="hover:text-white transition-colors">IIB / Militsiya</button></li>
                                <li><button className="hover:text-white transition-colors">Tez tibbiy yordam</button></li>
                                <li><button className="hover:text-white transition-colors">Favqulodda vaziyatlar</button></li>
                                <li><button className="hover:text-white transition-colors">Kommunal xizmatlar</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Ijtimoiy tarmoqlar</h4>
                            <div className="flex gap-3">
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <Facebook size={18} />
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <Instagram size={18} />
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <Youtube size={18} />
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Globe size={14} />
                                    <span>www.hokimlik.uz</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-500">
                        <p>© 2026 Hokimlik monitoring tizimi. Barcha huquqlar himoyalangan.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}