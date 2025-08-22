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

			// Get validated data
			const data = await this.getValidatedData<typeof this.schema>();
			const { url } = data.params;
			// 示例 URL
			// const url = `https://api.live.bilibili.com/xlive/web-ucenter/v1/user_title/GetTitles`;
			
			const resp = await fetch(decodeURIComponent(url));

			if (!resp.ok) {
				return Response.json({
					success: false,
					error: `Failed to fetch: ${resp.status}`,
				}, { status: resp.status });
			}
			const ret = await resp.json();

			// 直接返回外部接口内容
			return {
				success: true,
				RETURN: ret
			};
		}
}
