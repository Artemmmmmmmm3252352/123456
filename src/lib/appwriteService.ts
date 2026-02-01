import { databases, ID, Query, COLLECTIONS, DATABASE_ID } from './appwrite';
import { User, UserSchema } from './auth';

// Helper to parse JSON string or return object
const parseJson = (value: any, defaultValue: any) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return value || defaultValue;
};

// Helper to stringify JSON or return value
const stringifyJson = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return value;
};

// Helper to convert Appwrite document to User
const documentToUser = (doc: any): User => {
  return {
    id: doc.$id,
    email: doc.email,
    name: doc.name,
    password: doc.password, // In production, this should be hashed
    avatar: doc.avatar || undefined,
    createdAt: doc.createdAt,
    role: doc.role || 'user',
    balance: doc.balance || 0,
    quota: parseJson(doc.quota, { used: 0, lastReset: Date.now() }),
    inventory: parseJson(doc.inventory, []),
    subscription: parseJson(doc.subscription, { plan: 'free', expiresAt: null }),
    stats: parseJson(doc.stats, { tokensUsed: 0, chatsCount: 0, totalSpent: 0 }),
    transactions: parseJson(doc.transactions, []),
  };
};

// Helper to convert User to Appwrite document
const userToDocument = (user: Partial<User>): any => {
  const doc: any = {};
  if (user.email !== undefined) doc.email = user.email;
  if (user.name !== undefined) doc.name = user.name;
  if (user.password !== undefined) doc.password = user.password;
  if (user.avatar !== undefined) doc.avatar = user.avatar;
  if (user.createdAt !== undefined) doc.createdAt = user.createdAt;
  if (user.role !== undefined) doc.role = user.role;
  if (user.balance !== undefined) doc.balance = user.balance;
  if (user.quota !== undefined) doc.quota = stringifyJson(user.quota);
  if (user.inventory !== undefined) doc.inventory = stringifyJson(user.inventory);
  if (user.subscription !== undefined) doc.subscription = stringifyJson(user.subscription);
  if (user.stats !== undefined) doc.stats = stringifyJson(user.stats);
  if (user.transactions !== undefined) doc.transactions = stringifyJson(user.transactions);
  return doc;
};

export const AppwriteService = {
  // User operations
  async getUserById(userId: string): Promise<User> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
      return documentToUser(doc);
    } catch (error) {
      throw new Error('User not found');
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        Query.equal('email', email),
        Query.limit(1),
      ]);
      if (response.documents.length === 0) return null;
      return documentToUser(response.documents[0]);
    } catch (error) {
      return null;
    }
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        userToDocument(userData)
      );
      return documentToUser(doc);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        userToDocument(data)
      );
      return documentToUser(doc);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS);
      return response.documents.map(documentToUser);
    } catch (error) {
      return [];
    }
  },

  // Chat sessions operations
  async getChatSessions(userId: string): Promise<any[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_SESSIONS, [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
      ]);
      return response.documents.map((doc) => ({
        id: doc.$id,
        userId: doc.userId,
        title: doc.title,
        messages: parseJson(doc.messages, []),
        createdAt: doc.createdAt,
      }));
    } catch (error) {
      return [];
    }
  },

  async createChatSession(userId: string, sessionData: { title: string; messages: any[] }): Promise<any> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        ID.unique(),
        {
          userId,
          title: sessionData.title,
          messages: stringifyJson(sessionData.messages),
          createdAt: new Date().toISOString(),
        }
      );
      return {
        id: doc.$id,
        userId: doc.userId,
        title: doc.title,
        messages: parseJson(doc.messages, []),
        createdAt: doc.createdAt,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create chat session');
    }
  },

  async updateChatSession(sessionId: string, data: { title?: string; messages?: any[] }): Promise<any> {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.messages !== undefined) updateData.messages = stringifyJson(data.messages);

      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        sessionId,
        updateData
      );
      return {
        id: doc.$id,
        userId: doc.userId,
        title: doc.title,
        messages: parseJson(doc.messages, []),
        createdAt: doc.createdAt,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update chat session');
    }
  },

  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CHAT_SESSIONS, sessionId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete chat session');
    }
  },

  // Products operations
  async getProducts(): Promise<any[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS);
      return response.documents.map((doc) => ({
        id: doc.$id,
        title: doc.title,
        category: doc.category,
        price: doc.price,
        image: doc.image,
        description: doc.description,
        purchasedContent: doc.purchasedContent,
        accessLevel: doc.accessLevel,
      }));
    } catch (error) {
      return [];
    }
  },

  async createProduct(productData: Omit<any, 'id'>): Promise<any> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PRODUCTS,
        ID.unique(),
        productData
      );
      return {
        id: doc.$id,
        ...productData,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create product');
    }
  },

  async updateProduct(productId: string, data: Partial<any>): Promise<any> {
    try {
      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PRODUCTS,
        productId,
        data
      );
      return {
        id: doc.$id,
        ...data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update product');
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, productId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete product');
    }
  },
};
