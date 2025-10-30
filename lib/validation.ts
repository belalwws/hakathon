import { z } from "zod"

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
})

// Score submission validation schema
export const scoreSchema = z.object({
  team_id: z.string().min(1, "معرف الفريق مطلوب"),
  criterion_id: z.string().min(1, "معرف المعيار مطلوب"),
  hackathon_id: z.string().min(1, "معرف الهاكاثون مطلوب"),
  score: z.number().min(0, "النتيجة لا يمكن أن تكون أقل من 0").max(5, "النتيجة لا يمكن أن تكون أكثر من 5"),
})

// Validation helper function
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    return { success: false, error: "بيانات غير صالحة" }
  }
} 