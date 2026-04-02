import { useState } from 'react';
import { User, Lock, ArrowLeft, Shield, Building2, LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useFormik } from 'formik';
import { loginSchema } from '../auth/validations/loginSchema';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slice';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../auth/api/api';

const initialValues = {
    username: '',
    password: ''
}

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting } = useFormik({
        initialValues,
        onSubmit: async (values) => {
            setErrorMessage('');
            try {
                let resp = await baseURL.post('/v1/auth/login/', values);
                if (resp.data.role === 'oqsoqol') {
                    setErrorMessage('Oqsoqol roli uchun kirish huquqi cheklangan');
                    setTimeout(() => navigate('/'), 1500);
                } else {
                    dispatch(login({
                        access: resp.data.access,
                        refresh: resp.data.refresh,
                        user: values.username,
                        role: resp.data.role === 'xodim' ? 'service_staff' : resp.data.role,
                        id: resp.data.id,
                        service_id: resp.data.service || null
                    }));
                    navigate('/dashboard');
                }
            } catch (xatolik) {
                setErrorMessage('Login yoki parol noto\'g\'ri. Iltimos qaytadan urinib ko\'ring.');
            }
        },
        validationSchema: loginSchema
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}></div>
            </div>

            {/* Animated blobs */}
            <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

            <div className="relative w-full max-w-md mx-4">
                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
                    
                    {/* Top Decoration */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

                    {/* Back Button */}
                    <button 
                        onClick={() => navigate('/')} 
                        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium cursor-pointer">Orqaga</span>
                    </button>

                    {/* Header */}
                    <div className="pt-12 pb-6 px-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                            <Building2 className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 cursor-pointer">Tizimga kirish</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Davlat xizmatlari monitoring tizimi
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Foydalanuvchi nomi
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="username"
                                    value={values.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        touched.username && errors.username
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                                    }`}
                                />
                            </div>
                            {touched.username && errors.username && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parol
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full pl-10 pr-12 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        touched.password && errors.password
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-red-600 text-sm text-center">{errorMessage}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            disabled={isSubmitting} 
                            type="submit" 
                            className={`w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                                isSubmitting 
                                    ? 'opacity-70 cursor-not-allowed' 
                                    : 'hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-98'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Kutilmoqda...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>Tizimga kirish</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center gap-6 mt-6 cursor-context-menu">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <CheckCircle size={14} />
                        <span>Davlat standarti</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Shield size={14} />
                        <span>Ma'lumotlar himoyasi</span>
                    </div>
                </div>
            </div>
        </div>
    );
}