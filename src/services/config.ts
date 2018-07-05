// Vendor
import {error} from '@oclif/errors'
import * as fs from 'fs-extra'

// Services
import Document from './document'

// Types
import {ApiConfig} from '../types/api-config'
import {Config} from '../types/config'
import {DocumentConfig} from '../types/document-config'

export default class ConfigFetcher {
  private readonly config: Config

  constructor() {
    this.config = fs.readJsonSync('accent.json')
  }

  public sync(nameInConfig: string): Document[] {
    return this.operationConfig(nameInConfig, this.config.sync)
  }

  public addTranslations(nameInConfig: string): Document[] {
    return this.operationConfig(nameInConfig, this.config.addTranslations)
  }

  public api(): ApiConfig {
    return this.config.api
  }

  private operationConfig(
    nameInConfig: string,
    documentConfigs: DocumentConfig[]
  ) {
    const documentConfig =
      nameInConfig && documentConfigs.find(({name}) => name === nameInConfig)
    if (!documentConfig && nameInConfig) {
      error('No match in your config for this file')
    }

    const selectedDocumentConfigs = documentConfig
      ? [documentConfig]
      : documentConfigs

    if (!selectedDocumentConfigs.length) {
      error('You must have at least 1 document set in your config')
    }

    return selectedDocumentConfigs.map(
      documentConfig => new Document(documentConfig, this.api())
    )
  }
}
