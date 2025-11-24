"use server";

import { DataJudResponse, SearchParams } from "./datajud-types";

const DATAJUD_API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

export async function searchDataJud({ apiKey = DATAJUD_API_KEY, tribunal, query, filters, size = 10, searchAfter }: SearchParams): Promise<DataJudResponse> {
    const url = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`;

    let queryBody = query;

    if (!queryBody) {
        const mustMatches = filters?.map(f => ({
            match: {
                [f.field]: f.value
            }
        })) || [];

        queryBody = {
            size: size,
            query: {
                bool: {
                    must: mustMatches.length > 0 ? mustMatches : [{ match_all: {} }]
                }
            },
            sort: [
                { "id.keyword": { "order": "asc" } }
            ]
        };

        if (searchAfter && searchAfter.length > 0) {
            queryBody.search_after = searchAfter;
        }
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `APIKey ${apiKey}`,
        },
        body: JSON.stringify(queryBody),
    });

    if (!response.ok) {
        throw new Error(`DataJud API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
