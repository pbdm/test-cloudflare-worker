import { fromHono } from "chanfana";
import { Hono } from "hono";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { Custom } from "./endpoints/custom";

addEventListener('fetch', event => {
	console.log('fetch')
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 打印请求头（重点查看条件头是否存在）
  console.log('请求头信息：');
  for (const [key, value] of request.headers) {
    // 只打印条件头相关的键（或全部打印）
    if (['If-Match', 'If-None-Match', 'If-Modified-Since', 'If-Unmodified-Since'].includes(key)) {
      console.log(`- ${key}: ${value}`);
    }
  }

  // 发送请求
  const response = await fetch(request);
  return response;
}

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);
openapi.get("/api/custom/:url", Custom);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
