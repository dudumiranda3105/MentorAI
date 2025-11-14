import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown, Brain, BookOpen, Clock, Target, Award, TrendingUp, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Index = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/app/create-flashcards')
    } else {
      navigate('/login')
    }
  }

  const plans = [
    {
      name: 'Gratuito',
      description: 'Para começar sua jornada de estudos',
      icon: Sparkles,
      price: 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      features: [
        '10 flashcards por mês',
        '2 sessões do MentorAI por semana',
        'Modelos básicos de IA',
        'Suporte por e-mail',
      ],
      cta: 'Começar Grátis',
      popular: false,
    },
    {
      name: 'Premium',
      description: 'Ideal para estudantes dedicados',
      icon: Zap,
      price: 30.00,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      features: [
        'Flashcards ilimitados',
        'MentorAI sem limites',
        'Todos os modelos de IA',
        'Suporte prioritário',
        'Sem anúncios',
      ],
      cta: 'Assinar Premium',
      popular: true,
    },
    {
      name: 'Pro',
      description: 'Para profissionais e educadores',
      icon: Crown,
      price: 80.00,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      features: [
        'Tudo do Premium',
        'API Key própria',
        'Colaboração em equipe',
        'Suporte dedicado 24/7',
        'Análises avançadas',
      ],
      cta: 'Assinar Pro',
      popular: false,
    },
  ]

  const features = [
    {
      icon: Brain,
      title: 'IA Avançada',
      description: 'Tecnologia de ponta para extrair os conceitos mais importantes',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: BookOpen,
      title: 'Múltiplos Formatos',
      description: 'PDF, URLs, YouTube, CSV e TXT suportados',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Economia de Tempo',
      description: 'Crie flashcards em segundos, não em horas',
      color: 'from-cyan-500 to-green-500'
    },
    {
      icon: Target,
      title: 'Aprendizado Eficaz',
      description: 'Método comprovado de repetição espaçada',
      color: 'from-green-500 to-emerald-500'
    },
  ]

  const stats = [
    { value: '50K+', label: 'Estudantes', icon: Users },
    { value: '1M+', label: 'Flashcards', icon: Sparkles },
    { value: '98%', label: 'Satisfação', icon: Award },
    { value: '5x', label: 'Mais Rápido', icon: TrendingUp },
  ]

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Gratuito') {
      if (isAuthenticated) {
        navigate('/app/create-flashcards')
      } else {
        navigate('/register')
      }
    } else {
      navigate('/register', { state: { plan: planName } })
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-purple-50 via-blue-50 to-background dark:from-purple-950/20 dark:via-blue-950/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container z-10 mx-auto flex flex-col items-center px-4 py-20 text-center md:px-6 lg:py-32 relative">
          <Badge className="mb-6 animate-fade-in-up bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            Inteligência Artificial para Estudos
          </Badge>
          
          <div className="max-w-5xl space-y-8">
            <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Transforme seus materiais de estudo em
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                flashcards eficientes
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-3xl animate-fade-in-up text-lg text-muted-foreground [animation-delay:0.2s] md:text-xl leading-relaxed">
              Com a ajuda da inteligência artificial, o Mentor.ai otimiza seu
              aprendizado, criando cartões de memorização a partir de qualquer
              texto em segundos.
            </p>
            
            <div className="mt-10 flex animate-fade-in-up flex-col justify-center gap-4 [animation-delay:0.4s] sm:flex-row">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={handleGetStarted}
              >
                <Sparkles className="w-5 h-5" />
                Começar Gratuitamente
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-xl px-8 py-6 text-lg transition-all hover:bg-muted"
                onClick={() => navigate('/about')}
              >
                Saiba Mais
              </Button>
            </div>
          </div>
          
          <div className="relative mt-20 w-full max-w-5xl animate-fade-in-up [animation-delay:0.6s]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
            <img
              src="https://img.usecurling.com/p/1000/550?q=modern%20AI%20study%20dashboard%20interface&color=purple"
              alt="Interface do Mentor.ai"
              className="relative rounded-2xl shadow-2xl border border-border"
              width={1000}
              height={550}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center space-y-2">
                  <Icon className="w-8 h-8 mx-auto text-purple-600" />
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-2">
              <Target className="w-3 h-3 mr-1" />
              Recursos
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl">
              Por que escolher o Mentor.ai?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para turbinar seu aprendizado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="pt-8 space-y-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-2">
              <Crown className="w-3 h-3 mr-1" />
              Planos
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl">Escolha o Plano Ideal</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Potencialize seus estudos com o Mentor.ai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card 
                  key={plan.name} 
                  className={`relative overflow-hidden transition-all border-none shadow-lg hover:shadow-2xl ${
                    plan.popular ? 'scale-105 shadow-xl' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                  )}
                  
                  {plan.popular && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <div className={`${plan.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`h-7 w-7 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">
                        R${plan.price.toFixed(0)}
                      </span>
                      {plan.price > 0 && <span className="text-muted-foreground text-lg">/mês</span>}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className={`w-full h-11 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan.name)}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="link" 
              onClick={() => navigate('/pricing')}
              className="gap-2 text-base"
            >
              Ver detalhes completos dos planos
              <span className="text-lg">→</span>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Sparkles className="w-16 h-16 mx-auto opacity-90" />
            <h2 className="text-4xl font-bold sm:text-5xl">
              Comece a estudar de forma mais inteligente hoje
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de estudantes que já estão usando IA para aprender mais rápido e reter mais informações
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="gap-2 bg-white text-purple-600 hover:bg-white/90 rounded-xl px-8 py-6 text-lg shadow-lg"
                onClick={() => navigate('/register')}
              >
                Criar Conta Grátis
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-xl px-8 py-6 text-lg"
                onClick={() => navigate('/about')}
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Index
