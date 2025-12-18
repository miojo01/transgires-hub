"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

// ==========================================
// 1. AUTENTICAÇÃO E USUÁRIOS
// ==========================================

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Preencha tudo!" }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.password !== password) {
    return { error: "Email ou senha inválidos" }
  }

  const cookieStore = await cookies()
  cookieStore.set("userId", user.id)
  
  redirect("/")
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) return { error: "Preencha tudo!" }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email já cadastrado" }

  await prisma.user.create({
    data: { name, email, password, avatarUrl: "" }
  })

  redirect("/login")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  redirect("/login")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) return null

  return await prisma.user.findUnique({ where: { id: userId } })
}

// ==========================================
// 2. GESTÃO DA FILA (TICKETS)
// ==========================================

// Criar Ticket Manualmente
export async function createAndQueueDriver(formData: FormData) {
  const name = formData.get("name") as string
  const licensePlate = (formData.get("licensePlate") as string).toUpperCase()
  const type = formData.get("type") as string
  const group = formData.get("group") as string
  const romaneio = formData.get("romaneio") as string

  // Verifica duplicidade no banco fixo (apenas alerta)
  const existing = await prisma.savedDriver.findUnique({
    where: { licensePlate }
  })

  if (existing) {
    return { error: `Motorista com placa ${licensePlate} já cadastrado! Use a aba 'Lista de Motoristas'.` }
  }

  // 1. Salva no Banco Eterno
  await prisma.savedDriver.create({
    data: { name, licensePlate, type, group }
  })

  // 2. Cria o Ticket na Fila
  await prisma.driver.create({
    data: {
      name,
      licensePlate,
      type,
      group,
      romaneio,
      status: "TODO",
      arrivalTime: new Date(),
    },
  })

  revalidatePath("/")
  return { success: true }
}

// Usar Motorista da Lista (Cria Ticket)
export async function queueExistingDriver(savedDriverId: number, romaneio: string) {
  const saved = await prisma.savedDriver.findUnique({ where: { id: savedDriverId } })
  
  if (!saved) return

  await prisma.driver.create({
    data: {
      name: saved.name,
      licensePlate: saved.licensePlate,
      type: saved.type,
      group: saved.group,
      romaneio: romaneio,
      status: "TODO",
      arrivalTime: new Date(),
    },
  })
  
  revalidatePath("/")
}

// Ações Gerais da Esteira (Start, Block, Finish)
// Em app/actions.ts

export async function ticketAction(driverId: number, action: string, reason?: string) {
  const user = await getCurrentUser()
  if (!user) return

  if (action === 'START') {
    await prisma.driver.update({
      where: { id: driverId },
      data: { 
        status: 'IN_PROGRESS', 
        currentHandlerId: user.id,
        // REMOVIDO: failedStep: null (Mantemos o erro para saber onde parou)
      }
    })
  }
  
  if (action === 'BLOCK') {
    await prisma.driver.update({
      where: { id: driverId },
      data: { 
        status: 'PENDING', 
        failedStep: reason || "Motivo não informado" 
      }
    })
  }

  if (action === 'FINISH') {
    await prisma.driver.update({
      where: { id: driverId },
      data: { 
        status: 'DONE',
        currentHandlerId: null,
        failedStep: null // Aqui sim limpamos, pois acabou
      }
    })
  }

  revalidatePath("/")
}

// AVANÇAR ETAPA DO CHECKLIST (A função que estava faltando/duplicada)
export async function advanceStep(driverId: number) {
  await prisma.driver.update({
    where: { id: driverId },
    data: { 
      currentStep: { increment: 1 } 
    }
  })
  revalidatePath("/")
}

// Editar Ticket Ativo (Fila)
export async function updateDriver(driverId: number, formData: FormData) {
  const name = formData.get("name") as string
  const licensePlate = formData.get("licensePlate") as string
  const type = formData.get("type") as string
  const group = formData.get("group") as string
  const romaneio = formData.get("romaneio") as string

  await prisma.driver.update({
    where: { id: driverId },
    data: {
      name,
      licensePlate: licensePlate.toUpperCase(),
      type,
      group,
      romaneio
    }
  })
  revalidatePath("/")
}

// Excluir Ticket da Fila
export async function deleteDriver(driverId: number) {
  await prisma.driver.delete({ where: { id: driverId } })
  revalidatePath("/")
}

// ==========================================
// 3. GESTÃO DO BANCO DE DADOS (SAVED DRIVERS)
// ==========================================

export async function getSavedDrivers() {
  return await prisma.savedDriver.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function updateSavedDriver(id: number, formData: FormData) {
  await prisma.savedDriver.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      licensePlate: (formData.get("licensePlate") as string).toUpperCase(),
      type: formData.get("type") as string,
      group: formData.get("group") as string,
    }
  })
  revalidatePath("/drivers")
}

export async function deleteSavedDriver(id: number) {
  await prisma.savedDriver.delete({ where: { id } })
  revalidatePath("/drivers")
}

export async function getDriverHistory(licensePlate: string) {
  return await prisma.driver.findMany({
    where: { licensePlate: licensePlate },
    orderBy: { arrivalTime: 'desc' },
    include: { currentHandler: true }
  })
}

// ==========================================
// 4. SOCIAL E CHAT
// ==========================================

export async function sendMessage(content: string) {
  const user = await getCurrentUser()
  if (!user) return

  await prisma.message.create({
    data: {
      content,
      userId: user.id
    }
  })
  revalidatePath("/")
}

export async function getChatMessages() {
  return await prisma.message.findMany({
    take: 50,
    orderBy: { createdAt: 'asc' },
    include: { user: true }
  })
}

export async function getUsersWithStatus() {
  const users = await prisma.user.findMany({
    include: {
      activeTickets: {
        where: { status: "IN_PROGRESS" },
        include: { currentHandler: true } // Garante que trazemos dados completos
      }
    }
  })
  return users
}