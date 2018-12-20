// Command
import {flags} from '@oclif/command'
import Command from '../base-commit'

// Formatters
import Formatter from '../services/formatters/project-add-translations'
import ExportFormatter from '../services/formatters/project-export'

// Services
import Document from '../services/document'
import CommitOperationFormatter from '../services/formatters/commit-operation'
import DocumentExportFormatter from '../services/formatters/document-export'
import HookRunner from '../services/hook-runner'

// Types
import {Hooks} from '../types/document-config'

export default class AddTranslations extends Command {
  public static description = 'Add translations in Accent and write them to your local filesystem'

  public static examples = [
    `$ accent add-translations`,
    `$ accent add-translations Localization-admin`
  ]

  public static args = [...Command.args]
  public static flags = {
    ...Command.flags,
    mergeType: flags.string({
      default: 'passive',
      options: ['smart', 'force', 'passive'],
      required: false
    }),
    orderBy: flags.string({
      default: 'index',
      options: ['index', 'key-asc']
    })
  }

  public async run() {
    const {args, flags} = this.parse(AddTranslations)

    // Fetch config to add translations, defaults to all config entries in addTranslations config.
    const documents = this.projectConfig.addTranslations(args.filename)
    const documentConfigs = documents.map(
      (document: Document) => document.config
    )

    // From all the documentConfigs, do the add translations or peek operations and log the results.
    new Formatter(this.project!).log(documentConfigs)

    for (const document of documents) {
      await new HookRunner(document).run(Hooks.beforeAddTranslations)

      await Promise.all(this.processDocumentConfig(document))

      await new HookRunner(document).run(Hooks.afterAddTranslations)
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
    const {flags} = this.parse(AddTranslations)
    const formatter = new CommitOperationFormatter()

    return document.paths.map(async path => {
      const operations = await document.addTranslations(path, flags)

      if (operations.addTranslations && !operations.peek) {
        formatter.logAddTranslation(path)
      }

      if (operations.peek) formatter.logPeek(path, operations.peek)

      return operations
    })
  }
}
