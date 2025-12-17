"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { login, logout } from "@/app/actions"
import { User } from "@prisma/client"
import { LogOut, UserCircle, Users } from "lucide-react"

interface UserNavProps {
  currentUser: User | null
  allUsers: User[]
}

export function UserNav({ currentUser, allUsers }: UserNavProps) {
  
  // Função para pegar as iniciais do nome (Ex: Leonardo Batz -> LB)
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-600">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser?.avatarUrl || ""} alt={currentUser?.name} />
            <AvatarFallback className="bg-gray-800 text-white font-bold">
                {currentUser ? getInitials(currentUser.name) : "?"}
            </AvatarFallback>
          </Avatar>
          {/* Bolinha de Status Online */}
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-black" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name || "Visitante"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email || "Selecione um usuário"}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-gray-400">TROCAR USUÁRIO (Simulação)</DropdownMenuLabel>
          
          {allUsers.map((user) => (
            <DropdownMenuItem key={user.id} onClick={() => login(user.id)} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4 text-gray-500" />
              <span>{user.name}</span>
              {currentUser?.id === user.id && <span className="ml-auto text-xs font-bold text-green-600">✔</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair do sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}