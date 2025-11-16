import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Neo-Brutalism UI Components
 * Reusable components for the bold, high-contrast design system
 */

interface BrutalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: LucideIcon;
}

export function BrutalButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon
}: BrutalButtonProps) {
  const variants = {
    primary: 'bg-yellow-400 text-black border-black hover:bg-yellow-300',
    secondary: 'bg-cyan-400 text-black border-black hover:bg-cyan-300',
    success: 'bg-green-400 text-black border-black hover:bg-green-300',
    danger: 'bg-red-400 text-white border-black hover:bg-red-300',
    warning: 'bg-orange-400 text-black border-black hover:bg-orange-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        border-4 font-black uppercase tracking-tight
        brutal-shadow brutal-hover
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={3} />}
      {children}
    </button>
  );
}

interface BrutalCardProps {
  children: React.ReactNode;
  color?: 'white' | 'cyan' | 'yellow' | 'purple' | 'green' | 'red' | 'pink';
  rotate?: number;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function BrutalCard({ 
  children, 
  color = 'white', 
  rotate = 0,
  className = '',
  onClick,
  hoverable = false
}: BrutalCardProps) {
  const colors = {
    white: 'bg-white',
    cyan: 'bg-cyan-300',
    yellow: 'bg-yellow-300',
    purple: 'bg-purple-300',
    green: 'bg-green-300',
    red: 'bg-red-300',
    pink: 'bg-pink-300',
  };

  return (
    <div
      onClick={onClick}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`
        ${colors[color]}
        border-4 border-black p-6
        brutal-shadow
        ${hoverable ? 'brutal-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface BrutalStatProps {
  label: string;
  value: string | number;
  color?: 'cyan' | 'yellow' | 'purple' | 'green' | 'red' | 'pink';
  icon?: LucideIcon;
  rotate?: number;
}

export function BrutalStat({ label, value, color = 'cyan', icon: Icon, rotate = 0 }: BrutalStatProps) {
  const colors = {
    cyan: { bg: 'bg-cyan-400', border: 'border-cyan-600', shadow: 'brutal-shadow-cyan' },
    yellow: { bg: 'bg-yellow-400', border: 'border-yellow-600', shadow: 'brutal-shadow-yellow' },
    purple: { bg: 'bg-purple-400', border: 'border-purple-600', shadow: 'brutal-shadow-purple' },
    green: { bg: 'bg-green-400', border: 'border-green-600', shadow: 'brutal-shadow-green' },
    red: { bg: 'bg-red-400', border: 'border-red-600', shadow: 'brutal-shadow-red' },
    pink: { bg: 'bg-pink-400', border: 'border-pink-600', shadow: 'brutal-shadow-pink' },
  };

  const { bg, border, shadow } = colors[color];

  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`${bg} border-4 ${border} p-6 brutal-hover ${shadow}`}
    >
      {Icon && <Icon className="w-6 h-6 text-black mb-2" strokeWidth={3} />}
      <p className="text-black text-xs font-black uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-black text-4xl font-black">
        {value}
      </p>
    </div>
  );
}

interface BrutalBadgeProps {
  children: React.ReactNode;
  color?: 'cyan' | 'yellow' | 'purple' | 'green' | 'red' | 'pink' | 'orange';
  className?: string;
}

export function BrutalBadge({ children, color = 'yellow', className = '' }: BrutalBadgeProps) {
  const colors = {
    cyan: 'bg-cyan-400 border-cyan-600',
    yellow: 'bg-yellow-400 border-yellow-600',
    purple: 'bg-purple-400 border-purple-600',
    green: 'bg-green-400 border-green-600',
    red: 'bg-red-400 border-red-600',
    pink: 'bg-pink-400 border-pink-600',
    orange: 'bg-orange-400 border-orange-600',
  };

  return (
    <span className={`inline-block ${colors[color]} border-3 border-black px-3 py-1 text-xs font-black uppercase tracking-tight ${className}`}>
      {children}
    </span>
  );
}

interface BrutalHeaderProps {
  children: React.ReactNode;
  color?: 'cyan' | 'yellow' | 'purple' | 'green' | 'red' | 'pink';
  rotate?: number;
  className?: string;
}

export function BrutalHeader({ children, color = 'yellow', rotate = 0, className = '' }: BrutalHeaderProps) {
  const colors = {
    cyan: 'bg-cyan-300',
    yellow: 'bg-yellow-300',
    purple: 'bg-purple-300',
    green: 'bg-green-300',
    red: 'bg-red-300',
    pink: 'bg-pink-300',
  };

  return (
    <h2
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`
        inline-block ${colors[color]} 
        px-4 py-2 border-4 border-black
        text-2xl md:text-3xl lg:text-4xl font-black uppercase text-black
        ${className}
      `}
    >
      {children}
    </h2>
  );
}

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function BrutalInput({ label, className = '', ...props }: BrutalInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-black text-sm font-black uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-4 py-3 
          bg-white border-4 border-black
          text-black font-bold
          focus:outline-none focus:ring-0
          focus:translate-x-1 focus:translate-y-1
          focus:shadow-none
          brutal-shadow
          transition-all
          ${className}
        `}
      />
    </div>
  );
}

interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function BrutalTextarea({ label, className = '', ...props }: BrutalTextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-black text-sm font-black uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full px-4 py-3 
          bg-white border-4 border-black
          text-black font-bold
          focus:outline-none focus:ring-0
          focus:translate-x-1 focus:translate-y-1
          focus:shadow-none
          brutal-shadow
          transition-all
          resize-none
          ${className}
        `}
      />
    </div>
  );
}

interface BrutalAlertProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
  icon?: LucideIcon;
  rotate?: number;
}

export function BrutalAlert({ children, type = 'info', icon: Icon, rotate = 0 }: BrutalAlertProps) {
  const types = {
    info: 'bg-cyan-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    success: 'bg-green-400',
  };

  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`${types[type]} border-4 border-black p-4 brutal-shadow flex items-start gap-3`}
    >
      {Icon && <Icon className="w-6 h-6 text-black flex-shrink-0" strokeWidth={3} />}
      <div className="text-black font-bold">
        {children}
      </div>
    </div>
  );
}
