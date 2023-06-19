console.log(1e2);

// fs.promises
//   .readFile('test.log', { encoding: 'utf8' })
//   .then((data) => {
//     const lines = data.split('\n');
//     lines.forEach((line) => {
//       try {
//         const a = JSON.parse(line) as { n: number; s: number; u: number; si: number; ui: number };
//         if (a.si + a.ui > 100) {
//           console.log(line);
//           console.log(a.n + a.s + a.u, a.si + a.ui);
//         }
//       } catch (error) {
//         // console.error(line);
//       }
//     });
//   })
//   .catch((err) => {
//     console.error(err);
//   });

// setInterval(() => {
//   console.log('tick');
// }, 10000);
