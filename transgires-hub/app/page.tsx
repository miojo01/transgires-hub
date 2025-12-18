import { getCurrentUser } from "@/app/actions";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/UserNav";
import { SocialSidebar } from "@/components/SocialSidebar";
import { DashboardManager } from "@/components/DashboardManager";
// AQUI ESTAVA O ERRO: Agora temos apenas UMA linha importando os ícones
import { LayoutDashboard, Users } from "lucide-react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

// Desabilitar cache para garantir dados frescos
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Segurança
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // 2. Dados
  const drivers = await prisma.driver.findMany({
    orderBy: { arrivalTime: 'asc' },
    include: { currentHandler: true }
  });

  // Métricas para o Header
  const todoCount = drivers.filter(d => d.status === 'TODO').length;
  const doingCount = drivers.filter(d => d.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- HEADER --- */}
      <header className="bg-black text-white p-4 shadow-md border-b-4 border-red-600 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4">
          
          {/* LADO ESQUERDO: Logo + Saudação + Botões */}
          <div className="flex items-center gap-8">
            {/* Logo e Saudação */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-red-600">Transgires</span> Billing Hub
              </h1>
              <p className="text-xs text-gray-400">
                Olá, <span className="text-white font-bold">{currentUser.name}</span>
              </p>
            </div>

            {/* --- GRUPO DE BOTÕES DE GESTÃO --- */}
            <div className="flex items-center gap-2 border-l border-gray-700 pl-6 h-10">
                
                {/* Botão 1: Banco de Motoristas */}
                <Link href="/drivers">
                  <Button variant="secondary" size="sm" className="bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border-0 h-9">
                    <Users className="w-4 h-4 mr-2" />
                    Motoristas
                  </Button>
                </Link>

                {/* Botão 2: Métricas */}
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm" className="bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border-0 h-9">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Métricas
                  </Button>
                </Link>
            </div>
          </div>
          
          {/* LADO DIREITO: Contadores Rápidos + Avatar */}
          <div className="flex items-center gap-6">
             <div className="hidden md:flex gap-6 text-sm mr-4">
                <div className="flex flex-col items-center">
                    <span className="text-gray-400">Na Fila</span>
                    <span className="font-bold text-xl">{todoCount}</span>
                </div>
                <div className="flex flex-col items-center text-blue-400">
                    <span className="text-blue-200/70">Emissão</span>
                    <span className="font-bold text-xl">{doingCount}</span>
                </div>
             </div>
             <UserNav currentUser={currentUser} />
          </div>
        </div>
      </header>

      {/* --- CORPO DA PÁGINA --- */}
      <div className="flex max-w-screen-2xl mx-auto items-start">
          
          {/* ÁREA PRINCIPAL (Esquerda) */}
          <main className="flex-1 p-6 min-w-0">
             <DashboardManager drivers={drivers} currentUser={currentUser} />
          </main>

          {/* BARRA LATERAL (Direita) */}
          <SocialSidebar currentUser={currentUser} />
      
      </div>
    </div>
  );
}