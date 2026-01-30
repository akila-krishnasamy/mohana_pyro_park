const StatusBadge = ({ status }) => {
  const statusConfig = {
    // Order statuses
    pending: { label: 'Pending', className: 'badge-warning' },
    confirmed: { label: 'Confirmed', className: 'badge-info' },
    packing: { label: 'Packing', className: 'badge-info' },
    ready: { label: 'Ready', className: 'badge-primary' },
    'out-for-delivery': { label: 'Out for Delivery', className: 'badge-info' },
    delivered: { label: 'Delivered', className: 'badge-success' },
    'picked-up': { label: 'Picked Up', className: 'badge-success' },
    cancelled: { label: 'Cancelled', className: 'badge-danger' },
    
    // Payment statuses
    paid: { label: 'Paid', className: 'badge-success' },
    refunded: { label: 'Refunded', className: 'badge-warning' },
    
    // Stock statuses
    'in-stock': { label: 'In Stock', className: 'badge-success' },
    'low-stock': { label: 'Low Stock', className: 'badge-warning' },
    'out-of-stock': { label: 'Out of Stock', className: 'badge-danger' },
    
    // Delivery types
    pickup: { label: 'Pickup', className: 'badge-info' },
    delivery: { label: 'Delivery', className: 'badge-primary' },
  };

  const config = statusConfig[status] || { label: status, className: 'badge' };

  return (
    <span className={config.className}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
