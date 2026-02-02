import { sql } from './neon-node.js';

async function checkAllData() {
  console.log('🔍 Проверка всех данных в базе...\n');

  try {
    // Check users
    console.log('📊 Пользователи:');
    const users = await sql`SELECT id, email, name, role, balance, created_at FROM users ORDER BY created_at DESC LIMIT 5`;
    console.log(`   Всего пользователей: ${users.length}`);
    if (users.length > 0) {
      users.forEach((u: any) => {
        console.log(`   - ${u.email} (${u.name}) - роль: ${u.role}, баланс: ${u.balance || 0}`);
      });
    }
    console.log('');

    // Check products
    console.log('🛍️ Товары:');
    const products = await sql`SELECT id, title, category, price, access_level, created_at FROM products ORDER BY created_at DESC`;
    console.log(`   Всего товаров: ${products.length}`);
    if (products.length > 0) {
      products.forEach((p: any) => {
        console.log(`   - ${p.title} (${p.category}) - ${p.price}₽, доступ: ${p.access_level || 'free'}`);
      });
    }
    console.log('');

    // Check chat sessions
    console.log('💬 Чаты:');
    const chats = await sql`
      SELECT cs.id, cs.title, cs.created_at, u.email as user_email, 
             jsonb_array_length(cs.messages) as messages_count
      FROM chat_sessions cs
      JOIN users u ON cs.user_id = u.id
      ORDER BY cs.created_at DESC
      LIMIT 10
    `;
    console.log(`   Всего чатов: ${chats.length}`);
    if (chats.length > 0) {
      chats.forEach((c: any) => {
        console.log(`   - "${c.title}" (${c.user_email}) - сообщений: ${c.messages_count || 0}`);
      });
    }
    console.log('');

    // Check user inventory
    console.log('📦 Инвентарь пользователей:');
    const usersWithInventory = await sql`
      SELECT u.email, u.inventory, jsonb_array_length(u.inventory) as items_count
      FROM users u
      WHERE jsonb_array_length(u.inventory) > 0
      LIMIT 5
    `;
    if (usersWithInventory.length > 0) {
      usersWithInventory.forEach((u: any) => {
        console.log(`   - ${u.email}: ${u.items_count} товаров`);
      });
    } else {
      console.log('   Нет пользователей с товарами');
    }
    console.log('');

    // Check subscriptions
    console.log('💳 Подписки:');
    const subscriptions = await sql`
      SELECT u.email, u.subscription->>'plan' as plan, u.subscription->>'expiresAt' as expires_at
      FROM users u
      WHERE u.subscription->>'plan' != 'free' OR u.subscription->>'plan' IS NULL
      LIMIT 5
    `;
    if (subscriptions.length > 0) {
      subscriptions.forEach((s: any) => {
        console.log(`   - ${s.email}: ${s.plan || 'free'}`);
      });
    } else {
      console.log('   Все пользователи на бесплатном тарифе');
    }
    console.log('');

    console.log('✅ Проверка завершена!');
  } catch (error: any) {
    console.error('❌ Ошибка при проверке:', error.message);
    process.exit(1);
  }
}

checkAllData();
