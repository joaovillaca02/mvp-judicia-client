export interface DataJudResponse {
    took: number;
    timed_out: boolean;
    _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
    };
    hits: {
        total: {
            value: number;
            relation: string;
        };
        max_score: number;
        hits: Array<{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: any;
        }>;
    };
}

export interface SearchParams {
    apiKey?: string;
    tribunal: string;
    query?: any; // Elasticsearch query body
    filters?: Array<{ field: string; value: string }>;
    size?: number;
    searchAfter?: any[];
}

export interface TribunalOption {
    value: string;
    label: string;
}

export interface TribunalGroup {
    label: string;
    options: TribunalOption[];
}

export const TRIBUNAL_GROUPS: TribunalGroup[] = [
    {
        label: "Tribunais Superiores",
        options: [
            { value: "stj", label: "STJ - Superior Tribunal de Justiça" },
            { value: "tst", label: "TST - Tribunal Superior do Trabalho" },
            { value: "tse", label: "TSE - Tribunal Superior Eleitoral" },
            { value: "stm", label: "STM - Superior Tribunal Militar" },
        ]
    },
    {
        label: "Justiça Federal",
        options: [
            { value: "trf1", label: "TRF1 - Tribunal Regional Federal da 1ª Região" },
            { value: "trf2", label: "TRF2 - Tribunal Regional Federal da 2ª Região" },
            { value: "trf3", label: "TRF3 - Tribunal Regional Federal da 3ª Região" },
            { value: "trf4", label: "TRF4 - Tribunal Regional Federal da 4ª Região" },
            { value: "trf5", label: "TRF5 - Tribunal Regional Federal da 5ª Região" },
            { value: "trf6", label: "TRF6 - Tribunal Regional Federal da 6ª Região" },
        ]
    },
    {
        label: "Justiça Estadual",
        options: [] // Placeholder for future implementation
    },
    {
        label: "Justiça do Trabalho",
        options: [] // Placeholder for future implementation
    },
    {
        label: "Justiça Eleitoral",
        options: [] // Placeholder for future implementation
    },
    {
        label: "Justiça Militar",
        options: [] // Placeholder for future implementation
    }
];
