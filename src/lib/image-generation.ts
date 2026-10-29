export type ImagePurpose = "hero" | "lifestyle" | "promotional" | "editorial"
export type ImageStyle = "luxury" | "minimal" | "bold-dtc" | "organic" | "studio"

export interface GenerateImageInput {
  productContext: string
  purpose: ImagePurpose
  style: ImageStyle
  aspectRatio: "square" | "portrait" | "landscape"
  prompt?: string
  templateId?: string
  jobId?: string
  pageId?: string
}

export interface GeneratedImageAsset {
  id: string
  url: string
  source: "generated"
  status: "completed"
  purpose: ImagePurpose
  style: ImageStyle
  alt: string
}

export async function generateProductImage(
  apiUrl: string,
  token: string,
  input: GenerateImageInput,
): Promise<GeneratedImageAsset> {
  if (!input.jobId && !input.pageId) {
    throw new Error("Open a generated page before creating an AI image.")
  }

  const size = input.aspectRatio === "square"
    ? "1024x1024"
    : input.aspectRatio === "portrait"
      ? "1024x1536"
      : "1536x1024"

  const response = await fetch(`${apiUrl}/image-generation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      product_context: input.productContext,
      purpose: input.purpose,
      style: input.style,
      size,
      instruction: input.prompt,
      template_id: input.templateId,
      job_id: input.jobId,
      page_id: input.pageId,
    }),
  })

  const payload = await response.json().catch(() => null) as {
    image_url?: string
    url?: string
    asset_id?: string
    b64_json?: string
    asset?: { id?: string; url?: string; b64_json?: string }
    detail?: string
  } | null
  if (!response.ok) {
    throw new Error(payload?.detail || (response.status === 404 ? "AI image generation is not enabled on the backend yet." : "Image generation failed. Please try again."))
  }

  const remoteUrl = payload?.image_url || payload?.url || payload?.asset?.url
  const base64Image = payload?.b64_json || payload?.asset?.b64_json
  const url = remoteUrl || (base64Image ? `data:image/png;base64,${base64Image}` : undefined)
  if (!url) throw new Error("The image service returned no image preview.")

  return {
    id: payload?.asset_id || payload?.asset?.id || `generated-${Date.now()}`,
    url,
    source: "generated",
    status: "completed",
    purpose: input.purpose,
    style: input.style,
    alt: `${input.purpose} image for ${input.productContext}`,
  }
}
