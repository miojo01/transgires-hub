import { getCurrentUser } from "@/app/actions"; // <--- Importe isso
import { UserNav } from "@/components/UserNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrismaClient } from "@prisma/client";
import { Clock, Play, AlertTriangle, CheckCircle2, LayoutDashboard } from "lucide-react";
import { NewDriverDialog } from "@/components/NewDriverDialog";
import { TicketActions } from "@/components/TicketActions";
import Link from "next/link"; // Importante para o botão funcionar
import { redirect } from "next/navigation";
import { DriverMenu } from "@/components/DriverMenu";

const prisma = new PrismaClient();

async function getDrivers() {
  const drivers = await prisma.driver.findMany({
    orderBy: { arrivalTime: 'asc' },
    include: { currentHandler: true }
  });
  return drivers;
}

// 1. CONFIGURAÇÃO VISUAL (Baseada no GRUPO/COR)
const groupConfig: any = {
  "VERMELHO": { border: "border-red-600", bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-800" },
  "AZUL":     { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
  "VERDE":    { border: "border-green-500", bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-800" },
};

// 2. CONFIGURAÇÃO DE STATUS
const statusConfig: any = {
  "TODO": { label: "Aguardando", icon: Clock, color: "text-gray-500" },
  "IN_PROGRESS": { label: "Em Andamento", icon: Play, color: "text-blue-600" },
  "PENDING": { label: "Pendente", icon: AlertTriangle, color: "text-red-500" },
  "DONE": { label: "Concluído", icon: CheckCircle2, color: "text-green-600" },
};

export default async function Home() {
  const drivers = await getDrivers();
  const currentUser = await getCurrentUser();
  const allUsers = await prisma.user.findMany();

  if (!currentUser) {
    redirect("/login");
  }

  // Separar as listas
  const todoList = drivers.filter(d => d.status === 'TODO');
  const inProgressList = drivers.filter(d => d.status === 'IN_PROGRESS');
  const pendingList = drivers.filter(d => d.status === 'PENDING');
  const doneList = drivers.filter(d => d.status === 'DONE');

  // Componente de Lista Reutilizável
  const DriverList = ({ list }: { list: any[] }) => (
    <div className="space-y-3 mt-4">
      {list.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-gray-50 text-gray-400">
          Nenhum item nesta etapa.
        </div>
      ) : (
        list.map((driver) => {
          // AQUI A MÁGICA: Cor vem do Grupo, Texto vem do Tipo
          const visual = groupConfig[driver.group] || groupConfig["VERMELHO"];
          const status = statusConfig[driver.status];
          const StatusIcon = status.icon;

          return (
            <Card key={driver.id} className={`flex flex-row items-center justify-between overflow-hidden border-l-[6px] hover:shadow-md transition-all h-24 ${visual.border}`}>
              
              {/* Coluna 1: Horário */}
              <div className="flex flex-col items-center justify-center w-24 h-full bg-gray-50 border-r border-gray-100 shrink-0">
                <StatusIcon className={`w-6 h-6 mb-1 ${status.color} ${driver.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-bold text-gray-600">
                  {driver.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Coluna 2: Dados Centrais */}
              <div className="flex-1 px-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 leading-none">{driver.name}</h3>
                  
                  {/* Badge de Modalidade (Neutro) */}
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold border border-gray-200">
                    {driver.type}
                  </Badge>

                  {/* Bolinha indicando a cor do Grupo */}
                  <div className={`w-3 h-3 rounded-full ${visual.bg.replace('bg-', 'bg-').replace('50', '500')}`} title={`Grupo ${driver.group}`}></div>

                  {driver.status === 'PENDING' && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                       Travado em: {driver.failedStep}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 font-mono mt-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold border border-gray-200">
                      {driver.licensePlate}
                  </span>
                  {driver.currentHandler && (
                      <span className="text-blue-600 flex items-center gap-1 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {driver.currentHandler.name}
                      </span>
                  )}
                </div>
              </div>

              {/* Coluna 3: Ações */}
              <div className="pr-4 shrink-0 flex items-center gap-2">
                  <TicketActions driver={driver} />
                  
                  {/* Menu de Opções (Só aparece se NÃO estiver concluído para evitar bagunça no histórico) */}
                  {driver.status !== 'DONE' && (
                     <DriverMenu driver={driver} />
                  )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* --- HEADER ATUALIZADO --- */}
      <header className="bg-black text-white p-4 shadow-md border-b-4 border-red-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-red-600">Transgires</span> Billing Hub
              </h1>
              <p className="text-xs text-gray-400">
                Olá, <span className="text-white font-bold">{currentUser?.name || "Visitante"}</span>
              </p>
            </div>

            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border-0 h-9">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Métricas
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Métricas Rápidas */}
             <div className="hidden md:flex gap-6 text-sm mr-4">
                <div className="flex flex-col items-center">
                    <span className="text-gray-400">Na Fila</span>
                    <span className="font-bold text-xl">{todoList.length}</span>
                </div>
                <div className="flex flex-col items-center text-blue-400">
                    <span className="text-blue-200/70">Emissão</span>
                    <span className="font-bold text-xl">{inProgressList.length}</span>
                </div>
             </div>

             {/* O NOVO SELETOR DE USUÁRIO */}
             <UserNav currentUser={currentUser} allUsers={allUsers} />
          </div>
        </div>
      </header>

      {/* --- CORPO --- */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* COMANDOS */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-2 items-center">
            <Input placeholder="Buscar placa..." className="flex-1" />
            <NewDriverDialog />
        </div>

        {/* ESTEIRA (TABS) */}
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-200 p-1 rounded-lg">
            <TabsTrigger value="todo" className="data-[state=active]:bg-white data-[state=active]:text-black font-bold">
               A Fazer ({todoList.length})
            </TabsTrigger>
            <TabsTrigger value="doing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">
               Em Andamento ({inProgressList.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold">
               Pendências ({pendingList.length})
            </TabsTrigger>
            <TabsTrigger value="done" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold">
               Concluídos ({doneList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo">
             <h2 className="text-sm font-semibold text-gray-500 mt-4 mb-2 uppercase">Aguardando Emissão</h2>
             <DriverList list={todoList} />
          </TabsContent>
          
          <TabsContent value="doing">
             <h2 className="text-sm font-semibold text-blue-600 mt-4 mb-2 uppercase">Sendo emitidos agora</h2>
             <DriverList list={inProgressList} />
          </TabsContent>

          <TabsContent value="pending">
             <h2 className="text-sm font-semibold text-red-600 mt-4 mb-2 uppercase">Precisam de Atenção</h2>
             <DriverList list={pendingList} />
          </TabsContent>

          <TabsContent value="done">
             <h2 className="text-sm font-semibold text-green-600 mt-4 mb-2 uppercase">Finalizados Hoje</h2>
             <DriverList list={doneList} />
          </TabsContent>
        </Tabs>

      </div>
    </main>
  );
}