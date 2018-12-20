// Vendor
import * as FormData from 'form-data'
import * as fs from 'fs-extra'
import fetch, {Response} from 'node-fetch'
import * as path from 'path'

// Services
import Tree from './tree'

// Types
import {ApiConfig} from '../types/api-config'
import {DocumentConfig} from '../types/document-config'
import {OperationResponse} from '../types/operation-response'

const enum OperationName {
  Sync = 'sync',
  AddTranslation = 'addTranslations'
}

export default class Document {
  public readonly paths: string[]
  public readonly config: DocumentConfig
  private readonly api: ApiConfig

  constructor(documentConfig: DocumentConfig, apiConfig: ApiConfig) {
    this.config = documentConfig
    this.api = apiConfig
    this.paths = new Tree(this.config).list()
  }

  public async sync(file: string, options: any) {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(file))
    formData.append('document_path', this.parseDocumentName(file))
    formData.append('document_format', this.config.format)
    formData.append('language', this.config.language)

    let url = `${this.api.url}/sync`
    if (!options.write) url = `${url}/peek`

    const response = await fetch(url, {
      body: formData,
      headers: this.authorizationHeader(),
      method: 'POST'
    })

    return this.handleResponse(response, options, OperationName.Sync)
  }

  public async addTranslations(file: string, options: any) {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(file))
    formData.append('document_path', this.parseDocumentName(file))
    formData.append('document_format', this.config.format)
    formData.append('language', this.config.language)
    formData.append('merge_type', options.mergeType)

    let url = `${this.api.url}/add-translations`
    if (!options.write) url = `${url}/peek`

    const response = await fetch(url, {
      body: formData,
      headers: this.authorizationHeader(),
      method: 'POST'
    })

    return this.handleResponse(response, options, OperationName.AddTranslation)
  }

  public async export(file: string, options: any) {
    const query = [
      ['document_path', this.parseDocumentName(file)],
      ['document_format', this.config.format],
      ['language', this.config.language],
      ['order_by', options.orderBy]
    ]
      .map(([name, value]) => `${name}=${value}`)
      .join('&')

    const url = `${this.api.url}/export?${query}`
    const response = await fetch(url, {
      headers: this.authorizationHeader()
    })

    return this.writeResponseToFile(response, file)
  }

  private authorizationHeader() {
    return {authorization: `Bearer ${this.api.key}`}
  }

  private parseDocumentName(file: string): string {
    return path.basename(file).replace(path.extname(file), '')
  }

  private writeResponseToFile(response: Response, file: string) {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(file, {autoClose: true})
      response.body.pipe(fileStream)
      response.body.on('error', reject)
      fileStream.on('finish', resolve)
    })
  }

  private async handleResponse(
    response: Response,
    options: any,
    operationName: OperationName
  ): Promise<OperationResponse> {
    if (options.write) {
      if (response.status >= 400) {
        return {[operationName]: {success: false}, peek: false}
      }

      return {[operationName]: {success: true}, peek: false}
    } else {
      const {data} = await response.json()

      return {peek: data, [operationName]: {success: true}}
    }
  }
}
