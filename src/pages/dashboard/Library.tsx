import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { useProductStore } from "@/lib/store"
import { Product } from "@/lib/data"
import { useNavigate } from "react-router-dom"
import { ExternalLink, Download, Wallet, Copy, Check } from "lucide-react"
import { TopUpDialog } from "@/components/TopUpDialog"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function LibraryPage() {
    const { user, topUp } = useAuth();
    const { products, loadProducts } = useProductStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [copied, setCopied] = useState(false);
    
    // Load products from Appwrite on mount
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);
    
    // Filter products that are in user's inventory
    const myProducts = products.filter(p => user?.inventory?.includes(p.id));

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: "Скопировано", description: "Данные скопированы в буфер обмена" });
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <TopUpDialog 
                open={isTopUpOpen} 
                onOpenChange={setIsTopUpOpen} 
                onConfirm={async (amount) => await topUp(amount)}
            />

            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedProduct?.title}</DialogTitle>
                        <DialogDescription>
                            Материалы вашего приобретенного продукта.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-foreground">Описание</h4>
                            <p className="text-sm text-muted-foreground">{selectedProduct?.description}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-foreground">Доступ и Файлы</h4>
                            {selectedProduct?.purchasedContent ? (
                                <div className="rounded-md bg-muted p-4 relative group">
                                    <pre className="whitespace-pre-wrap font-mono text-sm break-all">
                                        {selectedProduct.purchasedContent}
                                    </pre>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-8 w-8 bg-background/50 hover:bg-background"
                                        onClick={() => handleCopy(selectedProduct.purchasedContent || "")}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ) : (
                                <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
                                    Дополнительный контент не указан автором. Свяжитесь с поддержкой.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                         <Button variant="secondary" onClick={() => setSelectedProduct(null)}>Закрыть</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Моя библиотека</h2>
                    <p className="text-muted-foreground">Доступ ко всем вашим приобретенным ресурсам.</p>
                </div>
                <Card className="p-4 flex items-center gap-4 bg-muted/50 border-none">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Ваш баланс</div>
                        <div className="text-xl font-bold">${user.balance?.toFixed(2) || "0.00"}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsTopUpOpen(true)}>Пополнить</Button>
                </Card>
            </div>

            {myProducts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                    <h2 className="text-2xl font-bold">У вас пока нет продуктов</h2>
                    <p className="text-muted-foreground">Посетите магазин, чтобы приобрести полезные ресурсы.</p>
                    <Button onClick={() => navigate("/dashboard/store")}>Перейти в магазин</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20 flex flex-col">
                            <div className="aspect-video relative overflow-hidden group">
                                <img 
                                    src={product.image} 
                                    alt={product.title} 
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" className="gap-2" onClick={() => setSelectedProduct(product)}>
                                        <Download className="h-4 w-4" />
                                        Открыть
                                    </Button>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                                <CardDescription>
                                    Категория: {product.category}
                                </CardDescription> 
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center bg-muted/20 py-3">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Владелец</Badge>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
                                    Подробнее <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
