import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Server, Database, Key, Cpu } from 'lucide-react'
import { OraculoAPI } from '@/lib/oraculo-api'

interface HealthCheck {
  name: string
  status: 'loading' | 'success' | 'error' | 'warning'
  message: string
  details?: any
  icon: React.ReactNode
}

export default function SystemDiagnostic() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    {
      name: 'Conexão com Backend',
      status: 'loading',
      message: 'Verificando...',
      icon: <Server className="h-4 w-4" />
    },
    {
      name: 'Autenticação',
      status: 'loading', 
      message: 'Verificando...',
      icon: <Key className="h-4 w-4" />
    },
    {
      name: 'Sessões do MentorAI',
      status: 'loading',
      message: 'Verificando...',
      icon: <Database className="h-4 w-4" />
    },
    {
      name: 'Debug de Sessões',
      status: 'loading',
      message: 'Verificando...',
      icon: <Cpu className="h-4 w-4" />
    }
  ])

  const [isRunning, setIsRunning] = useState(false)

  const updateCheck = (name: string, updates: Partial<HealthCheck>) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, ...updates } : check
    ))
  }

  const runDiagnostic = async () => {
    setIsRunning(true)
    
    // Reset all checks
    setChecks(prev => prev.map(check => ({
      ...check,
      status: 'loading' as const,
      message: 'Verificando...',
      details: undefined
    })))

    // Check 1: Backend Connection
    try {
      const response = await fetch('http://localhost:3000')
      if (response.ok) {
        const text = await response.text()
        updateCheck('Conexão com Backend', {
          status: 'success',
          message: 'Backend está rodando',
          details: { status: response.status, response: text.substring(0, 100) }
        })
      } else {
        updateCheck('Conexão com Backend', {
          status: 'error',
          message: `Backend retornou erro: ${response.status}`,
          details: { status: response.status }
        })
      }
    } catch (error: any) {
      updateCheck('Conexão com Backend', {
        status: 'error',
        message: 'Não foi possível conectar com o backend',
        details: { error: error.message }
      })
    }

    // Wait a bit before next check
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check 2: Authentication
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        updateCheck('Autenticação', {
          status: 'warning',
          message: 'Usuário não está logado',
          details: { hasToken: false }
        })
      } else {
        updateCheck('Autenticação', {
          status: 'success',
          message: 'Token de autenticação encontrado',
          details: { hasToken: true, tokenLength: token.length }
        })
      }
    } catch (error: any) {
      updateCheck('Autenticação', {
        status: 'error',
        message: 'Erro ao verificar autenticação',
        details: { error: error.message }
      })
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Check 3: Oraculo Sessions
    try {
      const sessions = await OraculoAPI.getSessions()
      updateCheck('Sessões do Oráculo', {
        status: 'success',
        message: `${sessions.sessoesAtivas.length} sessões ativas, ${sessions.conversas.length} conversas`,
        details: sessions
      })
    } catch (error: any) {
      updateCheck('Sessões do Oráculo', {
        status: 'error',
        message: `Erro ao buscar sessões: ${error.message}`,
        details: { error: error.message }
      })
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // Check 4: Debug Sessions
    try {
      const debugInfo = await OraculoAPI.debugSessions()
      updateCheck('Debug de Sessões', {
        status: 'success',
        message: `${debugInfo.sessoesNaMemoria.length} sessões na memória, total: ${debugInfo.totalSessoes}`,
        details: debugInfo
      })
    } catch (error: any) {
      updateCheck('Debug de Sessões', {
        status: 'error',
        message: `Erro no debug: ${error.message}`,
        details: { error: error.message }
      })
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'loading':
        return 'bg-blue-500'
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Diagnóstico do Sistema</h1>
        <p className="text-muted-foreground">
          Verificação completa do estado do sistema Mentor AI
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          className="mb-4"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando diagnóstico...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Executar diagnóstico
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <Card key={check.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {check.icon}
                {check.name}
                <Badge 
                  variant="outline" 
                  className={`ml-auto ${getStatusColor(check.status)} text-white border-0`}
                >
                  {getStatusIcon(check.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {check.message}
              </CardDescription>
              
              {check.details && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Ver detalhes
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(check.details, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Soluções comuns:</strong>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Se o backend não estiver rodando, execute: <code className="bg-muted px-1 rounded">npm run dev</code> na pasta backend</li>
              <li>Se houver erro de autenticação, faça login novamente no sistema</li>
              <li>Se as sessões não aparecerem, verifique se o MongoDB está conectado</li>
              <li>Para problemas de CORS, verifique se o frontend está na porta correta (8080)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}