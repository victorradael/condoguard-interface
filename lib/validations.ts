import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, "Usuário deve ter ao menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
