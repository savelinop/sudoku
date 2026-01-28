import { Eraser } from 'lucide-react';

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  disabled: boolean;
}

export function NumberPad({ onNumberClick, disabled }: NumberPadProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-2 max-w-[340px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            className="aspect-square bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] 
                     border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                     active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
                     transition-all font-bold text-lg text-[#4a1e4a]
                     min-h-[56px]"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => onNumberClick(null)}
          disabled={disabled}
          className="aspect-square bg-gradient-to-b from-[#ef5350] to-[#e53935] 
                   border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                   active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
                   transition-all flex items-center justify-center
                   min-h-[56px]"
          title="Borrar"
          style={{
            imageRendering: 'pixelated',
          }}
        >
          <Eraser className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}