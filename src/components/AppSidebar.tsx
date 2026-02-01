import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  MessageSquare,
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  HeadphonesIcon,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Menu items based on your requirements
const items = [
  {
    title: "AI Chat",
    url: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Статистика",
    url: "/dashboard/stats",
    icon: LayoutDashboard,
  },
  {
    title: "Мои продукты",
    url: "/dashboard/library",
    icon: Package,
  },
  {
    title: "Магазин",
    url: "/dashboard/store",
    icon: ShoppingBag,
  },
  {
    title: "Подписка",
    url: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Настройки",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Поддержка",
    url: "/dashboard/support",
    icon: HeadphonesIcon,
  },
]

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
      await logout();
      navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1 group-data-[collapsible=icon]:!p-0">
          <img src="/xvexta_logo.jpg" alt="X-VEXTA Logo" className="h-8 w-8 rounded-lg object-cover" />
          <span className="font-semibold text-lg truncate">X-VEXTA</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            {user && (
                <div className="py-2 mb-2 flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:!p-0">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                </div>
            )}
          <SidebarGroupLabel>Личный кабинет</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Профиль">
                    <Link to="/dashboard/settings">
                        <UserIcon className="h-4 w-4" />
                        <span>Профиль</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    className="text-red-500 hover:text-red-600 hover:bg-red-100/10" 
                    onClick={handleLogout}
                    tooltip="Выйти"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Выйти</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
