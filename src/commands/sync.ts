// Command
import {flags} from '@oclif/command'
import Command from '../base-commit'

// Formatters
import ExportFormatter from '../services/formatters/project-export'
import Formatter from '../services/formatters/project-sync'

// Services
import Document from '../services/document'
import CommitOperationFormatter from '../services/formatters/commit-operation'
import DocumentExportFormatter from '../services/formatters/document-export'
import HookRunner from '../services/hook-runner'

// Types
import {Hooks} from '../types/document-config'

export default class Sync extends Command {
  public static description = 'Sync files in Accent and write them to your local filesystem'

  public static examples = [`$ accent sync`, `$ accent sync Localization-admin`]

  public static args = [...Command.args]
  public static flags = {
    ...Command.flags,
    orderBy: flags.string({
      default: 'index',
      options: ['index', 'key-asc']
    })
  }

  public async run() {
    const {args, flags} = this.parse(Sync)

    // Fetch config to sync, defaults to all config entries in sync config.
    const documents = this.projectConfig.sync(args.filename)
    const documentConfigs = documents.map(
      (document: Document) => document.config
    )

    // From all the documentConfigs, do the sync or peek operations and log the results.
    new Formatter(this.project!).log(documentConfigs)

    for (const document of documents) {
      await new HookRunner(document).run(Hooks.beforeSync)

      await Promise.all(this.processDocumentConfig(document))

      await new HookRunner(document).run(Hooks.afterSync)
    }

    if (!flags.write) return
    const formatter = new DocumentExportFormatter()

    // From all the documentConfigs, do the export, write to local file and log the results.
    new ExportFormatter().log(documentConfigs)

    for (const document of documents) {
      await new HookRunner(document).run(Hooks.beforeExport)

      await Promise.all(
        document.paths.map(path => {
          formatter.log(path)
          return document.export(path, flags)
        })
      )

      await new HookRunner(document).run(Hooks.afterExport)
    }
  }

  private processDocumentConfig(document: Document) {
    const {flags} = this.parse(Sync)
    const formatter = new CommitOperationFormatter()

    return document.paths.map(async path => {
      const operations = await document.sync(path, flags)

      if (operations.sync && !operations.peek) formatter.logSync(path)
      if (operations.peek) formatter.logPeek(path, operations.peek)

      return operations
    })
  }
}
