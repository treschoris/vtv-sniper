export const digitToMonth = {
  2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio", 
  7: "Julio", 8: "Agosto", 9: "Septiembre", 0: "Octubre", 1: "Noviembre"
};

// Helper for index-based names
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function getVTVStatus(jurisdiction, year, km, lastDigit, patentMonth = 0) {
  const currentYear = 2026;
  const currentMonth = 3; // April (0-indexed is 3)
  const targetMonthName = digitToMonth[lastDigit];
  const targetMonthIndex = monthNames.indexOf(targetMonthName);

  // --- PBA LOGIC (Strict Annual) ---
  if (jurisdiction === 'PBA') {
    const age = currentYear - year;
    if (age < 2) return { status: 'Exento', info: 'Exento por ser menor a 2 años (Regla PBA).' };
    
    if (currentMonth > targetMonthIndex) {
      return { status: 'VENCIDA', info: `Debiste verificar en ${targetMonthName}.`, color: '#e53e3e' };
    }
    return { status: 'OBLIGATORIO', info: `Te toca en ${targetMonthName} ${currentYear}.` };
  }

  // --- CABA LOGIC (Decreto 139 / 48-month logic) ---
  // 1. Check for the 4-year / 64k km "Golden Exemption"
  const monthsSincePatent = (currentYear - year) * 12 + (currentMonth - patentMonth);
  
  if (monthsSincePatent < 48 && km <= 64000) {
    return { status: 'EXENTO', info: 'Vehículo nuevo. Exento hasta cumplir 4 años o 64.000km.' };
  }

  // 2. Determine Frequency (Annual vs Biennial)
  const age = currentYear - year;
  const isAnnual = (age >= 10 || km > 84000);
  const frequencyText = isAnnual ? "Anual" : "Cada 2 años";

  if (currentMonth > targetMonthIndex) {
    return { status: 'VENCIDA', info: `Plazo vencido en ${targetMonthName}. Renovación: ${frequencyText}.`, color: '#e53e3e' };
  }

  return { status: 'OBLIGATORIO', info: `Te toca en ${targetMonthName}. Frecuencia: ${frequencyText}.` };
}
