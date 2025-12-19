"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"

export function DashboardCharts({ typeData, groupData }: { typeData: any[], groupData: any[] }) {
  const COLORS = ['#ef4444', '#3b82f6', '#22c55e'] // Vermelho, Azul, Verde (para a rosca)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GRÁFICO DE BARRAS (Igual foto: Volume por Modalidade) */}
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Volume por Modalidade</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={typeData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                            {/* Cor da barra escura conforme a imagem */}
                            <Bar dataKey="quantidade" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* GRÁFICO DE ROSCA (Igual foto: Demanda por Grupo) */}
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Demanda por Grupo Operacional</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={groupData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {groupData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Legenda simples */}
                <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
                    {groupData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {entry.name}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}