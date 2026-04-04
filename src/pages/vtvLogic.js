export const digitToMonth = {
  2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio", 
  7: "Julio", 8: "Agosto", 9: "Septiembre", 0: "Octubre", 1: "Noviembre"
};

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function getVTVStatus(jurisdiction, year, km, lastDigit, patentMonth = 0) {
  const currentYear = 2026;
  const currentMonth = 3; // Abril 2026
  const targetMonthName = digitToMonth[lastDigit];
  const targetMonthIndex = monthNames.indexOf(targetMonthName);

  if (jurisdiction === 'PBA') {
    const age = currentYear - year;
    if (age < 2) return { status: 'EXENTO', info: 'Menor a 2 años.', action: 'No necesitás verificar aún en PBA.', color: '#10B981' };
    if (currentMonth > targetMonthIndex) return { status: 'VENCIDA', info: `Debiste verificar en ${targetMonthName}.`, action: 'Multas en PBA pueden superar los $1.8M.', color: '#EF4444' };
    return { status: 'PRÓXIMA', info: `Te toca en ${targetMonthName} ${currentYear}.`, action: 'Prepará el matafuegos y luces.', color: '#2563EB' };
  }

  const monthsSincePatent = (currentYear - year) * 12 + (currentMonth - patentMonth);
  if (monthsSincePatent < 48 && km <= 64000) {
    return { status: 'EXENTO', info: 'Exento por Decreto 139 (Menor a 4 años o 64k km).', action: 'Disfrutá la exención.', color: '#10B981' };
  }

  const age = currentYear - year;
  const isAnnual = (age >= 10 || km > 84000);
  const freqLabel = isAnnual ? "ANUAL (+10 años o +84k km)" : "BIENAL (Cada 2 años)";

  if (currentMonth > targetMonthIndex) return { status: 'VENCIDA', info: `Venció en ${targetMonthName}.`, action: `Tu frecuencia es ${freqLabel}. Sacá turno urgente.`, color: '#EF4444' };
  return { status: 'OBLIGATORIA', info: `Te toca en ${targetMonthName}.`, action: `Frecuencia: ${freqLabel}. Reservá con antelación.`, color: '#2563EB' };
}
