import React from 'react';

const STATUS_STAGES = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];

export default function OrderStepper({ status }) {
  const currentIndex = STATUS_STAGES.indexOf(status);

  return (
    <div className="flex items-center justify-between w-full max-w-md">
      {STATUS_STAGES.map((stage, idx) => {
        const complete = currentIndex >= idx;
        const active = currentIndex === idx;

        return (
          <div key={stage} className="flex flex-col items-center gap-1 relative z-10">
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono font-mono-bold text-xs shadow-hard transition-all duration-300 ${
                complete
                  ? 'bg-citrus border-citrus text-citrus-text'
                  : active
                  ? 'bg-ink border-ink text-elevated ring-4 ring-ink/10'
                  : 'border-border text-ink-light'
              }`}
            >
              {idx + 1}
            </div>
            <span
              className={`font-mono font-mono-medium text-[10px] uppercase leading-tight text-center w-12 ${
                complete ? 'text-ink font-bold' : 'text-ink-light'
              }`}
            >
              {stage}
            </span>
            {idx < STATUS_STAGES.length - 1 && (
              <div className="absolute -top-1/2 left-full w-full h-0.5">
                <div
                  className={`h-0.5 w-full ${
                    complete ? 'bg-citrus' : active ? 'bg-ink' : 'bg-border-muted'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STATUS_STAGES };