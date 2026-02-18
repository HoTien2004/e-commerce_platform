import { Link } from 'react-router-dom';
import { scrollToTop } from '../utils/scrollToTop';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  as?: 'link' | 'div';
}

const Logo = ({ className = '', onClick, as = 'link' }: LogoProps) => {
  const handleClick = () => {
    scrollToTop();
    if (onClick) onClick();
  };

  const logoContent = (
    <span
      className={`text-2xl md:text-3xl font-extrabold tracking-tight ${className}`}
      style={{
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      }}
    >
      <span style={{ color: '#ef4444' }}>H</span>
      <span style={{ color: '#22c55e' }}>D</span>
      <span style={{ color: '#f97316' }}>Q</span>
      <span style={{ color: '#06b6d4' }}>T</span>
      <span style={{ color: '#1f2937' }}>Shop</span>
    </span>
  );

  if (as === 'div') {
    return <div onClick={handleClick}>{logoContent}</div>;
  }

  return (
    <Link 
      to="/" 
      onClick={handleClick}
    >
      {logoContent}
    </Link>
  );
};

export default Logo;

