import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon, Bot, User, Loader2, Image as ImageIcon, X, Trash2, Plus, MessageSquare, Pencil, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useAuth } from "@/context/AuthContext"
import { NeonService } from "@/lib/neonService"

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

if (!GROQ_API_KEY) {
  console.error('⚠️ VITE_GROQ_API_KEY is not set! AI chat will not work.');
}

type Message = {
    role: 'assistant' | 'user';
    content: string;
    type?: 'text' | 'image';
    imageUrl?: string; 
};

type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
};

export default function ChatPage() {
  const { user, updateUser } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const sessionsRef = useRef<ChatSession[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  
  // Keep ref in sync with state
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);
  
  // Function to save all sessions to database
  const saveAllSessions = async (sessionsToSave?: ChatSession[]) => {
    const sessionsToUse = sessionsToSave || sessions;
    if (!user || sessionsToUse.length === 0) return;
    
    console.log('💾 Saving all sessions to database...', sessionsToUse.length);
    const savePromises = sessionsToUse.map(async (session) => {
      try {
        // Try to update first
        await NeonService.updateChatSession(session.id, {
          title: session.title,
          messages: session.messages
        });
        console.log('✅ Session saved:', session.id, 'Messages:', session.messages.length);
        return { success: true, id: session.id };
      } catch (error: any) {
        // If session doesn't exist, create it
        if (error.message?.includes('not found') || error.message?.includes('Session not found')) {
          console.log('⚠️ Session not found, creating new one:', session.id);
          try {
            const created = await NeonService.createChatSession(user.id, {
              title: session.title,
              messages: session.messages
            });
            console.log('✅ Session created:', created.id);
            return { success: true, id: created.id, oldId: session.id };
          } catch (createError) {
            console.error('❌ Failed to create session:', session.id, createError);
            return { success: false, id: session.id };
          }
        } else {
          console.error('❌ Failed to save session:', session.id, error);
          return { success: false, id: session.id };
        }
      }
    });
    
    const results = await Promise.all(savePromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`💾 Saved ${successCount}/${sessionsToUse.length} sessions`);
    
    // Update session IDs if any were recreated
    const recreated = results.filter(r => r.success && (r as any).oldId);
    if (recreated.length > 0) {
      setSessions(current => current.map(s => {
        const recreatedSession = recreated.find(r => (r as any).oldId === s.id);
        if (recreatedSession) {
          return { ...s, id: recreatedSession.id };
        }
        return s;
      }));
    }
  };

  // Load sessions from Appwrite
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) {
        setIsLoadingSessions(false);
        return;
      }

      // Always reload sessions on mount or when user changes to get latest data

      try {
        setIsLoadingSessions(true);
        console.log('Loading chat sessions for user:', user.id);
        const appwriteSessions = await NeonService.getChatSessions(user.id);
        console.log('Loaded sessions:', appwriteSessions.length);
        
        if (appwriteSessions.length > 0) {
          const formattedSessions: ChatSession[] = appwriteSessions.map(s => ({
            id: s.id,
            title: s.title,
            messages: s.messages || [],
            createdAt: new Date(s.createdAt).getTime()
          }));
          setSessions(formattedSessions);
          setActiveSessionId(formattedSessions[0].id);
        } else {
          // Create default session if none exist
          const defaultSession: ChatSession = {
            id: uuidv4(),
            title: 'Новый чат',
            messages: [{ role: 'assistant', content: 'Привет! Я ваш AI-ассистент. Чем могу помочь?', type: 'text' }],
            createdAt: Date.now()
          };
          
          try {
            const created = await NeonService.createChatSession(user.id, {
              title: defaultSession.title,
              messages: defaultSession.messages
            });
            setSessions([{
              id: created.id,
              title: created.title,
              messages: created.messages,
              createdAt: new Date(created.createdAt).getTime()
            }]);
            setActiveSessionId(created.id);
          } catch (error) {
            console.error('Failed to create default session:', error);
            setSessions([defaultSession]);
            setActiveSessionId(defaultSession.id);
          }
        }

        // Migration: Check localStorage for old data
        const oldHistory = localStorage.getItem('chat_history');
        if (oldHistory && appwriteSessions.length === 0) {
          try {
            const parsed = JSON.parse(oldHistory);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const migratedSession = await NeonService.createChatSession(user.id, {
                title: 'Предыдущий чат',
                messages: parsed
              });
              setSessions([{
                id: migratedSession.id,
                title: migratedSession.title,
                messages: migratedSession.messages,
                createdAt: new Date(migratedSession.createdAt).getTime()
              }]);
              setActiveSessionId(migratedSession.id);
              localStorage.removeItem('chat_history');
            }
          } catch (e) {
            console.error("Failed to migrate old history", e);
          }
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        // Fallback to default session - create in DB
        try {
          const defaultSessionData = {
            title: 'Новый чат',
            messages: [{ role: 'assistant', content: 'Привет! Я ваш AI-ассистент. Чем могу помочь?', type: 'text' }]
          };
          const created = await NeonService.createChatSession(user.id, defaultSessionData);
          const defaultSession: ChatSession = {
            id: created.id,
            title: created.title,
            messages: created.messages,
            createdAt: new Date(created.createdAt).getTime()
          };
          setSessions([defaultSession]);
          setActiveSessionId(defaultSession.id);
          console.log('✅ Default session created in DB (fallback):', defaultSession.id);
        } catch (createError) {
          console.error('Failed to create default session:', createError);
          // Last resort: local session
          const defaultSession: ChatSession = {
            id: uuidv4(),
            title: 'Новый чат',
            messages: [{ role: 'assistant', content: 'Привет! Я ваш AI-ассистент. Чем могу помочь?', type: 'text' }],
            createdAt: Date.now()
          };
          setSessions([defaultSession]);
          setActiveSessionId(defaultSession.id);
        }
      } finally {
        setIsLoadingSessions(false);
      }
    };

    loadSessions();
  }, [user?.id]); // Only reload when user ID changes, not when user object changes

  // Save sessions before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save all sessions synchronously if possible
      if (user && sessions.length > 0) {
        // Save to localStorage as backup
        sessions.forEach(session => {
          try {
            const backup = localStorage.getItem('chat_sessions_backup') || '{}';
            const backupData = JSON.parse(backup);
            backupData[session.id] = {
              title: session.title,
              messages: session.messages,
              timestamp: Date.now()
            };
            localStorage.setItem('chat_sessions_backup', JSON.stringify(backupData));
          } catch (err) {
            console.error('Failed to backup session:', err);
          }
        });
        
        // Try to save to DB (may not complete, but we try)
        // Use navigator.sendBeacon for more reliable saving
        const sessionsData = JSON.stringify(sessions.map(s => ({
          id: s.id,
          title: s.title,
          messages: s.messages
        })));
        
        // Also try async save
        saveAllSessions(sessions).catch(err => console.error('Failed to save on unload:', err));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessions, user]);

  // Auto-save all sessions periodically - every 2 seconds for reliability
  useEffect(() => {
    if (!user || sessions.length === 0) return;
    
    const autoSaveInterval = setInterval(() => {
      // Use current sessions state
      setSessions(currentSessions => {
        saveAllSessions(currentSessions);
        return currentSessions;
      });
    }, 2000); // Save every 2 seconds for more frequent saves
    
    return () => clearInterval(autoSaveInterval);
  }, [user, sessions.length]);

  // Ensure active session exists, fallback to first one
  useEffect(() => {
    if (!sessions.find(s => s.id === activeSessionId) && sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Calculate Quota for UI
  const getQuotaStats = () => {
      if (!user) return { used: 0, limit: 5, plan: 'free' };
      const plan = user.subscription?.plan || 'free';
      let limit = 5;
      if (plan === 'standard') limit = 1000;
      if (plan === 'premium') limit = Infinity;
      return { used: user.quota?.used || 0, limit, plan };
  };
  
  const { used, limit, plan } = getQuotaStats();

  // Removed auto-save useEffect - saving is now done directly in updateActiveSessionMessages
  // This prevents infinite loops and message loss

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (user && user.stats && user.stats.chatsCount !== sessions.length) {
         updateUser({
            stats: {
                ...user.stats,
                chatsCount: sessions.length
            }
         }, true).catch(error => {
            console.error('Failed to update chatsCount:', error);
            // Don't throw - just log the error to prevent page reload
         });
    }
  }, [sessions.length, user?.stats?.chatsCount]);

  const createNewChat = async () => {
      if (!user) return;

      const newSession: ChatSession = {
          id: uuidv4(),
          title: 'Новый чат',
          messages: [{ role: 'assistant', content: 'Привет! Я ваш AI-ассистент. Чем могу помочь?', type: 'text' }],
          createdAt: Date.now()
      };
      
      try {
          const created = await NeonService.createChatSession(user.id, {
              title: newSession.title,
              messages: newSession.messages
          });
          const formattedSession: ChatSession = {
              id: created.id,
              title: created.title,
              messages: created.messages,
              createdAt: new Date(created.createdAt).getTime()
          };
          setSessions(prev => [formattedSession, ...prev]);
          setActiveSessionId(created.id);
      } catch (error) {
          console.error('Failed to create session:', error);
          // Fallback to local state
          setSessions(prev => [newSession, ...prev]);
          setActiveSessionId(newSession.id);
      }
      setMode('chat');
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      try {
          await NeonService.deleteChatSession(id);
          const newSessions = sessions.filter(s => s.id !== id);
          setSessions(newSessions);
          if (activeSessionId === id && newSessions.length > 0) {
              setActiveSessionId(newSessions[0].id);
          }
      } catch (error) {
          console.error('Failed to delete session:', error);
          toast({
              title: "Ошибка",
              description: "Не удалось удалить сессию",
              variant: "destructive"
          });
      }
  };

  const startEditingTitle = (e: React.MouseEvent, sessionId: string, currentTitle: string) => {
      e.stopPropagation();
      setEditingSessionId(sessionId);
      setEditingTitle(currentTitle);
  };

  const saveTitle = async (sessionId: string) => {
      if (!editingTitle.trim()) {
          setEditingSessionId(null);
          return;
      }

      const session = sessions.find(s => s.id === sessionId);
      if (!session || session.title === editingTitle.trim()) {
          setEditingSessionId(null);
          return;
      }

      const newTitle = editingTitle.trim();
      
      // Update local state
      setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, title: newTitle } : s
      ));
      
      setEditingSessionId(null);

      // Save to database
      if (user && sessionId) {
          try {
              await NeonService.updateChatSession(sessionId, {
                  title: newTitle,
                  messages: session.messages
              });
              console.log('✅ Chat title updated in DB:', newTitle);
              toast({
                  title: "Успешно",
                  description: "Название чата обновлено",
                  variant: "default"
              });
          } catch (error: any) {
              console.error('❌ Failed to update chat title:', error);
              toast({
                  title: "Ошибка",
                  description: "Не удалось сохранить название",
                  variant: "destructive"
              });
              // Revert local state on error
              setSessions(prev => prev.map(s => 
                  s.id === sessionId ? { ...s, title: session.title } : s
              ));
          }
      }
  };

  const cancelEditing = () => {
      setEditingSessionId(null);
      setEditingTitle("");
  };

  // Helper to update messages for the active session - saves immediately
  const updateActiveSessionMessages = (updateFn: (prevMessages: Message[]) => Message[]) => {
      setSessions(prev => {
          const updated = prev.map(session => {
              if (session.id === activeSessionId) {
                  const newMessages = updateFn(session.messages);
                  // Update title based on first user question if it's the generic title
                  let newTitle = session.title;
                  if (session.title === 'Новый чат') {
                      const firstUserMsg = newMessages.find(m => m.role === 'user');
                      if (firstUserMsg && firstUserMsg.content) {
                          newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
                      }
                  }
                  return { ...session, messages: newMessages, title: newTitle };
              }
              return session;
          });
          
          // Save immediately - no debounce
          const updatedSession = updated.find(s => s.id === activeSessionId);
          if (user && activeSessionId && updatedSession) {
              NeonService.updateChatSession(activeSessionId, {
                  title: updatedSession.title,
                  messages: updatedSession.messages
              }).then(() => {
                  console.log('✅ Session updated in DB');
              }).catch(async (error: any) => {
                  if (error.message?.includes('not found') || error.message?.includes('Session not found')) {
                      try {
                          const created = await NeonService.createChatSession(user.id, {
                              title: updatedSession.title,
                              messages: updatedSession.messages
                          });
                          setSessions(current => current.map(s => 
                              s.id === activeSessionId ? { ...s, id: created.id } : s
                          ));
                          setActiveSessionId(created.id);
                      } catch (createError) {
                          console.error('Failed to create session:', createError);
                      }
                  } else {
                      console.error('Failed to update session:', error);
                  }
              });
          }
          
          return updated;
      });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    // Block interaction in Image mode for now (Development State)
    if (mode === 'image') {
        toast({
            title: "В разработке",
            description: "Генерация изображений временно недоступна.",
            variant: "default"
        });
        return;
    }

    if ((!input.trim() && !selectedImage) || isLoading) return;

    // CHECK QUOTAS BEFORE OPTIMISTIC UI
    if (user) {
        const now = Date.now();
        const lastReset = user.quota?.lastReset || 0;
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Reset check (client side prediction)
        let currentUsed = user.quota?.used || 0;
        if (now - lastReset > oneDay) {
            currentUsed = 0;
            // We'll update the reset time in the actual update call
        }

        const plan = user.subscription?.plan || 'free';
        // Admin override can be here, but let's enforce based on Plan usually.
        // If user is Admin, they should give themselves Premium to bypass.
        
        let planLimit = 5;
        if (plan === 'standard') planLimit = 1000;
        if (plan === 'premium') planLimit = 999999;
        
        if (currentUsed >= planLimit) {
             toast({
                title: "Лимит исчерпан",
                description: `Вы исчерпали лимит запросов (${planLimit}) для тарифа ${plan.toUpperCase()}. Обновите подписку.`,
                variant: "destructive"
            });
            return;
        }

        // Increment usage
        // We await this to ensure state consistency
        try {
            await updateUser({ 
                quota: { 
                    used: currentUsed + 1, 
                    lastReset: (now - lastReset > oneDay) ? now : lastReset 
                } 
            }, true);
        } catch (error) {
            console.error('Failed to update quota:', error);
            // Continue anyway - don't block the chat
        }
    }

    const userContent = input;
    const userImage = selectedImage;
    
    // Optimistic UI update
    const userMessage: Message = { 
        role: 'user', 
        content: userContent, 
        type: 'text',
        imageUrl: userImage || undefined
    };

    // Update state and save immediately - with retry logic
    setSessions(prev => {
        const updated = prev.map(session => {
            if (session.id === activeSessionId) {
                return { ...session, messages: [...session.messages, userMessage] };
            }
            return session;
        });
        
        // Save immediately with updated data
        const updatedSession = updated.find(s => s.id === activeSessionId);
        if (user && activeSessionId && updatedSession) {
            // Save with retry - try update first, then create if needed
            (async () => {
                try {
                    await NeonService.updateChatSession(activeSessionId, {
                        title: updatedSession.title,
                        messages: updatedSession.messages
                    });
                    console.log('✅ User message saved to DB');
                } catch (error: any) {
                    // If session doesn't exist, create it
                    if (error.message?.includes('not found') || error.message?.includes('Session not found')) {
                        console.log('⚠️ Session not found, creating new one...');
                        try {
                            const created = await NeonService.createChatSession(user.id, {
                                title: updatedSession.title,
                                messages: updatedSession.messages
                            });
                            console.log('✅ New session created:', created.id);
                            // Update local state with real ID from DB
                            setSessions(current => current.map(s => 
                                s.id === activeSessionId ? { 
                                    ...s, 
                                    id: created.id,
                                    messages: created.messages 
                                } : s
                            ));
                            setActiveSessionId(created.id);
                        } catch (createError: any) {
                            console.error('❌ Failed to create session:', createError);
                            console.error('Create error details:', createError.message);
                        }
                    } else {
                        console.error('❌ Failed to save user message:', error);
                        console.error('Error details:', error.message);
                    }
                }
            })();
        }
        
        return updated;
    });
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
        if (mode === 'image') {
           // ... Code hidden/disabled for now ... 
        } else {
            // Chat Mode
            const apiMessages = messages.map(m => ({
                role: m.role,
                content: m.content || "" 
            }));
            
            const newMessage = { 
                role: 'user', 
                content: userContent 
            };
            
            // Handle image input for chat (multimodal) if exists
            if (userImage) {
               (newMessage as any).content = [
                    { type: "text", text: userContent || "Image description request" },
                    { type: "image_url", image_url: { url: userImage } }
                ];
            }

            console.log("Sending chat request...", { apiMessages, newMessage });

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "llama-3.1-8b-instant", 
                    "messages": [
                        ...apiMessages, 
                        newMessage
                    ]
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error("Chat API Error:", err);
                throw new Error(err.error?.message || `Chat API error: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message;

            // Update state and save assistant message immediately
            const assistantMsg: Message = {
                role: 'assistant',
                content: assistantMessage.content || "...",
                type: 'text'
            };
            
            setSessions(prev => {
                const updated = prev.map(session => {
                    if (session.id === activeSessionId) {
                        return { ...session, messages: [...session.messages, assistantMsg] };
                    }
                    return session;
                });
                
                // Save immediately with updated data - with retry logic
                const updatedSession = updated.find(s => s.id === activeSessionId);
                if (user && activeSessionId && updatedSession) {
                    (async () => {
                        try {
                            await NeonService.updateChatSession(activeSessionId, {
                                title: updatedSession.title,
                                messages: updatedSession.messages
                            });
                            console.log('✅ Assistant message saved to DB');
                        } catch (error: any) {
                            // If session doesn't exist, create it
                            if (error.message?.includes('not found') || error.message?.includes('Session not found')) {
                                console.log('⚠️ Session not found, creating new one...');
                                try {
                                    const created = await NeonService.createChatSession(user.id, {
                                        title: updatedSession.title,
                                        messages: updatedSession.messages
                                    });
                                    console.log('✅ New session created:', created.id);
                                    // Update local state with real ID from DB
                                    setSessions(current => current.map(s => 
                                        s.id === activeSessionId ? { 
                                            ...s, 
                                            id: created.id,
                                            messages: created.messages 
                                        } : s
                                    ));
                                    setActiveSessionId(created.id);
                                } catch (createError: any) {
                                    console.error('❌ Failed to create session:', createError);
                                    console.error('Create error details:', createError.message);
                                }
                            } else {
                                console.error('❌ Failed to save assistant message:', error);
                                console.error('Error details:', error.message);
                            }
                        }
                    })();
                }
                
                return updated;
            });

            // Track Token Usage
            if (user && user.stats) {
                const estimatedInput = Math.ceil((userContent?.length || 0) / 4);
                const estimatedOutput = Math.ceil((assistantMessage.content?.length || 0) / 4);
                const totalTokens = estimatedInput + estimatedOutput;
                
                updateUser({
                    stats: {
                        ...user.stats,
                        tokensUsed: (user.stats.tokensUsed || 0) + totalTokens
                    }
                }, true).catch(error => {
                    console.error('Failed to update tokensUsed:', error);
                    // Don't throw - just log the error
                });
            }
        }
    } catch (error: any) {
        console.error("Chat error:", error);
        toast({
            title: "Ошибка",
            description: error.message || "Произошла ошибка при выполнении запроса.",
            variant: "destructive"
        });
        updateActiveSessionMessages(prev => [...prev, { role: 'assistant', content: `Ошибка: ${error.message || 'Не удалось получить ответ.'}`, type: 'text' }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Sidebar - History */}
      <Card className="w-64 hidden md:flex flex-col border-r shadow-sm h-full rounded-tr-none rounded-br-none border-0 bg-card/50">
         <CardHeader className="p-3 border-b">
             <Button onClick={createNewChat} className="w-full justify-start gap-2" variant="outline">
                 <Plus className="h-4 w-4" />
                 Новый чат
             </Button>
         </CardHeader>
         <CardContent className="flex-1 p-0 overflow-hidden">
             <ScrollArea className="h-full">
                 <div className="flex flex-col gap-1 p-2">
                     <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">История</p>
                     {sessions.map(session => (
                         <div 
                            key={session.id}
                            onClick={() => {
                                if (editingSessionId !== session.id) {
                                    setActiveSessionId(session.id);
                                }
                            }}
                            className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                                activeSessionId === session.id 
                                ? 'bg-secondary text-secondary-foreground' 
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                         >
                             <MessageSquare className="h-4 w-4 shrink-0" />
                             {editingSessionId === session.id ? (
                                 <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                     <Input
                                         value={editingTitle}
                                         onChange={(e) => setEditingTitle(e.target.value)}
                                         onKeyDown={(e) => {
                                             if (e.key === 'Enter') {
                                                 saveTitle(session.id);
                                             } else if (e.key === 'Escape') {
                                                 cancelEditing();
                                             }
                                         }}
                                         className="h-7 text-sm px-2"
                                         autoFocus
                                         onClick={(e) => e.stopPropagation()}
                                     />
                                     <Button
                                         variant="ghost"
                                         size="icon"
                                         className="h-6 w-6"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             saveTitle(session.id);
                                         }}
                                     >
                                         <Check className="h-3 w-3 text-green-600" />
                                     </Button>
                                     <Button
                                         variant="ghost"
                                         size="icon"
                                         className="h-6 w-6"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             cancelEditing();
                                         }}
                                     >
                                         <X className="h-3 w-3 text-muted-foreground" />
                                     </Button>
                                 </div>
                             ) : (
                                 <>
                                     <span 
                                         className="truncate flex-1 text-left"
                                         onDoubleClick={(e) => startEditingTitle(e, session.id, session.title)}
                                     >
                                         {session.title}
                                     </span>
                                     <Button
                                         variant="ghost" 
                                         size="icon" 
                                         className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                         onClick={(e) => startEditingTitle(e, session.id, session.title)}
                                     >
                                         <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                     </Button>
                                     <Button
                                         variant="ghost" 
                                         size="icon" 
                                         className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                         onClick={(e) => deleteSession(e, session.id)}
                                     >
                                         <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                     </Button>
                                 </>
                             )}
                         </div>
                     ))}
                 </div>
             </ScrollArea>
         </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col shadow-sm h-full md:rounded-tl-none md:rounded-bl-none">
        <CardHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Bot className="h-5 w-5 text-primary shrink-0" />
                    {editingSessionId === activeSessionId ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                            <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        saveTitle(activeSessionId);
                                    } else if (e.key === 'Escape') {
                                        cancelEditing();
                                    }
                                }}
                                className="h-8 text-lg font-semibold px-2 flex-1"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => saveTitle(activeSessionId)}
                            >
                                <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={cancelEditing}
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <CardTitle 
                                className="text-lg hidden md:block truncate cursor-pointer hover:text-primary transition-colors"
                                onDoubleClick={() => {
                                    if (activeSession) {
                                        startEditingTitle({ stopPropagation: () => {} } as any, activeSessionId, activeSession.title);
                                    }
                                }}
                                title="Двойной клик для редактирования"
                            >
                                {activeSession?.title || "AI Chat"}
                            </CardTitle>
                            <CardTitle className="text-lg md:hidden">AI Assistant</CardTitle>
                            {activeSession && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hidden md:flex shrink-0"
                                    onClick={() => {
                                        if (activeSession) {
                                            startEditingTitle({ stopPropagation: () => {} } as any, activeSessionId, activeSession.title);
                                        }
                                    }}
                                >
                                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
                
                {user && (
                    <div className="flex items-center gap-2 px-4 border-r mr-4">
                        <div className="flex flex-col items-end text-xs">
                           <span className="text-muted-foreground whitespace-nowrap font-medium">{used} / {limit > 1000 ? '∞' : limit}</span>
                           <Progress value={(used / (limit > 1000 ? 100 : limit)) * 100} className="h-1.5 w-16 mt-0.5" />
                        </div>
                    </div>
                )}
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'chat' | 'image')} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="chat">Чат</TabsTrigger>
                        <TabsTrigger value="image">Фото</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {m.imageUrl && m.role === 'user' && (
                        <div className="mb-2 rounded-md overflow-hidden">
                            <img 
                                src={m.imageUrl} 
                                alt="Uploaded content" 
                                className="max-w-full h-auto max-h-[200px] object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="hidden text-xs underline break-all text-blue-500 hover:text-blue-700">
                                Не удалось загрузить предпросмотр. Открыть изображение
                            </a>
                        </div>
                    )}
                    {m.type === 'image' && m.imageUrl ? (
                        <div>
                             <img 
                                src={m.imageUrl} 
                                alt="Generated content" 
                                className="max-w-full h-auto rounded-md"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }} 
                             />
                             <div className="hidden mt-2">
                                <p className="text-xs text-muted-foreground mb-1">Не удалось отобразить изображение напрямую:</p>
                                <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline text-blue-500 break-all">
                                    Ссылка на изображение
                                </a>
                             </div>
                        </div>
                    ) : (
                        <div className={`prose prose-sm max-w-none [&>.math-display]:overflow-x-auto [&>.math-display]:my-2 
                            prose-code:text-foreground prose-code:bg-muted-foreground/20 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                            prose-a:text-blue-500 hover:prose-a:text-blue-400
                            prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground
                            ${m.role === 'user' ? 'prose-invert text-primary-foreground' : 'dark:prose-invert text-foreground'}
                        }`}>
                            <ReactMarkdown 
                                remarkPlugins={[remarkMath]} 
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                    a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                                }}
                            >
                                {m.content}
                            </ReactMarkdown>
                        </div>
                    )}
                  </div>
                  {m.role === 'user' && (
                     <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>{mode === 'image' ? 'Генерирую изображение...' : 'Печатает...'}</span>
                    </div>
                 </div>
              )}
               <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-3 flex-col gap-2">
          {selectedImage && (
              <div className="w-full flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <div className="h-10 w-10 relative rounded overflow-hidden">
                      <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <span className="text-xs text-muted-foreground flex-1 truncate">Изображение выбрано</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedImage(null)}>
                      <X className="h-4 w-4" />
                  </Button>
              </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex w-full items-center gap-2"
          >
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || mode === 'image'} 
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
            <Input
              placeholder={mode === 'image' ? "Функция в разработке..." : "Введите сообщение..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isLoading || mode === 'image'}
            />
            <Button type="submit" size="icon" disabled={(!input.trim() && !selectedImage) || isLoading || mode === 'image'}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
              <span className="sr-only">Отправить</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
