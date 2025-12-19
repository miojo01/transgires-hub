"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, MessageSquare, Send, Trash2, X, FileText, Truck, MapPin } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { sendMessage, getChatMessages, getUsersWithStatus, deleteMessage } from "@/app/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SocialSidebar({ currentUser }: { currentUser: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  
  // Estado para controlar qual motorista está sendo visualizado no detalhe
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // Polling para manter tudo atualizado
  useEffect(() => {
    const fetchData = async () => {
      const msgs = await getChatMessages()
      const users = await getUsersWithStatus()
      setMessages(msgs)
      setActiveUsers(users)
    }

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim()) return
    await sendMessage(newMessage)
    setNewMessage("")
    const msgs = await getChatMessages()
    setMessages(msgs)
  }

  async function handleDelete(msgId: number) {
    if(confirm("Apagar esta mensagem?")) {
        await deleteMessage(msgId)
        const msgs = await getChatMessages()
        setMessages(msgs)
    }
  }

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??"

  // Cores para os Grupos
  const getGroupColor = (group: string) => {
    switch(group?.toUpperCase()) {
        case 'VERMELHO': return 'bg-red-100 text-red-700 border-red-200';
        case 'AZUL': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'VERDE': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  return (
    <>
        {/* MODAL DE DETALHES DO MOTORISTA (Abre ao clicar) */}
        {selectedTicket && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
                    {/* Cabeçalho do Modal */}
                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" /> Detalhes do Atendimento
                        </h3>
                        <button 
                            onClick={() => setSelectedTicket(null)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Conteúdo do Modal */}
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Motorista</label>
                            <div className="font-bold text-lg text-gray-900 leading-tight">{selectedTicket.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{selectedTicket.licensePlate}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                                    <FileText className="w-3 h-3" /> Romaneio
                                </label>
                                <div className="font-mono font-bold text-gray-800">
                                    {selectedTicket.romaneio || "---"}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                                    <Truck className="w-3 h-3" /> Modalidade
                                </label>
                                <div className="font-bold text-gray-800 text-sm">
                                    {selectedTicket.type || "FROTA"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Grupo Operacional</label>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGroupColor(selectedTicket.group)}`}>
                                {selectedTicket.group || "SEM GRUPO"}
                            </span>
                        </div>
                        
                        {selectedTicket.destiny && (
                            <div className="pt-2 border-t border-gray-100 mt-2">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400" /> 
                                    Destino: <span className="font-semibold">{selectedTicket.destiny}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 border-t text-center">
                        <Button className="w-full bg-black hover:bg-gray-800" onClick={() => setSelectedTicket(null)}>
                            Fechar
                        </Button>
                    </div>
                </div>
            </div>
        )}

        <aside className="w-80 bg-white border-l border-gray-200 hidden lg:flex flex-col h-[calc(100vh-80px)] sticky top-[80px]">
        
        {/* 1. FATURADORES ONLINE */}
        <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
            <Users className="w-3 h-3" /> Faturadores Online
            </h3>
            
            <div className="space-y-4">
            {activeUsers.map(u => {
                const isMe = u.id === currentUser.id
                const isWorking = u.activeTickets && u.activeTickets.length > 0
                const ticket = isWorking ? u.activeTickets[0] : null
                
                return (
                <div key={u.id} className="flex items-center gap-3 relative group">
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <Avatar className="h-9 w-9 border border-gray-100">
                            <AvatarImage src={u.avatarUrl} />
                            <AvatarFallback className={`text-[10px] text-white font-bold ${isMe ? "bg-black" : "bg-blue-600"}`}>
                                {getInitials(u.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isWorking ? "bg-orange-500" : "bg-green-500"}`}></span>
                    </div>
                    
                    {/* Nome e Status (Clicável se estiver trabalhando) */}
                    <div className="flex flex-col leading-tight min-w-0">
                        <span className="text-sm font-bold text-gray-800 truncate">
                            {isMe ? "Você" : u.name}
                        </span>
                        
                        {isWorking ? (
                            <button 
                                onClick={() => setSelectedTicket(ticket)}
                                className="text-[11px] truncate text-orange-600 font-bold hover:underline text-left hover:text-orange-700 cursor-pointer flex items-center gap-1 transition-all"
                                title="Clique para ver detalhes do motorista"
                            >
                                Emitindo {ticket.name.split(" ")[0]}
                                <FileText className="w-3 h-3 inline opacity-50" />
                            </button>
                        ) : (
                            <span className="text-[11px] text-gray-400">Disponível</span>
                        )}
                    </div>
                </div>
                )
            })}
            </div>
        </div>

        {/* 2. CHAT */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Chat Geral
            </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={scrollRef}>
            {messages.map((msg) => {
            const isMe = msg.userId === currentUser.id
            return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 shrink-0 mt-1">
                        <AvatarImage src={msg.user.avatarUrl} />
                        <AvatarFallback className={`text-[10px] text-white ${isMe ? "bg-black" : "bg-blue-600"}`}>
                            {getInitials(msg.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col min-w-0 max-w-[85%] ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="text-[11px] font-bold text-gray-500 uppercase">
                                {isMe ? "Você" : msg.user.name}
                            </span>
                            <span className="text-[10px] text-gray-300">
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                            {isMe && (
                                <button onClick={() => handleDelete(msg.id)} className="text-gray-300 hover:text-red-600" title="Apagar">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div className={`text-sm px-3 py-2 rounded-lg break-words shadow-sm ${
                            isMe 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-slate-700 text-white rounded-tl-none"
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                </div>
            )
            })}
        </div>

        <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
                <Input 
                placeholder="Mensagem..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-gray-50 border-gray-200"
                />
                <Button size="icon" className="bg-red-600 hover:bg-red-700 text-white shrink-0" onClick={handleSend}>
                <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
        </aside>
    </>
  )
}