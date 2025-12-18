"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketActions } from "@/components/TicketActions"
import { DriverMenu } from "@/components/DriverMenu"
import { NewDriverDialog } from "@/components/NewDriverDialog"
import { Clock, Play, AlertTriangle, CheckCircle2, Search, X } from "lucide-react"

const groupConfig: any = {
  "VERMELHO": { border: "border-red-600", bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-800" },
  "AZUL":     { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
  "VERDE":    { border: "border-green-500", bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-800" },
}

const statusConfig: any = {
  "TODO": { label: "Aguardando", icon: Clock, color: "text-gray-500" },
  "IN_PROGRESS": { label: "Em Andamento", icon: Play, color: "text-blue-600" },
  "PENDING": { label: "Pendente", icon: AlertTriangle, color: "text-red-500" },
  "DONE": { label: "Concluído", icon: CheckCircle2, color: "text-green-600" },
}

export function DashboardManager({ drivers, currentUser }: { drivers: any[], currentUser: any }) {
  const [search, setSearch] = useState("")

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.licensePlate.toLowerCase().includes(search.toLowerCase())
  )

  const todoList = filteredDrivers.filter(d => d.status === 'TODO')
  const inProgressList = filteredDrivers.filter(d => d.status === 'IN_PROGRESS')
  const pendingList = filteredDrivers.filter(d => d.status === 'PENDING')
  const doneList = filteredDrivers.filter(d => d.status === 'DONE')

  // Helper para limpar o texto do erro
  function getCleanErrorText(fullText: string) {
    if (!fullText) return ""
    return fullText.replace(/\[Parou em: (.*?)\] - /, "$1: ").replace(/\[Parou em: (.*?)\]/, "$1")
  }

  const DriverList = ({ list }: { list: any[] }) => (
    <div className="space-y-3 mt-4">
      {list.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg bg-gray-50 text-gray-400">
          {search ? `Nenhum resultado para "${search}" nesta aba.` : "Nenhum motorista nesta etapa."}
        </div>
      ) : (
        list.map((driver) => {
          const visual = groupConfig[driver.group] || groupConfig["VERMELHO"]
          const status = statusConfig[driver.status]
          const StatusIcon = status.icon
          
          const errorText = driver.failedStep ? getCleanErrorText(driver.failedStep) : null

          return (
            // CORREÇÃO: 'pr-4' e 'w-full' para garantir que os elementos caibam e respeitem a borda
            <Card key={driver.id} className={`w-full relative flex flex-row items-center border-l-[6px] hover:shadow-md transition-all h-24 pr-4 ${visual.border}`}>
              
              {/* 1. HORÁRIO (Esquerda Fixa) */}
              <div className="flex flex-col items-center justify-center w-20 h-full bg-gray-50 border-r border-gray-100 shrink-0 rounded-l-lg">
                <StatusIcon className={`w-5 h-5 mb-1 ${status.color} ${driver.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-bold text-gray-600">
                  {new Date(driver.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* 2. CONTEÚDO PRINCIPAL (Flex-1) */}
              <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                
                {/* Linha Superior */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-bold text-base text-gray-900 leading-none truncate mr-1">
                    {driver.name}
                  </h3>
                  
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold border border-gray-200 h-5 px-1.5">
                    {driver.type}
                  </Badge>

                  <div className={`w-2.5 h-2.5 rounded-full ${visual.bg.replace('bg-', 'bg-').replace('50', '500')}`} title={`Grupo ${driver.group}`}></div>

                  {/* ERRO LIMPO */}
                  {driver.status === 'PENDING' && errorText && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 h-5 px-2 text-[10px] truncate max-w-[200px]" title={errorText}>
                       {errorText}
                    </Badge>
                  )}
                </div>
                
                {/* Linha Inferior */}
                <div className="flex items-center gap-3 text-sm text-gray-500 font-mono">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold border border-gray-200 text-xs">
                      {driver.licensePlate}
                  </span>
                  
                  {driver.romaneio && (
                     <span className="flex items-center gap-1 text-gray-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-xs">
                        <span className="text-[9px] uppercase font-bold text-yellow-700">ROM:</span>
                        <span className="font-bold text-gray-900">{driver.romaneio}</span>
                     </span>
                  )}

                  {driver.currentHandler && (
                      <span className="text-blue-600 flex items-center gap-1 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full truncate border border-blue-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {driver.currentHandler.name}
                      </span>
                  )}
                </div>
              </div>

              {/* 3. AÇÕES (Direita Fixa) */}
              {/* Ajustei o gap para 2 e padding-left para 2 para ficar compacto */}
              <div className="shrink-0 flex items-center gap-2 pl-2">
                  <TicketActions driver={driver} />
                  
                  {/* Menu de 3 pontos */}
                  <div className="relative flex items-center">
                     <DriverMenu driver={driver} />
                  </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )

  return (
    <div className="space-y-6">
        {/* BARRA DE COMANDO */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-2 items-center sticky top-20 z-10">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Buscar placa ou nome..." 
                    className="pl-10 h-10 bg-gray-50 border-gray-200 focus-visible:ring-red-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-gray-400 hover:text-black">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            <NewDriverDialog />
        </div>

        {/* ESTEIRA (TABS) */}
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-200 p-1 rounded-lg">
            <TabsTrigger value="todo" className="data-[state=active]:bg-white data-[state=active]:text-black font-bold text-xs sm:text-sm">
               A Fazer ({todoList.length})
            </TabsTrigger>
            <TabsTrigger value="doing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-xs sm:text-sm">
               Em Andamento ({inProgressList.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold text-xs sm:text-sm">
               Pendências ({pendingList.length})
            </TabsTrigger>
            <TabsTrigger value="done" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold text-xs sm:text-sm">
               Concluídos ({doneList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo"><DriverList list={todoList} /></TabsContent>
          <TabsContent value="doing"><DriverList list={inProgressList} /></TabsContent>
          <TabsContent value="pending"><DriverList list={pendingList} /></TabsContent>
          <TabsContent value="done"><DriverList list={doneList} /></TabsContent>
        </Tabs>
    </div>
  )
}