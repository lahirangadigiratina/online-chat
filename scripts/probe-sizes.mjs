const port = 9920;
const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
const page = list.find((t) => t.type === "page") || list[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
});
function send(method, params = {}) {
  const i = ++id;
  return new Promise((resolve) => {
    pending.set(i, resolve);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}
async function evalJs(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true });
  return result.result?.result?.value;
}
await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:3002/" });
await new Promise((r) => setTimeout(r, 1200));
await evalJs(`(() => { [...document.querySelectorAll("button")].find((n) => (n.innerText||"").includes("Manual form")).click(); })()`);
await new Promise((r) => setTimeout(r, 200));
console.log(await evalJs(`(() => {
  const grid = document.querySelector(".grid.grid-cols-4");
  return grid.innerText.replace(/\\s+/g, " ").trim();
})()`));
ws.close();
process.exit(0);
