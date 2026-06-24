async function test() {
  const res = await fetch("http://0.0.0.0:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Analyze constraints of topological quantum grids", model: "gemini-2.5-flash", history: [] })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
