
import React from 'react';
import Layout from '@/components/Layout';
import RegisterForm from '@/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-lg mx-auto py-12">
        <RegisterForm />
      </div>
    </Layout>
  );
};

export default RegisterPage;
