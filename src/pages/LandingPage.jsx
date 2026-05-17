import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  Users,
  TrendingUp,
  Star,
  ChevronRight,
  Play,
  Check,
  Brain,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Scissors,
  Package,
  Palette,
  ArrowRight,
  UserCheck,
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Rocket,
  Globe,
} from "lucide-react";

const modules = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    desc: "Visualização diária e semanal com drag-and-drop, validação de conflitos em tempo real, gestão por profissional e bloqueio de horários. Zero double-booking.",
    tag: "Core",
  },
  {
    icon: Users,
    title: "CRM de Clientes",
    desc: "Ficha completa com histórico de atendimentos, observações, alergias, preferências, aniversário e indicadores de fidelidade. Seu cliente nunca se sente esquecido.",
    tag: "Core",
  },
  {
    icon: UserCheck,
    title: "Gestão de Profissionais",
    desc: "Cadastro por especialidade, horários de atendimento por dia da semana e vínculo com a agenda. Controle quem atende o quê e quando.",
    tag: "Operacional",
  },
  {
    icon: Package,
    title: "Pacotes & Sessões",
    desc: "Crie pacotes de serviços com validade, acompanhe sessões usadas por cliente, registre pagamentos e controle o saldo restante de cada pacote vendido.",
    tag: "Comercial",
  },
  {
    icon: DollarSign,
    title: "Financeiro & KPIs",
    desc: "Dashboard com receita por período, ticket médio, formas de pagamento, serviços mais rentáveis e projeções. Dados reais em tempo real.",
    tag: "Gestão",
  },
  {
    icon: Brain,
    title: "AI Growth Engine",
    desc: "Motor de inteligência artificial que analisa seus dados, detecta oportunidades e gera mensagens personalizadas de reativação, oferta e relacionamento.",
    tag: "IA",
  },
];

const problems = [
  {
    icon: AlertCircle,
    text: "Agenda no papel ou no WhatsApp — cheia de erros e conflitos de horário",
  },
  {
    icon: AlertCircle,
    text: "Clientes sumindo sem que você perceba ou reaja a tempo",
  },
  {
    icon: AlertCircle,
    text: "Sem controle de receita real — só um número no final do mês",
  },
  {
    icon: AlertCircle,
    text: "Pacotes vendidos no caderno, sessões perdidas, clientes sem controle",
  },
  {
    icon: AlertCircle,
    text: "Sem visão de quais serviços geram mais ou profissionais mais rentáveis",
  },
  {
    icon: AlertCircle,
    text: "No-show alto por falta de confirmação e lembrete automático",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Configure seu salão",
    desc: "Nome, logo, cor da marca, slug público. Em minutos o sistema já tem a cara do seu negócio.",
  },
  {
    step: "02",
    title: "Cadastre serviços e equipe",
    desc: "Adicione serviços com duração e valor, e profissionais com especialidades e horários de atendimento.",
  },
  {
    step: "03",
    title: "Receba e gerencie agendamentos",
    desc: "Link público para clientes agendarem sozinhos, ou lançamento manual pelo painel. Agenda sempre atualizada.",
  },
  {
    step: "04",
    title: "Acompanhe e cresça com IA",
    desc: "O sistema analisa seu histórico, detecta oportunidades e sugere ações concretas para aumentar receita.",
  },
];

const testimonials = [
  {
    name: "Ana Silveira",
    role: "Proprietária — Studio Ana Silveira",
    text: "Reduzi o no-show em 60% e aumentei o ticket médio em 35% no primeiro mês. A agenda digital mudou minha operação completamente.",
    stars: 5,
  },
  {
    name: "Marcos Costa",
    role: "Gerente — Espaço Beleza Premium",
    text: "A IA de reativação trouxe de volta clientes que eu achei que havia perdido. Só no primeiro mês recuperamos R$ 4.200 em serviços.",
    stars: 5,
  },
  {
    name: "Juliana Ramos",
    role: "Diretora — Rede Bella Vita",
    text: "Gerenciar 3 unidades ficou simples. Cada salão tem seu ambiente isolado, link próprio e identidade visual separada.",
    stars: 5,
  },
];

const plans = [
  {
    name: "Starter",
    price: "R$ 19,99",
    period: "/mês",
    desc: "Para salões que querem sair do improviso e ter controle real.",
    features: [
      "Até 4 profissionais",
      "Agenda completa",
      "CRM de clientes",
      "Link de agendamento público",
      "Relatórios básicos",
    ],
    color: "border-slate-200",
  },
  {
    name: "Pro",
    price: "R$ 25",
    period: "/mês",
    desc: "Para salões que querem crescer com inteligência e dados.",
    features: [
      "Até 10 profissionais",
      "Tudo do Starter",
      "AI Growth Engine",
      "Pacotes e sessões",
      "Financeiro avançado",
      "Reativação automática",
    ],
    color: "border-rose-400",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    desc: "Para redes e franquias com múltiplas unidades.",
    features: [
      "Profissionais ilimitados",
      "Multi-unidades isoladas",
      "White-label completo",
      "Suporte dedicado",
      "Acesso via API",
    ],
    color: "border-slate-200",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">
              BeautyFlow <span className="text-rose-500">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a
              href="#problema"
              className="hover:text-slate-900 transition-colors"
            >
              O Problema
            </a>
            <a
              href="#modulos"
              className="hover:text-slate-900 transition-colors"
            >
              Módulos
            </a>
            <a href="#ia" className="hover:text-slate-900 transition-colors">
              Inteligência Artificial
            </a>
            <a
              href="#planos"
              className="hover:text-slate-900 transition-colors"
            >
              Planos
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/demo">
              <Button
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hidden sm:flex"
              >
                <Play className="w-3 h-3 mr-1" /> Demo
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                Acessar Sistema
              </Button>
            </Link>
            <Link to="/master">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-200 text-slate-500 hover:bg-slate-50 text-xs hidden md:flex"
              >
                Master
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50/60 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-5 bg-rose-100 text-rose-700 border-rose-200 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Sistema SaaS para
              salões de beleza — com IA integrada
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.08] tracking-tight">
              Seu salão merece um sistema
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 mt-1">
                à altura do seu potencial
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              BeautyFlow é o sistema de gestão completo para salões de beleza,
              estúdios e espaços estéticos que querem operar com
              profissionalismo, crescer com dados e recuperar receita com
              inteligência artificial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link to="/demo">
                <Button
                  size="lg"
                  className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-rose-200/60 gap-2"
                >
                  <Play className="w-5 h-5" />
                  Ver Demo Interativa Agora
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <a target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 text-lg rounded-xl border-2 gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
            <p className="text-sm text-slate-400">
              Demo com dados ilustrativos • Sem cadastro • Sem cartão de crédito
            </p>
          </div>

          {/* Dashboard Mock */}
          <div className="max-w-5xl mx-auto mt-16 relative">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 ring-1 ring-white/10">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/60 bg-slate-800/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 mx-4 bg-slate-700/60 rounded-md h-6 flex items-center px-3">
                  <span className="text-xs text-slate-400">
                    beautyflow.ai/dashboard
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      label: "Agendamentos Hoje",
                      value: "24",
                      sub: "+3 vs ontem",
                      color: "text-rose-400",
                    },
                    {
                      label: "Receita do Mês",
                      value: "R$ 18.450",
                      sub: "Meta: R$ 20k",
                      color: "text-emerald-400",
                    },
                    {
                      label: "Clientes Ativos",
                      value: "312",
                      sub: "28 novos",
                      color: "text-blue-400",
                    },
                    {
                      label: "Taxa de Retorno",
                      value: "78%",
                      sub: "Acima da média",
                      color: "text-purple-400",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-slate-700/50 rounded-xl p-3.5 border border-slate-600/30"
                    >
                      <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold ${s.color}`}>
                        {s.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 bg-slate-700/30 rounded-xl p-4 border border-slate-600/20">
                    <p className="text-xs text-slate-400 mb-3 font-medium">
                      Agenda — Hoje
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          hora: "09:00",
                          cliente: "Maria Fernanda",
                          servico: "Coloração",
                          prof: "Carla",
                          status: "confirmado",
                          cor: "text-blue-400",
                        },
                        {
                          hora: "10:30",
                          cliente: "Ana Paula",
                          servico: "Corte + Escova",
                          prof: "Joana",
                          status: "chegou",
                          cor: "text-amber-400",
                        },
                        {
                          hora: "11:00",
                          cliente: "Bianca Lima",
                          servico: "Manicure",
                          prof: "Priscila",
                          status: "agendado",
                          cor: "text-slate-400",
                        },
                      ].map((ag, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-slate-600/30 rounded-lg px-3 py-2"
                        >
                          <span className="text-xs font-mono text-slate-300 w-10 flex-shrink-0">
                            {ag.hora}
                          </span>
                          <span className="text-xs text-white font-medium flex-1 truncate">
                            {ag.cliente}
                          </span>
                          <span className="text-xs text-slate-400 hidden sm:block">
                            {ag.servico}
                          </span>
                          <span className={`text-xs ${ag.cor} flex-shrink-0`}>
                            {ag.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 bg-slate-700/30 rounded-xl p-4 border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-slate-300 font-medium">
                        AI Growth
                      </span>
                      <Badge className="bg-rose-500/20 text-rose-400 border-0 text-xs ml-auto">
                        3 ações
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        "8 clientes sem retorno há 45d",
                        "Horários ociosos nas terças",
                        "Pacote facial subutilizado",
                      ].map((o, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-slate-600/30 rounded-lg px-2.5 py-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                          <span className="text-xs text-slate-300 leading-tight">
                            {o}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating tags */}
            <div className="absolute -top-4 -right-2 sm:-right-6 bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-rose-500" />
              <div>
                <p className="text-xs text-slate-500">IA recuperou</p>
                <p className="text-sm font-bold text-slate-900">
                  +R$ 4.200 este mês
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-2 sm:-left-6 bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-500">Agenda do dia</p>
                <p className="text-sm font-bold text-slate-900">
                  24 confirmados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TURBOSAAS MODEL ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left: texto */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="text-rose-400 font-bold text-sm uppercase tracking-wider"></span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
                Esse sistema não é só um software.
                <br />
                <span className="text-rose-400">
                  É um ativo SaaS pronto para você.
                </span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demo">
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-2 px-6 h-11 rounded-xl">
                    <Play className="w-4 h-4" /> Ver demo do sistema
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white gap-2 px-6 h-11 rounded-xl"
                >
                  <Rocket className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right: cards do processo */}
            <div className="flex-1 w-full max-w-lg">
              <div className="space-y-3">
                {[
                  {
                    step: "01",
                    icon: Layers,
                    title: "Você recebe o sistema pronto no Supabase",
                    desc: "BeautyFlow AI entregue completo — agenda, clientes, IA, financeiro, pacotes, white-label. Zero linha de código.",
                    color: "border-rose-500/30 bg-rose-500/5",
                    badge: "text-rose-400",
                  },
                  {
                    step: "02",
                    icon: Palette,
                    title: "Clona e personaliza para o cliente",
                    desc: "Nome do salão, logo, cor da marca e slug próprio. Em minutos o sistema tem a identidade do negócio do seu cliente.",
                    color: "border-purple-500/30 bg-purple-500/5",
                    badge: "text-purple-400",
                  },
                  {
                    step: "03",
                    icon: Globe,
                    title: "Entrega um link de agendamento exclusivo",
                    desc: "Cada cliente recebe um link próprio (/agendar/slug-do-salao) para os clientes finais agendarem online.",
                    color: "border-blue-500/30 bg-blue-500/5",
                    badge: "text-blue-400",
                  },
                  {
                    step: "04",
                    icon: DollarSign,
                    title: "Cobra mensalidade recorrente como SaaS",
                    desc: "R$ 197, R$ 297, R$ 397/mês por salão. Você define o preço. O sistema é seu. A receita é sua.",
                    color: "border-emerald-500/30 bg-emerald-500/5",
                    badge: "text-emerald-400",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-5 flex gap-4 items-start ${item.color}`}
                  >
                    <div
                      className={`text-xs font-bold ${item.badge} w-7 flex-shrink-0 mt-0.5 font-mono`}
                    >
                      {item.step}
                    </div>
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.badge}`}
                    />
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">
                        {item.title}
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                <p className="text-slate-400 text-xs mb-1"></p>
                <p className="text-white text-sm font-medium"></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGOS / SOCIAL PROOF BAR ─── */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 mb-6 font-medium uppercase tracking-wider">
            Criado para operações reais em beleza e estética
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-slate-400">
            {[
              "Salões de Beleza",
              "Estúdios de Estética",
              "Barbearias",
              "Clínicas de Micropigmentação",
              "Redes & Franquias",
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Scissors className="w-3.5 h-3.5 text-rose-400" />
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEMA ─── */}
      <section id="problema" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-5 bg-red-100 text-red-700 border-red-200">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> O cenário mais
                comum nos salões hoje
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-5 leading-tight">
                A maioria dos salões opera no improviso e{" "}
                <span className="text-rose-500">perde dinheiro todo mês</span>{" "}
                sem perceber
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Agendas no WhatsApp, cadernos de pacotes, financeiro no Excel.
                Essa realidade parece funcionar — até você começar a medir o
                quanto custa não ter um sistema real.
              </p>
              <div className="space-y-3">
                {problems.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl border border-red-100"
                  >
                    <p.icon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl">
              <p className="text-rose-400 font-semibold mb-4 text-sm uppercase tracking-wide">
                Com o BeautyFlow AI, tudo muda
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Zero conflito de agenda",
                    desc: "Validação em tempo real impede double-booking e erros de horário.",
                  },
                  {
                    title: "Clientes nunca somem silenciosamente",
                    desc: "A IA detecta quem está inativo e gera mensagem de reativação automática.",
                  },
                  {
                    title: "Financeiro em tempo real",
                    desc: "Receita, ticket médio, serviços rentáveis — tudo visível, sempre atualizado.",
                  },
                  {
                    title: "Pacotes sob controle total",
                    desc: "Cada sessão registrada, saldo visível, vencimento controlado por cliente.",
                  },
                  {
                    title: "Link de agendamento próprio",
                    desc: "Clientes agendam sozinhos pelo link do salão, 24h por dia.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {item.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-rose-100 text-rose-700 border-rose-200">
              Como funciona na prática
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Da configuração ao crescimento em 4 passos
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Não é só bonito. É funcional e rápido de colocar em uso real.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < howItWorks.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-rose-200 to-transparent z-10 -translate-y-px"
                    style={{ width: "calc(100% - 2rem)" }}
                  />
                )}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-rose-100 transition-all h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-5 shadow-md shadow-rose-200/50">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-base">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MÓDULOS ─── */}
      <section id="modulos" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200">
              Módulos completos
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Uma plataforma, todos os módulos
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Cada módulo foi pensado para uma parte real da operação de um
              salão. Não são recursos vazios — são ferramentas funcionais.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-slate-100 hover:border-rose-200 hover:shadow-lg transition-all bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <m.icon className="w-6 h-6 text-rose-500" />
                  </div>
                  <Badge className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                    {m.tag}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTELIGÊNCIA ARTIFICIAL ─── */}
      <section
        id="ia"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <Badge className="mb-5 bg-rose-500/20 text-rose-400 border-rose-500/30">
                <Brain className="w-3.5 h-3.5 mr-1.5" /> Inteligência Artificial
                aplicada ao seu negócio
              </Badge>
              <h2 className="text-4xl font-bold mb-5 leading-tight">
                O sistema trabalha por você,
                <span className="text-rose-400">
                  {" "}
                  mesmo quando você não está olhando
                </span>
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                O AI Growth Engine analisa o histórico real do seu salão e
                detecta oportunidades que você normalmente não enxergaria no dia
                a dia. Não é teoria. É análise de dados que gera ação.
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: Users,
                    title: "Detecta clientes em risco de abandono",
                    desc: "Identifica automaticamente clientes que pararam de aparecer e aponta quantos dias faz.",
                  },
                  {
                    icon: MessageSquare,
                    title: "Gera mensagens personalizadas com IA",
                    desc: "Cria mensagens de reativação, oferta de pacote ou aniversário com linguagem natural e personalizada.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Identifica oportunidades de receita",
                    desc: "Analisa serviços subutilizados, horários ociosos e padrões de comportamento para sugerir ações práticas.",
                  },
                  {
                    icon: BarChart3,
                    title: "Insights baseados em dados reais",
                    desc: "Nenhum dado fictício. Tudo calculado com base nos agendamentos e comportamentos registrados no sistema.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                      <item.icon className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IA mockup */}
            <div className="bg-slate-800/60 rounded-3xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/50">
                <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    AI Growth Engine
                  </p>
                  <p className="text-xs text-slate-400">
                    3 oportunidades detectadas hoje
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  {
                    label: "Alta prioridade",
                    text: "8 clientes sem retorno há mais de 45 dias — potencial de R$ 2.400 em reativações.",
                    color: "border-red-400/40 bg-red-500/10",
                    badge: "bg-red-500/20 text-red-400",
                  },
                  {
                    label: "Oportunidade",
                    text: "Terças-feiras com 40% dos horários ociosos. Promoção pode gerar +R$ 800/mês.",
                    color: "border-amber-400/40 bg-amber-500/10",
                    badge: "bg-amber-500/20 text-amber-400",
                  },
                  {
                    label: "Expansão",
                    text: "Pacote facial com 3 vendas — clientes que compraram voltam 2x mais rápido.",
                    color: "border-emerald-400/40 bg-emerald-500/10",
                    badge: "bg-emerald-500/20 text-emerald-400",
                  },
                ].map((op, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${op.color}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge className={`text-xs border-0 ${op.badge}`}>
                        {op.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {op.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
                <p className="text-xs text-slate-400 mb-2">
                  Mensagem gerada pela IA para reativação:
                </p>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "Oi, Maria! Sentimos sua falta por aqui 💕 Passamos para te
                  convidar de volta com uma condição especial: 20% off no seu
                  próximo serviço até sexta. Que tal agendar agora?"
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                    Copiar mensagem
                  </Badge>
                  <Badge className="bg-slate-600 text-slate-300 border-0 text-xs">
                    Regerar
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEMO BANNER ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-rose-500 via-rose-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-5 bg-white/20 text-white border-white/30">
            <Play className="w-3.5 h-3.5 mr-1.5" /> Demo pública disponível
            agora
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            Veja o sistema funcionando antes de qualquer decisão
          </h2>
          <p className="text-rose-100 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
            Nossa demo pública simula um salão real com dados reais. Agenda,
            clientes, financeiro, pacotes e IA — tudo explorável sem se
            cadastrar, sem cartão, sem compromisso.
          </p>
          <Link to="/demo">
            <Button
              size="lg"
              className="bg-white text-rose-600 hover:bg-rose-50 px-12 py-6 text-lg rounded-xl font-semibold shadow-2xl gap-2"
            >
              <Play className="w-5 h-5" />
              Abrir Demo Interativa
            </Button>
          </Link>
          <p className="mt-4 text-rose-200/80 text-sm">
            Demo com dados ilustrativos. Sem formulário, sem cadastro, sem
            espera.
          </p>
        </div>
      </section>

      {/* ─── WHITE-LABEL ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-50 to-rose-50/50 rounded-3xl p-8 border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-medium">
                  Customização da marca
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "Studio Ana Beleza",
                      cor: "#f43f5e",
                      slug: "studio-ana",
                      logo: "A",
                    },
                    {
                      label: "Espaço Bella Vita",
                      cor: "#8b5cf6",
                      slug: "bella-vita",
                      logo: "B",
                    },
                    {
                      label: "Barber Kings",
                      cor: "#0f172a",
                      slug: "barber-kings",
                      logo: "K",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: s.cor }}
                      >
                        {s.logo}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {s.label}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          /agendar/{s.slug}
                        </p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: s.cor }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 mb-2">
                    Página pública do cliente — Link personalizado
                  </p>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono text-slate-600">
                      beautyflow.ai/agendar/studio-ana
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Badge className="mb-5 bg-rose-100 text-rose-700 border-rose-200">
                <Palette className="w-3.5 h-3.5 mr-1.5" /> White-label por
                cliente
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-5 leading-tight">
                Cada salão tem sua própria identidade dentro do sistema
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Nome, logo, cor primária e link de agendamento público
                personalizados por salão. O cliente do seu cliente não vê uma
                plataforma genérica — vê a marca do negócio dele.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Palette,
                    title: "Cores e logo personalizáveis",
                    desc: "Cada salão define sua cor principal e logo. O sistema adapta toda a interface e a página pública.",
                  },
                  {
                    icon: Globe,
                    title: "Link de agendamento exclusivo",
                    desc: "Cada salão recebe um link único (/agendar/slug) para compartilhar com seus clientes.",
                  },
                  {
                    icon: Layers,
                    title: "Ambientes 100% isolados",
                    desc: "Clientes, serviços, financeiro e profissionais de um salão nunca aparecem em outro.",
                  },
                  {
                    icon: Building2,
                    title: "Pronto para escalar como rede",
                    desc: "Multi-unidades gerenciadas por um painel central, cada uma com sua identidade e dados independentes.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              O que dizem quem já usa
            </h2>
            <p className="text-slate-500 text-lg">
              Resultados reais de salões que saíram do improviso.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic leading-relaxed flex-1">
                  "{t.text}"
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900 text-sm">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TURBOSAAS ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 70% 30%, #f43f5e 0%, transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                  TurboSaaS
                </span>
              </div>
              <Badge className="mb-5 bg-white/10 text-white/80 border-white/20 text-sm"></Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                BeautyFlow faz parte de uma linha de SaaS por nicho — criada
                para operar no mundo real
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8"></p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  {
                    icon: Layers,
                    title: "SaaS por nicho",
                    desc: "Cada sistema focado em uma vertical específica de mercado",
                  },
                  {
                    icon: Shield,
                    title: "Visão comercial real",
                    desc: "Pensado para venda, demonstração e escala, não só para portfólio",
                  },
                  {
                    icon: Rocket,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10"
                  >
                    <item.icon className="w-6 h-6 text-rose-400 mx-auto mb-3" />
                    <p className="font-semibold text-white text-sm mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                Outros sistemas da biblioteca:{" "}
                <span className="text-slate-300 font-medium"></span>{" "}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLANOS ─── */}
      <section
        id="planos"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-rose-100 text-rose-700 border-rose-200">
              Planos transparentes
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Planos que crescem com o seu salão
            </h2>
            <p className="text-lg text-slate-600">
              Comece pequeno. Escale quando precisar. Sem surpresas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border-2 p-8 relative bg-white ${plan.color} ${plan.highlight ? "shadow-2xl shadow-rose-100 scale-105" : "shadow-sm"}`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-500 text-white border-0 px-5 shadow-md">
                    Mais Popular
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <Check className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/demo">
                  <Button
                    className={`w-full h-11 rounded-xl font-semibold ${plan.highlight ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200" : "border-2 border-slate-200 bg-transparent text-slate-800 hover:bg-slate-50"}`}
                  >
                    {plan.price === "Sob consulta"
                      ? "Falar com especialista"
                      : "Começar com Demo"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-200">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight">
            Pronto para tirar seu salão do improviso?
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
            Explore a demo completa agora mesmo. Sem compromisso. Sem cadastro.
            Veja o sistema funcionando com dados reais antes de qualquer
            decisão.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/demo">
              <Button
                size="lg"
                className="bg-rose-500 hover:bg-rose-600 text-white px-12 py-6 text-lg rounded-xl shadow-lg shadow-rose-200 gap-2"
              >
                <Play className="w-5 h-5" />
                Explorar Demo Agora
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-6 text-lg rounded-xl border-2 gap-2"
              >
                Já tenho minha conta
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 text-sm">
            Demo pública • Sem cadastro • Dados realistas de operação
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">BeautyFlow</span>
                <p className="text-xs text-slate-500"></p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="#problema"
                className="hover:text-white transition-colors"
              >
                O Problema
              </a>
              <a href="#modulos" className="hover:text-white transition-colors">
                Módulos
              </a>
              <a href="#ia" className="hover:text-white transition-colors">
                Inteligência Artificial
              </a>
              <a href="#planos" className="hover:text-white transition-colors">
                Planos
              </a>
              <Link to="/demo" className="hover:text-white transition-colors">
                Demo
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>
              © 2026 BeautyFlow — Ecossistema. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Termos
              </a>
              <Link to="/master" className="hover:text-white transition-colors">
                Master Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
