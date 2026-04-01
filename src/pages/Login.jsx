import { useState } from 'react';
import { User, Lock, ArrowLeft } from 'lucide-react';
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
    const navigate = useNavigate()

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting } = useFormik({
        initialValues,
        onSubmit: async (values) => {
            try{
                let resp = await baseURL.post('/v1/auth/login/', values);
                console.log(resp.data);
                dispatch(login({
                    access: resp.data.access,
                    refresh: resp.data.refresh,
                    user: values.username,
                    role: resp.data.role,
                    id: resp.data.id
                }));
                navigate('/dashboard')
            }catch(xatolik){
                alert(xatolik)
            }
        },
        validationSchema: loginSchema
    })

    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#051538] to-[#0e3b9a]">
        <div className="relative w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">

            <button onClick={() => {
                navigate('/')
            }} className='absolute hover:bg-gray-300/40 rounded-full flex items-center justify-center p-1 top-6 left-6 text-blue-500 transition-all duration-200 active:duration-75 active:scale-90 cursor-pointer'>
                <ArrowLeft size={27} />
            </button>

            {/* Logo va sarlavha */}
            <div className="text-center mb-8">
            {/* <div className="w-18 h-14 rounded-xl bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                HMS
            </div> */}
            <h3 className="text-blue-600 text-2xl font-semibold mb-1">
                Kirish
            </h3>
            <p className="text-gray-500 text-sm">
                Davlat Xizmatlari Murojaatlarini Monitoring Qilish va Nazorat Tizimi
            </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            name='username'
                            id='username'
                            placeholder="Username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                        />
                    </div>
                    <p className="text-red-500 text-[13px]">{touched.username && errors.username}</p>
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            name='password'
                            id='password'
                            placeholder="Parol"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                        />
                    </div>
                    <p className="text-red-500 text-[13px]">{touched.password && errors.password}</p>
                </div>

            <div>
                <button disabled={isSubmitting} type="submit" className={`${isSubmitting ? 'cursor-wait opacity-85' : 'hover:bg-blue-700 cursor-pointer active:scale-96'} w-full h-11 bg-[#0e3b9a]  text-white font-medium rounded-md transition-all duration-200 active:duration-75 selection:bg-white/0`}>
                    {isSubmitting ? 'Kuting...' : 'Kirish'}
                </button>
            </div>
            </form>

            <p className="text-center text-gray-500 text-xs mt-4">
            Demo: superadmin / 123
            </p>
        </div>
    </div>
};
