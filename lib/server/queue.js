const queue = {};
let qTimeout = false;

function genId() {
  const abc = '0123456789abcdefghijklmnopqrstuvxyz';
  const length = 8;
  const ret = [];
  for (let i = 0; i < length; i++)
    ret.push(abc.substr(Math.floor(Math.random() * abc.length), 1));
  return ret.join('');
}

export function enqueue(predicate, cb) {
  if (predicate()) {
    cb();
    return;
  }

  const id = genId();
  queue[id] = {id, predicate, cb};
  if (!qTimeout) {
    qTimeout = setTimeout(checkQueue, 50);
  }
}

function checkQueue() {
  Object.keys(queue).forEach((key) => {
    const { predicate, cb } = queue[key];
    if (predicate()) {
      cb();
      delete queue[key];
    }
  });
  if (Object.keys(queue).length > 0) {
    qTimeout = setTimeout(checkQueue, 50);
  } else {
    qTimeout = false;
  }
}
