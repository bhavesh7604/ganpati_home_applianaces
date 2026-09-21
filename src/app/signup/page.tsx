import type { Metadata } from 'next';
import AuthForm from '../auth/AuthForm';

export const metadata: Metadata = { title: 'Create account' };
export default function Signup() {
  return (
    <div className="wrap py-12">
      <h1 className="text-center text-3xl md:text-4xl">Create your account</h1>
      <AuthForm mode="signup" />
    </div>
  );
}
