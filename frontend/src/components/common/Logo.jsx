import { Sparkles } from 'lucide-react';

const Logo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: { icon: 24, text: 'text-lg' },
    default: { icon: 32, text: 'text-xl' },
    large: { icon: 48, text: 'text-3xl' },
  };

  const { icon, text } = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg p-2">
          <Sparkles className="text-white" size={icon} />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-gold rounded-full animate-pulse" />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold gradient-text ${text}`}>MOHANA</span>
          <span className={`font-semibold text-gray-700 ${size === 'large' ? 'text-lg' : 'text-sm'}`}>
            PYRO PARK
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
