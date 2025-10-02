"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Cog,
  Download,
  Home,
  Menu,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Wrench,
  X,
  Zap,
  Building,
  Droplets,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Upload,
  FileText,
  PenTool,
  RefreshCw,
  MessageSquare,
  Edit,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { supabase, getFilteredMaintenanceRequests, type MaintenanceRequest } from "@/lib/supabase"

const maintenanceTypes = [
  {
    name: "Mecânica",
    icon: <Cog className="text-orange-500" />,
    description: "Equipamentos e máquinas industriais",
    count: 0,
    urgent: 0,
    color: "orange",
    examples: ["Compressores", "Bombas", "Motores", "Máquinas de produção"],
  },
  {
    name: "Predial",
    icon: <Building className="text-red-600" />,
    description: "Estrutura e acabamentos do prédio",
    count: 0,
    urgent: 0,
    color: "red",
    examples: ["Pintura", "Pisos", "Paredes", "Telhados"],
  },
]

const recentWorkOrders: any[] = []

const sidebarItems = [
  {
    title: "Dashboard",
    icon: <Home />,
    isActive: true,
    key: "home",
  },
  {
    title: "Todas as OS",
    icon: <FileText />,
    key: "orders",
  },
  {
    title: "Relatórios",
    icon: <BarChart3 />,
    key: "reports",
  },
]

export function DesignaliCreative() {
  const [notifications, setNotifications] = useState(0)
  const [activeTab, setActiveTab] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    type: "all",
    sector: "all",
    search: "",
  })
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOS, setSelectedOS] = useState<MaintenanceRequest | null>(null)
  const [showOSModal, setShowOSModal] = useState(false)
  const [stats, setStats] = useState({
    pendentes: 0,
    em_execucao: 0,
    concluidas: 0,
    prioridade_alta: 0,
  })
  const [maintenanceTypeStats, setMaintenanceTypeStats] = useState({
    mecanica: 0,
    predial: 0,
  })

  const handleSidebarClick = (key: string) => {
    setActiveTab(key)
    setMobileMenuOpen(false)
  }

  const handleViewOS = (os: MaintenanceRequest) => {
    setSelectedOS(os)
    setShowOSModal(true)
  }

  const handleCompleteOS = async (osId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'concluida',
          updated_at: new Date().toISOString()
        })
        .eq('id', osId)

      if (error) {
        console.error('Erro ao concluir OS:', error)
        return
      }

      // Recarregar dados
      await loadMaintenanceRequests()
      
      // Fechar modal
      setShowOSModal(false)
      setSelectedOS(null)
      
      console.log('OS concluída com sucesso!')
    } catch (error) {
      console.error('Erro ao concluir OS:', error)
    }
  }

  const handlePrintOS = () => {
    if (!selectedOS) return
    
    // Criar conteúdo para impressão
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
          ORDEM DE SERVIÇO - OS #${selectedOS.id?.slice(-8)}
        </h1>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #666; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Informações Básicas</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Solicitante:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedOS.solicitante}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Setor:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedOS.setor}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Data da Solicitação:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(selectedOS.data_solicitacao).toLocaleDateString('pt-BR')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Local/Equipamento:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedOS.local_equipamento}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Prioridade:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedOS.prioridade === 'alta' ? 'Alta' : selectedOS.prioridade === 'media' ? 'Média' : 'Baixa'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Tipo:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedOS.tipo_manutencao === 'predial' ? 'Predial' : 'Mecânica'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Status:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedOS.status === 'pendente' ? 'Pendente' : selectedOS.status === 'em_execucao' ? 'Em Execução' : selectedOS.status === 'concluida' ? 'Concluída' : 'Cancelada'}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #666; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Descrição do Problema</h2>
          <div style="padding: 15px; border: 1px solid #ddd; background: #f9f9f9; margin: 10px 0;">
            ${selectedOS.descricao}
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #666; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Informações de Sistema</h2>
          <p><strong>Criado em:</strong> ${formatDate(selectedOS.created_at)}</p>
          <p><strong>Última atualização:</strong> ${formatDate(selectedOS.updated_at)}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>Documento gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `
    
    // Abrir janela de impressão
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleAddComment = () => {
    const comment = prompt('Adicione um comentário sobre esta OS:')
    if (comment && selectedOS?.id) {
      // Aqui você pode implementar a lógica para salvar o comentário
      console.log('Comentário adicionado:', comment)
      alert('Comentário adicionado com sucesso!')
    }
  }

  const handleEditOS = () => {
    if (!selectedOS) return
    
    // Por enquanto, vamos mostrar um alerta com as opções de edição
    const newStatus = prompt(`Editar status da OS (atual: ${selectedOS.status}):\n\nOpções: pendente, em_execucao, concluida, cancelada`)
    
    if (newStatus && ['pendente', 'em_execucao', 'concluida', 'cancelada'].includes(newStatus)) {
      // Atualizar status no banco
      supabase
        .from('maintenance_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOS.id)
        .then(() => {
          loadMaintenanceRequests()
          setShowOSModal(false)
          setSelectedOS(null)
          alert('OS atualizada com sucesso!')
        })
        .catch(error => {
          console.error('Erro ao atualizar OS:', error)
          alert('Erro ao atualizar OS')
        })
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('pt-BR')
    } catch {
      return 'N/A'
    }
  }

  // Carregar dados iniciais
  const loadMaintenanceRequests = async () => {
    setLoading(true)
    try {
      console.log('Carregando dados do Supabase...')
      const data = await getFilteredMaintenanceRequests(filters)
      console.log('Dados recebidos:', data)
      setMaintenanceRequests(data || [])
      
      // Calcular estatísticas
      const newStats = {
        pendentes: data?.filter(r => r.status === 'pendente').length || 0,
        em_execucao: data?.filter(r => r.status === 'em_execucao').length || 0,
        concluidas: data?.filter(r => r.status === 'concluida').length || 0,
        prioridade_alta: data?.filter(r => r.prioridade === 'alta').length || 0,
      }
      
      // Calcular estatísticas por tipo de manutenção
      const newMaintenanceTypeStats = {
        mecanica: data?.filter(r => r.tipo_manutencao === 'mecanica').length || 0,
        predial: data?.filter(r => r.tipo_manutencao === 'predial').length || 0,
      }
      
      console.log('Estatísticas calculadas:', newStats)
      console.log('Estatísticas por tipo:', newMaintenanceTypeStats)
      setStats(newStats)
      setMaintenanceTypeStats(newMaintenanceTypeStats)
      setNotifications(newStats.pendentes + newStats.prioridade_alta)
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Configurar realtime
  React.useEffect(() => {
    loadMaintenanceRequests()

    // Configurar subscription para mudanças em tempo real
    const channel = supabase
      .channel('maintenance_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        () => {
          // Recarregar dados quando houver mudanças
          loadMaintenanceRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filters])

  // Aplicar filtros
  const applyFilters = async () => {
    await loadMaintenanceRequests()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.3) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(220, 38, 38, 0.3) 0%, rgba(153, 27, 27, 0.3) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(248, 113, 113, 0.3) 0%, rgba(185, 28, 28, 0.3) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white">
                <Wrench className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">ManutençãoPro</h2>
                <p className="text-xs text-muted-foreground">Sistema de OS</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSidebarClick(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium",
                    activeTab === item.key ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button
                onClick={() => handleSidebarClick("settings")}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>Usuário</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Admin
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white">
                <Wrench className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">ManutençãoPro</h2>
                <p className="text-xs text-muted-foreground">Sistema de OS</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleSidebarClick(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium",
                    activeTab === item.key ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button
                onClick={() => handleSidebarClick("settings")}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>Usuário</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Admin
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Sistema de Manutenção</h1>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl relative">
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notificações</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>GS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[400px] grid-cols-3 rounded-2xl p-1 text-xs sm:text-sm">
                <TabsTrigger value="home" className="rounded-xl data-[state=active]:rounded-xl">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:rounded-xl">
                  Todas as OS
                </TabsTrigger>
                <TabsTrigger value="reports" className="rounded-xl data-[state=active]:rounded-xl">
                  Relatórios
                </TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl bg-transparent"
                  onClick={() => setActiveTab("reports")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Relatório
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="home" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-8 text-white"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                          <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Sistema Ativo</Badge>
                          <h2 className="text-3xl font-bold">Dashboard de Manutenção</h2>
                          <p className="max-w-[600px] text-white/80">
                            Controle total das ordens de serviço com indicadores em tempo real.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* Dashboard Indicators */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Card className="rounded-3xl border-2 hover:border-yellow-200 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-medium text-muted-foreground">OS Pendentes</p>
                              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">Aguardando execução</p>
                          </div>
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex-shrink-0">
                              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Card className="rounded-3xl border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-medium text-muted-foreground">Em Execução</p>
                              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.em_execucao}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">Em andamento</p>
                          </div>
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
                              <PlayCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Card className="rounded-3xl border-2 hover:border-green-200 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.concluidas}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">Finalizadas</p>
                          </div>
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0">
                              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Card className="rounded-3xl border-2 hover:border-red-200 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-sm font-medium text-muted-foreground">Prioridade Alta</p>
                              <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.prioridade_alta}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">Requer atenção</p>
                          </div>
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex-shrink-0">
                              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Tipos de Manutenção</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {maintenanceTypes.map((type) => (
                        <motion.div key={type.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300 group">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-${type.color}-100 group-hover:bg-${type.color}-200 transition-colors`}>
                                  {type.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg sm:text-xl font-bold">{type.name}</CardTitle>
                                    <CardDescription className="text-sm sm:text-base mt-1">{type.description}</CardDescription>
                                  </div>
                                </div>
                                {type.urgent > 0 && (
                                  <Badge className="rounded-xl bg-red-500">
                                    {type.urgent} Urgente{type.urgent > 1 ? "s" : ""}
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                  <span className="text-sm font-medium text-muted-foreground">Status: Ativo</span>
                                </div>
                                <Badge variant="outline" className="rounded-xl">
                                  {type.name === 'Mecânica' ? maintenanceTypeStats.mecanica : maintenanceTypeStats.predial} OS ativas
                                </Badge>
                              </div>
                              
                              
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Ordens de Serviço Recentes</h2>
                    </div>
                    <div className="rounded-3xl border">
                      {maintenanceRequests.length > 0 ? (
                      <div className="grid grid-cols-1 divide-y">
                        {maintenanceRequests.slice(0, 5).map((order) => (
                          <motion.div
                            key={order.id}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className="flex items-center justify-between p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{order.solicitante}</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.setor} • {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`rounded-xl ${
                                  order.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                                  order.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                {order.prioridade === 'alta' ? 'Alta' :
                                 order.prioridade === 'media' ? 'Média' : 'Baixa'}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`rounded-xl ${
                                  order.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'em_execucao' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'concluida' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {order.status === 'pendente' ? 'Pendente' :
                                 order.status === 'em_execucao' ? 'Em Execução' :
                                 order.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-xl"
                                onClick={() => handleViewOS(order)}
                              >
                                Ver OS
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Nenhuma OS encontrada</h3>
                          <p className="text-muted-foreground mb-4">
                            Não há ordens de serviço cadastradas ainda.
                          </p>
                          <Button className="rounded-2xl">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Primeira OS
                          </Button>
                        </div>
                      )}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="orders" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Todas as Ordens de Serviço</h2>
                          <p className="max-w-[600px] text-white/80">
                            Visualize e gerencie todas as ordens de serviço com filtros avançados por status, prioridade e tipo.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* Filtros */}
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtros e Busca
                      </CardTitle>
                      <CardDescription>Filtre as ordens de serviço por diferentes critérios</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Buscar</label>
                          <Input
                            placeholder="Buscar por ID, título ou setor..."
                            className="rounded-2xl"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="in-progress">Em Execução</SelectItem>
                              <SelectItem value="completed">Concluída</SelectItem>
                              <SelectItem value="cancelled">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Prioridade</label>
                          <Select
                            value={filters.priority}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Todas as prioridades" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tipo</label>
                          <Select
                            value={filters.type}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Todos os tipos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="mecanica">Mecânica</SelectItem>
                              <SelectItem value="predial">Predial</SelectItem>
                              <SelectItem value="tubulacao">Tubulação</SelectItem>
                              <SelectItem value="escritorio">Escritório</SelectItem>
                              <SelectItem value="melhoria">Melhoria</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Setor</label>
                          <Select
                            value={filters.sector}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Todos os setores" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="producao">Produção</SelectItem>
                              <SelectItem value="administrativo">Administrativo</SelectItem>
                              <SelectItem value="manutencao">Manutenção</SelectItem>
                              <SelectItem value="qualidade">Qualidade</SelectItem>
                              <SelectItem value="estoque">Estoque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <Button
                                variant="outline"
                          className="rounded-2xl flex-1 sm:flex-none"
                          onClick={() => setFilters({
                            status: "all",
                            priority: "all",
                            type: "all",
                            sector: "all",
                            search: "",
                          })}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Limpar Filtros
                        </Button>
                        <Button className="rounded-2xl flex-1 sm:flex-none" onClick={applyFilters}>
                          <Search className="mr-2 h-4 w-4" />
                          Aplicar Filtros
                              </Button>
                            </div>
                    </CardContent>
                  </Card>

                  {/* Lista de OS */}
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                              <div>
                          <CardTitle>Ordens de Serviço</CardTitle>
                          <CardDescription>Lista de todas as ordens de serviço</CardDescription>
                              </div>
                        <Badge variant="outline" className="rounded-xl">
                          {maintenanceRequests.length} OS encontradas
                                    </Badge>
                                </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center p-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              </div>
                      ) : maintenanceRequests.length > 0 ? (
                        <div className="space-y-4">
                          {maintenanceRequests.map((request) => (
                            <motion.div
                              key={request.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border rounded-2xl p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{request.solicitante}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className={`rounded-xl ${
                                        request.prioridade === 'alta' ? 'border-red-500 text-red-600' :
                                        request.prioridade === 'media' ? 'border-yellow-500 text-yellow-600' :
                                        'border-green-500 text-green-600'
                                      }`}
                                    >
                                      {request.prioridade === 'alta' ? 'Alta' : 
                                       request.prioridade === 'media' ? 'Média' : 'Baixa'}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`rounded-xl ${
                                        request.status === 'pendente' ? 'border-yellow-500 text-yellow-600' :
                                        request.status === 'em_execucao' ? 'border-blue-500 text-blue-600' :
                                        request.status === 'concluida' ? 'border-green-500 text-green-600' :
                                        'border-gray-500 text-gray-600'
                                      }`}
                                    >
                                      {request.status === 'pendente' ? 'Pendente' :
                                       request.status === 'em_execucao' ? 'Em Execução' :
                                       request.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                                    </Badge>
                          </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <strong>Setor:</strong> {request.setor} • <strong>Local:</strong> {request.local_equipamento}
                                  </p>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <strong>Tipo:</strong> {request.tipo_manutencao === 'mecanica' ? 'Mecânica' : 'Predial'}
                                  </p>
                                  <p className="text-sm">{request.descricao}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Criado em: {new Date(request.created_at || '').toLocaleDateString('pt-BR')}
                                  </p>
                        </div>
                              </div>
                            </motion.div>
                          ))}
                            </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Nenhuma OS encontrada</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            Não há ordens de serviço cadastradas ou que correspondam aos filtros aplicados.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button className="rounded-2xl flex-1 sm:flex-none" onClick={loadMaintenanceRequests}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Atualizar
                        </Button>
                      </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Relatórios e Indicadores</h2>
                          <p className="max-w-[600px] text-white/80">
                            Análise completa das ordens de serviço com filtros por período, setor e tipo de manutenção.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Relatório Mensal
                        </CardTitle>
                        <CardDescription>OS por mês e tipo de manutenção</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full rounded-2xl">
                          <Download className="mr-2 h-4 w-4" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Indicadores por Setor
                        </CardTitle>
                        <CardDescription>Performance por setor</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full rounded-2xl">
                          <Download className="mr-2 h-4 w-4" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Tempo de Execução
                        </CardTitle>
                        <CardDescription>Análise de tempo médio</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full rounded-2xl">
                          <Download className="mr-2 h-4 w-4" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Configurações do Sistema</h2>
                          <p className="max-w-[600px] text-white/80">
                            Gerencie usuários, perfis de acesso e configurações gerais do sistema.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="rounded-3xl">
                      <CardHeader>
                        <CardTitle>Usuários e Perfis</CardTitle>
                        <CardDescription>Gerenciar solicitantes, técnicos e gestores</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                            <span>Solicitantes</span>
                            <Badge variant="outline">0 usuários</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                            <span>Técnicos</span>
                            <Badge variant="outline">0 usuários</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                            <span>Gestores</span>
                            <Badge variant="outline">0 usuários</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl">
                      <CardHeader>
                        <CardTitle>Configurações Gerais</CardTitle>
                        <CardDescription>Configurações do sistema</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full rounded-2xl justify-start bg-transparent">
                            Backup de Dados
                          </Button>
                          <Button variant="outline" className="w-full rounded-2xl justify-start bg-transparent">
                            Notificações
                          </Button>
                          <Button variant="outline" className="w-full rounded-2xl justify-start bg-transparent">
                            Integração com Email
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>

      {/* Modal de Detalhes da OS */}
      {showOSModal && selectedOS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Detalhes da OS</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Ordem de Serviço #{selectedOS.id?.slice(-8)}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowOSModal(false)}
                  className="rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Conteúdo */}
              <div className="space-y-4 sm:space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Solicitante</label>
                    <p className="text-lg font-semibold">{selectedOS.solicitante}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Setor</label>
                    <p className="text-lg font-semibold">{selectedOS.setor}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Data da Solicitação</label>
                    <p className="text-lg font-semibold">
                      {new Date(selectedOS.data_solicitacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Local/Equipamento</label>
                    <p className="text-lg font-semibold">{selectedOS.local_equipamento}</p>
                  </div>
                </div>

                {/* Status e Prioridade */}
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge 
                      className={`rounded-xl ${
                        selectedOS.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOS.status === 'em_execucao' ? 'bg-blue-100 text-blue-800' :
                        selectedOS.status === 'concluida' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedOS.status === 'pendente' ? 'Pendente' :
                       selectedOS.status === 'em_execucao' ? 'Em Execução' :
                       selectedOS.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Prioridade</label>
                    <Badge 
                      className={`rounded-xl ${
                        selectedOS.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                        selectedOS.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedOS.prioridade === 'alta' ? 'Alta' :
                       selectedOS.prioridade === 'media' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                    <Badge variant="outline" className="rounded-xl">
                      {selectedOS.tipo_manutencao === 'predial' ? 'Predial' : 'Mecânica'}
                    </Badge>
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Descrição do Problema</label>
                  <div className="p-4 bg-muted/50 rounded-2xl">
                    <p className="text-base">{selectedOS.descricao}</p>
                  </div>
                </div>

                {/* Fotos */}
                {selectedOS.fotos && selectedOS.fotos.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Fotos Anexadas</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {selectedOS.fotos.map((foto, index) => (
                        <div key={index} className="aspect-square rounded-2xl overflow-hidden bg-muted">
                          <img 
                            src={foto} 
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações de Sistema */}
                <div className="pt-3 sm:pt-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Criado em:</span> {formatDate(selectedOS.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Última atualização:</span> {formatDate(selectedOS.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                {selectedOS.status !== 'concluida' && (
                  <Button 
                    onClick={() => selectedOS.id && handleCompleteOS(selectedOS.id)}
                    className="flex-1 rounded-2xl text-sm sm:text-base bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Concluir OS</span>
                    <span className="sm:hidden">Concluir</span>
                  </Button>
                )}
                <Button 
                  onClick={handlePrintOS}
                  className="flex-1 rounded-2xl text-sm sm:text-base"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Imprimir OS</span>
                  <span className="sm:hidden">Imprimir</span>
                </Button>
                <Button 
                  onClick={handleAddComment}
                  variant="outline" 
                  className="flex-1 rounded-2xl text-sm sm:text-base"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Adicionar Comentário</span>
                  <span className="sm:hidden">Comentário</span>
                </Button>
                <Button 
                  onClick={handleEditOS}
                  variant="outline" 
                  className="rounded-2xl"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
