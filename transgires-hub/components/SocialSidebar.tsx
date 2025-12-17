"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Circle, Truck, MessageSquare } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { sendMessage, getChatMessages, getUsersWithStatus } from "@/app/actions"
import { User } from "@prisma/client"

// Tipo para o usuário com os tickets ativos
type UserWithStatus = User & {
  activeTickets: { licensePlate: string; name: string }[]
}

export function SocialSidebar({ currentUser }: { currentUser: any }) {
  const [users, setUsers] = useState<UserWithStatus[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Função para carregar dados (Polling simples a cada 3s)
  async function refreshData() {
    const u = await getUsersWithStatus()
    const m = await getChatMessages()
    setUsers(u)
    setMessages(m)
  }

  // Efeito de "Tempo Real"
  useEffect(() => {
    refreshData() // Carrega na hora
    const interval = setInterval(refreshData, 3000) // Atualiza a cada 3s
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    // Envia e limpa o campo imediatamente
    await sendMessage(newMessage)
    setNewMessage("")
    refreshData()
  }

  // Função auxiliar para iniciais
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase()

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-[calc(100vh-80px)] sticky top-20 shadow-sm hidden xl:flex">
      
      {/* 1. LISTA DE COLEGAS (STATUS) */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
           <Truck className="w-3 h-3" /> Faturadores Online
        </h3>
        <div className="space-y-3">
          {users.map((user) => {
            const isMe = user.id === currentUser?.id
            // Verifica se está trabalhando em algo
            const activeJob = user.activeTickets[0] 
            const isBusy = !!activeJob

            return (
              <div key={user.id} className="flex items-start gap-3">
                <div className="relative">
                   <Avatar className="h-8 w-8 border border-gray-200">
                     <AvatarImage src={user.avatarUrl || ""} />
                     <AvatarFallback className="text-[10px] bg-gray-900 text-white">
                        {getInitials(user.name)}
                     </AvatarFallback>
                   </Avatar>
                   {/* Bolinha de Status */}
                   <span className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${isBusy ? 'bg-orange-500' : 'bg-green-500'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-black' : 'text-gray-700'}`}>
                        {isMe ? "Você" : user.name.split(" ")[0]}
                    </p>
                  </div>
                  
                  {/* O GRANDE DIFERENCIAL: Mostra o que ele está fazendo */}
                  {isBusy ? (
                    <div className="text-[10px] text-orange-600 font-medium flex items-center gap-1 mt-0.5 animate-pulse">
                       <span>Emitindo {activeJob.licensePlate}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400">Disponível</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. CHAT DO SETOR */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Chat Geral
            </h3>
        </div>
        
        {/* Área das Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" ref={scrollRef}>
           {messages.length === 0 && (
             <p className="text-center text-xs text-gray-400 mt-10">Nenhuma mensagem hoje.</p>
           )}
           {messages.map((msg) => {
             const isMe = msg.userId === currentUser?.id
             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${isMe ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-700 shadow-sm'}`}>
                     {!isMe && <span className="block text-[9px] text-gray-400 font-bold mb-0.5">{msg.user.name.split(" ")[0]}</span>}
                     {msg.content}
                  </div>
                  <span className="text-[9px] text-gray-300 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
               </div>
             )
           })}
        </div>

        {/* Área de Digitar */}
        <div className="p-3 bg-white border-t border-gray-200">
           <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mensagem..." 
                className="h-8 text-xs bg-gray-50" 
              />
              <Button size="icon" className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white shrink-0">
                 <Send className="w-3 h-3" />
              </Button>
           </form>
        </div>
      </div>
    </div>
  )
}