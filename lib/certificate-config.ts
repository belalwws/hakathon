// Certificate text positioning and styling configuration
export const DEFAULT_CERTIFICATE_CONFIG = {
  // Name position Y (vertical: up/down)
  // 0.5 = center, smaller numbers = higher, larger numbers = lower
  namePositionY: 0.52,

  // Name position X (horizontal: left/right)
  // 0.5 = center, smaller numbers = left, larger numbers = right
  namePositionX: 0.50,

  // Name font and color
  nameFont: 'bold 48px Arial',
  nameColor: '#1a472a',      // لون النص (أخضر داكن)

  // Text alignment
  textAlign: 'center' as CanvasTextAlign
}

// Function to get current settings from API
export async function getCertificateSettings() {
  try {
    const response = await fetch('/api/admin/certificate-settings')
    if (response.ok) {
      const settings = await response.json()
      return {
        ...DEFAULT_CERTIFICATE_CONFIG,
        namePositionY: settings.namePositionY || settings.namePosition || DEFAULT_CERTIFICATE_CONFIG.namePositionY,
        namePositionX: settings.namePositionX || DEFAULT_CERTIFICATE_CONFIG.namePositionX,
        nameFont: settings.nameFont,
        nameColor: settings.nameColor
      }
    }
  } catch (error) {
    console.error('Error fetching certificate settings:', error)
  }
  return DEFAULT_CERTIFICATE_CONFIG
}

// Helper function to draw certificate text with custom settings
export function drawCertificateText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  data: {
    participantName: string
    hackathonTitle: string
    date: string
    rank?: number
    isWinner?: boolean
  },
  customSettings?: any
) {
  const { participantName } = data
  const settings = customSettings || DEFAULT_CERTIFICATE_CONFIG

  // Configure text styling
  ctx.textAlign = settings.textAlign
  ctx.fillStyle = settings.nameColor
  ctx.font = settings.nameFont

  // Calculate position using both X and Y coordinates
  const nameX = canvas.width * settings.namePositionX
  const nameY = canvas.height * settings.namePositionY

  // Add participant name only
  ctx.fillText(participantName, nameX, nameY)
}
