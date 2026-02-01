import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2 } from "lucide-react"
import { useProductStore } from "@/lib/store"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export default function MarketplacePage() {
    const { user, buyProduct } = useAuth();
    const { products, loadProducts, isLoading } = useProductStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Load products from Appwrite on mount
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleBuy = async (product: typeof products[0]) => {
        // Check if user has access to this product based on their plan
        if (!user) return;
        
        const plan = user.subscription?.plan || 'free';
        const productAccessLevel = product.accessLevel || 'free';
        
        // Check access before purchase
        if (plan === 'standard' && productAccessLevel === 'premium') {
            toast({
                title: "Нет доступа",
                description: "Этот товар доступен только для Premium подписки",
                variant: "destructive"
            });
            return;
        }
        
        if (plan === 'free' && (productAccessLevel === 'premium' || productAccessLevel === 'standard')) {
            toast({
                title: "Нет доступа",
                description: "Этот товар недоступен для вашей подписки",
                variant: "destructive"
            });
            return;
        }
        
        setLoadingMap(prev => ({ ...prev, [product.id]: true }));
        try {
            await buyProduct(product);
        } finally {
            setLoadingMap(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const isOwned = (id: string) => user?.inventory?.includes(id);

    const getAccess = (product) => {
        if (!user) return false;
        const plan = user.subscription?.plan || 'free';
        const productAccessLevel = product.accessLevel || 'free';
        
        // Premium: все товары бесплатно
        if (plan === 'premium') return true;
        
        // Standard: только товары с accessLevel === 'standard' или 'free' (но платно)
        if (plan === 'standard') {
            return productAccessLevel === 'standard' || productAccessLevel === 'free';
        }
        
        // Free: только товары с accessLevel === 'free' (но платно)
        if (plan === 'free') {
            return productAccessLevel === 'free';
        }
        
        return false;
    };

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const categories = Array.from(new Set(products.map(p => p.category)));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Поиск товаров..." 
                        className="pl-8 w-full" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        Товары не найдены
                    </div>
                ) : (
                filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video relative bg-muted">
                            <img 
                                src={product.image} 
                                alt={product.title} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image"; 
                                }}
                            />
                            <Badge className="absolute top-2 right-2 bg-background/80 hover:bg-background/80 text-foreground backdrop-blur-sm">
                                {product.category}
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle>{product.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{product.description || "Полный доступ навсегда"}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between items-center">
                            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                            {isOwned(product.id) ? (
                                <Button variant="secondary" onClick={() => navigate("/dashboard/library")}>
                                    Открыть
                                </Button>
                            ) : getAccess(product) ? (
                                // User has access - show free button for premium, buy button for others
                                (user?.subscription?.plan === 'premium') ? (
                                    <Button 
                                        variant="success"
                                        onClick={() => handleBuy(product)}
                                        disabled={loadingMap[product.id]}
                                    >
                                        {loadingMap[product.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Добавить бесплатно
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handleBuy(product)} 
                                        disabled={loadingMap[product.id]}
                                    >
                                        {loadingMap[product.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Купить
                                    </Button>
                                )
                            ) : (
                                // No access - show disabled button with message
                                <Button 
                                    onClick={() => {
                                        toast({
                                            title: "Нет доступа",
                                            description: "Этот товар недоступен для вашей подписки",
                                            variant: "destructive"
                                        });
                                    }}
                                    disabled
                                    variant="outline"
                                >
                                    Недоступно
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                )))}
            </div>
        </div>
    )
}
