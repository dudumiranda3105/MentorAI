import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTerms } from '@/hooks/use-terms'

const TermsOfUse = () => {
  const navigate = useNavigate()
  const { acceptTerms, hasAcceptedTerms } = useTerms()

  const handleAccept = () => {
    acceptTerms()
    navigate('/privacy-policy')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold sm:text-3xl">
            Termos de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Bem-vindo ao Mentor.ai. Ao utilizar nossos serviços, você
                concorda com estes termos. Por favor, leia-os com atenção.
              </p>

              <h2>1. Uso dos Nossos Serviços</h2>
              <p>
                Você deve seguir todas as políticas disponibilizadas a você nos
                Serviços. Não faça uso indevido de nossos Serviços. Por exemplo,
                não interfira com nossos Serviços nem tente acessá-los por um
                método diferente da interface e das instruções que fornecemos.
                Você pode usar nossos Serviços somente conforme permitido por
                lei.
              </p>

              <h2>2. Sua Conta no Mentor.ai</h2>
              <p>
                Você pode precisar de uma Conta do Mentor.ai para usar alguns de
                nossos Serviços. Você pode criar sua própria Conta do Mentor.ai
                ou sua Conta do Mentor.ai pode ser atribuída a você por um
                administrador, como seu empregador ou instituição de ensino. Se
                você estiver usando uma Conta do Mentor.ai atribuída a você por
                um administrador, termos diferentes ou adicionais podem ser
                aplicados e seu administrador poderá acessar ou desativar sua
                conta.
              </p>

              <h2>3. Privacidade e Proteção de Direitos Autorais</h2>
              <p>
                As políticas de privacidade do Mentor.ai explicam como tratamos
                seus dados pessoais e protegemos sua privacidade quando você usa
                nossos Serviços. Ao usar nossos Serviços, você concorda que o
                Mentor.ai pode usar esses dados de acordo com nossas políticas
                de privacidade.
              </p>

              <h2>4. Seu Conteúdo em Nossos Serviços</h2>
              <p>
                Alguns de nossos Serviços permitem que você envie conteúdo. Você
                mantém a propriedade de quaisquer direitos de propriedade
                intelectual que detenha sobre esse conteúdo. Em suma, o que
                pertence a você, permanece seu.
              </p>
              <p>
                Quando você faz upload ou de outra forma envia conteúdo para
                nossos Serviços, você concede ao Mentor.ai (e àqueles com quem
                trabalhamos) uma licença mundial para usar, hospedar, armazenar,
                reproduzir, modificar, criar trabalhos derivados, comunicar,
                publicar, executar publicamente, exibir publicamente e
                distribuir tal conteúdo.
              </p>

              <h2>5. Sobre o Software em Nossos Serviços</h2>
              <p>
                Quando um Serviço exige ou inclui software para download, esse
                software pode ser atualizado automaticamente em seu dispositivo
                assim que uma nova versão ou recurso estiver disponível. Alguns
                Serviços podem permitir que você ajuste suas configurações de
                atualização automática.
              </p>

              <h2>6. Modificando e Encerrando Nossos Serviços</h2>
              <p>
                Estamos constantemente alterando e melhorando nossos Serviços.
                Podemos adicionar ou remover funcionalidades ou recursos, e
                podemos suspender ou encerrar um Serviço por completo.
              </p>
              <p>
                Você pode parar de usar nossos Serviços a qualquer momento,
                embora lamentemos vê-lo partir. O Mentor.ai também pode parar de
                fornecer Serviços a você, ou adicionar ou criar novos limites
                para nossos Serviços a qualquer momento.
              </p>

              <h2>7. Nossas Garantias e Isenções de Responsabilidade</h2>
              <p>
                Fornecemos nossos Serviços usando um nível comercialmente
                razoável de habilidade e cuidado e esperamos que você goste de
                usá-los. Mas há certas coisas que não prometemos sobre nossos
                Serviços.
              </p>

              <h2>8. Responsabilidade por Nossos Serviços</h2>
              <p>
                Quando permitido por lei, o Mentor.ai e os fornecedores e
                distribuidores do Mentor.ai não serão responsáveis por lucros
                cessantes, receitas ou dados, perdas financeiras ou danos
                indiretos, especiais, consequenciais, exemplares ou punitivos.
              </p>

              <h2>9. Sobre estes Termos</h2>
              <p>
                Podemos modificar estes termos ou quaisquer termos adicionais
                que se apliquem a um Serviço para, por exemplo, refletir
                alterações na lei ou em nossos Serviços. Você deve consultar os
                termos regularmente. Publicaremos avisos de modificações a estes
                termos nesta página.
              </p>
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleAccept}
              disabled={hasAcceptedTerms}
            >
              {hasAcceptedTerms ? 'Aceito' : 'Aceitar e continuar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TermsOfUse
