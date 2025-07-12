import { validateDistribuicaoConfig } from "../logic/validation"
import { buildDistribuicaoRequest } from "../logic/soap-builder"
import { sendSoapRequest } from "../adapters/soap-client"
import { parseDistribuicaoResponse } from "../adapters/response-parser"
import type { DistribuicaoResponse, NFeDistribuicaoConfig } from "../schema"

export class NFeDistribuicao {
  private readonly config: NFeDistribuicaoConfig

  constructor(config: NFeDistribuicaoConfig) {
    validateDistribuicaoConfig(config)
    this.config = Object.freeze({ ...config })
  }

  async consultaUltNSU(inputs: {
    ultNSU: string
  }): Promise<DistribuicaoResponse> {
    try {
      const requestXml = buildDistribuicaoRequest({
        type: `distNSU`,
        config: this.config,
        params: { ultNSU: inputs.ultNSU },
      })

      const response = await sendSoapRequest({
        xml: requestXml,
        config: this.config,
        endpoint: `NFeDistribuicaoDFe`,
      })

      return parseDistribuicaoResponse({
        responseXml: response.data,
        requestXml,
        status: response.status,
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : `Unknown error`,
        status: 500,
      }
    }
  }

  async consultaChNFe(inputs: {
    chNFe: string
  }): Promise<DistribuicaoResponse> {
    try {
      const requestXml = buildDistribuicaoRequest({
        type: `consChNFe`,
        config: this.config,
        params: { chNFe: inputs.chNFe },
      })

      const response = await sendSoapRequest({
        xml: requestXml,
        config: this.config,
        endpoint: `NFeDistribuicaoDFe`,
      })

      return parseDistribuicaoResponse({
        responseXml: response.data,
        requestXml,
        status: response.status,
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : `Unknown error`,
        status: 500,
      }
    }
  }

  async consultaNSU(inputs: { NSU: string }): Promise<DistribuicaoResponse> {
    try {
      const requestXml = buildDistribuicaoRequest({
        type: `consNSU`,
        config: this.config,
        params: { NSU: inputs.NSU },
      })

      const response = await sendSoapRequest({
        xml: requestXml,
        config: this.config,
        endpoint: `NFeDistribuicaoDFe`,
      })

      return parseDistribuicaoResponse({
        responseXml: response.data,
        requestXml,
        status: response.status,
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : `Unknown error`,
        status: 500,
      }
    }
  }
}

export const createNFeDistribuicao = (
  config: NFeDistribuicaoConfig
): NFeDistribuicao => {
  return new NFeDistribuicao(config)
}
