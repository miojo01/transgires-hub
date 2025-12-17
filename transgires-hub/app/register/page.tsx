import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { register } from "@/app/actions"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="absolute inset-0 bg-zinc-900 h-1/2" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-t-4 border-red-600">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">Criar Acesso</CardTitle>
          <CardDescription>Cadastro de Faturador Transgires</CardDescription>
        </CardHeader>
        
        <form action={register}>
          <CardContent className="space-y-4 pb-8"> {/* Mais respiro aqui */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" placeholder="Ex: João Silva" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input id="email" name="email" type="email" required className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required className="h-10" />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-11 text-base shadow-md">
              Criar Conta
            </Button>
            <p className="text-sm text-center text-gray-500">
              Já tem acesso? <Link href="/login" className="text-red-600 hover:underline font-semibold">Faça Login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}