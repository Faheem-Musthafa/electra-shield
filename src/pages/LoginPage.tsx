
import React from 'react';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-lg mx-auto py-12">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
