import React, { useState } from 'react';

export default function InputPesos() {
  // displayValue es lo que ve el usuario (ej. "1.500.000")
  const [displayValue, setDisplayValue] = useState('');
  // rawValue es el número real que enviarías a tu base de datos o API (ej. "1500000")
  const [rawValue, setRawValue] = useState('');

  const handleChange = (e) => {
    // 1. Capturamos el valor y eliminamos cualquier cosa que no sea un dígito (\D)
    const inputValue = e.target.value;
    const numericString = inputValue.replace(/\D/g, '');

    // 2. Si el input queda vacío, limpiamos ambos estados
    if (numericString === '') {
      setDisplayValue('');
      setRawValue('');
      return;
    }

    // 3. Formateamos el string numérico a formato de pesos (con puntos para miles)
    const formatter = new Intl.NumberFormat('es-CO');
    const formattedNumber = formatter.format(parseInt(numericString, 10));

    // 4. Actualizamos los estados
    setDisplayValue(formattedNumber);
    setRawValue(numericString);
  };

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      <label htmlFor="amount" className="font-medium text-gray-700">
        Valor en Pesos
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          $
        </span>
        <input
          id="amount"
          type="text" // Usamos text, pero controlamos que solo reciba números
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Esto es solo para que veas el valor real guardado en memoria */}
      <span className="text-sm text-gray-500">
        Valor real para el backend: {rawValue || '0'}
      </span>
    </div>
  );
}