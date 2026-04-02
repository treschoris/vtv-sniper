export const digitToMonth = {
  2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio", 
  7: "Julio", 8: "Agosto", 9: "Septiembre", 0: "Octubre", 1: "Noviembre"
};

export function getVTVStatus(jurisdiction, year, km) {
  const age = 2026 - year;
  if (jurisdiction === 'PBA') {
    return age < 2 ? { status: 'Exento', info: 'Exento por ser menor a 2 años.' } 
                   : { status: 'Obligatorio', info: 'Anual (Regla tradicional PBA).' };
  }
  if (age < 5 && km <= 84000) return { status: 'Exento', info: 'Exento hasta año 5 o 84k km (Decreto 139).' };
  if (age >= 10 || km > 84000) return { status: 'Obligatorio', info: 'Anual (>10 años o >84k km).' };
  return { status: 'Obligatorio', info: 'Cada 2 años (Vehículo 5-10 años).' };
}
