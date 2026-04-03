import { Bell, LogOut, Menu, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, toggleMenu, toggleSidebar } from "../../redux/slice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header(){
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { menu } = useSelector(state => state.backend)
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return <div className="relative z-100 shadow-lg sticky top-0 bg-white z-10 h-[70px] flex items-center justify-between px-4 md:px-5 pr-4 md:pr-5">
        <button onClick={() => dispatch(toggleSidebar())} className="cursor-pointer transition-all duration-200 active:duration-75 active:scale-90">
            <Menu />
        </button>
        
        <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => dispatch(toggleMenu())} className="cursor-pointer bg-[#0e3b9a] text-white rounded-full p-2 transition-all duration-200">
                <User size={18} className="md:w-5 md:h-5" />
            </button>
        </div>

        {/* Hide Menu */}
        <div className={`${menu ? 'hidden' : 'flex'} flex-col gap-1 absolute top-[65px] md:top-[75px] w-[120px] md:w-[130px] shadow-lg border border-zinc-200 bg-white right-3 md:right-5 rounded-lg p-1 z-50`}>
            <button onClick={() => {
                dispatch(logout());
                dispatch(toggleMenu())
                navigate('/')
            }} className="w-full flex items-center gap-2 text-red-500 text-[13px] md:text-[14px] hover:text-white hover:bg-red-500 py-2 px-3 rounded cursor-pointer transition-all duration-150 active:duration-75 active:scale-95">
                <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                Chiqish
            </button>
        </div>
    </div>
}