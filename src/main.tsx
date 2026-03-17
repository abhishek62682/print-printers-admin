import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './config/router.tsx'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import {QueryClient , QueryClientProvider} from "@tanstack/react-query";
import Toaster from './components/Toaster.tsx'



export const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   
   <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} ></RouterProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
      
/>

    </QueryClientProvider>

   
    
  </StrictMode>,
)
