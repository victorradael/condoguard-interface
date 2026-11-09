import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Espelha a política da API (a validação final, inclusive "senha comum", é do servidor).
export const passwordSchema = z
  .string()
  .min(10, "Senha deve ter ao menos 10 caracteres")
  .max(72, "Senha deve ter no máximo 72 caracteres")
  .regex(/[A-Za-z]/, "Senha deve ter letras")
  .regex(/\d/, "Senha deve ter números");

export const registerSchema = z
  .object({
    username: z.string().min(3, "Usuário deve ter ao menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      ![data.email, data.username].some(
        (v) => v.length > 0 && data.password.toLowerCase().includes(v.toLowerCase())
      ),
    { message: "A senha não pode conter o e-mail ou o usuário", path: ["password"] }
  );

export const expenseSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
});

export const csvExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.preprocess(Number, z.number().positive()),
  date: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const totpCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Código inválido")
    .max(8, "Código inválido")
    .regex(/^\d+$/, "Código deve conter apenas dígitos"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TotpCodeInput = z.infer<typeof totpCodeSchema>;
