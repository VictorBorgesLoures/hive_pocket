
import '@src/App.css'
import {AppRouter} from '@src/config/routes'
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
      <ToastContainer />
      <AppRouter />
    </>
  )
}

export default App
