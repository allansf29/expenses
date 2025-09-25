function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 pt-16">
      <main className="w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-8 py-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Controle suas despesas <span className="text-primary">com facilidade</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Organize, visualize e planeje seu dinheiro. O Expense Tracker te ajuda a ter controle total das suas finanças pessoais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition"
            >
              Comece agora
            </a>
            <a
              href="#"
              className="px-6 py-3 rounded-md border border-primary text-primary font-semibold hover:bg-primary/10 transition"
            >
              Saiba mais
            </a>
          </div>
        </div>
        <div className="w-full flex justify-center">
          {/* Exemplo de gráfico ilustrativo ou imagem */}
          <img
            src="https://illustrations.popsy.co/gray/chart-bar.svg"
            alt="Gráfico de despesas"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
        </div>
      </main>
    </div>
  )
}

export default Home