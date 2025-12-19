import { getCurrentUser, getRanking } from "@/app/actions";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/UserNav";
import { SocialSidebar } from "@/components/SocialSidebar";
import { DashboardManager } from "@/components/DashboardManager";
import { LayoutDashboard, Users, Trophy } from "lucide-react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Funcionalidade Nova: Ranking
  const ranking = await getRanking();

  // Busca Drivers
  const drivers = await prisma.driver.findMany({
    orderBy: { arrivalTime: 'asc' },
    include: { currentHandler: true }
  });

  // --- LÓGICA DE ZERAR FILA DIÁRIA ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleDrivers = drivers.filter(d => {
    if (d.status === 'DONE') {
      // Só mostra DONE se foi atualizado HOJE
      return new Date(d.updatedAt) >= today; 
    }
    return true;
  });

  // Métricas para o Header
  const todoCount = visibleDrivers.filter(d => d.status === 'TODO').length;
  const doingCount = visibleDrivers.filter(d => d.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- HEADER --- */}
      <header className="bg-black text-white p-4 shadow-md border-b-4 border-red-600 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4">
          
          <div className="flex items-center gap-8">
            {/* LOGO/TEXTO EXATAMENTE COMO NA IMAGEM ENVIADA */}
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-red-600">Transgires</span> <span className="text-white">Billing Hub</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Olá, <span className="text-white font-bold">{currentUser.name}</span>
                </p>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-700 pl-6 h-10">
                <Link href="/drivers">
                  <Button variant="secondary" size="sm" className="bg-gray-800 text-gray-200 hover:bg-gray-700 border-0 h-9">
                    <Users className="w-4 h-4 mr-2" /> Motoristas
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm" className="bg-gray-800 text-gray-200 hover:bg-gray-700 border-0 h-9">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Métricas
                  </Button>
                </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* RANKING (Funcionalidade nova mantida discreta) */}
             <div className="hidden lg:flex items-center gap-2 bg-gray-900 px-3 py-1 rounded border border-gray-700 mr-4">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <div className="flex -space-x-2">
                    {ranking.slice(0, 3).map((u, i) => (
                        <div key={u.id} className="w-6 h-6 rounded-full bg-gray-700 border border-black flex items-center justify-center text-[10px] font-bold text-white relative group cursor-help">
                            {u.name.substring(0,2).toUpperCase()}
                            <span className="absolute -bottom-8 bg-black text-white text-[10px] p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                                {i+1}º {u.name} ({u._count.finishedDrivers})
                            </span>
                        </div>
                    ))}
                </div>
             </div>

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

      <div className="flex max-w-screen-2xl mx-auto items-start">
          <main className="flex-1 p-6 min-w-0">
             <DashboardManager drivers={visibleDrivers} currentUser={currentUser} />
          </main>
          <SocialSidebar currentUser={currentUser} />
      </div>
      
    </div>
  );
}