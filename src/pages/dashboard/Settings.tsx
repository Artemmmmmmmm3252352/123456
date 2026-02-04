import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { FileUpload } from "@/components/FileUpload"

export default function SettingsPage() {
  const { user, updateUser, changePassword } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
        setName(user.name);
        setEmail(user.email);
        setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
        await updateUser({ name, avatar });
    } finally {
        setLoading(false);
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) return alert("Пароль должен быть длиннее 6 символов");
      
    setPassLoading(true);
    try {
        await changePassword(currentPassword, newPassword);
        setCurrentPassword("");
        setNewPassword("");
    } finally {
        setPassLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Настройки</h3>
        <p className="text-sm text-muted-foreground">
          Управляйте настройками вашего аккаунта и предпочтениями.
        </p>
      </div>
      <Separator className="my-6" />
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="account">Аккаунт</TabsTrigger>
          <TabsTrigger value="password">Пароль</TabsTrigger>
          <TabsTrigger value="billing">Подписка</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>
                Эта информация будет видна на сайте.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={avatar || user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <FileUpload
                                type="image"
                                value={avatar}
                                onChange={setAvatar}
                                maxSizeMB={2}
                                maxWidth={400}
                                maxHeight={400}
                                quality={0.9}
                                placeholder="Загрузить аватар"
                                previewSize="md"
                            />
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Или введите URL изображения:
                    </div>
                    <Input
                        type="url"
                        placeholder="Ссылка на фото (jpg/png/svg)"
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
              <div className="space-y-1">
                <Label htmlFor="name">Имя</Label>
                <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    value={email} 
                    disabled 
                    className="bg-muted"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
            <Card>
                <CardHeader>
                    <CardTitle>Безопасность</CardTitle>
                    <CardDescription>Смените пароль для входа.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1">
                        <Label htmlFor="current">Текущий пароль</Label>
                        <Input 
                            id="current" 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="new">Новый пароль</Label>
                        <Input 
                            id="new" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleChangePassword} disabled={passLoading || !currentPassword || !newPassword}>
                        {passLoading ? "Обновление..." : "Обновить пароль"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] w-full bg-border ${className}`} />
}
