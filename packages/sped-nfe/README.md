# @camu-ai/sped-nfe

Uma biblioteca TypeScript para consumir os web services da Sefaz brasileira para distribuição de NFe (Nota Fiscal Eletrônica) e eventos de manifestação do destinatário. Esta biblioteca fornece uma interface limpa para interagir com os serviços de Distribuição DFe e Recepção de Eventos da NFe.

## Funcionalidades

- 🔐 **Autenticação por certificado digital** (arquivos PFX ou cert/key)
- 📦 **Consultas de distribuição de documentos NFe** (por ultNSU, NSU ou chNFe)
- 📤 **Eventos de manifestação do destinatário** (confirmação, ciência, etc.)
- 🏗️ **Arquitetura hexagonal** com separação clara de responsabilidades
- ✅ **Suporte completo ao TypeScript** com type safety total
- 🧪 **95%+ de cobertura de testes** garantindo confiabilidade
- 🌐 **Suporte dual de build** (ESM/CJS) para máxima compatibilidade
- 🎯 **Enums para UF, Ambiente e Tipos de Evento** facilitando o desenvolvimento
- 🔄 **Compatibilidade retroativa** mantida com versões anteriores

## Instalação

```bash
npm install @camu-ai/sped-nfe
# ou
yarn add @camu-ai/sped-nfe
# ou
pnpm add @camu-ai/sped-nfe
```

## Início Rápido

```typescript
import { createNFeDistribuicao, UFCode, Ambiente } from "@camu-ai/sped-nfe"
import { readFileSync } from "fs"

// Carregue seu certificado
const pfx = readFileSync("./certificado.pfx")

const config = {
  cUFAutor: UFCode.PR, // Paraná
  cnpj: "12345678901234",
  tpAmb: Ambiente.HOMOLOGACAO, // Homologação
  pfx,
  passphrase: "senha-do-certificado",
}

// Criar instância do controlador de distribuição
const distribuicao = createNFeDistribuicao(config)

// Consultar novos documentos
const resultado = await distribuicao.consultaUltNSU({
  ultNSU: "000000000000001",
})

console.log(resultado.data)
```

## Configuração

### Autenticação por Certificado Digital

A biblioteca suporta dois tipos de autenticação por certificado:

#### Opção 1: Certificado PFX

```typescript
import { UFCode, Ambiente } from "@camu-ai/sped-nfe"

const config = {
  cUFAutor: UFCode.PR,
  cnpj: "12345678901234",
  tpAmb: Ambiente.HOMOLOGACAO,
  pfx: Buffer.from(conteudoArquivoPfx),
  passphrase: "senha-do-seu-certificado",
}
```

#### Opção 2: Arquivos Separados de Certificado e Chave

```typescript
import { UFCode, Ambiente } from "@camu-ai/sped-nfe"

const config = {
  cUFAutor: UFCode.PR,
  cnpj: "12345678901234",
  tpAmb: Ambiente.HOMOLOGACAO,
  cert: "conteudo-do-certificado-string",
  key: "conteudo-da-chave-privada-string",
}
```

### Parâmetros de Configuração

| Parâmetro    | Tipo                   | Obrigatório | Descrição                                       |
| ------------ | ---------------------- | ----------- | ----------------------------------------------- |
| `cUFAutor`   | UFCode \| string       | Sim         | Código do estado onde a empresa está autorizada |
| `cnpj`       | string                 | Sim\*       | CNPJ da empresa (14 dígitos)                    |
| `cpf`        | string                 | Sim\*       | CPF da pessoa física (11 dígitos)               |
| `tpAmb`      | Ambiente \| '1' \| '2' | Sim         | Ambiente: Producao/1 ou Homologacao/2           |
| `pfx`        | Buffer                 | Sim\*\*     | Conteúdo do arquivo de certificado PFX          |
| `passphrase` | string                 | Sim\*\*     | Senha do certificado PFX                        |
| `cert`       | string                 | Sim\*\*     | Conteúdo do certificado (alternativa ao PFX)    |
| `key`        | string                 | Sim\*\*     | Conteúdo da chave privada (alternativa ao PFX)  |

\*Deve ser fornecido `cnpj` ou `cpf`, mas não ambos.
\*\*Deve ser fornecido `pfx` + `passphrase` ou `cert` + `key`.

## Referência da API

### Classes Controladoras

#### `NFeDistribuicao`

Classe para controle de distribuição de documentos NFe.

```typescript
import { createNFeDistribuicao } from "@camu-ai/sped-nfe"

const distribuicao = createNFeDistribuicao(config)
```

#### `consultaUltNSU(inputs)`

Consulta documentos baseado no último NSU (Número Sequencial Único).

```typescript
const resultado = await distribuicao.consultaUltNSU({
  ultNSU: "000000000000001",
})
```

**Parâmetros:**

- `ultNSU`: Último NSU conhecido (15 dígitos)

**Exemplo de Retorno:**

```typescript
{
  data: {
    tpAmb: "2",
    verAplic: "1.5.11",
    cStat: "138",
    xMotivo: "Documento(s) localizado(s)",
    dhResp: "2022-06-21T10:48:14-03:00",
    ultNSU: "000000000000050",
    maxNSU: "000000000000212",
    docZip: [{
      nsu: "000000000000049",
      schema: "resNFe_v1.01.xsd",
      xml: "<resNFe>...</resNFe>",
      json: { /* XML parseado como JSON */ }
    }]
  },
  reqXml: "<!-- XML da requisição SOAP -->",
  resXml: "<!-- XML da resposta SOAP -->",
  status: 200
}
```

#### `consultaNSU(inputs)`

Consulta um documento específico por NSU.

```typescript
const resultado = await distribuicao.consultaNSU({
  NSU: "000000000000045",
})
```

**Parâmetros:**

- `NSU`: NSU específico para consulta (15 dígitos)

#### `consultaChNFe(inputs)`

Consulta um documento específico pela chave de acesso da NFe.

```typescript
const resultado = await distribuicao.consultaChNFe({
  chNFe: "41000000000000000000000000000000000000000039",
})
```

**Parâmetros:**

- `chNFe`: Chave de acesso da NFe (44 dígitos)

### `NFeRecepcaoEvento`

Classe para controle de recepção de eventos NFe.

```typescript
import { createNFeRecepcaoEvento } from "@camu-ai/sped-nfe"

const recepcaoEvento = createNFeRecepcaoEvento(config)
```

#### `enviarEvento(inputs)`

Envia eventos de manifestação do destinatário para documentos NFe.

```typescript
import { TipoEvento } from "@camu-ai/sped-nfe"

const resultado = await recepcaoEvento.enviarEvento({
  idLote: "1",
  lote: [
    {
      chNFe: "41000000000000000000000000000000000000000039",
      tpEvento: TipoEvento.CONFIRMACAO_OPERACAO,
    },
  ],
})
```

**Parâmetros:**

- `idLote`: Identificador do lote (string)
- `lote`: Array de eventos para enviar

**Tipos de Evento:**

- `TipoEvento.CONFIRMACAO_OPERACAO` (210200): Confirmação da Operação
- `TipoEvento.CIENCIA_OPERACAO` (210210): Ciência da Operação
- `TipoEvento.DESCONHECIMENTO_OPERACAO` (210220): Desconhecimento da Operação
- `TipoEvento.OPERACAO_NAO_REALIZADA` (210240): Operação não Realizada

**Exemplo de Retorno:**

```typescript
{
  data: {
    idLote: "1",
    tpAmb: "2",
    verAplic: "AN_1.4.3",
    cOrgao: "91",
    cStat: "128",
    xMotivo: "Lote de evento processado",
    infEvento: [{
      tpAmb: "2",
      verAplic: "AN_1.4.3",
      cOrgao: "91",
      cStat: "135",
      xMotivo: "Evento registrado e vinculado a NF-e",
      chNFe: "41000000000000000000000000000000000000000039",
      tpEvento: "210200",
      xEvento: "Confirmacao da Operacao",
      nSeqEvento: "1",
      CNPJDest: "12345678901234",
      dhRegEvento: "2022-06-21T11:20:10-03:00",
      nProt: "891220000003301"
    }]
  },
  reqXml: "<!-- XML da requisição SOAP -->",
  resXml: "<!-- XML da resposta SOAP -->",
  status: 200
}
```

## Uso Avançado

### Tratamento de Erros

Todas as funções retornam um objeto de resposta que pode conter `data` ou `error`:

```typescript
const resultado = await nfeConsultaUltNSU({ config, ultNSU: "000000000000001" })

if (resultado.error) {
  console.error("Requisição falhou:", resultado.error)
  console.log("XML da Requisição:", resultado.reqXml)
  console.log("XML da Resposta:", resultado.resXml)
  console.log("Status HTTP:", resultado.status)
} else {
  console.log("Sucesso:", resultado.data)
}
```

### Trabalhando com CPF ao invés de CNPJ

```typescript
const configComCpf = {
  cUFAutor: "41",
  cpf: "12345678901", // Use CPF ao invés de CNPJ
  tpAmb: "2",
  pfx: bufferCertificado,
  passphrase: "senha",
}

const resultado = await nfeConsultaUltNSU({
  config: configComCpf,
  ultNSU: "000000000000001",
})
```

### Enviando Eventos com Justificativa

Para eventos que requerem justificativa (como "Operação não Realizada"):

```typescript
const resultado = await nfeEnviarEvento({
  config: configEvento,
  idLote: "1",
  lote: [
    {
      chNFe: "41000000000000000000000000000000000000000039",
      tpEvento: TipoEvento.OPERACAO_NAO_REALIZADA,
      justificativa: "Produto não foi entregue no prazo acordado",
    },
  ],
})
```

### Processando Lotes de Documentos

```typescript
// Obter múltiplos documentos
const resultado = await nfeConsultaUltNSU({
  config,
  ultNSU: "000000000000001",
})

if (resultado.data?.docZip) {
  for (const doc of resultado.data.docZip) {
    console.log(`Processando documento NSU: ${doc.nsu}`)
    console.log(`Schema: ${doc.schema}`)
    console.log(`Conteúdo XML:`, doc.xml)
    console.log(`JSON parseado:`, doc.json)
  }
}
```

## Configuração de Ambiente

### Ambiente de Produção

```typescript
const configProd = {
  cUFAutor: "41",
  cnpj: "12345678901234",
  tpAmb: "1", // Produção
  pfx: certificadoProducao,
  passphrase: "senha-prod",
}
```

### Ambiente de Homologação

```typescript
const configHom = {
  cUFAutor: "41",
  cnpj: "12345678901234",
  tpAmb: "2", // Homologação
  pfx: certificadoHomologacao,
  passphrase: "senha-hom",
}
```

## Códigos de Estados (cUFAutor)

Você pode usar o enum `UFCode` ou os códigos diretos:

```typescript
import { UFCode } from "@camu-ai/sped-nfe"

// Usando enum (recomendado)
const config = {
  cUFAutor: UFCode.SP, // São Paulo
  // ... outras configurações
}

// Ou usando código direto
const config2 = {
  cUFAutor: "35", // São Paulo
  // ... outras configurações
}
```

**Estados disponíveis:**

- `UFCode.RO` ('11'): Rondônia
- `UFCode.AC` ('12'): Acre
- `UFCode.AM` ('13'): Amazonas
- `UFCode.RR` ('14'): Roraima
- `UFCode.PA` ('15'): Pará
- `UFCode.AP` ('16'): Amapá
- `UFCode.TO` ('17'): Tocantins
- `UFCode.MA` ('21'): Maranhão
- `UFCode.PI` ('22'): Piauí
- `UFCode.CE` ('23'): Ceará
- `UFCode.RN` ('24'): Rio Grande do Norte
- `UFCode.PB` ('25'): Paraíba
- `UFCode.PE` ('26'): Pernambuco
- `UFCode.AL` ('27'): Alagoas
- `UFCode.SE` ('28'): Sergipe
- `UFCode.BA` ('29'): Bahia
- `UFCode.MG` ('31'): Minas Gerais
- `UFCode.ES` ('32'): Espírito Santo
- `UFCode.RJ` ('33'): Rio de Janeiro
- `UFCode.SP` ('35'): São Paulo
- `UFCode.PR` ('41'): Paraná
- `UFCode.SC` ('42'): Santa Catarina
- `UFCode.RS` ('43'): Rio Grande do Sul
- `UFCode.MS` ('50'): Mato Grosso do Sul
- `UFCode.MT` ('51'): Mato Grosso
- `UFCode.GO` ('52'): Goiás
- `UFCode.DF` ('53'): Distrito Federal

## Suporte ao TypeScript

Esta biblioteca é escrita em TypeScript e fornece type safety completo:

```typescript
import {
  UFCode,
  Ambiente,
  TipoEvento,
  type NFeDistribuicaoConfig,
  type NFeRecepcaoEventoConfig,
  type DistribuicaoResponse,
  type EventoResponse,
  type EventoLote,
} from "@camu-ai/sped-nfe"

// Todos os parâmetros e tipos de retorno são tipados
const config: NFeDistribuicaoConfig = {
  cUFAutor: UFCode.PR,
  cnpj: "12345678901234",
  tpAmb: Ambiente.HOMOLOGACAO,
  pfx: bufferCertificado,
  passphrase: "senha",
}

// Exemplo de evento tipado
const evento: EventoLote = {
  chNFe: "41000000000000000000000000000000000000000039",
  tpEvento: TipoEvento.CIENCIA_OPERACAO,
}
```

## Requisitos

- Node.js 16+
- TypeScript 4.7+ (para projetos TypeScript)
- Certificado digital válido emitido por uma Autoridade Certificadora brasileira
- CNPJ ou CPF registrado na Sefaz

## Exemplos Práticos

### Consulta Completa de Distribuição

```typescript
import { nfeConsultaUltNSU } from "@camu-ai/sped-nfe"
import { readFileSync } from "fs"

async function consultarDocumentos() {
  const certificado = readFileSync("./certificado.pfx")

  const config = {
    cUFAutor: "35", // São Paulo
    cnpj: "12345678000195",
    tpAmb: "2", // Homologação
    pfx: certificado,
    passphrase: "minha-senha",
  }

  try {
    const resultado = await nfeConsultaUltNSU({
      config,
      ultNSU: "000000000000001",
    })

    if (resultado.data) {
      console.log("Status:", resultado.data.cStat)
      console.log("Motivo:", resultado.data.xMotivo)
      console.log("Último NSU:", resultado.data.ultNSU)
      console.log("Máximo NSU:", resultado.data.maxNSU)

      if (resultado.data.docZip) {
        console.log(`Encontrados ${resultado.data.docZip.length} documentos`)

        resultado.data.docZip.forEach((doc, index) => {
          console.log(`Documento ${index + 1}:`)
          console.log(`  NSU: ${doc.nsu}`)
          console.log(`  Schema: ${doc.schema}`)
          console.log(`  XML: ${doc.xml.substring(0, 100)}...`)
        })
      }
    }
  } catch (error) {
    console.error("Erro na consulta:", error)
  }
}

consultarDocumentos()
```

### Manifestação do Destinatário

```typescript
import { nfeEnviarEvento } from "@camu-ai/sped-nfe"

async function manifestarCiencia() {
  const config = {
    cUFAutor: "35",
    cnpj: "12345678000195",
    tpAmb: "2",
    pfx: certificado,
    passphrase: "senha",
  }

  const resultado = await nfeEnviarEvento({
    config,
    idLote: Date.now().toString(), // ID único do lote
    lote: [
      {
        chNFe: "35220314200166000187550010000000001123456789",
        tpEvento: TipoEvento.CIENCIA_OPERACAO,
      },
    ],
  })

  if (resultado.data) {
    console.log("Evento processado com sucesso!")
    console.log("ID do Lote:", resultado.data.idLote)
    console.log("Status:", resultado.data.cStat)

    resultado.data.infEvento?.forEach((evento) => {
      console.log(`Evento para NFe ${evento.chNFe}:`)
      console.log(`  Status: ${evento.cStat}`)
      console.log(`  Motivo: ${evento.xMotivo}`)
      console.log(`  Protocolo: ${evento.nProt}`)
    })
  }
}
```

### Operação não Realizada com Justificativa

```typescript
async function rejeitarOperacao() {
  const resultado = await nfeEnviarEvento({
    config,
    idLote: Date.now().toString(),
    lote: [
      {
        chNFe: "35220314200166000187550010000000001123456789",
        tpEvento: TipoEvento.OPERACAO_NAO_REALIZADA,
        justificativa:
          "Mercadoria não foi entregue devido ao endereço incorreto",
      },
    ],
  })

  if (resultado.error) {
    console.error("Erro ao enviar evento:", resultado.error)
  } else {
    console.log("Operação rejeitada com sucesso!")
  }
}
```

## Regras Críticas e Limitações dos Web Services

### ⚠️ **ATENÇÃO: Leia Antes de Usar em Produção**

Os web services da Sefaz possuem regras rígidas de uso para prevenir abuso e garantir disponibilidade. **O não cumprimento dessas regras resulta em bloqueio automático do CNPJ por 1 hora**.

### Distribuição DFe - Regras Gerais

#### Disponibilidade de Documentos

- **90 dias**: Documentos ficam disponíveis por até 3 meses após recepção
- **50 documentos/consulta**: Máximo retornado por requisição
- **Ordem sequencial**: NSUs devem ser consultados em ordem crescente
- **Múltiplas aplicações**: Se várias aplicações do mesmo CNPJ fazem consultas, todas devem seguir a mesma sequência

### `consultaUltNSU` - Regras Específicas

#### 🚨 **Regra Crítica - Aguardar 1 Hora após cStat 137**

```typescript
// ❌ ERRADO - Pode causar bloqueio
const resultado1 = await distribuicao.consultaUltNSU({
  ultNSU: "000000000000001",
})
if (resultado1.data?.cStat === "137") {
  // NÃO faça nova consulta imediatamente!
  const resultado2 = await distribuicao.consultaUltNSU({
    ultNSU: "000000000000001",
  })
}

// ✅ CORRETO - Aguardar 1 hora
const resultado1 = await distribuicao.consultaUltNSU({
  ultNSU: "000000000000001",
})
if (resultado1.data?.cStat === "137") {
  console.log(
    "Nenhum documento encontrado. Aguardar 1 hora antes da próxima consulta."
  )
  // Implementar delay de 1 hora ou agendar para depois
}
```

#### Comportamento Esperado

- **cStat 137**: "Nenhum documento localizado" → **AGUARDAR 1 HORA**
- **cStat 138**: "Documento(s) localizado(s)" → Pode continuar consultando
- **cStat 656**: "Consumo Indevido" → **CNPJ BLOQUEADO POR 1 HORA**

### `consultaChNFe` e `consultaNSU` - Limite de Consultas

#### 🚨 **Limite: 20 Consultas por Hora**

```typescript
// ❌ ERRADO - Pode exceder limite
for (let i = 0; i < 25; i++) {
  await distribuicao.consultaChNFe({ chNFe: chaves[i] })
}

// ✅ CORRETO - Respeitar limite
const MAX_CONSULTAS_HORA = 20
let consultasRealizadas = 0
const inicioHora = Date.now()

for (const chave of chaves) {
  if (consultasRealizadas >= MAX_CONSULTAS_HORA) {
    const tempoEspera = 3600000 - (Date.now() - inicioHora)
    if (tempoEspera > 0) {
      console.log(`Aguardando ${tempoEspera}ms para nova consulta...`)
      await new Promise((resolve) => setTimeout(resolve, tempoEspera))
      consultasRealizadas = 0
    }
  }

  await distribuicao.consultaChNFe({ chNFe: chave })
  consultasRealizadas++
}
```

### Manifestação de Eventos - Regras Específicas

#### Limitações por Lote

- **Máximo 20 eventos por lote**
- **idLote único**: Não reutilizar identificadores
- **Uma manifestação por tipo**: Cada NFe pode receber apenas um evento de cada tipo

#### Evento 210240 - Justificativa Obrigatória

```typescript
// ✅ CORRETO - Operação não realizada com justificativa
await recepcaoEvento.enviarEvento({
  idLote: Date.now().toString(),
  lote: [
    {
      chNFe: "35220314200166000187550010000000001123456789",
      tpEvento: TipoEvento.OPERACAO_NAO_REALIZADA,
      justificativa: "Mercadoria não foi entregue devido ao endereço incorreto",
    },
  ],
})
```

## Códigos de Status e Erros

### Distribuição DFe

| Código | Descrição                                       | Ação Necessária                               |
| ------ | ----------------------------------------------- | --------------------------------------------- |
| `137`  | Nenhum documento localizado                     | **Aguardar 1 hora** antes da próxima consulta |
| `138`  | Documento(s) localizado(s)                      | Processar documentos e continuar              |
| `217`  | NFe inexistente para a chave informada          | Verificar chave de acesso                     |
| `236`  | Chave de Acesso com dígito verificador inválido | Corrigir chave de acesso                      |
| `589`  | NSU superior ao máximo disponível               | Usar NSU válido                               |
| `632`  | Solicitação fora de prazo (>90 dias)            | Documento não mais disponível                 |
| `640`  | CNPJ/CPF sem permissão para consultar           | Verificar permissões                          |
| `641`  | NFe indisponível para o emitente                | Emitente não pode baixar própria NFe          |
| `653`  | NFe Cancelada, indisponível                     | Documento cancelado                           |
| `654`  | NFe Denegada, indisponível                      | Documento denegado                            |
| `656`  | **Consumo Indevido**                            | **CNPJ bloqueado por 1 hora**                 |

### Eventos de Manifestação

| Código | Descrição                           | Ação Necessária                         |
| ------ | ----------------------------------- | --------------------------------------- |
| `128`  | Lote de evento processado           | Verificar status individual dos eventos |
| `135`  | Evento registrado e vinculado a NFe | Sucesso                                 |
| `573`  | Duplicidade de evento               | Evento já foi registrado                |
| `656`  | Rejeição: Falha na comunicação      | Verificar conectividade ou aguardar     |

## Implementação de Boas Práticas

### Controle de Rate Limiting

```typescript
class NFeRateLimiter {
  private consultasChNFe = 0
  private ultimaConsultaChNFe = 0
  private ultimoUltNSUCom137 = 0

  async consultaChNFeComLimite(distribuicao: NFeDistribuicao, chNFe: string) {
    const agora = Date.now()

    // Verificar limite de 20/hora
    if (agora - this.ultimaConsultaChNFe > 3600000) {
      this.consultasChNFe = 0
    }

    if (this.consultasChNFe >= 20) {
      const espera = 3600000 - (agora - this.ultimaConsultaChNFe)
      throw new Error(`Limite excedido. Aguardar ${espera}ms`)
    }

    const resultado = await distribuicao.consultaChNFe({ chNFe })
    this.consultasChNFe++
    this.ultimaConsultaChNFe = agora

    return resultado
  }

  async consultaUltNSUComControle(
    distribuicao: NFeDistribuicao,
    ultNSU: string
  ) {
    const agora = Date.now()

    // Verificar se deve aguardar após último 137
    if (this.ultimoUltNSUCom137 && agora - this.ultimoUltNSUCom137 < 3600000) {
      const espera = 3600000 - (agora - this.ultimoUltNSUCom137)
      throw new Error(`Aguardar ${espera}ms após último cStat 137`)
    }

    const resultado = await distribuicao.consultaUltNSU({ ultNSU })

    if (resultado.data?.cStat === "137") {
      this.ultimoUltNSUCom137 = agora
    }

    return resultado
  }
}
```

### Tratamento de Erros Específicos

```typescript
async function consultarComTratamento(
  distribuicao: NFeDistribuicao,
  ultNSU: string
) {
  try {
    const resultado = await distribuicao.consultaUltNSU({ ultNSU })

    switch (resultado.data?.cStat) {
      case "137":
        console.log("Nenhum documento encontrado. Aguardando 1 hora...")
        // Implementar lógica de espera
        break

      case "138":
        console.log(
          `Encontrados documentos. Próximo NSU: ${resultado.data.ultNSU}`
        )
        // Processar documentos
        break

      case "656":
        console.error("CNPJ bloqueado por uso indevido. Aguardar 1 hora.")
        // Implementar lógica de bloqueio
        break

      default:
        console.log(
          `Status: ${resultado.data?.cStat} - ${resultado.data?.xMotivo}`
        )
    }

    return resultado
  } catch (error) {
    console.error("Erro na consulta:", error)
    throw error
  }
}
```

## ⚠️ Avisos Importantes

1. **Nunca ignore cStat 137**: Sempre aguarde 1 hora antes de nova consulta
2. **Monitore limites**: Implemente contadores para evitar exceder 20 consultas/hora
3. **Use NSU sequencial**: Sempre use o último NSU retornado pela consulta anterior
4. **Trate bloqueios**: Implemente lógica para lidar com cStat 656
5. **Teste em homologação**: Valide sua implementação antes de usar em produção
6. **Documente chamadas**: Mantenha log das consultas para debug
7. **Implemente retry**: Use backoff exponencial para falhas temporárias

**Lembre-se**: O não cumprimento dessas regras pode resultar em bloqueio do seu CNPJ e interrupção dos serviços fiscais da sua aplicação.

## Licença

Licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para problemas e solicitações de recursos, visite nosso [repositório no GitHub](https://github.com/camu-ai/sped).

## Documentação Relacionada

- [Manual Técnico da NFe](https://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [Documentação dos Web Services da Sefaz](https://www.nfe.fazenda.gov.br/portal/webServices.aspx)
- [Requisitos de Certificado Digital](https://www.nfe.fazenda.gov.br/portal/certificados.aspx)
- [Portal Nacional da NFe](https://www.nfe.fazenda.gov.br/)

## Contribuindo

Contribuições são bem-vindas! Por favor, leia nossas diretrizes de contribuição antes de enviar um pull request.

## Changelog

Veja o arquivo [CHANGELOG.md](./CHANGELOG.md) para detalhes sobre mudanças em cada versão.
