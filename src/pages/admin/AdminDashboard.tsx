import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductStore } from "@/lib/store"
import { AuthService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
    const { products, addProduct, updateProduct, deleteProduct, loadProducts } = useProductStore();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newItem, setNewItem] = useState({ title: '', price: '', category: 'Digital', description: '', image: '', purchasedContent: '', accessLevel: 'standard' });
    const [stats, setStats] = useState({ totalRevenue: 0, totalUsers: 0, activeSubs: 0 });
    
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
                                <div className="space-y-2">
                                    <Label>Ссылка на изображение</Label>
                                    <Input value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} placeholder="https://..." />
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
            </Tabs>
        </div>
    )
}
