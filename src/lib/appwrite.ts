import { Client, Account, Databases, ID, Query } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'standard_c32f0124d7f6b6c90b89aa5d16e6c21d0c7b2a8ef7043834dfa8f5754610b9562288f916119e249cc9af6a26dfb3eb6cb4d803bbdb9d348b3a36ff989480025f47bf8898d0bd58f763bd38a291b085616df1a373ec30bae0ad5a529b56f9d2ed9caf05b2bef5906febf95c7853c67ae63db7bd9d9f2dd2f0992aa0113c39e831';

// Database and Collection IDs (will need to be created in Appwrite console)
export const DATABASE_ID = 'main';
export const COLLECTIONS = {
  USERS: 'users',
  CHAT_SESSIONS: 'chat_sessions',
  PRODUCTS: 'products',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

export { client, ID, Query };
