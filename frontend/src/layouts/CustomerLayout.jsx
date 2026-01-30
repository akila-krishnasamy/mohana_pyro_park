import { Outlet } from 'react-router-dom';
import CustomerNavbar from '../components/customer/CustomerNavbar';
import Footer from '../components/customer/Footer';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CustomerNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
