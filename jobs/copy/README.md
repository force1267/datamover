# Copy
copies content of source file to target file line by line.

this job is just an example for using this script.

## Running
script is started like this

```bash
node index.js --source=source.txt --target=target.txt copy
```

### `commits`
this job uses `redis` to set the `state` and `commit` its status to be able to continue after a restart.