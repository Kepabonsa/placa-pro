// Author: Kevin Pabón
// external imports
import { describe, expect, it } from 'vitest'

// internal imports
import { DateUtil } from '@/utils/DateUtil'
import { MockVehicleFixtures } from '@/lib/providers/mock-vehicle.fixtures'
import { TrafficLightService } from '@/lib/services/traffic-light.service'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

// 10:00 a. m. in Bogotá.
const REFERENCE_DATE = new Date('2026-11-25T15:00:00Z')

const buildReport = (plate: string): VehicleReportInterface => {
  const report = MockVehicleFixtures.build(plate, REFERENCE_DATE)
  if (!report) {
    throw new Error(`Missing fixture ${plate}`)
  }
  return report
}

const evaluateCodes = (report: VehicleReportInterface): string[] =>
  TrafficLightService.evaluate(report, REFERENCE_DATE).alerts.map((alert) => alert.code)

describe('TrafficLightService.evaluate — test plates', () => {
  it('KLM482 (Mazda CX-30 2022) is green with no alerts', () => {
    const assessment = TrafficLightService.evaluate(buildReport('KLM482'), REFERENCE_DATE)

    expect(assessment.status).toBe('green')
    expect(assessment.alerts).toEqual([])
    expect(assessment.headline).toBe('Negocio limpio: papeles al día y sin deudas.')
  })

  it('JTR915 (Onix Turbo 2021) is yellow: 2 SIMIT fines, Antioquia 2026 tax and SOAT in 18 days', () => {
    const assessment = TrafficLightService.evaluate(buildReport('JTR915'), REFERENCE_DATE)
    const [fines, taxes, soat] = assessment.alerts

    expect(assessment.status).toBe('yellow')
    expect(assessment.alerts.map((alert) => alert.code)).toEqual([
      'PENDING_FINES',
      'PENDING_TAXES',
      'SOAT_EXPIRING',
    ])
    expect(assessment.alerts.every((alert) => alert.severity === 'warning')).toBe(true)
    expect(fines?.title).toBe('2 comparendos pendientes en SIMIT')
    expect(fines?.detail).toContain('1.160.000')
    expect(taxes?.title).toBe('Impuesto Antioquia 2026 pendiente')
    expect(taxes?.detail).toContain('840.000')
    expect(soat?.title).toBe('SOAT vence en 18 días')
  })

  it('BXZ304 (Fortuner 2020) is red: active lien and total loss record', () => {
    const assessment = TrafficLightService.evaluate(buildReport('BXZ304'), REFERENCE_DATE)

    expect(assessment.status).toBe('red')
    expect(assessment.alerts.map((alert) => alert.code)).toEqual(['ACTIVE_LIEN', 'TOTAL_LOSS'])
    expect(assessment.alerts.every((alert) => alert.severity === 'critical')).toBe(true)
    expect(assessment.alerts[0]?.detail).toContain('Financiera Vehicular del Pacífico S.A.')
  })
})

describe('TrafficLightService.evaluate — strict rules', () => {
  it('red wins over yellow and critical alerts are listed first', () => {
    const report = buildReport('JTR915')
    report.legal.liens.push({ creditor: 'Banco de prueba', registeredAt: '2024-01-10' })

    const assessment = TrafficLightService.evaluate(report, REFERENCE_DATE)

    expect(assessment.status).toBe('red')
    expect(assessment.alerts[0]?.code).toBe('ACTIVE_LIEN')
    expect(assessment.alerts.slice(1).every((alert) => alert.severity === 'warning')).toBe(true)
  })

  it.each([
    [
      'embargo',
      (report: VehicleReportInterface): void => {
        report.legal.legalLimitations.push('Embargo Juzgado 3 Civil de Bogotá')
      },
      'LEGAL_LIMITATION',
    ],
    [
      'theft report',
      (report: VehicleReportInterface): void => {
        report.legal.hasTheftReport = true
      },
      'THEFT_REPORT',
    ],
    [
      'cancelled registration',
      (report: VehicleReportInterface): void => {
        report.legal.registrationStatus = 'cancelled'
      },
      'REGISTRATION_NOT_ACTIVE',
    ],
    [
      'theft claim in Fasecolda',
      (report: VehicleReportInterface): void => {
        report.fasecolda.claims.push({
          type: 'theft',
          occurredAt: '2024-07-01',
          insurer: 'Aseguradora de prueba',
          description: 'Hurto recuperado',
        })
      },
      'THEFT_CLAIM',
    ],
  ])('a clean vehicle with %s is red', (_label, mutate, expectedCode) => {
    const report = buildReport('KLM482')
    mutate(report)

    const assessment = TrafficLightService.evaluate(report, REFERENCE_DATE)

    expect(assessment.status).toBe('red')
    expect(assessment.alerts.map((alert) => alert.code)).toEqual([expectedCode])
  })

  it('a partial loss claim is yellow', () => {
    const report = buildReport('KLM482')
    report.fasecolda.claims.push({
      type: 'partial_loss',
      occurredAt: '2025-02-11',
      insurer: 'Aseguradora de prueba',
      description: 'Choque lateral reparado',
    })

    expect(TrafficLightService.evaluate(report, REFERENCE_DATE).status).toBe('yellow')
    expect(evaluateCodes(report)).toEqual(['PARTIAL_LOSS'])
  })

  it('paid taxes do not raise alerts', () => {
    const report = buildReport('KLM482')
    expect(report.debts.taxes.every((tax) => tax.status === 'paid')).toBe(true)
    expect(evaluateCodes(report)).toEqual([])
  })
})

describe('TrafficLightService.evaluate — SOAT and RTM', () => {
  it('an expired SOAT is yellow', () => {
    const report = buildReport('KLM482')
    report.documents.soat.expiresAt = DateUtil.addDays(REFERENCE_DATE, -1)

    expect(TrafficLightService.evaluate(report, REFERENCE_DATE).status).toBe('yellow')
    expect(evaluateCodes(report)).toEqual(['SOAT_EXPIRED'])
  })

  it('a missing SOAT counts as expired', () => {
    const report = buildReport('KLM482')
    report.documents.soat = { insurer: null, policyNumber: null, expiresAt: null }

    expect(evaluateCodes(report)).toEqual(['SOAT_EXPIRED'])
  })

  it('30 days left is "expiring soon" and 31 days is valid', () => {
    const expiringReport = buildReport('KLM482')
    expiringReport.documents.soat.expiresAt = DateUtil.addDays(REFERENCE_DATE, 30)
    const validReport = buildReport('KLM482')
    validReport.documents.soat.expiresAt = DateUtil.addDays(REFERENCE_DATE, 31)

    expect(evaluateCodes(expiringReport)).toEqual(['SOAT_EXPIRING'])
    expect(evaluateCodes(validReport)).toEqual([])
  })

  it('uses "hoy" and "mañana" for imminent expirations', () => {
    const todayReport = buildReport('KLM482')
    todayReport.documents.soat.expiresAt = DateUtil.addDays(REFERENCE_DATE, 0)
    const tomorrowReport = buildReport('KLM482')
    tomorrowReport.documents.soat.expiresAt = DateUtil.addDays(REFERENCE_DATE, 1)

    expect(TrafficLightService.evaluate(todayReport, REFERENCE_DATE).alerts[0]?.title).toBe(
      'SOAT vence hoy',
    )
    expect(TrafficLightService.evaluate(tomorrowReport, REFERENCE_DATE).alerts[0]?.title).toBe(
      'SOAT vence mañana',
    )
  })

  it('ignores the RTM of a vehicle that does not need it yet', () => {
    const report = buildReport('KLM482')
    expect(report.documents.technicalInspection.required).toBe(false)
    expect(evaluateCodes(report)).toEqual([])
  })

  it('a required RTM that expired is yellow', () => {
    const report = buildReport('BXZ304')
    report.legal.liens = []
    report.fasecolda.claims = []
    report.documents.technicalInspection.expiresAt = DateUtil.addDays(REFERENCE_DATE, -10)

    expect(TrafficLightService.evaluate(report, REFERENCE_DATE).status).toBe('yellow')
    expect(evaluateCodes(report)).toEqual(['RTM_EXPIRED'])
  })
})
