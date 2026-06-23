import { prisma } from '../../prisma.js'
import { ApiError } from '../../lib/http.js'
import type { AskInput } from './qna.schema.js'

const userInc = { include: { role: true, profile: true } } as const

function toAuthor(u: { id: number; email: string; role: { name: string }; profile: { displayName: string; avatarPath: string | null } | null }) {
  return { id: u.id, email: u.email, display_name: u.profile?.displayName ?? u.email, role: u.role.name, avatar_url: u.profile?.avatarPath ?? null }
}

function questionInclude(userId?: number) {
  return {
    user: userInc,
    answers: {
      include: { user: userInc, voters: { where: { userId: userId ?? -1 }, select: { id: true } } },
      orderBy: [{ isBest: 'desc' as const }, { votes: 'desc' as const }],
    },
  }
}

type QuestionRow = Awaited<ReturnType<typeof fetchOne>>

function fetchOne(id: number, userId?: number) {
  return prisma.question.findUnique({ where: { id }, include: questionInclude(userId) })
}

function mapQuestion(q: NonNullable<QuestionRow>) {
  return {
    id: q.id,
    blueprintId: q.blueprintId,
    blueprintTitle: q.blueprintTitle,
    user: toAuthor(q.user),
    title: q.title,
    content: q.content,
    solved: q.solved,
    createdAt: q.createdAt.toISOString(),
    answers: q.answers.map((a) => ({
      id: a.id,
      user: toAuthor(a.user),
      content: a.content,
      votes: a.votes,
      isBest: a.isBest,
      isExpert: a.isExpert,
      myVote: a.voters.length > 0,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function list(blueprintId: number | undefined, userId?: number) {
  const rows = await prisma.question.findMany({
    where: blueprintId ? { blueprintId } : {},
    orderBy: { createdAt: 'desc' },
    include: questionInclude(userId),
  })
  return rows.map(mapQuestion)
}

export async function ask(userId: number, input: AskInput) {
  const q = await prisma.question.create({
    data: {
      blueprintId: input.blueprintId ?? null,
      blueprintTitle: input.blueprintTitle ?? null,
      userId,
      title: input.title,
      content: input.content,
    },
    include: questionInclude(userId),
  })
  return mapQuestion(q)
}

export async function answer(userId: number, role: string, questionId: number, content: string) {
  const q = await prisma.question.findUnique({ where: { id: questionId } })
  if (!q) throw ApiError.notFound('Pertanyaan tidak ditemukan.')
  await prisma.answer.create({
    data: { questionId, userId, content, isExpert: role === 'moderator' || role === 'admin' },
  })
  return mapQuestion((await fetchOne(questionId, userId))!)
}

export async function vote(userId: number, answerId: number) {
  const ans = await prisma.answer.findUnique({ where: { id: answerId } })
  if (!ans) throw ApiError.notFound('Jawaban tidak ditemukan.')
  const existing = await prisma.answerVote.findUnique({ where: { answerId_userId: { answerId, userId } } })
  if (existing) {
    await prisma.answerVote.delete({ where: { id: existing.id } })
    const a = await prisma.answer.update({ where: { id: answerId }, data: { votes: { decrement: 1 } } })
    return { votes: a.votes, voted: false }
  }
  await prisma.answerVote.create({ data: { answerId, userId } })
  const a = await prisma.answer.update({ where: { id: answerId }, data: { votes: { increment: 1 } } })
  return { votes: a.votes, voted: true }
}

export async function markBest(userId: number, role: string, answerId: number) {
  const ans = await prisma.answer.findUnique({ where: { id: answerId }, include: { question: true } })
  if (!ans) throw ApiError.notFound('Jawaban tidak ditemukan.')
  const isOwner = ans.question.userId === userId
  if (!isOwner && role !== 'moderator' && role !== 'admin') throw ApiError.forbidden('Hanya penanya atau moderator yang dapat menandai.')
  await prisma.answer.updateMany({ where: { questionId: ans.questionId }, data: { isBest: false } })
  await prisma.answer.update({ where: { id: answerId }, data: { isBest: true } })
  await prisma.question.update({ where: { id: ans.questionId }, data: { solved: true } })
  return { message: 'Jawaban terbaik ditandai.' }
}
