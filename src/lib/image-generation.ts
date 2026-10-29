export type ImagePurpose = "hero" | "lifestyle" | "promotional" | "editorial"
export type ImageStyle = "luxury" | "minimal" | "bold-dtc" | "organic" | "studio"

export interface GenerateImageInput {
  productContext: string
  purpose: ImagePurpose
  style: ImageStyle
  aspectRatio: "square" | "portrait" | "landscape"
  prompt?: string
  templateId?: string
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
  const response = await fetch(`${apiUrl}/image-generation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  })

  const payload = await response.json().catch(() => null) as { image_url?: string; url?: string; asset?: { id?: string; url?: string }; detail?: string } | null
  if (!response.ok) {
    throw new Error(payload?.detail || (response.status === 404 ? "AI image generation is not enabled on the backend yet." : "Image generation failed. Please try again."))
  }

  const url = payload?.image_url || payload?.url || payload?.asset?.url
  if (!url) throw new Error("The image service returned no image preview.")

  return {
    id: payload?.asset?.id || `generated-${Date.now()}`,
    url,
    source: "generated",
    status: "completed",
    purpose: input.purpose,
    style: input.style,
    alt: `${input.purpose} image for ${input.productContext}`,
  }
}
