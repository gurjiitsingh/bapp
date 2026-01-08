'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FormEvent } from 'react';
//import { signIn } from 'next-auth/react';

const SignIn = () => {
  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const loginData = {
      id: 'login-form',
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: true,
      callbackUrl: '/admin',
    };

   // const response = await signIn('credentials', loginData);
   // console.log('Login response:', response);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
      <Card className="w-full max-w-md p-8 shadow-md border border-gray-200 dark:border-zinc-700">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Sign in to your account
        </h1>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              defaultValue="g@mail.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-emerald-600 focus:ring-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              required
              defaultValue="123456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-emerald-600 focus:ring-emerald-500 sm:text-sm"
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-emerald-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default SignIn;
