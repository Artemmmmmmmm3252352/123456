import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2, Wallet } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/data"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TopUpDialog } from "@/components/TopUpDialog"

export default function SubscriptionPage() {
    const { user, subscribe, topUp } = useAuth();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const handleSubscribe = async (planId: string, price: number) => {
        setLoadingPlan(planId);
        try {
            await subscribe(planId as any, price);
        } finally {
            setLoadingPlan(null);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <TopUpDialog 
                open={isTopUpOpen} 
                onOpenChange={setIsTopUpOpen} 
                onConfirm={async (amount) => await topUp(amount)}
            />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Тарифные планы</h2>
                    <p className="text-muted-foreground">Выберите план, который подходит именно вам.</p>
                </div>
                
                 <Card className="p-4 flex items-center gap-4 bg-muted/50 border-none w-full md:w-auto">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Ваш баланс</div>
                        <div className="text-xl font-bold">{user.balance?.toLocaleString() || "0"} ₽</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsTopUpOpen(true)}>Пополнить</Button>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {SUBSCRIPTION_PLANS.map((plan) => {
                    const isCurrent = user.subscription?.plan === plan.id;
                    const isFree = plan.id === "free";
                    
                    return (
                        <Card key={plan.id} className={`flex flex-col relative ${isCurrent ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                            {isCurrent && (
                                <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary">
                                    Current Plan
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <div className="text-3xl font-bold">
                                    {plan.price} ₽
                                    <span className="text-sm font-normal text-muted-foreground">/мес</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-2 text-sm">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    variant={isCurrent ? "outline" : "default"} 
                                    className="w-full"
                                    disabled={isCurrent || loadingPlan === plan.id}
                                    onClick={() => handleSubscribe(plan.id, plan.price)}
                                >
                                    {loadingPlan === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isCurrent ? "Активен" : "Выбрать план"}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
