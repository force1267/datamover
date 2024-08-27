const {
  Source,
  Target,
  Job,
} = require('../../job');

const config = require('./config');

const fs = require('fs');

class FileSource extends Source {
  constructor() {
    super();
    this.fileName = null;
  }
  init() {
    if (typeof this.fileName !== 'string') {
      throw 'file name was not given. use \'--source=file\' and \'--target=file\'';
    }
    if (!fs.existsSync(this.fileName)) {
      throw `${this.fileName} file does not exist.`;
    }
    const file = fs.readFileSync(this.fileName).toString();
    this.lines = file.split('\n');
  }
  async read(from, to) {
    const lines = [];
    for (let i = from; i < to; i++) {
      lines.push(this.lines[i]);
    }
    return lines;
  }
  async getLength() {
    return this.lines.length;
  }
}

class FileTarget extends Target {
  constructor() {
    super();
    this.fileName = null;
  }
  async write(entries) {
    for (const entry of entries) {
      fs.appendFileSync(this.fileName, `${entry}\n`);
    }
  }
}


const { createClient } = require('redis');

const redis = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}/`,
});
redis.on('error', err => { throw err; });


class CopyJob extends Job {
  constructor() {
    super();
    this.source = new FileSource();
    this.target = new FileTarget();
  }

  async init(opts) {
    const options = opts.filter(opt => opt.includes('=')).map(opt => opt.split('=')).reduce((obj, kv) => {
      obj[kv[0]] = kv[1];
      return obj;
    }, {});
    this.source.fileName = options['--source'];
    this.target.fileName = options['--target'];

    this.source.init();

    await redis.connect();
  }

  getName() {
    return 'copy';
  }

  async getSource() {
    return this.source;
  }
  async getTarget() {
    return this.target;
  }

  async getState(key) {
    const value = await redis.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value);
  }
  async setState(key, value) {
    await redis.set(key, JSON.stringify(value));
  }

  getBulkNumberOfItems() {
    return config.bulkNumber;
  }

  transformEntry(srcDoc) {
    return srcDoc;
  }
}

const copyJob = new CopyJob();

module.exports = {
  copyJob,
};
