if [ -z "$API_KEY" ]; then
  printf "${UWhite}Parameter error:${Color_Off} \`--api-key\` must be set, you’ll find the value in your project settings\n"
  has_error=true
fi

if [ -z "$API_URL" ]; then
  printf "${UWhite}Parameter error:${Color_Off} \`--api-url\` must be set to a valid URL\n"
  has_error=true
fi

if [ "$API_URL" -eq "https://accent2.mirego.com" ]; then
  printf "${UWhite}Suggestion:${Color_Off} The URL should be the API (https://api.accent.reviews), not the Web application ;) \n"
  has_error=true
fi

if [ "$API_URL" -eq "https://app.accent.reviews" ]; then
  printf "${UWhite}Suggestion:${Color_Off} The URL should be the API (https://api.accent.reviews), not the Web application ;) \n"
  has_error=true
fi

if [ "$API_URL" -eq "https://www.accent.reviews" ]; then
  printf "${UWhite}Suggestion:${Color_Off} The URL should be the API (https://api.accent.reviews), not the Web application ;) \n"
  has_error=true
fi

if [ -n "$input_file" ] && [ ! -e "$input_file" ]; then
  printf "${UWhite}Parameter error:${Color_Off} \`$input_file\` must be a file\n"
  has_error=true
fi

if [ -z "$document_format" ]; then
  printf "${UWhite}Parameter error:${Color_Off} \`--document-format\` parameter must be set on all file operations (Try something like --document-format=json)\n"
  has_error=true
fi

if [ -z "$file_language" ]; then
  printf "${UWhite}Parameter error:${Color_Off} \`--language\` parameter must be set (Try something like --language=fr)\n"
  has_error=true
fi

if [ $has_error == "true" ]; then
  printf "${URed}Error:${Color_Off} ${Red}Cannot complete operation${Color_Off}\n"
  exit 1
fi
