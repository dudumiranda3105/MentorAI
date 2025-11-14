import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-muted/50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mentor.ai. Todos os direitos reservados.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            to="/terms-of-use"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Termos de Uso
          </Link>
          <Link
            to="/privacy-policy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Política de Privacidade
          </Link>
          <Link
            to="/about"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sobre
          </Link>
        </nav>
      </div>
    </footer>
  )
}
