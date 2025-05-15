import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - TaskTrak',
  description: 'Log in to TaskTrak to manage your tasks.',
};

export default function LoginPage() {
  return <LoginForm />;
}
