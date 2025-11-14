import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePrivacy } from '@/hooks/use-privacy'

const PrivacyPolicy = () => {
  const navigate = useNavigate()
  const { acceptPrivacy, hasAcceptedPrivacy } = usePrivacy()

  const handleAccept = () => {
    acceptPrivacy()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold sm:text-3xl">
            Política de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Sua privacidade é importante para nós. É política do Mentor.ai
                respeitar a sua privacidade em relação a qualquer informação sua
                que possamos coletar no site Mentor.ai, e outros sites que
                possuímos e operamos.
              </p>

              <h2>1. Informações que Coletamos</h2>
              <p>
                Coletamos informações que você nos fornece diretamente. Por
                exemplo, o texto que você insere para a criação de flashcards.
                Este conteúdo é processado para gerar os flashcards e não é
                armazenado permanentemente em nossos servidores para outros
                fins. As coleções de flashcards que você decide salvar são
                armazenadas localmente no seu navegador e não são enviadas para
                nossos servidores.
              </p>

              <h2>2. Uso de Informações</h2>
              <p>
                Usamos as informações que coletamos (o texto fornecido)
                unicamente para fornecer, manter e melhorar nossos serviços de
                geração de flashcards. Não usamos seu conteúdo para treinar
                nossos modelos de IA sem seu consentimento explícito.
              </p>

              <h2>3. Compartilhamento de Informações</h2>
              <p>
                Não compartilhamos suas informações pessoais ou o conteúdo que
                você fornece com terceiros, exceto para o processamento
                necessário para gerar os flashcards através de APIs de
                terceiros, sob acordos de confidencialidade. Seus dados não são
                vendidos ou alugados.
              </p>

              <h2>4. Segurança</h2>
              <p>
                O Mentor.ai toma medidas razoáveis para ajudar a proteger as
                informações sobre você contra perda, roubo, uso indevido e
                acesso não autorizado, divulgação, alteração e destruição.
              </p>

              <h2>5. Seus Direitos</h2>
              <p>
                Como os dados são armazenados localmente, você tem controle
                total sobre eles. Você pode limpar os dados do seu navegador a
                qualquer momento para remover todas as suas coleções salvas.
              </p>

              <h2>6. Alterações na Política de Privacidade</h2>
              <p>
                Podemos alterar esta Política de Privacidade de tempos em
                tempos. Se fizermos alterações, notificaremos você revisando a
                data no topo da política e, em alguns casos, podemos fornecer a
                você um aviso adicional.
              </p>
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleAccept}
              disabled={hasAcceptedPrivacy}
            >
              {hasAcceptedPrivacy ? 'Aceito' : 'Concordo com a política'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrivacyPolicy
