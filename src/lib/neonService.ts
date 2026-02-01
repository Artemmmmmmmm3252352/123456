import { sql } from './neon';
import { User } from './auth';

// Helper to convert database row to User
const rowToUser = (row: any): User => {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    password: row.password,
    avatar: row.avatar || undefined,
    createdAt: row.created_at,
    role: row.role || 'user',
    balance: row.balance || 0,
    quota: typeof row.quota === 'string' ? JSON.parse(row.quota) : (row.quota || { used: 0, lastReset: Date.now() }),
    inventory: typeof row.inventory === 'string' ? JSON.parse(row.inventory) : (row.inventory || []),
    subscription: typeof row.subscription === 'string' ? JSON.parse(row.subscription) : (row.subscription || { plan: 'free', expiresAt: null }),
    stats: typeof row.stats === 'string' ? JSON.parse(row.stats) : (row.stats || { tokensUsed: 0, chatsCount: 0, totalSpent: 0 }),
    transactions: typeof row.transactions === 'string' ? JSON.parse(row.transactions) : (row.transactions || []),
  };
};

// Helper to convert User to database row
const userToRow = (user: Partial<User>): any => {
  const row: any = {};
  if (user.email !== undefined) row.email = user.email;
  if (user.name !== undefined) row.name = user.name;
  if (user.password !== undefined) row.password = user.password;
  if (user.avatar !== undefined) row.avatar = user.avatar;
  if (user.createdAt !== undefined) row.created_at = user.createdAt;
  if (user.role !== undefined) row.role = user.role;
  if (user.balance !== undefined) row.balance = user.balance;
  if (user.quota !== undefined) row.quota = JSON.stringify(user.quota);
  if (user.inventory !== undefined) row.inventory = JSON.stringify(user.inventory);
  if (user.subscription !== undefined) row.subscription = JSON.stringify(user.subscription);
  if (user.stats !== undefined) row.stats = JSON.stringify(user.stats);
  if (user.transactions !== undefined) row.transactions = JSON.stringify(user.transactions);
  return row;
};

export const NeonService = {
  // User operations
  async getUserById(userId: string): Promise<User> {
    try {
      console.log('getUserById called with userId:', userId);
      console.log('userId type:', typeof userId);
      console.log('userId length:', userId?.length);
      
      // Try with UUID casting first
      let rows;
      try {
        rows = await sql`SELECT * FROM users WHERE id = ${userId}::uuid`;
      } catch (uuidError: any) {
        // If UUID casting fails, try without casting
        console.log('UUID cast failed, trying without cast');
        rows = await sql`SELECT * FROM users WHERE id = ${userId}`;
      }
      
      console.log('Query result rows:', rows?.length || 0);
      if (!rows || rows.length === 0 || !rows[0]) {
        console.error('User not found in database. userId:', userId);
        // Try to find all users to see what IDs exist
        const allUsers = await sql`SELECT id, email FROM users LIMIT 5`;
        console.error('Available user IDs:', allUsers.map((u: any) => u.id));
        throw new Error(`User not found with id: ${userId}`);
      }
      const user = rowToUser(rows[0]);
      console.log('User found:', user.id, user.email);
      return user;
    } catch (error: any) {
      console.error('getUserById error:', error);
      throw new Error(error.message || 'User not found');
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
      if (!rows || rows.length === 0 || !rows[0]) {
        return null;
      }
      return rowToUser(rows[0]);
    } catch (error) {
      return null;
    }
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const row = userToRow(userData);
      const result = await sql`
        INSERT INTO users (email, name, password, avatar, created_at, role, balance, quota, inventory, subscription, stats, transactions)
        VALUES (${row.email}, ${row.name}, ${row.password}, ${row.avatar || null}, ${row.created_at}, ${row.role || 'user'}, ${row.balance || 0}, ${row.quota}::jsonb, ${row.inventory}::jsonb, ${row.subscription}::jsonb, ${row.stats}::jsonb, ${row.transactions}::jsonb)
        RETURNING *
      `;
      if (!result || result.length === 0 || !result[0]) {
        throw new Error('Failed to create user: no data returned');
      }
      return rowToUser(result[0]);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      console.log('updateUser called with userId:', userId);
      console.log('updateUser data:', data);
      
      // Get current user first to ensure it exists
      const current = await this.getUserById(userId);
      console.log('Current user retrieved:', current.id);
      
      const row = userToRow(data);
      console.log('Row to update:', Object.keys(row));
      
      // Merge current user with updates
      const updatedData = {
        ...current,
        ...data,
        // Ensure JSON fields are properly merged
        quota: data.quota !== undefined ? data.quota : current.quota,
        inventory: data.inventory !== undefined ? data.inventory : current.inventory,
        subscription: data.subscription !== undefined ? data.subscription : current.subscription,
        stats: data.stats !== undefined ? data.stats : current.stats,
        transactions: data.transactions !== undefined ? data.transactions : current.transactions,
      };
      
      const finalRow = userToRow(updatedData);
      
      // Use template literal for safe parameterized query
      const result = await sql`
        UPDATE users 
        SET 
          email = ${finalRow.email},
          name = ${finalRow.name},
          password = ${finalRow.password},
          avatar = ${finalRow.avatar || null},
          role = ${finalRow.role || 'user'},
          balance = ${finalRow.balance || 0},
          quota = ${finalRow.quota}::jsonb,
          inventory = ${finalRow.inventory}::jsonb,
          subscription = ${finalRow.subscription}::jsonb,
          stats = ${finalRow.stats}::jsonb,
          transactions = ${finalRow.transactions}::jsonb
        WHERE id = ${userId}
        RETURNING *
      `;
      
      console.log('Update result:', result?.length || 0);
      
      if (!result || result.length === 0 || !result[0]) {
        console.error('Update failed - no rows returned');
        throw new Error('User not found or update failed');
      }
      
      const updatedUser = rowToUser(result[0]);
      console.log('User updated successfully:', updatedUser.id);
      return updatedUser;
    } catch (error: any) {
      console.error('Update user error:', error);
      console.error('UserId:', userId);
      console.error('Data:', data);
      throw new Error(error.message || 'Failed to update user');
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const rows = await sql`SELECT * FROM users`;
      return rows.map(rowToUser);
    } catch (error) {
      return [];
    }
  },

  // Chat sessions operations
  async getChatSessions(userId: string): Promise<any[]> {
    try {
      console.log('getChatSessions called for user:', userId);
      const rows = await sql`SELECT * FROM chat_sessions WHERE user_id = ${userId}::uuid ORDER BY created_at DESC`;
      console.log(`Found ${rows.length} sessions for user ${userId}`);
      
      const sessions = rows.map((row: any) => {
        const messages = typeof row.messages === 'string' ? JSON.parse(row.messages) : (row.messages || []);
        return {
          id: row.id,
          userId: row.user_id,
          title: row.title,
          messages: messages,
          createdAt: row.created_at,
        };
      });
      
      sessions.forEach((s, i) => {
        console.log(`  Session ${i + 1}: ${s.id}, title: "${s.title}", messages: ${s.messages.length}`);
      });
      
      return sessions;
    } catch (error: any) {
      console.error('getChatSessions error:', error);
      return [];
    }
  },

  async createChatSession(userId: string, sessionData: { title: string; messages: any[] }): Promise<any> {
    try {
      console.log('createChatSession called:', { userId, title: sessionData.title, messagesCount: sessionData.messages.length });
      
      const result = await sql`
        INSERT INTO chat_sessions (user_id, title, messages, created_at)
        VALUES (${userId}::uuid, ${sessionData.title}, ${JSON.stringify(sessionData.messages)}::jsonb, ${new Date().toISOString()})
        RETURNING *
      `;
      if (!result || result.length === 0 || !result[0]) {
        throw new Error('Failed to create chat session: no data returned');
      }
      const row = result[0];
      const messages = typeof row.messages === 'string' ? JSON.parse(row.messages) : (row.messages || []);
      console.log('Chat session created successfully:', { id: row.id, messagesCount: messages.length });
      
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        messages: messages,
        createdAt: row.created_at,
      };
    } catch (error: any) {
      console.error('createChatSession error:', error);
      throw new Error(error.message || 'Failed to create chat session');
    }
  },

  async updateChatSession(sessionId: string, data: { title?: string; messages?: any[] }): Promise<any> {
    try {
      console.log('💾 updateChatSession called:', { 
        sessionId, 
        sessionIdType: typeof sessionId,
        sessionIdLength: sessionId?.length,
        hasTitle: !!data.title, 
        messagesCount: data.messages?.length 
      });
      
      // Get current session first - try with UUID casting
      let currentRows;
      try {
        currentRows = await sql`SELECT * FROM chat_sessions WHERE id = ${sessionId}::uuid`;
      } catch (uuidError) {
        // If UUID casting fails, try without casting
        console.log('UUID cast failed, trying without cast...');
        currentRows = await sql`SELECT * FROM chat_sessions WHERE id = ${sessionId}`;
      }
      
      if (!currentRows || currentRows.length === 0 || !currentRows[0]) {
        console.error('❌ Session not found in DB:', sessionId);
        throw new Error('Session not found');
      }
      
      const current = currentRows[0];
      const finalTitle = data.title !== undefined ? data.title : current.title;
      const finalMessages = data.messages !== undefined ? data.messages : (typeof current.messages === 'string' ? JSON.parse(current.messages) : current.messages);
      
      console.log('Updating session:', {
        sessionId,
        title: finalTitle,
        messagesCount: finalMessages?.length || 0,
        currentMessagesCount: typeof current.messages === 'string' ? JSON.parse(current.messages).length : (current.messages?.length || 0)
      });
      
      // Use template literal for safe update
      const result = await sql`
        UPDATE chat_sessions 
        SET 
          title = ${finalTitle},
          messages = ${JSON.stringify(finalMessages)}::jsonb
        WHERE id = ${sessionId}::uuid
        RETURNING *
      `;
      
      if (!result || result.length === 0 || !result[0]) {
        console.error('Update returned no rows');
        throw new Error('Session not found or update failed');
      }
      
      const row = result[0];
      const updatedMessages = typeof row.messages === 'string' ? JSON.parse(row.messages) : (row.messages || []);
      console.log('Session updated successfully:', {
        id: row.id,
        messagesCount: updatedMessages.length
      });
      
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        messages: updatedMessages,
        createdAt: row.created_at,
      };
    } catch (error: any) {
      console.error('updateChatSession error:', error);
      console.error('Error details:', {
        sessionId,
        message: error.message,
        stack: error.stack
      });
      throw new Error(error.message || 'Failed to update chat session');
    }
  },

  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      await sql`DELETE FROM chat_sessions WHERE id = ${sessionId}`;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete chat session');
    }
  },

  // Products operations
  async getProducts(): Promise<any[]> {
    try {
      const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      return rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        price: row.price,
        image: row.image,
        description: row.description,
        purchasedContent: row.purchased_content,
        accessLevel: row.access_level,
      }));
    } catch (error) {
      return [];
    }
  },

  async createProduct(productData: Omit<any, 'id'>): Promise<any> {
    try {
      const result = await sql`
        INSERT INTO products (title, category, price, image, description, purchased_content, access_level, created_at)
        VALUES (${productData.title}, ${productData.category}, ${productData.price}, ${productData.image}, ${productData.description || null}, ${productData.purchasedContent || null}, ${productData.accessLevel || null}, ${new Date().toISOString()})
        RETURNING *
      `;
      if (!result || result.length === 0 || !result[0]) {
        throw new Error('Failed to create product: no data returned');
      }
      const row = result[0];
      return {
        id: row.id,
        title: row.title,
        category: row.category,
        price: row.price,
        image: row.image,
        description: row.description,
        purchasedContent: row.purchased_content,
        accessLevel: row.access_level,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create product');
    }
  },

  async updateProduct(productId: string, data: Partial<any>): Promise<any> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        setParts.push(`title = $${paramIndex}`);
        values.push(data.title);
        paramIndex++;
      }
      if (data.category !== undefined) {
        setParts.push(`category = $${paramIndex}`);
        values.push(data.category);
        paramIndex++;
      }
      if (data.price !== undefined) {
        setParts.push(`price = $${paramIndex}`);
        values.push(data.price);
        paramIndex++;
      }
      if (data.image !== undefined) {
        setParts.push(`image = $${paramIndex}`);
        values.push(data.image);
        paramIndex++;
      }
      if (data.description !== undefined) {
        setParts.push(`description = $${paramIndex}`);
        values.push(data.description);
        paramIndex++;
      }
      if (data.purchasedContent !== undefined) {
        setParts.push(`purchased_content = $${paramIndex}`);
        values.push(data.purchasedContent);
        paramIndex++;
      }
      if (data.accessLevel !== undefined) {
        setParts.push(`access_level = $${paramIndex}`);
        values.push(data.accessLevel);
        paramIndex++;
      }

      if (setParts.length === 0) {
        const rows = await sql`SELECT * FROM products WHERE id = ${productId}`;
        if (!rows || rows.length === 0 || !rows[0]) {
          throw new Error('Product not found');
        }
        const row = rows[0];
        return {
          id: row.id,
          title: row.title,
          category: row.category,
          price: row.price,
          image: row.image,
          description: row.description,
          purchasedContent: row.purchased_content,
          accessLevel: row.access_level,
        };
      }

      values.push(productId);
      const query = `UPDATE products SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      
      const result = await sql.unsafe(query, values);
      if (!result || result.length === 0 || !result[0]) {
        throw new Error('Product not found or update failed');
      }
      const row = result[0];
      return {
        id: row.id,
        title: row.title,
        category: row.category,
        price: row.price,
        image: row.image,
        description: row.description,
        purchasedContent: row.purchased_content,
        accessLevel: row.access_level,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update product');
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await sql`DELETE FROM products WHERE id = ${productId}`;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete product');
    }
  },
};
