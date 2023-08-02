import treeKill from 'tree-kill';

const args = process.argv.slice(2);
const pid = args[0];
if (!pid) {
  console.log('No process ID provided!');
  process.exit(1);
}

const pidNumber = parseInt(pid, 10);
if (isNaN(pidNumber)) {
  console.log(`Invalid process ID: ${pid}`);
  process.exit(1);
}

console.log(`Killing process ${pid}...`);
treeKill(pidNumber, (error) => {
  if (error) {
    console.log(`Process ${pid} encountered an error while trying to kill it!`);
    console.log(error);
    process.exit(1);
  } else {
    console.log(`Process ${pid} has been killed!`);
    process.exit(0);
  }
});
