 find src -type f -exec sh -c '
  for f do
    echo "=====> $f :"; cat $f
  done;echo
' sh {} + > liste.txt