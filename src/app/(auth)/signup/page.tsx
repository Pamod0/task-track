
import { SignUpForm } from "@/components/auth/SignUpForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - TaskTrak',
  description: 'Create an account with TaskTrak.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
