import { AppRouter } from '@/router';
import { Toaster } from 'react-hot-toast';
import '@/index.css';
function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
