import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TemplateForm } from "@/components/admin/TemplateForm"
import type { AdminTemplate } from "@/types/template-admin"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params

  const raw = await prisma.template.findUnique({ where: { id } })
  if (!raw) return notFound()

  const template: AdminTemplate = {
    id:            raw.id,
    slug:          raw.slug,
    name:          raw.name,
    nameMs:        raw.nameMs,
    category:      raw.category as AdminTemplate["category"],
    thumbnail:     raw.thumbnail,
    previewUrl:    raw.previewUrl ?? undefined,
    isActive:      raw.isActive,
    sortOrder:     raw.sortOrder,
    defaultConfig: (raw.defaultConfig as Record<string, unknown>) ?? {},
    image1Url:     raw.image1Url ?? undefined,
    image2Url:     raw.image2Url ?? undefined,
    displayConfig: (raw.displayConfig as unknown as AdminTemplate["displayConfig"]) ?? undefined,
    createdAt:     raw.createdAt.toISOString(),
    updatedAt:     raw.updatedAt.toISOString(),
  }

  return <TemplateForm initialData={template} />
}
