import { Bell, LogOut, Menu, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout, toggleMenu, toggleSidebar } from "../../redux/slice";
import { useNavigate } from "react-router-dom";

export default function Header(){
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { menu } = useSelector(state => state.backend)

    return <div className="relative z-100 shadow-lg sticky top-0 bg-white z-10 h-[70px] flex items-center justify-between px-5 pr-5">
        <button onClick={() => dispatch(toggleSidebar())} className="cursor-pointer transition-all duration-200 active:duration-75 active:duration-75 active:scale-90">
            <Menu />
        </button>
        
        <div className="flex items-center gap-3">
            {/* <button title="Notifications" className="relative cursor-pointer rounded-full p-2 text-[#494949] hover:bg-[#56565625] hover:shadow-lg transition-all duration-200">
                <Bell size={20} />
                <p className="absolute top-0 right-0 text-white bg-red-500 rounded-full w-4.5 h-4.5 text-[12px] flex items-center justify-center">4</p>
            </button> */}
            <button onClick={() => dispatch(toggleMenu())} className="cursor-pointer bg-[#0e3b9a] text-white rounded-full p-2 transition-all duration-200">
                <User size={20} />
            </button>
        </div>

        {/* Hide Menu */}
        <div className={`${menu ? 'hidden' : 'flex'} flex-col gap-1 absolute top-[75px] w-[130px] shadow-lg border border-zinc-200 bg-white right-5 rounded-lg p-1`}>

            <button onClick={() => {
                dispatch(logout());
                dispatch(toggleMenu())
                navigate('/')
            }} className="w-full flex items-center gap-2 text-red-500 text-[14px] hover:text-white hover:bg-red-500 py-2 px-3 rounded cursor-pointer transition-all duration-150 active:duration-75 active:scale-95">
                <LogOut size={18} />
                Chiqish
            </button>
        </div>
    </div>
}