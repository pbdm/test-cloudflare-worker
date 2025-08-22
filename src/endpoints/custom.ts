import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Task } from "../types";

export class Custom extends OpenAPIRoute {
	schema = {
		tags: ["custom"],
		summary: "custom",
		request: {
			params: z.object({
				url: Str({ description: "parse url" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns room info if found",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result: z.object({
									task: Task,
								}),
							}),
						}),
					},
				},
			},
			"404": {
				description: "url found",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								error: Str(),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {

		const data = await this.getValidatedData<typeof this.schema>();
		const { url } = data.params;

		const originalRequest = c.req.raw

		// 拷贝一份可变的 headers
		const headers = new Headers(originalRequest.headers)

		// 删除条件请求头
		headers.delete('If-None-Match')
		headers.delete('If-Modified-Since')
		headers.delete('If-Match')

		// 构造一个新的 Request（Hono 的 c.req.raw 是 immutable 的，所以必须新建）
		const newRequest = new Request(decodeURIComponent(url), {
			method: originalRequest.method,
			headers,
			body: originalRequest.body,  
		})

		// 发送请求
		const resp = await fetch(newRequest)
		

		// const resp = await fetch(decodeURIComponent(url));

		if (!resp.ok) {
			return Response.json({
				success: false,
				error: `Failed to fetch: ${resp.status}`,
			}, { status: resp.status });
		}
		const ret = await resp.json();

		const responseHeaders = Object.fromEntries(resp.headers)
		// console.log('源站响应头:', responseHeaders)

		// 直接返回外部接口内容
		return {
			success: true,
			RETURN: ret
		};
	}
}
