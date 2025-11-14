import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown, X, HelpCircle, Shield, Award, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const plans = [
    {
      name: 'Gratuito',
      description: 'Para começar sua jornada de estudos',
      icon: Sparkles,
      price: { monthly: 0, yearly: 0 },
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        '10 flashcards por mês',
        '2 sessões do MentorAI por semana',
        'Suporte por e-mail',
        'Acesso aos modelos básicos de IA',
        'Processamento de documentos TXT',
      ],
      limitations: [
        'Anúncios na plataforma',
        'Limite de 1 documento por vez',
      ],
      cta: 'Começar Grátis',
      popular: false,
    },
    {
      name: 'Premium',
      description: 'Ideal para estudantes dedicados',
      icon: Zap,
      price: { monthly: 30.00, yearly: 300.00 },
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Flashcards ilimitados',
        'MentorAI sem limites',
        'Suporte prioritário',
        'Acesso a todos os modelos de IA',
        'Processamento de PDF, CSV, YouTube',
        'Histórico completo de conversas',
        'Exportação de flashcards',
        'Sem anúncios',
      ],
      cta: 'Assinar Premium',
      popular: true,
    },
    {
      name: 'Pro',
      description: 'Para profissionais e educadores',
      icon: Crown,
      price: { monthly: 80.00, yearly: 800.00 },
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      gradient: 'from-amber-500 to-orange-500',
      features: [
        'Tudo do Premium',
        'API Key própria (economia)',
        'Contexto personalizado do agente',
        'Colaboração em equipe (5 membros)',
        'Análises e estatísticas avançadas',
        'Integração com LMS',
        'Suporte dedicado 24/7',
        'Treinamento personalizado',
      ],
      cta: 'Assinar Pro',
      popular: false,
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Garantia de 7 dias',
      description: 'Não gostou? Devolvemos seu dinheiro'
    },
    {
      icon: Award,
      title: 'Suporte Premium',
      description: 'Equipe dedicada para ajudar você'
    },
    {
      icon: Users,
      title: '50K+ Estudantes',
      description: 'Milhares confiam no Mentor.ai'
    },
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-background dark:from-purple-950/20 dark:via-blue-950/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            Planos e Preços
          </Badge>
          <h1 className="text-5xl font-bold sm:text-6xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-muted-foreground">
            Potencialize seus estudos com o Mentor.ai e aprenda de forma mais inteligente
          </p>

          {/* Toggle de período */}
          <div className="inline-flex items-center gap-2 p-1.5 bg-background rounded-xl shadow-lg border">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'hover:bg-muted'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'hover:bg-muted'
              }`}
            >
              Anual
              {billingPeriod === 'yearly' && (
                <Badge className="ml-2 bg-green-500 hover:bg-green-600 border-none">
                  -17%
                </Badge>
              )}
            </button>
          </div>
          {billingPeriod === 'yearly' && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in mt-4 mb-2">
              🎉 Economize até R$ 180 por ano!
            </p>
          )}
        </div>
      </div>

      {/* Planos */}
      <div className="container mx-auto px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly

            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col border-none shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'scale-105 md:scale-110 ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 text-sm shadow-lg border-none">
                      ⭐ Mais Popular
                    </Badge>
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${plan.gradient}`}></div>

                <CardHeader className="text-center pb-6 pt-8">
                  <div className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} w-fit`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Preço */}
                  <div className="text-center py-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">
                        R${price.toFixed(0)}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground text-lg">
                          /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Apenas R$ {(price / 12).toFixed(2)} por mês
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-border"></div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations?.map((limitation, index) => (
                      <div key={`limit-${index}`} className="flex items-start gap-3 opacity-50">
                        <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm line-through">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    className={`w-full h-12 text-base font-semibold ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90`
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Benefícios */}
      <div className="container mx-auto px-4 py-16 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Award className="w-3 h-3 mr-1" />
              Por que escolher o Mentor.ai?
            </Badge>
            <h2 className="text-3xl font-bold">Vantagens exclusivas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <Card key={benefit.title} className="border-none shadow-lg text-center">
                  <CardContent className="pt-8 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
            <p className="text-muted-foreground mt-2">Tire suas dúvidas sobre os planos</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-background shadow-sm">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Posso cancelar a qualquer momento?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
                O acesso permanece ativo até o final do período já pago.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-background shadow-sm">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Como funciona a API Key própria?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No plano Pro, você pode usar sua própria chave de API do Google Gemini ou Groq,
                pagando diretamente aos provedores e economizando nos custos de uso intensivo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-background shadow-sm">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Há desconto para estudantes?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim! Estudantes com e-mail institucional válido têm 30% de desconto em qualquer plano.
                Entre em contato com nosso suporte para validar sua matrícula.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-background shadow-sm">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Qual a diferença entre os modelos de IA?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Os modelos Premium incluem Gemini Flash, Gemini Pro e todos os modelos Groq (Llama, Mixtral).
                No plano gratuito, você tem acesso limitado apenas aos modelos mais básicos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-background shadow-sm">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Posso fazer upgrade do meu plano?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim! Você pode fazer upgrade a qualquer momento. O valor será proporcional ao tempo restante
                da sua assinatura atual e você terá acesso imediato aos novos recursos.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Final */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto border-none shadow-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 text-white overflow-hidden">
          <CardContent className="py-16 px-6 text-center relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10 space-y-6">
              <Sparkles className="w-16 h-16 mx-auto opacity-90" />
              <h2 className="text-4xl font-bold">
                Pronto para estudar com mais eficiência?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Junte-se a milhares de estudantes que já estão usando o Mentor.ai
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  className="gap-2 bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                  onClick={() => navigate('/register')}
                >
                  Começar Agora
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10"
                  onClick={() => navigate('/about')}
                >
                  Saiba Mais
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Pricing
