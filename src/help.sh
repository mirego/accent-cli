help_message="Usage: accent [OPERATION] [OPTION]...
Sync, merge and export with the Accent API

  --api-url            URL of the Accent API endpoint
  --api-key            key that identify the API Client, you can find it in your project’s settings

  --input-file         local file that will be sent to Accent on a sync or merge

  --language           language identifier
  --merge-type         merge type parameter that will be sent to Accent
                       Available merge types: smart, force and passive

  --document-format    format parameter that will be sent to Accent
                       Available format: strings rails_yml json simple_json android_xml es6_module java_properties java_properties_xml gettext

  --document-path      path parameter represent the "module" that the operation targets
                       This is to support multi file projects in Accent.

  --order-by           order of the keys
                       Available order: key, -key, updated, -updated, index or -index
                       Default order: index

  --help               show this message

Examples:
  accent sync --input-file=locale.json --language=fr --document-format=json --document-path=locale
  accent merge --input-file=activerecord.en.yml --language=en --document-format=json --document-path=locale
  accent export --language=en --document-format=json --document-path=locale 

Writing on export:

The Accent export command only outputs the file content. If you want to write to a file, you could do something like:

  accent export --language=en --document-format=json --document-path=locale > ~/Documents/project/file.json

Why not cUrl?

This package only execute cUrl commands. Here is a mapping of an accent cli command vs a cUrl command:

  accent sync
    --api-url=https://api.accent.reviews
    --api-key=test123
    --input-file=locale.json
    --language=fr
    --document-format=json
    --document-path=public-section

  curl 'https://api.accent.reviews/sync'
    -F document-format=json
    -F document-path=public-section
    -F file=@locale.json
    -F language=fr
    -H 'Authorization: Bearer test1234'"
