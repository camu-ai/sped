import { Ambiente } from "../schema"
import type {
  NFeDistribuicaoConfig,
  NFeRecepcaoEventoConfig,
  UFCode,
} from "../schema"

export const validateDistribuicaoConfig = (
  config: NFeDistribuicaoConfig
): void => {
  if (!config.cUFAutor) {
    throw new Error(`cUFAutor is required`)
  }

  if (!config.cnpj && !config.cpf) {
    throw new Error(`CNPJ or CPF must be provided`)
  }

  if (config.cnpj && config.cpf) {
    throw new Error(`Provide either CNPJ or CPF, not both`)
  }

  if (
    ![`1`, `2`, Ambiente.PRODUCAO, Ambiente.HOMOLOGACAO].includes(
      config.tpAmb as string
    )
  ) {
    throw new Error(`tpAmb must be "1" (Production) or "2" (Homologation)`)
  }

  if (!config.pfx && (!config.cert || !config.key)) {
    throw new Error(
      `Certificate configuration required: provide either PFX with passphrase or cert and key files`
    )
  }

  if (config.cnpj && !/^\d{14}$/.test(config.cnpj)) {
    throw new Error(`CNPJ must contain 14 numeric digits`)
  }

  if (config.cpf && !/^\d{11}$/.test(config.cpf)) {
    throw new Error(`CPF must contain 11 numeric digits`)
  }
}

export const validateRecepcaoEventoConfig = (
  config: NFeRecepcaoEventoConfig
): void => {
  if (!config.cnpj && !config.cpf) {
    throw new Error(`CNPJ or CPF must be provided`)
  }

  if (config.cnpj && config.cpf) {
    throw new Error(`Provide either CNPJ or CPF, not both`)
  }

  if (
    ![`1`, `2`, Ambiente.PRODUCAO, Ambiente.HOMOLOGACAO].includes(
      config.tpAmb as string
    )
  ) {
    throw new Error(`tpAmb must be "1" (Production) or "2" (Homologation)`)
  }

  if (!config.pfx && (!config.cert || !config.key)) {
    throw new Error(
      `Certificate configuration required: provide either PFX with passphrase or cert and key files`
    )
  }

  if (config.cnpj && !/^\d{14}$/.test(config.cnpj)) {
    throw new Error(`CNPJ must contain 14 numeric digits`)
  }

  if (config.cpf && !/^\d{11}$/.test(config.cpf)) {
    throw new Error(`CPF must contain 11 numeric digits`)
  }
}

export const validateUltNSU = (ultNSU: string): void => {
  if (!ultNSU || !/^\d{15}$/.test(ultNSU)) {
    throw new Error(`ultNSU must contain 15 numeric digits`)
  }
}

export const validateNSU = (NSU: string): void => {
  if (!NSU || !/^\d{15}$/.test(NSU)) {
    throw new Error(`NSU must contain 15 numeric digits`)
  }
}

export const validateChNFe = (chNFe: string): void => {
  if (!chNFe || !/^\d{44}$/.test(chNFe)) {
    throw new Error(`chNFe must contain 44 numeric digits`)
  }
}

// Funções utilitárias para normalizar enums para strings
export const normalizeUFCode = (uf: UFCode | string): string => {
  return typeof uf === `string` ? uf : uf
}

export const normalizeAmbiente = (ambiente: Ambiente | `1` | `2`): string => {
  return typeof ambiente === `string` ? ambiente : ambiente
}
