import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
    ChartColumn,
    ClipboardList,
    Gauge,
    MapPin,
    Settings,
    Users, Landmark
} from "lucide-react";

export default function Sidebar() {
    const { sidebar, role } = useSelector(state => state.backend);

    const menuItems = [
        {
            label: "Boshqaruv paneli",
            path: "/dashboard",
            icon: Gauge,
            roles: ["super_admin", "hokim"]
        },
        {
            label: "Murojaatlar",
            path: "/dashboard/applications",
            icon: ClipboardList,
            roles: ["super_admin", "hokim", "xodim"]
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

    return (
        <div className={`${sidebar ? 'w-[80px]' : 'w-[270px]'} h-full bg-[#051538] flex flex-col gap-2 text-white transition-all duration-200`}>
            
            <div className="h-[70px] border-b border-[#072b789f] flex items-center">
                <div className="w-18 h-14 rounded-xl bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center scale-60 text-white text-2xl font-bold">
                    HMS
                </div>
                <p className={`${sidebar ? 'hidden' : 'flex'} text-[21px] font-semibold`}>
                    {role === "super_admin" ? "Admin" : role === "hokim" ? "Hokim" : "Xodim"}
                </p>
            </div>

            <div className="flex flex-col gap-1 p-3">
                {menuItems
                    .filter(item => item.roles.includes(role))
                    .map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                end={item.path === "/dashboard"}
                                className={({ isActive }) =>
                                    `${isActive ? 'bg-[#1e56a0]' : 'hover:bg-white/7 text-zinc-300 hover:text-white'}
                                     ${sidebar ? 'justify-center' : ''}
                                     cursor-pointer rounded-lg py-2.5 px-4 flex items-center gap-2 text-[14px]}`
                                }
                            >
                                <Icon size={20} />
                                <p className={`${sidebar ? 'hidden' : 'flex'}`}>
                                    {item.label}
                                </p>
                            </NavLink>
                        );
                    })}
            </div>
        </div>
    );
}