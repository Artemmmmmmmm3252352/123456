import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, CreditCard, Activity, Package } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function DashboardHome() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Добро пожаловать, {user.name}</h2>
        <p className="text-muted-foreground">
          Обзор вашей активности и статистики.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Токены ИИ</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats?.tokensUsed || 0}</div>
            <p className="text-xs text-muted-foreground">Использовано</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Диалоги</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats?.chatsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Всего диалогов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Потрачено</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(user.stats?.totalSpent || 0).toFixed(0)} ₽</div>
            <p className="text-xs text-muted-foreground">Всего расходов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Подписка</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.subscription?.plan || "Free"}</div>
            <p className="text-xs text-muted-foreground">
                {user.subscription?.expiresAt ? `До: ${new Date(user.subscription.expiresAt).toLocaleDateString()}` : "Бессрочно"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>История операций</CardTitle>
          </CardHeader>
          <CardContent>
            {user.transactions && user.transactions.length > 0 ? (
                <div className="space-y-4">
                    {user.transactions.slice(0, 5).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-2 border rounded-lg">
                             <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                     <CreditCard className="h-4 w-4 text-primary" />
                                 </div>
                                 <div>
                                     <p className="text-sm font-medium">{tx.title}</p>
                                     <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                 </div>
                             </div>
                             <div className="font-bold">-{tx.amount.toFixed(0)} ₽</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground flex-col gap-2">
                     <p>Нет операций</p>
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Мои продукты</CardTitle>
            <CardDescription>Недавно купленные</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {user.transactions && user.transactions.filter(t => !t.title.includes('Subscription')).slice(0, 3).length > 0 ? (
                    user.transactions.filter(t => !t.title.includes('Subscription')).slice(0, 3).map(tx => (
                        <div key={tx.id} className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{tx.title}</p>
                                <p className="text-sm text-muted-foreground">Куплен: {new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                         </div>
                    ))
                ) : (
                     <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
                        <Package className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Нет покупок</p>
                    </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
