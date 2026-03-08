const Logo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: { img: 'h-10', text: 'text-lg', subtext: 'text-xs' },
    default: { img: 'h-12', text: 'text-xl', subtext: 'text-sm' },
    large: { img: 'h-20', text: 'text-3xl', subtext: 'text-lg' },
  };

  const { img, text, subtext } = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-2">
      <img 
        src="/images/logo.png" 
        alt="Mohana Pyro Park" 
        className={`${img} w-auto object-contain`}
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500 bg-clip-text text-transparent ${text}`}>
            MOHANA
          </span>
          <span className={`font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent ${subtext}`}>
            PYRO PARK
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
