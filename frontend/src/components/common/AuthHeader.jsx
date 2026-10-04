import React from 'react';
import { Stethoscope } from 'lucide-react';

const AuthHeader = ({ subtitle }) => (
  <div className="auth-header">
    <div className="logo-container">
      <div className="logo-icon">
        <Stethoscope size={24} />
      </div>
      <h1>OralTech</h1>
    </div>
    <p>{subtitle}</p>
  </div>
);

export default AuthHeader;
