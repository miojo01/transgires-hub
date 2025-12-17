"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle2, AlertTriangle, Lock } from "lucide-react"
import { useState } from "react"
import { finishService, sendToPending, advanceStep } from "@/app/actions"

interface WorkDeskProps {
  driver: any
  children: React.ReactNode
}

export function WorkDesk({ driver, children }: WorkDeskProps) {
  const [open, setOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState(false)
  const [reason, setReason] = useState("")

  // Definição dos Passos baseada no Tipo
  const isFrota = driver.type === "FROTA"
  const steps = isFrota 
    ? ["Conferir Cargas e Documentos", "Emitir CT-e", "Emitir MDF-e"]
    : ["Conferir Cargas e Documentos", "Emitir CT-e", "Gerar e Assinar Contrato", "Emitir MDF-e"]

  const currentStepIndex = driver.currentStep || 0
  const isFinished = currentStepIndex >= steps.length

  // Marcar Checkbox (Lógica Sequencial)
  async function handleCheck(index: number) {
    // Só permite marcar se for o passo exato atual
    if (index === currentStepIndex) {
      // Otimisticamente avança na UI (o revalidate do server confirmará)
      await advanceStep(driver.id, index + 1)
    }
  }

  async function handleFinish() {
    if (!isFinished) return;
    await finishService(driver.id)
    setOpen(false)
  }

  async function handlePending() {
    if(!reason) return alert("A descrição do erro é obrigatória.")
    
    // Pega o nome da etapa onde o usuário travou
    const currentStepName = steps[currentStepIndex] || "Etapa Final"
    
    await sendToPending(driver.id, reason, currentStepName)
    setOpen(false)
    setPendingMode(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      
      <SheetContent className="sm:max-w-md border-l-4 border-red-600 bg-gray-50 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
             <span className="font-mono bg-black text-white px-2 py-1 rounded text-sm">{driver.licensePlate}</span>
             {driver.name}
          </SheetTitle>
          <SheetDescription>
            Etapa Atual: <strong className="text-red-600">{steps[currentStepIndex] || "Pronto para finalizar"}</strong>
          </SheetDescription>
        </SheetHeader>

        {!pendingMode ? (
          <div className="space-y-6">
            {/* CHECKLIST BLINDADO */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <FileText className="w-4 h-4" /> Procedimento Obrigatório
              </h3>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isLocked = index > currentStepIndex;

                  return (
                    <div 
                      key={index} 
                      onClick={() => isCurrent && handleCheck(index)}
                      className={`
                        flex items-center space-x-3 p-3 rounded border transition-all
                        ${isCompleted ? 'bg-green-50 border-green-200 text-green-700' : ''}
                        ${isCurrent ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-200 cursor-pointer' : ''}
                        ${isLocked ? 'bg-gray-100 border-gray-100 opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isCompleted ? 'bg-green-600 border-green-600' : 'border-gray-300'}
                        ${isCurrent ? 'border-blue-500' : ''}
                      `}>
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      
                      <span className={`text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {step}
                      </span>
                      
                      {isLocked && <Lock className="w-3 h-3 text-gray-400 ml-auto" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <SheetFooter className="flex-col gap-3 sm:flex-col">
              <Button 
                onClick={handleFinish} 
                disabled={!isFinished} // TRAVA O BOTÃO
                className={`w-full h-12 text-lg shadow-lg transition-all ${isFinished ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {isFinished ? (
                   <> <CheckCircle2 className="mr-2 h-5 w-5" /> Concluir Processo </>
                ) : (
                   `Complete ${steps.length - currentStepIndex} etapas para finalizar`
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setPendingMode(true)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-transparent hover:border-orange-200"
              >
                Reportar Problema na Etapa Atual
              </Button>
            </SheetFooter>
          </div>
        ) : (
          /* TELA DE PENDÊNCIA COM CONTEXTO */
          <div className="space-y-4 animate-in fade-in slide-in-from-right-10">
             <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-900 text-sm">
                <div className="font-bold flex items-center gap-2 mb-1">
                   <AlertTriangle className="w-4 h-4" />
                   Travando em: {steps[currentStepIndex] || "Geral"}
                </div>
                <p>Descreva exatamente o que impediu a conclusão desta etapa.</p>
             </div>
             
             <div className="grid gap-2">
                <Label>Descrição do Erro</Label>
                <Textarea 
                  placeholder="Ex: O sistema da SEFAZ rejeitou o CT-e por erro de alíquota..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-white min-h-[100px]"
                />
             </div>

             <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setPendingMode(false)}>Cancelar</Button>
                <Button onClick={handlePending} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                   Confirmar Erro
                </Button>
             </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}