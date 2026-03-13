import { Toaster as Sonner } from 'sonner';

const Toaster = () => {
  return (
    <Sonner
      position="top-right"
      richColors={false}
      icons={{
        success: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#22c55e"/>
            <path d="M7 13l3 3 7-7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        ),
        error: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        ),
        warning: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
        ),
        info: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#76B9F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
        ),
      }}
      toastOptions={{
        style: {
          background:   '#ffffff',
          border:       '1px solid #D2D2D2',
          borderRadius: '12px',
          fontFamily:   'Inter, sans-serif',
          color:        '#1E1E1E',
          boxShadow:    '0 4px 12px rgba(0,0,0,0.08)',
          padding:      '14px 16px',
        },
        classNames: {
          title:        'text-[#1E1E1E] text-sm font-semibold',
          description:  'text-[#757575] text-xs mt-0.5',
          actionButton: '!bg-[#31A2FF] !text-white !text-xs !rounded-lg !font-medium hover:!opacity-90',
          cancelButton: '!bg-[#f0f0f0] !text-[#757575] !text-xs !rounded-lg',
        },
      }}
    />
  );
};

export default Toaster;