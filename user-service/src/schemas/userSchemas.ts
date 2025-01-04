import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

const VALUE_PROVIDERS = ["credentials", "google"] as const;

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string(),
    login_provider: z.enum(VALUE_PROVIDERS)
})