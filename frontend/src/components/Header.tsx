import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Settings, LogOut, Info, DollarSign, FolderOpen, Brain, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/90 shadow-md backdrop-blur-lg'
          : 'bg-transparent',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-6">
        <Link
          to="/"
          className="text-2xl font-bold text-foreground transition-colors hover:text-primary"
        >
          Mentor.ai
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center space-x-1.5 md:flex">
            <Button 
              variant="ghost" 
              onClick={() => handleNavigate('/about')}
              className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Info className="h-4 w-4" />
              Sobre
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleNavigate('/pricing')}
              className="gap-2 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              Preços
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/app/my-collections')}
                  className="gap-2 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <FolderOpen className="h-4 w-4" />
                  Minhas Coleções
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/app/oraculo')}
                  className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Brain className="h-4 w-4" />
                  MentorAI
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('/app/agent-context')}
                  className="gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-950 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Bot className="h-4 w-4" />
                  Contexto IA
                </Button>
                <Button
                  onClick={() => handleNavigate('/app/create-flashcards')}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Criar Flashcards
                </Button>
              </>
            )}
          </nav>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/medium?seed=${user.email}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleNavigate('/app/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="hidden md:inline-flex gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
              onClick={() => handleNavigate('/login')}
            >
              Entrar
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col space-y-6 p-6">
                  <SheetClose asChild>
                    <Link to="/" className="text-2xl font-bold text-foreground">
                      Mentor.ai
                    </Link>
                  </SheetClose>
                  <div className="flex flex-col space-y-3">
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => handleNavigate('/about')}
                      >
                        <Info className="h-4 w-4" />
                        Sobre
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => handleNavigate('/pricing')}
                      >
                        <DollarSign className="h-4 w-4" />
                        Preços
                      </Button>
                    </SheetClose>
                    {isAuthenticated ? (
                      <>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-2 hover:bg-amber-50 dark:hover:bg-amber-950"
                            onClick={() =>
                              handleNavigate('/app/my-collections')
                            }
                          >
                            <FolderOpen className="h-4 w-4" />
                            Minhas Coleções
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                            onClick={() => handleNavigate('/app/oraculo')}
                          >
                            <Brain className="h-4 w-4" />
                            MentorAI
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                            onClick={() => handleNavigate('/app/agent-context')}
                          >
                            <Bot className="h-4 w-4" />
                            Contexto IA
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-2"
                            onClick={() => handleNavigate('/app/settings')}
                          >
                            <Settings className="h-4 w-4" />
                            Configurações
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start gap-2"
                            onClick={logout}
                          >
                            <LogOut className="h-4 w-4" />
                            Sair
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() =>
                              handleNavigate('/app/create-flashcards')
                            }
                          >
                            <Sparkles className="h-4 w-4" />
                            Criar Flashcards
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          onClick={() => handleNavigate('/login')}
                        >
                          Entrar
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
