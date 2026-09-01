import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, FileText, CalendarCheck, Package, User, ClipboardList, Send, Wrench, Star } from 'lucide-react';

import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FindTechnicians from './pages/FindTechnicians';
import TechnicianProfile from './pages/TechnicianProfile';
import AccountProfile from './pages/AccountProfile';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewServiceRequest from './pages/customer/NewServiceRequest';
import MyRequests from './pages/customer/MyRequests';
import RequestDetail from './pages/customer/RequestDetail';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerBookingDetail from './pages/customer/CustomerBookingDetail';
import ServicePassport from './pages/customer/ServicePassport';

import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianProfileEdit from './pages/technician/TechnicianProfileEdit';
import OpenRequests from './pages/technician/OpenRequests';
import MyQuotes from './pages/technician/MyQuotes';
import TechnicianBookings from './pages/technician/TechnicianBookings';
import TechnicianBookingDetail from './pages/technician/TechnicianBookingDetail';
import TechnicianReviews from './pages/technician/TechnicianReviews';

const customerLinks = [
  { to: '/customer', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customer/requests', label: 'My Requests', icon: FileText },
  { to: '/customer/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/customer/passport', label: 'Service Passport', icon: Package },
  { to: '/customer/profile', label: 'Profile', icon: User },
];

const technicianLinks = [
  { to: '/technician', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/technician/requests', label: 'Open Requests', icon: ClipboardList },
  { to: '/technician/quotes', label: 'My Quotes', icon: Send },
  { to: '/technician/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/technician/reviews', label: 'Reviews', icon: Star },
  { to: '/technician/profile', label: 'Profile', icon: Wrench },
];

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/find-technicians" element={<FindTechnicians />} />
        <Route path="/technicians/:userId" element={<TechnicianProfile />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout links={customerLinks} />
          </ProtectedRoute>
        }
      >
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/new-request" element={<NewServiceRequest />} />
        <Route path="/customer/requests" element={<MyRequests />} />
        <Route path="/customer/requests/:id" element={<RequestDetail />} />
        <Route path="/customer/bookings" element={<CustomerBookings />} />
        <Route path="/customer/bookings/:id" element={<CustomerBookingDetail />} />
        <Route path="/customer/passport" element={<ServicePassport />} />
        <Route path="/customer/profile" element={<AccountProfile />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['technician']}>
            <DashboardLayout links={technicianLinks} />
          </ProtectedRoute>
        }
      >
        <Route path="/technician" element={<TechnicianDashboard />} />
        <Route path="/technician/requests" element={<OpenRequests />} />
        <Route path="/technician/quotes" element={<MyQuotes />} />
        <Route path="/technician/bookings" element={<TechnicianBookings />} />
        <Route path="/technician/bookings/:id" element={<TechnicianBookingDetail />} />
        <Route path="/technician/reviews" element={<TechnicianReviews />} />
        <Route path="/technician/profile" element={<TechnicianProfileEdit />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
