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
   * **REGRAS CRÍTICAS DE USO:**
   * - **Aguardar 1 hora após cStat 137**: Quando não há mais documentos (cStat=137),
   *   DEVE aguardar 1 hora antes de nova consulta
   * - **Penalidade por uso indevido**: Consultas dentro de 1 hora após cStat=137
   *   resultam em cStat=656 e bloqueio do CNPJ por 1 hora
   * - **Ordem sequencial obrigatória**: Múltiplas aplicações para o mesmo CNPJ
   *   devem seguir sequência numerológica crescente
   * - **Máximo 50 documentos por consulta**: Resposta limitada a 50 documentos
   * - **Disponibilidade 90 dias**: Documentos disponíveis por até 3 meses
   *
   * **Códigos de Status:**
   * - 137: "Nenhum documento localizado" (aguardar 1 hora)
   * - 138: "Documento(s) localizado(s)"
   * - 656: "Rejeição: Consumo Indevido" (CNPJ bloqueado por 1 hora)
   *
   * @param inputs - Parâmetros da consulta
   * @param inputs.ultNSU - Último NSU conhecido (15 dígitos) - usar sempre o retornado pela consulta anterior
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
   * **REGRAS CRÍTICAS DE USO:**
   * - **Limite 20 consultas/hora**: Máximo 20 consultas por hora por CNPJ
   * - **Bloqueio por excesso**: Exceder 20 consultas/hora resulta em cStat=656
   *   e bloqueio do CNPJ por 1 hora
   * - **Disponibilidade 90 dias**: Documentos disponíveis por até 3 meses
   * - **Validação de permissão**: CNPJ/CPF deve ter permissão para consultar a NFe
   * - **Emitente restrito**: NFe não disponível para seu próprio emitente
   * - **Status válidos**: NFe canceladas ou denegadas são indisponíveis
   *
   * **Códigos de Status:**
   * - 137: "Nenhum documento localizado"
   * - 138: "Documento(s) localizado(s)"
   * - 217: "NFe inexistente para a chave de acesso informada"
   * - 236: "Chave de Acesso com dígito verificador inválido"
   * - 632: "Solicitação fora de prazo, NFe não disponível para download"
   * - 640: "CNPJ/CPF do interessado não possui permissão para consultar esta NFe"
   * - 641: "NFe indisponível para o emitente"
   * - 653: "NFe Cancelada, arquivo indisponível para download"
   * - 654: "NFe Denegada, arquivo indisponível para download"
   * - 656: "Consumo indevido - excedido o limite de 20 consultas por hora"
   *
   * @param inputs - Parâmetros da consulta
   * @param inputs.chNFe - Chave de acesso da NFe (44 dígitos) - deve ser válida e existir no Ambiente Nacional
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
   * **REGRAS CRÍTICAS DE USO:**
   * - **Limite 20 consultas/hora**: Máximo 20 consultas por hora por CNPJ
   * - **Bloqueio por excesso**: Exceder 20 consultas/hora resulta em cStat=656
   *   e bloqueio do CNPJ por 1 hora
   * - **Ordem sequencial obrigatória**: Múltiplas aplicações para o mesmo CNPJ
   *   devem seguir sequência numerológica crescente
   * - **NSU válido**: NSU não pode exceder o máximo disponível no Ambiente Nacional
   * - **Disponibilidade 90 dias**: Documentos disponíveis por até 3 meses
   * - **Uso para lacunas**: Destinado principalmente para fechar lacunas identificadas
   *
   * **Códigos de Status:**
   * - 137: "Nenhum documento localizado"
   * - 138: "Documento(s) localizado(s)"
   * - 589: "NSU informado superior ao maior NSU do Ambiente Nacional"
   * - 656: "Consumo indevido - excedido o limite de 20 consultas por hora"
   *
   * **Importante**: Para evitar uso indevido, as consultas devem seguir a sequência
   * numerológica ordenada de forma crescente. Tentativas sucessivas de busca por
   * registros já disponibilizados podem ser rejeitadas com erro "656–Rejeição:
   * Consumo Indevido".
   *
   * @param inputs - Parâmetros da consulta
   * @param inputs.NSU - NSU específico para consulta (15 dígitos) - deve ser válido e não exceder o máximo disponível
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
