
import React from 'react';

const LoginFooter: React.FC = () => {
  return (
    <div className="mt-6 mb-4 text-center">
      <span className="text-sm text-muted-foreground">
        Don't have an account?{' '}
      </span>
      <a 
        href="/register" 
        className="text-sm text-vote-secondary hover:underline"
      >
        Register
      </a>
    </div>
  );
};

export default LoginFooter;
