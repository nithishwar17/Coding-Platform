const fetch = require('node-fetch');

async function test() {
  const cookie = ""; // We can't easily fake next-auth cookie in a raw script.
  // Wait, I can just test `submitToCompiler` directly from a script to bypass authentication!
}
test();
