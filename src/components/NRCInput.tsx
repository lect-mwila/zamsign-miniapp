import React from 'react';
import { formatNRCInput, isValidNRC } from '@/lib/utils/nrc';
import { useFormContext } from 'react-hook-form';

export default function NRCInput({ name, label }: { name: string; label: string }) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const value = watch(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNRCInput(e.target.value);
    setValue(name, formatted, { shouldValidate: true });
  };

  return (
    <div>
      <label>{label} *</label>
      <input
        {...register(name)}
        onChange={handleChange}
        placeholder="123456/78/1"
        maxLength={12}           // 6 + 1 + 2 + 1 + 1 = 11 + slash positions
        className="input"
      />
      {errors[name] && <p className="text-red-500 text-sm">{errors[name]?.message}</p>}
    </div>
  );
}