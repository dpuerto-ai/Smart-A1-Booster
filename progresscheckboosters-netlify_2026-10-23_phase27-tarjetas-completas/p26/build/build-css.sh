#!/bin/sh
# Rebuilds css/*.css from the classes used in the HTML and js files.
# Run this after adding or changing any Tailwind class (e.g. bg-emerald-500) in a page or script.
# First time only:  cd build && npm install
cd "$(dirname "$0")" || exit 1
for page in a1 a2 b1 b2 c1 index; do
  ./node_modules/.bin/tailwindcss -c tailwind.$page.config.cjs -i input.css -o ../css/$page.css --minify || exit 1
done
echo "CSS rebuilt."
