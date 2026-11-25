// Author: Kevin Pabón
// internal imports
import { DateUtil } from '@/utils/DateUtil'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

/**
 * Realistic Colombian test vehicles. Expiration and fine dates are relative to the reference date
 * so the demo behaves the same any day (e.g. JTR915's SOAT always expires in 18 days).
 */
export class MockVehicleFixtures {
  /**
   * Builds the report of a test plate.
   * @param plate - Normalized plate.
   * @param referenceDate - Instant used as "today".
   * @returns The report, or null when the plate is not a test plate.
   */
  static build(plate: string, referenceDate: Date): VehicleReportInterface | null {
    switch (plate) {
      case 'KLM482':
        return MockVehicleFixtures.buildGreenMazda(referenceDate)
      case 'JTR915':
        return MockVehicleFixtures.buildYellowOnix(referenceDate)
      case 'BXZ304':
        return MockVehicleFixtures.buildRedFortuner(referenceDate)
      default:
        return null
    }
  }

  private static buildGreenMazda(referenceDate: Date): VehicleReportInterface {
    return {
      plate: 'KLM482',
      provider: 'mock',
      fetchedAt: referenceDate.toISOString(),
      vehicle: {
        brand: 'Mazda',
        line: 'CX-30',
        version: 'Grand Touring 2.5 AT',
        modelYear: 2022,
        color: 'Gris Máquina',
        bodyType: 'Camioneta',
        serviceType: 'Particular',
        fuelType: 'Gasolina',
        engineDisplacementCc: 2488,
        transitAuthority: 'Secretaría Distrital de Movilidad de Bogotá',
        registeredAt: '2022-03-15',
      },
      legal: {
        registrationStatus: 'active',
        ownerCount: 1,
        liens: [],
        legalLimitations: [],
        hasTheftReport: false,
      },
      debts: {
        fines: [],
        taxes: [{ department: 'Bogotá D.C.', year: 2026, amount: 2_180_000, status: 'paid' }],
      },
      documents: {
        soat: {
          insurer: 'Seguros Bolívar',
          policyNumber: 'SB-74120098',
          expiresAt: DateUtil.addDays(referenceDate, 214),
        },
        // Private vehicles get their first RTM five years after registration (2027).
        technicalInspection: { required: false, expiresAt: null, inspectionCenter: null },
      },
      fasecolda: { code: '05601232', referenceValue: 98_000_000, claims: [] },
    }
  }

  private static buildYellowOnix(referenceDate: Date): VehicleReportInterface {
    return {
      plate: 'JTR915',
      provider: 'mock',
      fetchedAt: referenceDate.toISOString(),
      vehicle: {
        brand: 'Chevrolet',
        line: 'Onix Turbo',
        version: 'LTZ 1.0T AT',
        modelYear: 2021,
        color: 'Blanco Summit',
        bodyType: 'Automóvil',
        serviceType: 'Particular',
        fuelType: 'Gasolina',
        engineDisplacementCc: 999,
        transitAuthority: 'Secretaría de Movilidad de Envigado',
        registeredAt: '2021-06-10',
      },
      legal: {
        registrationStatus: 'active',
        ownerCount: 2,
        liens: [],
        legalLimitations: [],
        hasTheftReport: false,
      },
      debts: {
        fines: [
          {
            code: 'C29',
            infraction: 'Conducir a velocidad superior a la máxima permitida',
            issuedAt: DateUtil.addDays(referenceDate, -96),
            city: 'Medellín',
            amount: 650_000,
          },
          {
            code: 'C02',
            infraction: 'Estacionar en sitios prohibidos',
            issuedAt: DateUtil.addDays(referenceDate, -41),
            city: 'Envigado',
            amount: 510_000,
          },
        ],
        taxes: [
          { department: 'Antioquia', year: 2026, amount: 840_000, status: 'pending' },
          { department: 'Antioquia', year: 2025, amount: 905_000, status: 'paid' },
        ],
      },
      documents: {
        soat: {
          insurer: 'Seguros SURA',
          policyNumber: 'SU-31877410',
          expiresAt: DateUtil.addDays(referenceDate, 18),
        },
        technicalInspection: {
          required: true,
          expiresAt: DateUtil.addDays(referenceDate, 197),
          inspectionCenter: 'CDA Envigado',
        },
      },
      fasecolda: { code: '01606118', referenceValue: 62_500_000, claims: [] },
    }
  }

  private static buildRedFortuner(referenceDate: Date): VehicleReportInterface {
    return {
      plate: 'BXZ304',
      provider: 'mock',
      fetchedAt: referenceDate.toISOString(),
      vehicle: {
        brand: 'Toyota',
        line: 'Fortuner',
        version: 'SRV 2.8 Diésel 4x4 AT',
        modelYear: 2020,
        color: 'Blanco Perla',
        bodyType: 'Camioneta',
        serviceType: 'Particular',
        fuelType: 'Diésel',
        engineDisplacementCc: 2755,
        transitAuthority: 'Secretaría de Movilidad de Santiago de Cali',
        registeredAt: '2020-02-20',
      },
      legal: {
        registrationStatus: 'active',
        ownerCount: 3,
        liens: [{ creditor: 'Financiera Vehicular del Pacífico S.A.', registeredAt: '2023-08-14' }],
        legalLimitations: [],
        hasTheftReport: false,
      },
      debts: {
        fines: [],
        taxes: [{ department: 'Valle del Cauca', year: 2026, amount: 3_460_000, status: 'paid' }],
      },
      documents: {
        soat: {
          insurer: 'La Previsora',
          policyNumber: 'LP-55029371',
          expiresAt: DateUtil.addDays(referenceDate, 95),
        },
        technicalInspection: {
          required: true,
          expiresAt: DateUtil.addDays(referenceDate, 128),
          inspectionCenter: 'CDA del Valle',
        },
      },
      fasecolda: {
        code: '09006071',
        referenceValue: 172_000_000,
        claims: [
          {
            type: 'total_loss',
            occurredAt: '2023-05-02',
            insurer: 'Aseguradora reportante (dato de prueba)',
            description: 'Pérdida total por daños tras choque',
          },
        ],
      },
    }
  }
}
