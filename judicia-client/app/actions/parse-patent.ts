'use server'

import fs from "fs";
const pdfParse = require("pdf-parse");

export interface PatentEntry {
    titulo: string;
    titular: string | null;
    dataDeposito: string | null;
    apresentacao: string | null;
    natureza: string | null;
    elementoNominativo: string | null;
    cfe: string | null;
    ncl: string | null;
    especificacao: string | null;
    procurador: string | null;
}

function parseEntry(text: string): PatentEntry {
    function match(regex: RegExp) {
        const m = text.match(regex);
        return m ? m[1].trim() : null;
    }

    return {
        titulo: "Publicação de pedido de registro",
        titular: match(/Titular:[\s\S]*?(.+?)[\s\S]*?Data de depósito:/),
        dataDeposito: match(/Data de depósito:\s*([0-9/]+)/),
        apresentacao: match(/Apresentação:[\s\S]*?(.+?)[\s\S]*?Natureza:/),
        natureza: match(/Natureza:[\s\S]*?(.+?)[\s\S]*?Elemento nominativo:/),
        elementoNominativo: match(/Elemento nominativo:[\s\S]*?(.+?)[\s\S]*?CFE:/),
        cfe: match(/CFE:\s*([0-9\.,\se]+)/),
        ncl: match(/NCL\(12\):\s*([0-9]+)/),
        especificacao: match(/Especificação:\s*([\s\S]+?)Procurador:/)
            ?.replace(/\s+/g, " ") // normaliza linhas
            .trim() || null,
        procurador: match(/Procurador:\s*(.+)/)
    };
}

export async function parsePatentPdf(filePath: string): Promise<{ success: boolean; data?: PatentEntry[]; error?: string }> {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const fullText = data.text;

        // Split text into blocks based on the "Publicação de pedido de registro" header
        // We use a lookahead to split but keep the delimiter, or just split and re-add if needed.
        // The user's example used split("Publicação de pedido de registro"), which removes the header.
        // We can just split and assume each valid block starts after that header.

        const entries = fullText.split("Publicação de pedido de registro");

        // The first element might be garbage before the first entry
        const objects = entries
            .map((e: string) => parseEntry(e))
            .filter((o: PatentEntry) => o.titular !== null); // Filter out empty/invalid entries

        return { success: true, data: objects };

    } catch (error: any) {
        console.error("Error parsing PDF:", error);
        return { success: false, error: error.message || String(error) };
    }
}
