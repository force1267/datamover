# db2db
this script migrates data from a `Source` to a `Target`. it tries to move data in bulks but it depends on the `Job` implementation.

the user must implement their own `Job`, `Target` and `Source`.

the script uses a `commit` usually saved to `redis` so it can continue from where it stopped later. 

## Job
extend the `./job.js::Job` class to write your job.

place the job in `./jobs/[jobname]` directory.

import and add the job to exported list in `./availableJobs.js` file so it can be addressed using its `getName` method.

jobs have `state` that usually uses `redis` for its backend. `commits` use the job's `state`.

## source
to implement your source of data extend the `./job.js::Source` in your job implementation.

## target
to implement your target for saving data extend the `./job.js::Target` in your job implementation.

## Running
script is started like this

```bash
node index.js --options job1 job2
```

when using docker to run the script only pass the options. `node index.js` is set as `ENTRYPOINT`.

jobs are identified with their `getName` method

### options
you can run the jobs with some comand line options.

options are first accessed in `Job::init(opts: [string])`. you can parse any custom option for your job in the `init` function of that job.

options with value must use `--option=value` syntax without spaces.

#### `--restart-commit`
sets the commit to 0 and starts the migration from the begining. it will not try to clean the target before restarting the migration.

#### `--restart-commit-and-exit`
sets the commit to 0 but does not start the migration. it will not try to clean the target. the job will end after setting the commit to 0.

#### `--restart-if-finished`
the job will not restart after it was finished once. to restart the job use this option. this option sets the commit to 0 and starts the migration from the beginig. it will not try to clean the target.

