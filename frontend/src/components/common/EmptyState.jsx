import { Package } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Package, 
  title = 'No items found', 
  description = '',
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {description && <p className="text-gray-500 max-w-sm">{description}</p>}
      </div>
      {action && action}
    </div>
  );
};

export default EmptyState;
