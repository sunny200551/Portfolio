import React, { useState, useEffect, useRef } from 'react';

export type VisitorGenderChoice = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface SteveVisitorCardProps {
  initialName?: string;
  initialGender?: VisitorGenderChoice;
  onSave: (name: string, gender: VisitorGenderChoice) => void;
  onSkip: () => void;
  onForget?: () => void;
  isEditMode?: boolean;
}

export const SteveVisitorCard: React.FC<SteveVisitorCardProps> = ({
  initialName = '',
  initialGender = 'prefer-not-to-say',
  onSave,
  onSkip,
  onForget,
  isEditMode = false,
}) => {
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<VisitorGenderChoice>(initialGender);
  const inputRef = useRef<HTMLInputElement>(null);


  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(name.trim().slice(0, 20), gender);
  };

  const genderOptions: { id: VisitorGenderChoice; label: string }[] = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'non-binary', label: 'Non-binary' },
    { id: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  return (
    <div
      role="region"
      aria-label="Steve visitor identity form"
      className="w-full max-w-[148px] bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] p-2.5 font-mono text-[11px] text-[#0A0A0A] pointer-events-auto select-none animate-in fade-in zoom-in-95 duration-150"
      style={{
        maxHeight: 'calc(100vh - 50% - 125px)',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <div className="font-black text-[10px] uppercase text-[#FF5A1F] leading-snug tracking-tight mb-2 border-b border-[#0A0A0A]/15 pb-1">
        Hi! I&apos;m Steve. Who are you?
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Name Input */}
        <div>
          <label htmlFor="steve-visitor-name-input" className="sr-only">
            Your name (max 20 characters)
          </label>
          <input
            ref={inputRef}
            id="steve-visitor-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            placeholder="Your name"
            maxLength={20}
            className="w-full px-2 py-1 text-[11px] font-bold border-2 border-[#0A0A0A] bg-[#EEF2FA] text-[#0A0A0A] placeholder-[#0A0A0A]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] transition-colors"
          />
        </div>

        {/* Gender Chips */}
        <div>
          <div className="text-[9px] font-bold uppercase text-[#0A0A0A]/60 mb-1 tracking-wider">
            Gender:
          </div>
          <div className="flex flex-col gap-1" role="radiogroup" aria-label="Gender selection">
            {genderOptions.map((opt) => {
              const isSelected = gender === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setGender(opt.id)}
                  className={`w-full text-left px-1.5 py-0.5 text-[9.5px] border font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FF5A1F] text-black border-[#0A0A0A] font-black shadow-[1px_1px_0px_#0A0A0A]'
                      : 'bg-white hover:bg-[#EEF2FA] text-[#0A0A0A] border-[#0A0A0A]/50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <span aria-hidden="true" className="text-[8px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions: Save & Skip */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-[#0A0A0A]/15 mt-0.5">
          <button
            type="submit"
            className="flex-1 py-1 px-1 bg-[#0A0A0A] text-white hover:bg-[#FF5A1F] hover:text-black font-black uppercase text-[9.5px] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="py-1 px-1.5 bg-[#EEF2FA] hover:bg-white text-[#0A0A0A] font-bold uppercase text-[9.5px] border-2 border-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
          >
            Skip
          </button>
        </div>

        {/* Forget Me (visible in edit mode or when name/identity is saved) */}
        {isEditMode && onForget && (
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={onForget}
              className="text-[9px] text-[#0A0A0A]/60 hover:text-[#FF5A1F] underline font-bold uppercase cursor-pointer"
            >
              Forget me
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SteveVisitorCard;
