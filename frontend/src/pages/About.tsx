import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit, BookOpen, Clock, Sparkles, Users, Target, Zap, Award, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const teamMembers = [
  {
    name: 'Edson Gabriel',
    role: 'Desenvolvedor',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Eduarda Roberta',
    role: 'Designer',
    color: 'from-pink-500 to-purple-500',
  },
  {
    name: 'Eduardo de Miranda',
    role: 'Backend',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Rebeca Chagas',
    role: 'Frontend',
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Davi Vieira',
    role: 'Desenvolvedor',
    color: 'from-amber-500 to-yellow-500',
  },
]

const About = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-background animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-50 via-blue-50 to-background dark:from-purple-950/20 dark:via-blue-950/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-6xl py-20 px-4 md:px-6 relative">
          <div className="text-center space-y-6">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
              <Sparkles className="w-3 h-3 mr-1" />
              Sobre Nós
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Mentor.ai
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground md:text-2xl">
              Uma ferramenta inteligente para otimizar seus estudos e
              potencializar sua memorização com IA
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                onClick={() => navigate('/register')}
              >
                <Sparkles className="w-4 h-4" />
                Começar Agora
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => navigate('/pricing')}
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-16 px-4 md:px-6 space-y-24">
        {/* O que é */}
        <section>
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 p-1">
              <div className="bg-background">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-3xl sm:text-4xl">
                      O que é o Mentor.ai?
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Mentor.ai é uma ferramenta inovadora que utiliza o poder da
                    inteligência artificial para revolucionar a forma como você
                    estuda. Nossa plataforma analisa seus materiais de estudo e gera
                    automaticamente flashcards otimizados, ajudando a fortalecer sua
                    memorização e a economizar um tempo precioso.
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                      <div className="text-3xl font-bold text-purple-600">1M+</div>
                      <div className="text-sm text-muted-foreground">Flashcards criados</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <div className="text-3xl font-bold text-blue-600">98%</div>
                      <div className="text-sm text-muted-foreground">Satisfação</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30">
                      <div className="text-3xl font-bold text-cyan-600">24/7</div>
                      <div className="text-sm text-muted-foreground">Disponível</div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </section>

        {/* Benefícios */}
        <section className="text-center space-y-12">
          <div>
            <Badge variant="outline" className="mb-4">
              <Award className="w-3 h-3 mr-1" />
              Benefícios
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Por que escolher o Mentor.ai?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              Estudar nunca foi tão eficiente e inteligente
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="pt-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold">IA Inteligente</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nossa IA identifica os conceitos-chave do seu texto para criar
                  perguntas e respostas relevantes e personalizadas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="pt-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold">Aprendizado Eficaz</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A repetição espaçada com flashcards é um método comprovado para
                  uma memorização de longo prazo e retenção superior.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="pt-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-green-100 dark:from-cyan-900 dark:to-green-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold">Otimize seu Tempo</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Passe menos tempo criando materiais de estudo e mais tempo
                  focando no que realmente importa: aprender e revisar.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Funcionalidades Extras */}
        <section className="text-center space-y-12">
          <div>
            <Badge variant="outline" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Recursos Poderosos
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Mais do que flashcards
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg text-left">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">MentorAI Assistant</h3>
                    <p className="text-muted-foreground">
                      Converse com seus documentos usando IA. Faça perguntas e obtenha respostas instantâneas sobre qualquer conteúdo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg text-left">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Múltiplos Formatos</h3>
                    <p className="text-muted-foreground">
                      Suporte para PDF, URLs, YouTube, CSV e TXT. Transforme qualquer conteúdo em conhecimento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg text-left">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Modo Estudo</h3>
                    <p className="text-muted-foreground">
                      Sistema de revisão inteligente com estatísticas de progresso e acompanhamento de desempenho.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg text-left">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Colaboração</h3>
                    <p className="text-muted-foreground">
                      Compartilhe coleções de flashcards com colegas e aprenda em grupo de forma eficiente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Time */}
        <section className="text-center space-y-12">
          <div>
            <Badge variant="outline" className="mb-4">
              <Heart className="w-3 h-3 mr-1 text-red-500" />
              Nosso Time
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Feito com dedicação
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              Projeto criado por estudantes da Uni-FACEF para agilizar estudos e
              revisões usando IA
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="pt-6 space-y-3">
                  <div className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center py-12">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 text-white overflow-hidden">
            <CardContent className="py-16 px-6 relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <Sparkles className="w-16 h-16 mx-auto opacity-90" />
                <h2 className="text-4xl font-bold">
                  Pronto para revolucionar seus estudos?
                </h2>
                <p className="text-xl text-white/90">
                  Junte-se a milhares de estudantes que já estão aprendendo de forma mais eficiente
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Button 
                    size="lg"
                    className="gap-2 bg-white text-purple-600 hover:bg-white/90"
                    onClick={() => navigate('/register')}
                  >
                    Criar Conta Grátis
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-transparent border-white text-white hover:bg-white/10"
                    onClick={() => navigate('/pricing')}
                  >
                    Ver Planos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default About
