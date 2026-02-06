import { z } from "zod";
import { NeonService } from "./neonService";

// Schema for User
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  avatar: z.string().optional(),
  createdAt: z.string(),
  // New fields
  role: z.enum(['user', 'admin']).default('user'),
  balance: z.number().default(0),
  quota: z.object({
      used: z.number().default(0),
      lastReset: z.number().default(Date.now())
  }).default({ used: 0, lastReset: Date.now() }),
  inventory: z.array(z.string()).default([]), // Array of Product IDs
  subscription: z.object({
      plan: z.enum(["free", "standard", "premium"]), // Changed from pro/enterprise
      expiresAt: z.string().nullable()
  }).default({ plan: "free", expiresAt: null }),
  stats: z.object({
      tokensUsed: z.number(),
      chatsCount: z.number(),
      totalSpent: z.number()
  }).default({ tokensUsed: 0, chatsCount: 0, totalSpent: 0 }),
  transactions: z.array(z.object({
      id: z.string(),
      title: z.string(),
      date: z.string(),
      amount: z.number()
  })).default([])
});

export type User = z.infer<typeof UserSchema>;

// Session storage key (for client-side session caching)
const DB_SESSION_KEY = "craft-studio-session";

// Helper to update session (localStorage for quick access)
const updateSession = (user: User) => {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(userWithoutPassword));
}

export const AuthService = {
  async login(email: string, password: string): Promise<User> {
    // Check if user exists
    const user = await NeonService.getUserByEmail(email);
    
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    // Verify password (in production, use hashed passwords)
    if (user.password !== password) {
      throw new Error("Invalid email or password");
    }
    
    // Defaulting missing fields for old users mechanism
    const fullUser = {
        ...user,
        role: user.role || 'user',
        balance: user.balance || 0,
        quota: user.quota || { used: 0, lastReset: Date.now() },
        inventory: user.inventory || [],
        subscription: user.subscription || { plan: "free", expiresAt: null },
        stats: user.stats || { tokensUsed: 0, chatsCount: 0, totalSpent: 0 },
        transactions: user.transactions || []
    }

    updateSession(fullUser);
    return fullUser;
  },

  async register(data: { email: string; password: string; name: string }): Promise<User> {
    // Check if user already exists
    const existingUser = await NeonService.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser: Omit<User, 'id'> = {
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      role: data.email.includes('admin') ? 'admin' : 'user', // Auto-admin for emails with 'admin'
      balance: 0,
      quota: { used: 0, lastReset: Date.now() },
      inventory: [],
      subscription: { plan: "free", expiresAt: null },
      stats: { tokensUsed: 0, chatsCount: 0, totalSpent: 0 },
      transactions: []
    };

    const createdUser = await NeonService.createUser(newUser);
    updateSession(createdUser);
    return createdUser;
  },

  /* ... logout and getSession remain same, updateProfile needs update ... */

  async logout(): Promise<void> {
    localStorage.removeItem(DB_SESSION_KEY);
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    console.log('updateProfile called with userId:', userId);
    console.log('updateProfile data:', data);
    const updatedUser = await NeonService.updateUser(userId, data);
    console.log('updateProfile got updated user:', updatedUser?.id);
    
    // Update session if it's the current user
    const currentSession = AuthService.getSession();
    if (currentSession && currentSession.id === userId) {
         updateSession(updatedUser);
    }
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  },
  
  // NEW: Purchase Item
  async purchaseItem(userId: string, item: { id: string, title: string, price: number }): Promise<User> {
      // Get current user
      const user = await NeonService.getUserById(userId);
      
       if (user.inventory?.includes(item.id)) throw new Error("Item already owned");
       
      // Check subscription plan - must be exactly 'premium' (case-sensitive, strict check)
      const plan = user.subscription?.plan || 'free';
      const isPremium = plan === 'premium'; // Only 'premium' string, nothing else
      
      // Get product access level (need to fetch product to check accessLevel)
      // For now, we'll assume the item passed has accessLevel if needed
      // Note: This check should ideally be done before calling purchaseItem
      
      console.log('🔍 Purchase check:', { 
          userId, 
          plan, 
          planType: typeof plan,
          isPremium, 
          balance: user.balance, 
          itemPrice: item.price,
          fullSubscription: user.subscription 
      });
      
      // For premium users ONLY, items are free. For ALL others (free, standard, undefined), check balance.
      if (plan !== 'premium') {
          // Not premium - must have enough balance
          if ((user.balance || 0) < item.price) {
              console.log('❌ Insufficient balance:', { balance: user.balance, required: item.price });
              throw new Error("Недостаточно средств");
          }
          console.log('✅ Balance check passed for non-premium user');
      } else {
          console.log('✅ Premium user - item is free');
      }

      // Calculate actual price (0 ONLY for premium users, full price for everyone else)
      const actualPrice = (plan === 'premium') ? 0 : item.price;

       const updatedUser = {
           ...user,
          balance: (user.balance || 0) - actualPrice, // Only deduct if not premium
           inventory: [...(user.inventory || []), item.id],
           stats: {
               ...user.stats,
              totalSpent: (user.stats?.totalSpent || 0) + actualPrice
           },
           transactions: [
              { 
                  id: Date.now().toString(), 
                  title: isPremium ? `Получено бесплатно: ${item.title}` : `Куплено: ${item.title}`, 
                  date: new Date().toISOString(), 
                  amount: actualPrice 
              },
               ...(user.transactions || [])
           ]
       };
       
      const savedUser = await NeonService.updateUser(userId, updatedUser);
      updateSession(savedUser);
       
      const { password: _, ...clean } = savedUser;
       return clean as User;
  },

  // NEW: Update Subscription
  async updateSubscription(userId: string, plan: "free" | "pro" | "enterprise" | "standard" | "premium", price: number): Promise<User> {
      // Get current user
      const user = await NeonService.getUserById(userId);

       // Check balance if price > 0
       if (price > 0 && (user.balance || 0) < price) {
           throw new Error("Недостаточно средств на балансе");
       }

       // Calculate expiration date: if subscription is still active, add 30 days to current expiration
       // Otherwise, set expiration to 30 days from now
       let expiresAt: string;
       if (user.subscription?.expiresAt) {
         const currentExpires = new Date(user.subscription.expiresAt);
         const now = new Date();
         // If subscription is still active, extend from current expiration date
         if (currentExpires > now) {
           expiresAt = new Date(currentExpires.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
         } else {
           // Subscription expired, start from now
           expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
         }
       } else {
         // No expiration date, start from now
         expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
       }

       const updatedUser = {
           ...user,
           balance: price > 0 ? (user.balance || 0) - price : (user.balance || 0),
           subscription: {
               plan: plan as any,
               expiresAt: expiresAt
           },
            stats: {
               ...user.stats,
               totalSpent: (user.stats?.totalSpent || 0) + price
           },
            transactions: [
               {
                   id: Math.random().toString(36).substr(2, 9),
                   title: `Subscription: ${plan.toUpperCase()}`,
                   date: new Date().toISOString(),
                   amount: price
               },
               ...(user.transactions || [])
           ]
       };
       
      const savedUser = await NeonService.updateUser(userId, updatedUser);
      updateSession(savedUser);
       
      const { password: _, ...clean } = savedUser;
       return clean as User;
  },

  // NEW: Create Payment Request (instead of directly topping up)
  async createPaymentRequest(userId: string, amount: number, screenshot: string): Promise<void> {
      await NeonService.createPaymentRequest(userId, { amount, screenshot });
  },

  // NEW: Top Up Balance (now only used by admin after approval)
  async topUpBalance(userId: string, amount: number): Promise<User> {
      // Get current user
      const user = await NeonService.getUserById(userId);
      
      const updatedUser = {
           ...user,
           balance: (user.balance || 0) + amount,
           transactions: [
               {
                   id: Math.random().toString(36).substr(2, 9),
                   title: 'Пополнение баланса',
                   date: new Date().toISOString(),
                   amount: amount // Store as positive value
               },
               ...(user.transactions || [])
           ]
      };

      const savedUser = await NeonService.updateUser(userId, updatedUser);
      updateSession(savedUser);
      
      const { password: _, ...clean } = savedUser;
      return clean as User;
  },

  // NEW: Approve Payment Request
  async approvePaymentRequest(requestId: string, adminUserId: string): Promise<void> {
      const paymentRequest = await NeonService.getPaymentRequestById(requestId);
      
      if (!paymentRequest) {
          throw new Error('Payment request not found');
      }
      
      if (paymentRequest.status !== 'pending') {
          throw new Error('Payment request already processed');
      }
      
      // Update status
      await NeonService.updatePaymentRequestStatus(requestId, 'approved', adminUserId);
      
      // Top up user balance
      await this.topUpBalance(paymentRequest.userId, paymentRequest.amount);
  },

  // NEW: Reject Payment Request
  async rejectPaymentRequest(requestId: string, adminUserId: string): Promise<void> {
      const paymentRequest = await NeonService.getPaymentRequestById(requestId);
      
      if (!paymentRequest) {
          throw new Error('Payment request not found');
      }
      
      if (paymentRequest.status !== 'pending') {
          throw new Error('Payment request already processed');
      }
      
      await NeonService.updatePaymentRequestStatus(requestId, 'rejected', adminUserId);
  },

  // NEW: Get Payment Requests (for admin)
  async getPaymentRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<any[]> {
      return await NeonService.getPaymentRequests(status);
  },

  async changePassword(userId: string, current: string, newPass: string): Promise<void> {
    const user = await AppwriteService.getUserById(userId);
    
    // In a real app we would hash passwords. Here they are plain text.
    if (user.password !== current) {
        throw new Error("Неверный текущий пароль");
    }

    await NeonService.updateUser(userId, { password: newPass });
  },

  // NEW: Get System Stats for Admin
  async getAdminStats(): Promise<{ totalUsers: number; activeSubs: number; totalRevenue: number }> {
      const users = await NeonService.getAllUsers();
      
      const totalUsers = users.length;
      const activeSubs = users.filter(u => u.subscription?.plan !== 'free').length;
      
      // Calculate revenue based on totalSpent from all users
      const totalRevenue = users.reduce((acc, user) => acc + (user.stats?.totalSpent || 0), 0);

      return {
          totalUsers,
          activeSubs,
          totalRevenue
      };
  },

  getSession(): User | null {
    const data = localStorage.getItem(DB_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
};
