// components/DashboardCharts.tsx
"use client" // <--- ISSO RESOLVE O ERRO

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308'];

interface DashboardChartsProps {
  typeData: { name: string; quantidade: number }[];
  groupData: { name: string; value: number }[];
}

export function DashboardCharts({ typeData, groupData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
      {/* GRÁFICO DE BARRAS */}
      <Card className="col-span-1">
          <CardHeader>
              <CardTitle>Volume por Modalidade</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                          cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="quantidade" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
              </ResponsiveContainer>
          </CardContent>
      </Card>

      {/* GRÁFICO DE PIZZA */}
      <Card className="col-span-1">
          <CardHeader>
              <CardTitle>Demanda por Grupo Operacional</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
                      <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
              </ResponsiveContainer>
          </CardContent>
      </Card>

    </div>
  );
}