import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>, silent?: boolean) => Promise<void>;
  buyProduct: (item: { id: string, title: string, price: number }) => Promise<void>;
  subscribe: (plan: "free" | "pro" | "enterprise", price: number) => Promise<void>;
  topUp: (amount: number) => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = () => {
      const session = AuthService.getSession();
      if (session) {
        // Ensure session has new fields structure if loaded from old session
        const safeSession = {
            ...session,
            role: session.role || 'user',
            balance: session.balance || 0,
            quota: session.quota || { used: 0, lastReset: Date.now() },
            inventory: session.inventory || [],
            subscription: session.subscription || { plan: "free", expiresAt: null },
            stats: session.stats || { tokensUsed: 0, chatsCount: 0, totalSpent: 0 },
            transactions: session.transactions || []
        };
        setUser(safeSession as User);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      return Promise.resolve();
    } catch (error) {
      toast({ 
        title: "Login Failed", 
        description: error instanceof Error ? error.message : "Undefined error",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    try {
      const user = await AuthService.register(data);
      setUser(user);
      toast({ title: "Welcome!", description: "Account created successfully." });
      return Promise.resolve();
    } catch (error) {
      toast({ 
        title: "Registration Failed", 
        description: error instanceof Error ? error.message : "Undefined error",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    toast({ title: "Logged out", description: "See you soon!" });
  };
  
  const updateUser = async (data: Partial<User>, silent = false) => {
      if (!user || !user.id) {
        console.error('Cannot update user: user or user.id is missing');
        console.error('User object:', user);
        return;
      }
      console.log('updateUser called in AuthContext with user.id:', user.id);
      console.log('updateUser data:', data);
      try {
          const updated = await AuthService.updateProfile(user.id, data);
          console.log('Update successful, updated user:', updated?.id);
          if (updated && updated.id) {
            setUser(updated);
            if (!silent) {
              toast({ title: "Success", description: "Profile updated" });
            }
          } else {
            console.error('Update returned invalid response:', updated);
            throw new Error('Failed to update user: invalid response');
          }
      } catch (error) {
          console.error('Update error in AuthContext:', error);
          // Only show toast for non-silent updates to avoid spam
          if (!silent) {
            toast({ 
              title: "Update Failed", 
              description: error instanceof Error ? error.message : "Undefined error",
              variant: "destructive"
            });
          }
          // Don't throw error for silent updates to prevent page reload
          if (!silent) {
            throw error;
          }
      }
  }

  const buyProduct = async (item: { id: string, title: string, price: number }) => {
      if (!user || !user.id) {
        console.error('Cannot buy product: user or user.id is missing');
        return;
      }
      try {
          const updated = await AuthService.purchaseItem(user.id, item);
          if (updated && updated.id) {
            setUser(updated);
            toast({ title: "Покупка успешна!", description: `Вы приобрели ${item.title}` });
          } else {
            throw new Error('Failed to purchase item: invalid response');
          }
      } catch (error) {
            toast({ 
            title: "Ошибка покупки", 
            description: error instanceof Error ? error.message : "Код ошибки: 500",
            variant: "destructive"
          });
          throw error;
      }
  }

  const subscribe = async (plan: "free" | "pro" | "enterprise", price: number) => {
      if (!user || !user.id) {
        console.error('Cannot subscribe: user or user.id is missing');
        return;
      }
      try {
          const updated = await AuthService.updateSubscription(user.id, plan, price);
          if (updated && updated.id) {
            setUser(updated);
            toast({ title: "Подписка активирована!", description: `Ваш план теперь: ${plan.toUpperCase()}` });
          } else {
            throw new Error('Failed to update subscription: invalid response');
          }
      } catch (error) {
            toast({ 
            title: "Ошибка оплаты", 
            description: error instanceof Error ? error.message : "Код ошибки: 500",
            variant: "destructive"
          });
          throw error;
      }
  }

  const topUp = async (amount: number) => {
      if (!user || !user.id) {
        console.error('Cannot top up: user or user.id is missing');
        return;
      }
      try {
          const updated = await AuthService.topUpBalance(user.id, amount);
          if (updated && updated.id) {
            setUser(updated);
            toast({ title: "Баланс пополнен", description: `Зачислено: ${amount} ₽` });
          } else {
            throw new Error('Failed to top up balance: invalid response');
          }
      } catch (error) {
            toast({ 
            title: "Ошибка", 
            description: "Не удалось пополнить баланс",
            variant: "destructive"
          });
          throw error;
      }
  }

  const changePassword = async (current: string, newPass: string) => {
      if (!user) return;
      try {
          await AuthService.changePassword(user.id, current, newPass);
          toast({ title: "Успешно", description: "Пароль обновлен" });
      } catch (error) {
          toast({
              title: "Ошибка",
              description: error instanceof Error ? error.message : "Не удалось сменить пароль",
              variant: "destructive"
          });
          throw error;
      }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, buyProduct, subscribe, topUp, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
