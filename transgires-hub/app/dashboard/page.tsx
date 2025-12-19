import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardFilter } from "@/components/DashboardFilter"; // <--- Importa o filtro

const prisma = new PrismaClient();

// Correção para Next.js 15: searchParams é Promise
export default async function DashboardPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams;
  
  // 1. FILTRO DE DATA
  const filterDateStr = searchParams.date || new Date().toISOString().split('T')[0];
  const startDate = new Date(filterDateStr);
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  startDate.setHours(0,0,0,0);
  
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  // 2. BUSCAR DADOS FILTRADOS NO BANCO
  const drivers = await prisma.driver.findMany({
    where: {
      updatedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { finishedBy: true }
  });

  // 3. PROCESSAR MÉTRICAS
  const total = drivers.length;
  const done = drivers.filter(d => d.status === 'DONE').length;
  const pending = drivers.filter(d => d.status === 'PENDING').length;
  const todo = drivers.filter(d => d.status === 'TODO').length;
  
  // Dados para Gráficos
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

  // Ranking (Melhoria permitida)
  const rankingMap = new Map<string, number>();
  drivers.filter(d => d.status === 'DONE').forEach(d => {
      const name = d.finishedBy?.name || 'Desconhecido';
      rankingMap.set(name, (rankingMap.get(name) || 0) + 1);
  });
  const ranking = Array.from(rankingMap.entries()).sort((a,b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* HEADER IGUAL FOTO + FILTRO */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Operacional</h1>
            <p className="text-gray-500">Visão geral da performance do dia</p>
        </div>
        <div className="flex items-center gap-3">
            {/* O SELETOR DE DATA ENTRA AQUI DISCRETAMENTE */}
            <DashboardFilter defaultDate={filterDateStr} />
            
            <Link href="/">
                <Button variant="outline" className="gap-2 bg-white">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Fila
                </Button>
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CARDS KPI (IGUAL FOTO) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Motoristas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                    <p className="text-xs text-gray-500">Registrados em {new Intl.DateTimeFormat('pt-BR').format(startDate)}</p>
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

        {/* GRÁFICOS */}
        <DashboardCharts typeData={typeData} groupData={groupData} />

        {/* RANKING (MELHORIA NO FINAL DA PÁGINA) */}
        {ranking.length > 0 && (
            <Card>
                <CardHeader>
                     <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" /> Ranking do Período
                     </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {ranking.map(([name, count], index) => (
                            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-400 text-sm">#{index + 1}</span>
                                    <span className="font-bold text-gray-700">{name}</span>
                                </div>
                                <span className="text-sm font-bold text-blue-600">{count} emissões</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

      </div>
    </div>
  );
}