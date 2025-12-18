"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, CheckCircle2, AlertTriangle, Truck, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { ticketAction } from "@/app/actions"

interface WorkDeskProps {
  driver: any
}

export function WorkDesk({ driver }: WorkDeskProps) {
  const [open, setOpen] = useState(false)
  const [pendingReason, setPendingReason] = useState("")
  const [showPendingInput, setShowPendingInput] = useState(false)
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const allTasks = [
    { id: "notes",    label: "1. Conferência de Notas Fiscais" },
    { id: "cte",      label: "2. Emissão do CT-e" },
    { id: "contract", label: "3. Emissão de Contrato (Agregado/Terceiro)", requiredFor: ["TERCEIRO", "AGREGADO"] },
    { id: "mdfe",     label: "4. Emissão do MDF-e" },
    { id: "gnre",     label: "5. Verificar/Emitir Guias (GNRE)" }
  ]

  const tasks = allTasks.filter(task => {
    if (!task.requiredFor) return true 
    return task.requiredFor.includes(driver.type)
  })

  useEffect(() => {
    if (open && driver.failedStep && driver.failedStep.includes("[Parou em:")) {
       const match = driver.failedStep.match(/\[Parou em: (.*?)\]/)
       if (match && match[1]) {
          const failedLabel = match[1]
          const failedIndex = tasks.findIndex(t => t.label === failedLabel)
          if (failedIndex > 0) {
             const itemsToAutoCheck = tasks.slice(0, failedIndex).map(t => t.id)
             setCheckedItems(itemsToAutoCheck)
          }
       }
    }
  }, [open, driver.failedStep])

  const isChecklistComplete = tasks.every(task => checkedItems.includes(task.id))

  const toggleItem = (id: string, index: number) => {
    const isEnabled = index === 0 || checkedItems.includes(tasks[index - 1].id)
    if (!isEnabled) return

    setCheckedItems(prev => {
      if (prev.includes(id)) {
        const idsToKeep = tasks.slice(0, index).map(t => t.id)
        return prev.filter(item => idsToKeep.includes(item))
      } else {
        return [...prev, id]
      }
    })
  }

  const currentStageName = tasks.find(t => !checkedItems.includes(t.id))?.label || "Finalização"

  async function handleFinish() {
    await ticketAction(driver.id, 'FINISH')
    setOpen(false)
  }

  async function handlePending() {
    if (!pendingReason.trim()) return
    const finalReason = `[Parou em: ${currentStageName}] - ${pendingReason}`
    await ticketAction(driver.id, 'BLOCK', finalReason)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* CORREÇÃO: Removi w-full e adicionei px-4 para ficar compacto e bonito no card */}
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 shadow-sm px-4">
           <FileText className="w-4 h-4 mr-2" /> 
           Iniciar Atendimento
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
              <Truck className="w-6 h-6 text-blue-600" />
              Checklist Sequencial
          </DialogTitle>
          <div className="text-sm text-gray-500 mt-1 flex flex-col">
             <span className="font-bold text-black text-lg">{driver.name}</span>
             <div className="flex gap-2 text-xs items-center mt-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono border">{driver.licensePlate}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded border">{driver.type}</span>
                {driver.romaneio && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200 font-bold">
                        ROM: {driver.romaneio}
                    </span>
                )}
             </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
            
            {!showPendingInput && (
                <div className="space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Label className="text-gray-500 text-xs font-bold uppercase mb-3 block">
                        Etapas Obrigatórias
                    </Label>
                    
                    {tasks.map((task, index) => {
                        const isEnabled = index === 0 || checkedItems.includes(tasks[index - 1].id)
                        const isChecked = checkedItems.includes(task.id)

                        return (
                            <div 
                                key={task.id} 
                                className={`flex items-center space-x-3 p-3 rounded border transition-all ${
                                    isEnabled 
                                        ? 'bg-white border-gray-200 shadow-sm' 
                                        : 'bg-gray-100 border-transparent opacity-60 cursor-not-allowed'
                                }`}
                            >
                                <div className="relative flex items-center justify-center">
                                    <Checkbox 
                                        id={task.id} 
                                        checked={isChecked}
                                        disabled={!isEnabled} 
                                        onCheckedChange={() => toggleItem(task.id, index)}
                                        className={!isEnabled ? "data-[state=unchecked]:bg-gray-200 border-gray-400" : "border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"}
                                    />
                                    {!isEnabled && !isChecked && (
                                        <Lock className="w-3 h-3 text-gray-400 absolute -right-6" />
                                    )}
                                </div>

                                <label 
                                    htmlFor={task.id} 
                                    className={`text-sm font-medium leading-none flex-1 py-1 ${
                                        !isEnabled ? 'cursor-not-allowed text-gray-400' : 
                                        isChecked ? 'text-blue-700 font-bold' : 'cursor-pointer text-gray-700'
                                    }`}
                                >
                                    {task.label}
                                </label>
                            </div>
                        )
                    })}
                </div>
            )}

            {showPendingInput && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-bold text-sm">Problema em: {currentStageName}</span>
                    </div>
                    <Label className="text-red-700 text-xs font-bold mb-1 block">Descrição do Erro</Label>
                    <Textarea 
                        placeholder={`Descreva o que impediu a conclusão da etapa "${currentStageName}"...`}
                        value={pendingReason}
                        onChange={e => setPendingReason(e.target.value)}
                        className="bg-white border-red-200 focus-visible:ring-red-500"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowPendingInput(false)}>Cancelar</Button>
                        <Button size="sm" variant="destructive" onClick={handlePending}>Confirmar Bloqueio</Button>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-4 border-t pt-4 mt-2">
            
            {!showPendingInput && (
                <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm" onClick={() => setShowPendingInput(true)}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Reportar Erro na Etapa Atual
                </Button>
            )}
            
            {!showPendingInput && (
                <Button 
                    onClick={handleFinish} 
                    disabled={!isChecklistComplete} 
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto ml-auto px-6 font-bold disabled:opacity-50 disabled:bg-gray-400"
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isChecklistComplete ? "Finalizar e Liberar" : "Complete o Checklist"}
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}