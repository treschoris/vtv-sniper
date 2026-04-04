/**
 * VTV Logic Module - Decreto 139 (CABA) and PBA Rules
 * Calculates VTV expiration dates based on jurisdiction, vehicle age, and license plate digit
 */

export const DIGIT_TO_MONTH: Record<number, string> = {
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  0: "Octubre",
  1: "Noviembre",
};

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export interface VTVResult {
  status: string;
  info: string;
  color?: string;
}

const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 3; // April (0-indexed)
const CABA_NEW_VEHICLE_MONTHS = 48;
const CABA_NEW_VEHICLE_KM = 64000;
const CABA_ANNUAL_AGE_THRESHOLD = 10;
const CABA_ANNUAL_KM_THRESHOLD = 84000;
const PBA_MIN_AGE_EXEMPT = 2;

/**
 * Validates input parameters
 */
function validateInputs(
  jurisdiction: string,
  year: number,
  km: number,
  lastDigit: number,
  patentMonth: number
): { valid: boolean; error?: string } {
  if (!["CABA", "PBA"].includes(jurisdiction)) {
    return { valid: false, error: "Jurisdicción inválida" };
  }
  if (year < 1900 || year > CURRENT_YEAR) {
    return { valid: false, error: "Año de patentamiento inválido" };
  }
  if (km < 0) {
    return { valid: false, error: "Kilometraje no puede ser negativo" };
  }
  if (![0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(lastDigit)) {
    return { valid: false, error: "Último dígito inválido" };
  }
  if (patentMonth < 0 || patentMonth > 11) {
    return { valid: false, error: "Mes de patentamiento inválido" };
  }
  return { valid: true };
}

/**
 * Gets the VTV status for a vehicle in PBA (Provincia de Buenos Aires)
 */
function getPBAStatus(
  year: number,
  lastDigit: number
): VTVResult {
  const age = CURRENT_YEAR - year;
  const targetMonthName = DIGIT_TO_MONTH[lastDigit];
  const targetMonthIndex = MONTH_NAMES.indexOf(targetMonthName);

  if (age < PBA_MIN_AGE_EXEMPT) {
    return {
      status: "Exento",
      info: "Exento por ser menor a 2 años (Regla PBA).",
    };
  }

  if (CURRENT_MONTH > targetMonthIndex) {
    return {
      status: "VENCIDA",
      info: `Debiste verificar en ${targetMonthName}.`,
      color: "#e53e3e",
    };
  }

  return {
    status: "OBLIGATORIO",
    info: `Te toca en ${targetMonthName} ${CURRENT_YEAR}.`,
  };
}

/**
 * Gets the VTV status for a vehicle in CABA (Decreto 139)
 */
function getCABAStatus(
  year: number,
  km: number,
  lastDigit: number,
  patentMonth: number
): VTVResult {
  const targetMonthName = DIGIT_TO_MONTH[lastDigit];
  const targetMonthIndex = MONTH_NAMES.indexOf(targetMonthName);
  const monthsSincePatent =
    (CURRENT_YEAR - year) * 12 + (CURRENT_MONTH - patentMonth);

  // Golden Exemption: New vehicles under 4 years AND 64k km
  if (
    monthsSincePatent < CABA_NEW_VEHICLE_MONTHS &&
    km <= CABA_NEW_VEHICLE_KM
  ) {
    return {
      status: "EXENTO",
      info: "Vehículo nuevo. Exento hasta cumplir 4 años o 64.000 km.",
    };
  }

  // Determine frequency (Annual vs Biennial)
  const age = CURRENT_YEAR - year;
  const isAnnual = age >= CABA_ANNUAL_AGE_THRESHOLD || km > CABA_ANNUAL_KM_THRESHOLD;
  const frequencyText = isAnnual ? "Anual" : "Cada 2 años";

  if (CURRENT_MONTH > targetMonthIndex) {
    return {
      status: "VENCIDA",
      info: `Plazo vencido en ${targetMonthName}. Renovación: ${frequencyText}.`,
      color: "#e53e3e",
    };
  }

  return {
    status: "OBLIGATORIO",
    info: `Te toca en ${targetMonthName}. Frecuencia: ${frequencyText}.`,
  };
}

/**
 * Main function to get VTV status
 * @param jurisdiction - "CABA" or "PBA"
 * @param year - Vehicle registration year
 * @param km - Current vehicle mileage
 * @param lastDigit - Last digit of license plate
 * @param patentMonth - Month of registration (0-11), required for CABA
 */
export function getVTVStatus(
  jurisdiction: string,
  year: number,
  km: number,
  lastDigit: number,
  patentMonth: number = 0
): VTVResult {
  const validation = validateInputs(
    jurisdiction,
    year,
    km,
    lastDigit,
    patentMonth
  );

  if (!validation.valid) {
    return {
      status: "Error",
      info: validation.error || "Datos inválidos",
      color: "#e53e3e",
    };
  }

  if (jurisdiction === "PBA") {
    return getPBAStatus(year, lastDigit);
  }

  return getCABAStatus(year, km, lastDigit, patentMonth);
}
