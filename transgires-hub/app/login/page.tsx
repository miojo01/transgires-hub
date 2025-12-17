import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/app/actions"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 bg-zinc-900 h-1/2" /> 
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-t-4 border-red-600">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">
            <span className="text-red-600">Transgires</span> Billing Hub
          </CardTitle>
          <CardDescription>Entre para acessar a esteira de faturamento</CardDescription>
        </CardHeader>
        
        <form action={login}>
          <CardContent className="space-y-4 pb-8"> {/* Aumentei o espaço aqui (pb-8) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input id="email" name="email" type="email" placeholder="nome@transgires.com.br" required className="h-10" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input id="password" name="password" type="password" required className="h-10" />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2"> {/* Espaçamento superior extra no rodapé */}
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 text-base shadow-md">
              Acessar Sistema
            </Button>
            <p className="text-sm text-center text-gray-500">
              Não tem conta? <Link href="/register" className="text-red-600 hover:underline font-semibold">Cadastre-se</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}