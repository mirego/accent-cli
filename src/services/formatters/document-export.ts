// Vendor
import chalk from 'chalk'

export default class DocumentExportFormatter {
  public log(path: string, error?: string) {
    console.log('  ', chalk.white(path))
    if (error) {
      console.log('  ', chalk.red('✗ Unable to write the file from Accent'))
      console.log('  ', chalk.red(error))
    } else {
      console.log(
        '  ',
        chalk.green('✓ Successfully wrote the locale file from Accent')
      )
    }
    console.log('')
  }
}
