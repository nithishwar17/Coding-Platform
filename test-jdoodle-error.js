const fetch = require('node-fetch');

async function test() {
  const res = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: "a4906460ffc3a4c54fcda77bf3f3ff7a",
      clientSecret: "c1e6542c1a46f72f5baa69c2857e666859d3bf92d6d0ddcca1bf73b76602cdcb",
      script: "class Solution { public void solve(String input) { return true; } }",
      language: "java",
      versionIndex: "4"
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
