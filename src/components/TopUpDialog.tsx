import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, Upload, CreditCard } from "lucide-react"

interface TopUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (amount: number) => Promise<void>;
}

export function TopUpDialog({ open, onOpenChange, onConfirm }: TopUpDialogProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [amount, setAmount] = useState("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = () => {
        if (step === 1 && amount) setStep(2);
        else if (step === 2) setStep(3);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setScreenshot(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onConfirm(Number(amount));
            onOpenChange(false);
            // Reset state after close
            setTimeout(() => {
                setStep(1);
                setAmount("");
                setScreenshot(null);
            }, 300);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Пополнение баланса</DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Введите сумму для пополнения."}
                        {step === 2 && "Оплатите счет по реквизитам."}
                        {step === 3 && "Подтвердите оплату скриншотом."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="grid w-full items-center gap-4">
                             <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="amount">Сумма (₽)</Label>
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    placeholder="100" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Карта VISA/MasterCard</div>
                                        <div className="text-sm text-muted-foreground">4276 3800 1234 5678</div>
                                        <div className="text-xs text-muted-foreground mt-1">Получатель: X-VEXTA INC</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center text-sm font-medium">
                                К оплате: <span className="text-primary text-lg">{amount} ₽</span>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <Label>Прикрепите скриншот чека</Label>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" />
                            </div>
                            {screenshot && (
                                <div className="rounded-md border p-2 relative h-32 w-full overflow-hidden">
                                     <img src={screenshot} alt="Proof" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 1 && (
                         <Button onClick={handleNext} disabled={!amount || Number(amount) <= 0}>Далее</Button>
                    )}
                    {step === 2 && (
                         <Button onClick={handleNext}>Я оплатил</Button>
                    )}
                    {step === 3 && (
                         <Button onClick={handleSubmit} disabled={!screenshot || isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Подтвердить
                         </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
