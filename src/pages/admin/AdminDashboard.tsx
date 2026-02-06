import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductStore } from "@/lib/store"
import { AuthService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, Save, X, Check, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/FileUpload"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"

export default function AdminDashboard() {
    const { products, addProduct, updateProduct, deleteProduct, loadProducts } = useProductStore();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ title: '', price: '', category: 'Digital', description: '', image: '', purchasedContent: '', accessLevel: 'standard' });
    const [stats, setStats] = useState({ totalRevenue: 0, totalUsers: 0, activeSubs: 0 });
    const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [loadingRequests, setLoadingRequests] = useState(false);
    
    // Load products from Appwrite on mount
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);
    
    // Fetch real stats on mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await AuthService.getAdminStats();
            setStats(data);
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        };
        loadStats();
        // Set up an interval to refresh stats occasionally or listen to events
        const interval = setInterval(loadStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load payment requests
    useEffect(() => {
        loadPaymentRequests();
    }, []);

    const loadPaymentRequests = async () => {
        setLoadingRequests(true);
        try {
            const requests = await AuthService.getPaymentRequests('pending');
            setPaymentRequests(requests);
        } catch (error) {
            console.error('Failed to load payment requests:', error);
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить запросы на оплату",
                variant: "destructive"
            });
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleApprovePayment = async (requestId: string) => {
        if (!user?.id) return;
        try {
            await AuthService.approvePaymentRequest(requestId, user.id);
            toast({ title: "Одобрено", description: "Баланс пользователя пополнен" });
            loadPaymentRequests();
            setSelectedRequest(null);
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Не удалось одобрить платеж",
                variant: "destructive"
            });
        }
    };

    const handleRejectPayment = async (requestId: string) => {
        if (!user?.id) return;
        try {
            await AuthService.rejectPaymentRequest(requestId, user.id);
            toast({ title: "Отклонено", description: "Платеж отклонен" });
            loadPaymentRequests();
            setSelectedRequest(null);
        } catch (error) {
            toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Не удалось отклонить платеж",
                variant: "destructive"
            });
        }
    };

    const { toast } = useToast();

    const handleAdd = async () => {
        if (!newItem.title || !newItem.price) return;
        try {
            await addProduct({
            title: newItem.title,
            price: Number(newItem.price),
            category: newItem.category as any,
            description: newItem.description || "No description",
            image: newItem.image || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60",
            purchasedContent: newItem.purchasedContent || "",
            accessLevel: newItem.accessLevel || 'standard'
        });
        setNewItem({ title: '', price: '', category: 'Digital', description: '', image: '', purchasedContent: '', accessLevel: 'standard' });
        toast({ title: "Товар добавлен" });
        } catch (error) {
            toast({ 
                title: "Ошибка", 
                description: "Не удалось добавить товар",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Вы уверены?")) {
            try {
                await deleteProduct(id);
            toast({ title: "Товар удален" });
            } catch (error) {
                toast({ 
                    title: "Ошибка", 
                    description: "Не удалось удалить товар",
                    variant: "destructive"
                });
            }
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Панель администратора</h1>
            
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue} ₽</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Пользователей</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Активных подписок</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubs}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="products">
                <TabsList>
                    <TabsTrigger value="products">Управление товарами</TabsTrigger>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="payments">Запросы на оплату</TabsTrigger>
                </TabsList>
                
                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Добавить новый товар</CardTitle>
                            <CardDescription>Заполните данные для создания карточки товара.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Название</Label>
                                    <Input value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Название товара" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Цена (₽)</Label>
                                    <Input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Категория</Label>
                                    <Input 
                                        value={newItem.category} 
                                        onChange={e => setNewItem({...newItem, category: e.target.value})} 
                                        placeholder="Например: Скрипты, Курсы, Софт..." 
                                        list="categories"
                                    />
                                    <datalist id="categories">
                                        <option value="Курсы"/>
                                        <option value="Цифровые товары"/>
                                        <option value="Ассеты"/>
                                        <option value="Софт"/>
                                    </datalist>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <FileUpload
                                        type="image"
                                        value={newItem.image}
                                        onChange={(value) => setNewItem({...newItem, image: value})}
                                        maxSizeMB={5}
                                        maxWidth={1200}
                                        maxHeight={800}
                                        quality={0.85}
                                        placeholder="Изображение товара"
                                        previewSize="lg"
                                    />
                                    <div className="text-sm text-muted-foreground mt-2">
                                        Или введите URL изображения:
                                    </div>
                                    <Input 
                                        value={newItem.image} 
                                        onChange={e => setNewItem({...newItem, image: e.target.value})} 
                                        placeholder="https://..." 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Минимальный тариф для доступа</Label>
                                    <Select value={newItem.accessLevel} onValueChange={v => setNewItem({...newItem, accessLevel: v as any})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите тариф" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free - доступен всем (Free, Standard, Premium)</SelectItem>
                                            <SelectItem value="standard">Standard - доступен для Standard и Premium</SelectItem>
                                            <SelectItem value="premium">Premium - доступен только для Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Укажите минимальный уровень подписки, необходимый для доступа к товару. Premium пользователи получают все товары бесплатно.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Описание</Label>
                                <Textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Описание товара..." />
                            </div>
                             <div className="space-y-2">
                                <Label>Скрытый контент (доступен только после покупки)</Label>
                                <Textarea 
                                    className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30"
                                    value={newItem.purchasedContent} 
                                    onChange={e => setNewItem({...newItem, purchasedContent: e.target.value})} 
                                    placeholder="Ссылка на скачивание, ключ активации, пароль и т.д." 
                                />
                            </div>
                            <Button onClick={handleAdd} className="w-full md:w-auto"><Plus className="mr-2 h-4 w-4" /> Добавить товар</Button>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => (
                            <Card key={product.id} className="relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button size="icon" variant="secondary" onClick={() => handleDelete(product.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    {/* Edit Logic Stub */}
                                </div>
                                <CardHeader>
                                    <img 
                                        src={product.image} 
                                        alt={product.title} 
                                        className="h-32 w-full object-cover rounded-md mb-2 bg-muted"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image"; 
                                        }}
                                    />
                                    <CardTitle>{product.title}</CardTitle>
                                    <CardDescription>{product.price} ₽ • {product.category}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Список пользователей</CardTitle>
                            <CardDescription>Управление пользователями системы (Mock Data).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Функционал управления пользователями в разработке.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Запросы на пополнение баланса</CardTitle>
                            <CardDescription>
                                Просмотрите скриншоты оплаты и одобрите или отклоните запросы.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingRequests ? (
                                <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                            ) : paymentRequests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Нет ожидающих запросов на оплату
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paymentRequests.map((request) => (
                                        <Card key={request.id} className="border-l-4 border-l-yellow-500">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Ожидает рассмотрения
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Сумма</p>
                                                            <p className="text-xl font-bold">{request.amount} ₽</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Дата запроса</p>
                                                            <p className="text-sm">
                                                                {new Date(request.createdAt).toLocaleString('ru-RU')}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">ID пользователя</p>
                                                            <p className="text-sm font-mono">{request.userId}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedRequest(request)}
                                                        >
                                                            Просмотреть скриншот
                                                        </Button>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleApprovePayment(request.id)}
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Одобрить
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleRejectPayment(request.id)}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Отклонить
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Скриншот оплаты</DialogTitle>
                                <DialogDescription>
                                    Сумма: {selectedRequest?.amount} ₽
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {selectedRequest?.screenshot && (
                                    <div className="rounded-md border p-4 bg-muted/50">
                                        <img
                                            src={selectedRequest.screenshot}
                                            alt="Screenshot"
                                            className="w-full h-auto rounded-md"
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedRequest(null)}
                                    >
                                        Закрыть
                                    </Button>
                                    {selectedRequest && (
                                        <>
                                            <Button
                                                variant="default"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprovePayment(selectedRequest.id)}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Одобрить
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleRejectPayment(selectedRequest.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Отклонить
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>
        </div>
    )
}
