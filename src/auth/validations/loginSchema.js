import * as Yup from 'yup'
export const loginSchema = Yup.object({
    username: Yup.string().min(4, 'Kamida 4 ta belgi!').required('Loginni kiriting!'),
    password: Yup.string().min(3, 'Kamida 3 ta belgi!').required('Passwordni kiriting!')
})