import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

const SAVE_DELAY = 400;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSave'> & {
  value: string;
  onSave: (value: string) => void;
};

/**
 * Text input that saves ~400 ms after typing stops (and on blur).
 * Empty values are never saved; on blur the field reverts to the stored value.
 * Remote updates are picked up only while the field is not focused.
 */
export function DebouncedInput({ value: stored, onSave, onFocus, onBlur, onKeyDown, ...rest }: Props) {
  const [value, setValue] = useState(stored);
  const focused = useRef(false);
  const save = useDebouncedCallback(onSave, SAVE_DELAY);

  useEffect(() => {
    if (!focused.current) setValue(stored);
  }, [stored]);

  return (
    <input
      {...rest}
      value={value}
      onFocus={(e) => {
        focused.current = true;
        onFocus?.(e);
      }}
      onChange={(e) => {
        setValue(e.target.value);
        if (e.target.value.trim()) save.call(e.target.value);
      }}
      onBlur={(e) => {
        focused.current = false;
        save.flush();
        if (!value.trim()) setValue(stored);
        onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.currentTarget.blur();
        onKeyDown?.(e);
      }}
    />
  );
}
