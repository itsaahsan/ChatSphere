'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useChatStore } from '@/store/chatStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset } = useForm();
  const { setUser } = useChatStore();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let response;
      if (isSignup) {
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        response = await authAPI.register({
          name: data.name,
          email: data.email,
          password: data.password,
        });
      } else {
        response = await authAPI.login({
          email: data.email,
          password: data.password,
        });
      }

      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success(isSignup ? 'Account created successfully!' : 'Logged in successfully!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-dark to-darker">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
        <h1 className="text-4xl font-bold text-center mb-2 text-green-500">ChatSphere</h1>
        <p className="text-center text-gray-400 mb-8">Real-time messaging powered by AI</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isSignup && (
            <input
              {...register('name')}
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              required
            />
          )}

          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            required
          />

          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            required
          />

          {isSignup && (
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-green-500 hover:text-green-400 font-semibold"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
