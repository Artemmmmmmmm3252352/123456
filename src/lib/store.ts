import { create } from 'zustand';
import { Product, PRODUCTS } from './data';
import { NeonService } from './neonService';

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loadProducts: () => Promise<void>;
  initDefaultProducts: () => Promise<void>;
  stats: {
      totalUsers: number;
      activeSubs: number;
      totalRevenue: number;
  };
  updateStats: (newStats: Partial<{ totalUsers: number; activeSubs: number; totalRevenue: number }>) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  
  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await NeonService.getProducts();
      if (products.length === 0) {
        // Initialize default products if database is empty
        await get().initDefaultProducts();
        const newProducts = await NeonService.getProducts();
        set({ products: newProducts as Product[] });
      } else {
        set({ products: products as Product[] });
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  initDefaultProducts: async () => {
    try {
      for (const product of PRODUCTS) {
        const { id, ...productData } = product;
        await NeonService.createProduct(productData);
      }
    } catch (error) {
      console.error('Failed to initialize default products:', error);
    }
  },

  addProduct: async (product) => {
    try {
      const created = await NeonService.createProduct(product);
      set((state) => ({
        products: [...state.products, created as Product]
      }));
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  },

  updateProduct: async (id, updated) => {
    try {
      await NeonService.updateProduct(id, updated);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p))
      }));
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await NeonService.deleteProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  stats: {
      totalUsers: 154,
      activeSubs: 89,
      totalRevenue: 12450
  },
  updateStats: (newStats) => set((state) => ({
      stats: { ...state.stats, ...newStats }
  }))
}));
