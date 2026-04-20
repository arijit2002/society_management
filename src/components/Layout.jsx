import { Sidebar } from './Sidebar';
import { ToastContainer } from './Toast';

export function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 min-h-full">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}
