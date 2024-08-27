
class Source {
  // returns [SourceDoc]
  // from: int
  // to: int
  // from, to: range inclusive from, exclusive to
  async read(from, to) { throw `Source (${this.constructor.name}): read Not Implemented.`; }
  // returns int. number of rows in the table
  async getLength() { throw `Source (${this.constructor.name}): getLength Not Implemented.`; }
}

class Target {
  // entries: [TargetDoc]
  async write(entries) { throw `Target (${this.constructor.name}): write Not Implemented.`; }
}

class SourceDoc { }
class TargetDoc { }

// Abstract
class Job {
  getName() {
    throw `Job (${this.constructor.name}): getName Not Implemented.
    should return the extended job's name`;
  }

  async init(opts) { }

  async getSource() {
    throw `Job (${this.constructor.name}): getSource Not Implemented.
    should return the 'Source' object`;
  }
  async getTarget() {
    throw `Job (${this.constructor.name}): getTarget Not Implemented.
    should return the 'Target' object`;
  }
  transformEntry(srcDoc) {
    throw `Job (${this.constructor.name}): transformEntry Not Implemented.
    should accept 'SourceDoc' arg and return the 'TargetDoc' object`;
  }
  transformBulk(entries) {
    return entries.filter(entry => entry !== null).flat();
  }

  async getState(key) {
    throw `Job (${this.constructor.name}): getState Not Implemented.
    should accept string key arg and return an object as value from the state or null if state is empty.`;
  }
  async setState(key, value) {
    throw `Job (${this.constructor.name}): setState Not Implemented.
    should accept string key and value object args and set the state`;
  }

  async commit(number) {
    return this.setState(`job_${this.getName()}_commit_number`, number);
  }
  async readCommit() {
    return this.getState(`job_${this.getName()}_commit_number`);
  }

  getBulkNumberOfItems() {
    return 1000;
  }

  async execute(opts) {
    await this.init(opts);

    if (opts.includes('--restart-commit-and-exit')) {
      console.log('setting commit to 0 with \'--restart-commit-and-exit\' option.');
      await this.commit(0);
      return;
    }

    if (opts.includes('--restart-commit')) {
      console.log('starting from the begining with \'--restart-commit\' option.');
      await this.commit(0);
    }

    const src = await this.getSource();
    const target = await this.getTarget();

    const bulkLen = this.getBulkNumberOfItems();
    const len = await src.getLength();
    const bulkNumber = parseInt(len / bulkLen) === (len / bulkLen) ?
      parseInt(len / bulkLen) : parseInt(len / bulkLen) + 1;

    const rc = await this.readCommit();
    if (rc >= bulkNumber - 1) {
      if (opts.includes('--restart-if-finished')) {
        console.log('starting from the begining because last session has ended' +
          ' and \'--restart-if-finished\' option is given.');
        await this.commit(0);
      } else {
        console.log('not starting the job because last session has ended' +
          ' and \'--restart-if-finished\' option is not given.');
        return;
      }
    }
    if (rc === null) {
      await this.commit(0);
    }

    let lastPerc = 0;
    let i = await this.readCommit();
    while (i < bulkNumber) {
      const srcBulk = await src.read(i * bulkLen, (i + 1) * bulkLen);
      const entries = [];
      for (let j = 0; j < srcBulk.length; j++) {
        const entry = this.transformEntry(srcBulk[j]);
        entries[j] = entry;
      }
      const transformedEntries = this.transformBulk(entries);
      await target.write(transformedEntries);
      await this.commit(i);

      const perc = i * 100 / (bulkNumber + 1);
      if (perc - lastPerc >= 1) {
        console.log(`Job ${this.getName()} progress: ${parseInt(perc)}%`);
        lastPerc = perc;
      }

      const c = await this.readCommit();
      i = c + 1;
    }
  }
}

module.exports = {
  Source,
  Target,
  SourceDoc,
  TargetDoc,
  Job,
};
