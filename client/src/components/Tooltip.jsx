import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useState } from 'react';

const Tooltip = ({ children, content, side = 'top', delayDuration = 200 }) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild onClick={handleClick}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            className='z-50 overflow-hidden rounded-lg bg-slate-900 px-3 py-2 text-sm text-white shadow-lg animate-in fade-in-0 zoom-in-95 max-w-xs break-words'
            sideOffset={5}
            onPointerDownOutside={() => setOpen(false)}>
            {content}
            <TooltipPrimitive.Arrow className='fill-slate-900' />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
