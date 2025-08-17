import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

/**
 * Login Component
 * Handles user authentication (login/register)
 */
const Login = () => {
  const { login, register, error, loading, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    // Name validation (only for registration)
    if (isRegistering && !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (isRegistering && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation (only for registration)
    if (isRegistering) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      let result;
      
      if (isRegistering) {
        result = await register(formData.name, formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        // Success handled by AuthContext - user will be redirected to dashboard
        console.log(`${isRegistering ? 'Registration' : 'Login'} successful`);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  /**
   * Toggle between login and register modes
   */
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    clearError();
  };

  

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Task Board</h1>
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p>
            {isRegistering 
              ? 'Join your team and start managing tasks' 
              : 'Sign in to manage your team tasks'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name field - only for registration */}
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={formErrors.name ? 'error' : ''}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {formErrors.name && (
                <span className="error-message">{formErrors.name}</span>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? 'error' : ''}
              placeholder={isRegistering ? 'Create a password (min 6 characters)' : 'Enter your password'}
              disabled={loading}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>

          {/* Confirm password field - only for registration */}
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={formErrors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
              />
              {formErrors.confirmPassword && (
                <span className="error-message">{formErrors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* API Error Display */}
          {error && (
            <div className="error-message api-error">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner small"></span>
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle between login/register */}
        <div className="auth-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button"
              onClick={toggleMode}
              className="auth-link"
              disabled={loading}
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

        {/* Demo credentials for testing
        {!isRegistering && process.env.NODE_ENV === 'development' && (
          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: demo@taskboard.com</p>
            <p>Password: demo123</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Login;