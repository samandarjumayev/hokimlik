import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowRoles }) {

    const { isAuth, role } = useSelector(state => state.backend);

    // login qilmagan bo‘lsa
    if (!isAuth) {
        return <Navigate to="/login" replace />
    }

    // role tekshirish
    if (allowRoles && !allowRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}