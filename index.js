const availableJobs = require('./availableJobs');

const jobsList = {};

let shouldStop = false;

function gracefullShutdown() {
  console.log("exit signal recieved.");
  shouldStop = true;
}

process.on('SIGINT', () => {
  gracefullShutdown();
  setTimeout(process.exit, 10000, 2);
});

process.on('SIGTERM', () => {
  gracefullShutdown();
  setTimeout(process.exit, 10000, 3);
});

async function main() {
  try {
    for (const job of availableJobs) {
      const jobName = job.getName();
      if (jobName in jobsList) {
        console.warn(jobName, 'name is being used by multiple jobs');
      }
      jobsList[jobName] = job;
    }

    const argv = [];
    const opts = [];
    for (let i = 2; i < process.argv.length; i++) {
      const argi = process.argv[i];
      if (argi[0] === '-') {
        opts.push(argi);
      } else {
        argv.push(argi);
      }
    }

    const jobs = argv.filter(s => s !== '').map(s => s.trim());
    let jobsExist = true;
    for (const jobName of jobs) {
      if (!(jobName in jobsList)) {
        console.error(jobName, 'is not a registered job');
        jobsExist = false;
      }
    }
    if (!jobsExist) {
      throw 'Some requested jobs are not registered';
    }
    console.log('DB2DB job is ready');

    for (const jobName of jobs) {
      const job = jobsList[jobName];
      const retries = [3, 5, 30, 60, 'FAIL'];
      for (const seconds of retries) {
        try {
          if (shouldStop) {
            return;
          }
          console.log('Running', `'${jobName}'`);
          await job.execute(opts);
          break;
        } catch (err) {
          if (seconds === 'FAIL') {
            throw err;
          }
          console.error(err);
          console.log(jobName, 'failed. Retring after', seconds, 'seconds');
          await new Promise(res => setTimeout(() => res(), seconds * 1000));
        }
      }
    }

    console.log('DB2DB job is done');
    return;
  } catch (error) {
    console.error(error);
    console.error('DB2DB job is going down');
    setTimeout(() => {
      process.exit(1);
    }, 100);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', error);
});

main().then(() => {
  setTimeout(() => { process.exit(0); }, 100);
}).catch((error) => {
  console.log(error);
  setTimeout(() => { process.exit(1); }, 100);
});

