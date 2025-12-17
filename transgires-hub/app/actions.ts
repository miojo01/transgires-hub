'use server'

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// --- AUTENTICAÇÃO REAL ---

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) return { error: "Preencha tudo!" }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email já cadastrado." }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      status: "ONLINE"
    }
  })

  // CORREÇÃO AQUI: await cookies()
  const cookieStore = await cookies()
  cookieStore.set("userId", user.id)
  
  redirect("/")
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Preencha tudo!" }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Email ou senha inválidos." }
  }

  // CORREÇÃO AQUI: await cookies()
  const cookieStore = await cookies()
  cookieStore.set("userId", user.id)

  redirect("/")
}

export async function logout() {
  // CORREÇÃO AQUI: await cookies()
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  
  redirect("/login")
}

export async function getCurrentUser() {
  // CORREÇÃO AQUI: await cookies()
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  
  if (!userId) return null
  return await prisma.user.findUnique({ where: { id: userId } })
}

// --- AÇÕES DO MOTORISTA ---

export async function createDriver(formData: FormData) {
  const name = formData.get("name") as string
  const licensePlate = formData.get("licensePlate") as string
  const type = formData.get("type") as string
  const group = formData.get("group") as string

  if (!name || !licensePlate || !type || !group) return

  await prisma.driver.create({
    data: {
      name,
      licensePlate: licensePlate.toUpperCase(),
      type,
      group,
      status: "TODO",
      arrivalTime: new Date(),
    },
  })
  revalidatePath("/")
}

export async function startService(driverId: number) {
  const user = await getCurrentUser()
  
  if (!user) throw new Error("Você precisa estar logado!")

  await prisma.driver.update({
    where: { id: driverId },
    data: {
      status: "IN_PROGRESS",
      currentHandlerId: user.id,
    },
  })
  revalidatePath("/")
}

export async function advanceStep(driverId: number, nextStepIndex: number) {
  await prisma.driver.update({
    where: { id: driverId },
    data: { currentStep: nextStepIndex }
  })
  revalidatePath("/")
}

export async function finishService(driverId: number) {
  await prisma.driver.update({
    where: { id: driverId },
    data: { 
      status: "DONE",
      currentHandlerId: null, 
    },
  })
  revalidatePath("/")
}

export async function sendToPending(driverId: number, reason: string, failedStepName: string) {
  await prisma.driver.update({
    where: { id: driverId },
    data: { 
      status: "PENDING",
      pendingReason: reason,
      failedStep: failedStepName,
      currentHandlerId: null
    },
  })
  revalidatePath("/")
}

// Adicione ao final de app/actions.ts

export async function deleteDriver(driverId: number) {
  await prisma.driver.delete({ where: { id: driverId } })
  revalidatePath("/")
}

export async function updateDriver(driverId: number, formData: FormData) {
  const name = formData.get("name") as string
  const licensePlate = formData.get("licensePlate") as string
  const type = formData.get("type") as string
  const group = formData.get("group") as string

  await prisma.driver.update({
    where: { id: driverId },
    data: {
      name,
      licensePlate: licensePlate.toUpperCase(),
      type,
      group
    }
  })
  revalidatePath("/")
}

// Adicione ao final de app/actions.ts

// --- FUNCIONALIDADES SOCIAIS ---

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
  // Pega as últimas 50 mensagens
  return await prisma.message.findMany({
    take: 50,
    orderBy: { createdAt: 'asc' },
    include: { user: true }
  })
}

export async function getUsersWithStatus() {
  // Busca todos os usuários
  const users = await prisma.user.findMany({
    include: {
      // Traz os tickets que esse usuário está fazendo AGORA (IN_PROGRESS)
      activeTickets: {
        where: { status: "IN_PROGRESS" }
      }
    }
  })
  return users
}