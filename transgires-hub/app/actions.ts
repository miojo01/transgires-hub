"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

// ==========================================
// 1. AUTENTICAÇÃO E PERFIL
// ==========================================

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Preencha todos os campos." }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.password !== password) {
    return { error: "Email ou senha incorretos." }
  }

  const cookieStore = await cookies()
  cookieStore.set("userId", user.id)
  
  redirect("/")
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) return { error: "Preencha todos os campos." }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Este email já está em uso." }

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

// EDITAR PERFIL
export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const avatarUrl = formData.get("avatarUrl") as string

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email, avatarUrl }
  })
  revalidatePath("/")
}

// DELETAR CONTA
export async function deleteAccount() {
  const user = await getCurrentUser()
  if (!user) return

  // Remove cookies e deleta
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  
  await prisma.user.delete({ where: { id: user.id } })
  redirect("/login")
}

// RANKING DE FATURADORES (Top 5)
export async function getRanking() {
  // Busca usuários e conta quantos drivers eles finalizaram HOJE ou TOTAL (vamos fazer mensal/geral)
  // Aqui faremos geral para simplificar, mas podemos filtrar por data
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { finishedDrivers: true }
      }
    },
    orderBy: {
      finishedDrivers: { _count: 'desc' }
    },
    take: 5
  })
  return users
}

// ==========================================
// 2. GESTÃO DA FILA (TICKETS)
// ==========================================

export async function createAndQueueDriver(formData: FormData) {
  const name = (formData.get("name") as string).toUpperCase() // <--- CAIXA ALTA
  const licensePlate = (formData.get("licensePlate") as string).toUpperCase()
  const type = formData.get("type") as string
  const group = formData.get("group") as string
  const romaneio = formData.get("romaneio") as string

  const existing = await prisma.savedDriver.findUnique({ where: { licensePlate } })

  if (existing) {
    return { error: `Placa ${licensePlate} já cadastrada! Use a busca.` }
  }

  await prisma.savedDriver.create({
    data: { name, licensePlate, type, group }
  })

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

export async function queueExistingDriver(savedDriverId: number, romaneio: string) {
  const saved = await prisma.savedDriver.findUnique({ where: { id: savedDriverId } })
  if (!saved) return

  await prisma.driver.create({
    data: {
      name: saved.name, // Já está em upper no banco
      licensePlate: saved.licensePlate,
      type: saved.type,
      group: saved.group,
      romaneio,
      status: "TODO",
      arrivalTime: new Date(),
    },
  })
  revalidatePath("/")
}

export async function ticketAction(driverId: number, action: string, reason?: string) {
  const user = await getCurrentUser()
  if (!user) return

  if (action === 'START') {
    await prisma.driver.update({
      where: { id: driverId },
      data: { 
        status: 'IN_PROGRESS', 
        currentHandlerId: user.id, 
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
        failedStep: null,
        finishedById: user.id // <--- SALVA QUEM FINALIZOU (PARA O RANKING)
      }
    })
  }

  revalidatePath("/")
}

export async function updateDriver(driverId: number, formData: FormData) {
  const name = (formData.get("name") as string).toUpperCase() // <--- CAIXA ALTA
  const licensePlate = (formData.get("licensePlate") as string).toUpperCase()
  const type = formData.get("type") as string
  const group = formData.get("group") as string
  const romaneio = formData.get("romaneio") as string

  await prisma.driver.update({
    where: { id: driverId },
    data: { name, licensePlate, type, group, romaneio }
  })
  revalidatePath("/")
}

export async function deleteDriver(driverId: number) {
  await prisma.driver.delete({ where: { id: driverId } })
  revalidatePath("/")
}

export async function advanceStep(driverId: number) {
  await prisma.driver.update({
    where: { id: driverId },
    data: { currentStep: { increment: 1 } }
  })
  revalidatePath("/")
}

// ==========================================
// 3. GESTÃO DO BANCO DE DADOS
// ==========================================

export async function getSavedDrivers() {
  return await prisma.savedDriver.findMany({ orderBy: { name: 'asc' } })
}

export async function updateSavedDriver(id: number, formData: FormData) {
  await prisma.savedDriver.update({
    where: { id },
    data: {
      name: (formData.get("name") as string).toUpperCase(), // <--- CAIXA ALTA
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

// ==========================================
// 4. CHAT E MENSAGENS
// ==========================================

export async function sendMessage(content: string) {
  const user = await getCurrentUser()
  if (!user) return

  await prisma.message.create({
    data: { content, userId: user.id }
  })
  revalidatePath("/")
}

export async function deleteMessage(messageId: number) {
  const user = await getCurrentUser()
  if (!user) return

  // Só permite deletar se for o dono da mensagem
  const msg = await prisma.message.findUnique({ where: { id: messageId } })
  if (msg && msg.userId === user.id) {
    await prisma.message.delete({ where: { id: messageId } })
  }
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
        include: { currentHandler: true }
      }
    }
  })
  return users
}

// ... (mantenha todo o código anterior igual)

// ADICIONE ISTO NO FINAL DO ARQUIVO:
export async function getDriversList() {
  return await prisma.driver.findMany({
    orderBy: { arrivalTime: 'asc' },
    include: { currentHandler: true }
  })
}