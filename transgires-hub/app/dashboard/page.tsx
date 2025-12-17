// app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/DashboardCharts"; // <--- Importamos o novo componente

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // 1. BUSCAR DADOS (Backend/Server)
  const drivers = await prisma.driver.findMany();

  // 2. PROCESSAR MÉTRICAS
  const total = drivers.length;
  const done = drivers.filter(d => d.status === 'DONE').length;
  const pending = drivers.filter(d => d.status === 'PENDING').length;
  const todo = drivers.filter(d => d.status === 'TODO').length;
  
  // 3. PREPARAR DADOS PARA OS GRÁFICOS
  const groupData = [
    { name: 'Vermelho', value: drivers.filter(d => d.group === 'VERMELHO').length },
    { name: 'Azul', value: drivers.filter(d => d.group === 'AZUL').length },
    { name: 'Verde', value: drivers.filter(d => d.group === 'VERDE').length },
  ].filter(d => d.value > 0);

  const typeData = [
    { name: 'Frota', quantidade: drivers.filter(d => d.type === 'FROTA').length },
    { name: 'Agregado', quantidade: drivers.filter(d => d.type === 'AGREGADO').length },
    { name: 'Terceiro', quantidade: drivers.filter(d => d.type === 'TERCEIRO').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Operacional</h1>
            <p className="text-gray-500">Visão geral da performance do dia</p>
        </div>
        <Link href="/">
            <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar para Fila
            </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CARDS DE KPI (Server Side Rendered - Rápido!) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Motoristas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                    <p className="text-xs text-gray-500">Registrados hoje</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{done}</div>
                    <p className="text-xs text-gray-500">Documentos emitidos</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendências</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{pending}</div>
                    <p className="text-xs text-gray-500">Travados na operação</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fila Atual</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{todo}</div>
                    <p className="text-xs text-gray-500">Aguardando atendimento</p>
                </CardContent>
            </Card>
        </div>

        {/* COMPONENTE CLIENT-SIDE (Aqui entram os gráficos) */}
        <DashboardCharts typeData={typeData} groupData={groupData} />

      </div>
    </div>
  );
}