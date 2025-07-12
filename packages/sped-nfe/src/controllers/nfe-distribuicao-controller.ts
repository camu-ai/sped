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

  /**
   * Consulta documentos fiscais a partir do último NSU conhecido.
   *
   * Considerando que o Ambiente Nacional gera NSU sem lacunas, o processo de
   * distribuição de DF-e estabelecido a partir do NSU informado disponibiliza
   * ao interessado uma sequência numerológica ordenada de forma crescente.
   *
   * Retorna cStat 137 quando nenhum documento é localizado ou cStat 138
   * quando documentos são encontrados.
   *
   * @param inputs - Parâmetros da consulta
   * @param inputs.ultNSU - Último NSU conhecido (15 dígitos)
   * @returns Promise com a resposta da distribuição contendo os documentos encontrados
   */
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

  /**
   * Consulta um documento fiscal específico pela chave de acesso da NFe.
   *
   * Permite consultar pontualmente uma NFe específica através de sua chave
   * de acesso de 44 dígitos. Útil quando se conhece a chave exata do documento
   * que se deseja obter.
   *
   * Retorna cStat 137 quando o documento não é localizado ou cStat 138
   * quando o documento é encontrado.
   *
   * @param inputs - Parâmetros da consulta
   * @param inputs.chNFe - Chave de acesso da NFe (44 dígitos)
   * @returns Promise com a resposta da distribuição contendo o documento solicitado
   */
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

  /**
   * Consulta um documento fiscal específico por NSU.
   *
   * Neste caso, o interessado deve consultar pontualmente o NSU identificado
   * como faltante em sua base de dados. Útil para recuperar documentos específicos
   * quando há lacunas na sequência de NSUs já baixados.
   *
   * Importante: Para evitar uso indevido, as consultas devem seguir a sequência
   * numerológica ordenada de forma crescente. Tentativas sucessivas de busca por
   * registros já disponibilizados podem ser rejeitadas com erro "656–Rejeição:
   * Consumo Indevido".
   *
   * @param inputs - Parâmetros da consulta
   * @param inputs.NSU - NSU específico para consulta (15 dígitos)
   * @returns Promise com a resposta da distribuição contendo o documento do NSU solicitado
   */
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
