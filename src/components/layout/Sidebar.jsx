import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import {
    ChartColumn,
    ClipboardList,
    Gauge,
    MapPin,
    Settings,
    Users, 
    Landmark,
    Building2
} from "lucide-react";
import { useEffect, useState } from "react";
import { toggleSidebar } from "../../redux/slice";

export default function Sidebar() {
    const { sidebar, role } = useSelector(state => state.backend);
    const dispatch = useDispatch();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const menuItems = [
        {
            label: "Boshqaruv paneli",
            path: "/dashboard",
            icon: Gauge,
            roles: ["super_admin", "hokim"]
        },
        {
            label: "Tumandagi kunlik hisobotlar",
            path: "/dashboard/applications",
            icon: ClipboardList,
            roles: ["super_admin", "hokim", "service_staff"]
        },
        {
            label: "Mahalla hisobotlari",
            path: "/dashboard/mahalla-reports",
            icon: Gauge,
            roles: ["super_admin", "hokim"]
        },
        {
            label: "Mahallalar",
            path: "/dashboard/mahallas",
            icon: MapPin,
            roles: ["super_admin"]
        },
        {
            label: "Foydalanuvchilar",
            path: "/dashboard/users",
            icon: Users,
            roles: ["super_admin"]
        },
        {
            label: "Servislar",
            path: "/dashboard/services",
            icon: Landmark,
            roles: ["super_admin"]
        },
        {
            label: "Sozlamalar",
            path: "/dashboard/settings",
            icon: Settings,
            roles: ["super_admin"]
        }
    ];

    // Desktop: sidebar true -> faqat ikonka, false -> ikonka + nom
    // Mobile: sidebar ochiq -> ikonka + nom, yopiq -> butunlay yashirin
    const showLabels = !sidebar || (isMobile && sidebar);
    const isSidebarVisible = !isMobile || (isMobile && sidebar);

    return (
        <>
            {/* Mobile overlay - with fade animation */}
            {isMobile && sidebar && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}
            
            {/* Sidebar - with smooth slide animation */}
            <div className={`
                fixed md:relative
                top-0 left-0
                h-full bg-[#051538] flex flex-col gap-2 text-white
                shadow-xl z-50
                transition-all duration-300 ease-in-out
                ${!isMobile && sidebar ? 'w-[80px]' : 'w-[280px]'}
                ${isMobile && sidebar ? 'translate-x-0' : isMobile && !sidebar ? '-translate-x-full' : ''}
                ${!isMobile ? 'translate-x-0' : ''}
            `}>
                <div className="h-[70px] border-b border-[#072b789f] flex items-center px-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                        <Building2 className="text-white" size={22} />
                    </div>
                    <p className={`${!showLabels ? 'hidden' : 'flex'} text-[21px] font-semibold ml-2 transition-opacity duration-200`}>
                        {role === "super_admin" ? "Admin" : role === "hokim" ? "Hokim" : role === "service_staff" ? "Xodim" : ""}
                    </p>
                </div>

                <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
                    {menuItems
                        .filter(item => item.roles.includes(role))
                        .map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={index}
                                    to={item.path}
                                    end={item.path === "/dashboard"}
                                    onClick={() => {
                                        if (isMobile) {
                                            setTimeout(() => {
                                                dispatch(toggleSidebar());
                                            }, 150);
                                        }
                                    }}
                                    className={({ isActive }) =>
                                        `${isActive ? 'bg-[#1e56a0]' : 'hover:bg-white/10 text-zinc-300 hover:text-white'}
                                         cursor-pointer rounded-lg py-2.5 px-4 flex items-center gap-3 text-[14px]
                                         transition-all duration-200`
                                    }
                                >
                                    <Icon size={20} className="flex-shrink-0" />
                                    <p className={`${!showLabels ? 'hidden' : 'flex'} text-sm whitespace-nowrap transition-opacity duration-200`}>
                                        {item.label}
                                    </p>
                                </NavLink>
                            );
                        })}
                </div>
            </div>
        </>
    );
}