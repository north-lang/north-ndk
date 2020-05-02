
react-scripts test --env=jsdom --maxWorkers=3 $@
code=$?

# yarn test-server-stop

if [ $code -ne 0 ];
  then exit $code
fi
