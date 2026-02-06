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
      console.log('🔄 updateProduct called:', { productId, data });
      
      // Get current product first to ensure it exists
      const currentRows = await sql`SELECT * FROM products WHERE id = ${productId}::uuid`;
      if (!currentRows || currentRows.length === 0 || !currentRows[0]) {
        throw new Error('Product not found');
      }
      
      const current = currentRows[0];
      
      // Build update query using template literals (safer approach)
      const updates: any = {};
      if (data.title !== undefined) updates.title = data.title;
      if (data.category !== undefined) updates.category = data.category;
      if (data.price !== undefined) updates.price = data.price;
      if (data.image !== undefined) updates.image = data.image;
      if (data.description !== undefined) updates.description = data.description;
      if (data.purchasedContent !== undefined) updates.purchased_content = data.purchasedContent;
      if (data.accessLevel !== undefined) updates.access_level = data.accessLevel;

      if (Object.keys(updates).length === 0) {
        // No updates, return current product
        return {
          id: current.id,
          title: current.title,
          category: current.category,
          price: current.price,
          image: current.image,
          description: current.description,
          purchasedContent: current.purchased_content,
          accessLevel: current.access_level,
        };
      }

      // Use template literal for safe update
      const result = await sql`
        UPDATE products 
        SET 
          ${updates.title !== undefined ? sql`title = ${updates.title}` : sql``},
          ${updates.category !== undefined ? sql`category = ${updates.category}` : sql``},
          ${updates.price !== undefined ? sql`price = ${updates.price}` : sql``},
          ${updates.image !== undefined ? sql`image = ${updates.image}` : sql``},
          ${updates.description !== undefined ? sql`description = ${updates.description}` : sql``},
          ${updates.purchased_content !== undefined ? sql`purchased_content = ${updates.purchased_content}` : sql``},
          ${updates.access_level !== undefined ? sql`access_level = ${updates.access_level}` : sql``}
        WHERE id = ${productId}::uuid
        RETURNING *
      `;
      
      // Better approach: build SET clause dynamically
      const setClauses: any[] = [];
      if (updates.title !== undefined) setClauses.push(sql`title = ${updates.title}`);
      if (updates.category !== undefined) setClauses.push(sql`category = ${updates.category}`);
      if (updates.price !== undefined) setClauses.push(sql`price = ${updates.price}`);
      if (updates.image !== undefined) setClauses.push(sql`image = ${updates.image}`);
      if (updates.description !== undefined) setClauses.push(sql`description = ${updates.description}`);
      if (updates.purchased_content !== undefined) setClauses.push(sql`purchased_content = ${updates.purchased_content}`);
      if (updates.access_level !== undefined) setClauses.push(sql`access_level = ${updates.access_level}`);

      // Build the query manually with sql template
      const setString = setClauses.map((_, i) => {
        if (updates.title !== undefined && i === 0) return 'title = $1';
        if (updates.category !== undefined) return 'category = $' + (setClauses.findIndex(c => c === sql`category = ${updates.category}`) + 1);
        // This is getting complex, let's use a simpler approach
        return '';
      }).filter(Boolean).join(', ');

      // Simpler: use sql.unsafe but with proper parameterization
      const setStrings: string[] = [];
      const values: any[] = [];
      let paramIdx = 1;

      if (updates.title !== undefined) { setStrings.push(`title = $${paramIdx}`); values.push(updates.title); paramIdx++; }
      if (updates.category !== undefined) { setStrings.push(`category = $${paramIdx}`); values.push(updates.category); paramIdx++; }
      if (updates.price !== undefined) { setStrings.push(`price = $${paramIdx}`); values.push(updates.price); paramIdx++; }
      if (updates.image !== undefined) { setStrings.push(`image = $${paramIdx}`); values.push(updates.image); paramIdx++; }
      if (updates.description !== undefined) { setStrings.push(`description = $${paramIdx}`); values.push(updates.description); paramIdx++; }
      if (updates.purchased_content !== undefined) { setStrings.push(`purchased_content = $${paramIdx}`); values.push(updates.purchased_content); paramIdx++; }
      if (updates.access_level !== undefined) { setStrings.push(`access_level = $${paramIdx}`); values.push(updates.access_level); paramIdx++; }

      values.push(productId);
      const finalQuery = `UPDATE products SET ${setStrings.join(', ')} WHERE id = $${paramIdx}::uuid RETURNING *`;
      
      const finalResult = await sql.unsafe(finalQuery, values);
      if (!finalResult || finalResult.length === 0 || !finalResult[0]) {
        throw new Error('Product not found or update failed');
      }
      const row = finalResult[0];
      console.log('✅ Product updated successfully:', row.id);
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
      console.error('❌ updateProduct error:', error);
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

  // Payment requests operations
  async createPaymentRequest(userId: string, data: { amount: number; screenshot: string }): Promise<any> {
    try {
      const result = await sql`
        INSERT INTO payment_requests (user_id, amount, screenshot, status, created_at)
        VALUES (${userId}::uuid, ${data.amount}, ${data.screenshot}, 'pending', ${new Date().toISOString()})
        RETURNING *
      `;
      if (!result || result.length === 0 || !result[0]) {
        throw new Error('Failed to create payment request: no data returned');
      }
      const row = result[0];
      return {
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        screenshot: row.screenshot,
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create payment request');
    }
  },

  async getPaymentRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<any[]> {
    try {
      let rows;
      if (status) {
        rows = await sql`SELECT * FROM payment_requests WHERE status = ${status} ORDER BY created_at DESC`;
      } else {
        rows = await sql`SELECT * FROM payment_requests ORDER BY created_at DESC`;
      }
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        screenshot: row.screenshot,
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
      }));
    } catch (error: any) {
      console.error('getPaymentRequests error:', error);
      return [];
    }
  },

  async getPaymentRequestById(requestId: string): Promise<any | null> {
    try {
      const rows = await sql`SELECT * FROM payment_requests WHERE id = ${requestId}::uuid LIMIT 1`;
      if (!rows || rows.length === 0 || !rows[0]) {
        return null;
      }
      const row = rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        screenshot: row.screenshot,
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
      };
    } catch (error: any) {
      console.error('getPaymentRequestById error:', error);
      return null;
    }
  },

  async updatePaymentRequestStatus(requestId: string, status: 'approved' | 'rejected', reviewedBy: string): Promise<any> {
    try {
      const result = await sql`
        UPDATE payment_requests 
        SET 
          status = ${status},
          reviewed_at = ${new Date().toISOString()},
          reviewed_by = ${reviewedBy}::uuid
        WHERE id = ${requestId}::uuid
        RETURNING *
      `;
      if (!result || result.length === 0 || !result[0]) {
        throw new Error('Payment request not found or update failed');
      }
      const row = result[0];
      return {
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        screenshot: row.screenshot,
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update payment request');
    }
  },
};
