import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PrismaClient } from "@prisma/client" // <--- CORREÇÃO 1: Import direto
import { DeleteDriverButton } from "@/components/DeleteDriverButton"
import { EditDriverDialog } from "@/components/EditDriverDialog" // <--- Vamos criar esse arquivo no próximo passo

const prisma = new PrismaClient() // <--- CORREÇÃO 2: Instância direta

// Desabilitar cache para garantir lista sempre nova
export const dynamic = 'force-dynamic';

export default async function DriversPage() {
  const drivers = await prisma.savedDriver.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-bold text-gray-900">Banco de Motoristas</h1>
             <p className="text-gray-500">Gestão dos cadastros permanentes</p>
           </div>
           <Link href="/">
             <Button variant="outline" className="gap-2">
               <ArrowLeft className="w-4 h-4" /> Voltar para Operação
             </Button>
           </Link>
        </div>

        {/* Lista */}
        <Card>
           <CardHeader>
             <CardTitle>Motoristas Cadastrados ({drivers.length})</CardTitle>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Nome</TableHead>
                   <TableHead>Placa</TableHead>
                   <TableHead>Modalidade</TableHead>
                   <TableHead>Grupo</TableHead>
                   <TableHead className="text-right">Ações</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {drivers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                            Nenhum motorista salvo no banco ainda.
                        </TableCell>
                    </TableRow>
                 ) : (
                    drivers.map((driver) => (
                    <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="font-mono">{driver.licensePlate}</TableCell>
                        <TableCell>
                        <Badge variant="secondary">{driver.type}</Badge>
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-bold 
                            ${driver.group === 'VERMELHO' ? 'bg-red-100 text-red-800' : 
                                driver.group === 'AZUL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {driver.group}
                            </span>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                            {/* Botões de Ação */}
                            <EditDriverDialog driver={driver} />
                            <DeleteDriverButton id={driver.id} />
                        </TableCell>
                    </TableRow>
                    ))
                 )}
               </TableBody>
             </Table>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}