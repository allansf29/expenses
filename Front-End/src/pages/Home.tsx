import Calendar from '@/components/calendar/ExpenseCalendar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card'
import {
  BarChart2,
  FileText,
  PlusCircle,
  Shield,
  Tag,
  Target,
} from 'lucide-react'

const features = [
  {
    icon: <PlusCircle className="size-8 text-primary" />,
    title: 'Registro Rápido',
    description: 'Adicione suas despesas e receitas em segundos, de forma simples e intuitiva.',
  },
  {
    icon: <BarChart2 className="size-8 text-primary" />,
    title: 'Gráficos Inteligentes',
    description: 'Visualize seus padrões de gastos com gráficos claros e informativos.',
  },
  {
    icon: <Tag className="size-8 text-primary" />,
    title: 'Categorização Flexível',
    description: 'Organize suas transações com categorias personalizáveis para um controle total.',
  },
  {
    icon: <Target className="size-8 text-primary" />,
    title: 'Metas e Orçamentos',
    description: 'Defina metas de economia e acompanhe seu progresso para alcançar seus objetivos.',
  },
  {
    icon: <FileText className="size-8 text-primary" />,
    title: 'Relatórios Detalhados',
    description: 'Exporte relatórios mensais e anuais para uma análise financeira completa.',
  },
  {
    icon: <Shield className="size-8 text-primary" />,
    title: 'Segurança dos Dados',
    description: 'Seus dados financeiros são criptografados e protegidos com segurança de ponta.',
  },
]

function Home() {
  return (
    <div className="bg-background text-foreground">
      <section className="w-full mx-auto py-12 md:py-20 px-4">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
            Funcionalidades Poderosas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col text-left hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardDescription className="px-6 pb-6">
                  {feature.description}
                </CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Calendar />
    </div>
  )
}

export default Home