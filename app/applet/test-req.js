async function run() {
  try {
    const res = await fetch("http://0.0.0.0:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: "Hello, what's in the news today?", 
        model: "gemini-2.5-flash", 
        history: [] 
      })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) {
    console.error(e);
  }
}
run();
