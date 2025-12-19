"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/app/actions"
import { User } from "@prisma/client"
import { LogOut } from "lucide-react"
import { ProfileDialog } from "./ProfileDialog" // <--- Importe aqui

interface UserNavProps {
  currentUser: User | null
}

export function UserNav({ currentUser }: UserNavProps) {
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "??"

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
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Item de Perfil Customizado */}
        <div className="px-1 py-1">
            <ProfileDialog user={currentUser} />
        </div>

        <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair do sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}