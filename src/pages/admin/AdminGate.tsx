import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminGate() {
    const { user, updateUser } = useAuth();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simple hardcoded check for demo purposes
            // In a real app, this should be a backend call
            const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
            if (password === adminPassword) {
                await updateUser({ role: 'admin' }, true);
                toast.success("Админ-доступ получен!");
                navigate("/admin");
            } else {
                toast.error("Неверный пароль администратора");
                setPassword("");
            }
        } catch (error) {
            toast.error("Ошибка при входе");
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role === 'admin') {
        navigate("/admin");
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-red-200 shadow-lg dark:border-red-900/50">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Доступ к панели администратора</CardTitle>
                    <CardDescription>
                        Для продолжения необходима авторизация уровня Administrator.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Input 
                                type="password" 
                                placeholder="Введите код доступа..." 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-center tracking-widest"
                                autoFocus
                             />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" variant="destructive" disabled={!password || isLoading}>
                            {isLoading ? "Проверка..." : "Войти"}
                        </Button>
                        <Button variant="ghost" className="w-full" type="button" onClick={() => navigate("/dashboard")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться в кабинет
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
