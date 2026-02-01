
export interface Product {
    id: string;
    title: string;
    category: string;
    price: number;
    image: string;
    description: string;
    purchasedContent?: string; // The content shown only after purchase
    accessLevel?: 'free' | 'standard' | 'premium'; // Ограничение по подписке
}

export const PRODUCTS: Product[] = [
  { 
      id: "prod_1", 
      title: "React Mastery Course", 
      category: "Course", 
    price: 990, 
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
      description: "Полный курс по React с нуля до профи.",
      purchasedContent: "Ссылка на курс: https://udemy.com/course/react-mastery\nПароль: react2024"
  },
  { 
      id: "prod_2", 
      title: "AI Prompt Pack", 
      category: "Digital", 
    price: 390, 
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
      description: "Коллекция лучших промптов для GPT-4."
  },
  { 
      id: "prod_3", 
      title: "UI Kit Pro", 
      category: "Asset", 
    price: 590, 
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=60",
      description: "Набор компонентов для быстрого старта."
  },
  { 
      id: "prod_4", 
      title: "Advanced Python", 
      category: "Course", 
    price: 1190, 
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60",
      description: "Продвинутые техники Python разработки."
  }
];

export const SUBSCRIPTION_PLANS = [
    {
        id: "free",
        name: "Free",
        price: 0,
        features: [
            "5 запросов в сутки",
            "Базовый доступ к AI",
            "Поддержка сообщества"
        ]
    },
    {
        id: "standard",
        name: "Standard",
        price: 200,
        features: [
            "1,000 запросов к ИИ в сутки",
            "Доступ только к готовым продуктам",
            "Помощь и поддержка"
        ]
    },
    {
        id: "premium",
        name: "Premium",
        price: 350,
        features: [
            "Безлимит к ИИ",
            "Доступ ко всем продуктам бесплатно",
            "Эксклюзивные функции и ранний доступ"
        ]
    }
]
