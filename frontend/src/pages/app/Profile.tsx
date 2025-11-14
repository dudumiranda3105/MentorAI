import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { AuthAPI } from '@/lib/auth-api'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Shield, KeyRound, User as UserIcon } from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [theme, setTheme] = useState(user?.preferences?.theme || 'auto')
  const [notifyEmail, setNotifyEmail] = useState(!!user?.preferences?.notifications?.email)
  const [notifyPush, setNotifyPush] = useState(!!user?.preferences?.notifications?.push)

  const [saving, setSaving] = useState(false)
  const [cpCurrent, setCpCurrent] = useState('')
  const [cpNew, setCpNew] = useState('')
  const [cpConfirm, setCpConfirm] = useState('')
  const [changing, setChanging] = useState(false)

  const initials = useMemo(() => {
    const n = (user?.name || 'U').trim()
    return n
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [user?.name])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      const payload = {
        name: name.trim(),
        preferences: {
          theme: theme as 'light' | 'dark' | 'auto',
          language: user?.preferences?.language || 'pt-BR',
          notifications: {
            email: notifyEmail,
            push: notifyPush,
          },
        },
      }
      const res = await AuthAPI.updateProfile(payload)
      updateUser(res.user)
      toast({ title: 'Perfil atualizado', description: 'Suas alterações foram salvas com sucesso.' })
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message || 'Tente novamente', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!cpCurrent || !cpNew || !cpConfirm) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos de senha.', variant: 'destructive' })
      return
    }
    if (cpNew.length < 6) {
      toast({ title: 'Senha fraca', description: 'A nova senha deve ter pelo menos 6 caracteres.', variant: 'destructive' })
      return
    }
    if (cpNew !== cpConfirm) {
      toast({ title: 'Confirmação inválida', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }
    try {
      setChanging(true)
      await AuthAPI.changePassword({ currentPassword: cpCurrent, newPassword: cpNew, confirmPassword: cpConfirm })
      setCpCurrent('')
      setCpNew('')
      setCpConfirm('')
      toast({ title: 'Senha alterada', description: 'Sua senha foi atualizada com sucesso.' })
    } catch (e: any) {
      toast({ title: 'Erro ao alterar senha', description: e.message || 'Tente novamente', variant: 'destructive' })
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            Meu Perfil
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Gerencie suas informações
          </h1>
          <p className="text-muted-foreground">Atualize seus dados e preferências da conta</p>
        </div>

        {/* Profile + Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Identidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                  {initials}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Avatar gerado pelas suas iniciais
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notificações</Label>
                  <div className="flex items-center gap-3 py-1">
                    <Checkbox id="n-email" checked={notifyEmail} onCheckedChange={(v) => setNotifyEmail(!!v)} />
                    <label htmlFor="n-email" className="text-sm text-muted-foreground">Email</label>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <Checkbox id="n-push" checked={notifyPush} onCheckedChange={(v) => setNotifyPush(!!v)} />
                    <label htmlFor="n-push" className="text-sm text-muted-foreground">Push</label>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Suas informações são protegidas e utilizadas apenas para melhorar sua experiência.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Password */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> Alterar senha</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cp-current">Senha atual</Label>
              <Input id="cp-current" type="password" value={cpCurrent} onChange={(e) => setCpCurrent(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-new">Nova senha</Label>
              <Input id="cp-new" type="password" value={cpNew} onChange={(e) => setCpNew(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-confirm">Confirmar nova senha</Label>
              <Input id="cp-confirm" type="password" value={cpConfirm} onChange={(e) => setCpConfirm(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="md:col-span-3">
              <Button onClick={handleChangePassword} disabled={changing} className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
                {changing ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile
