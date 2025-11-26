'use server'

import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { parsePatentPdf, type PatentEntry } from "./parse-patent";

export async function downloadLatestPatent() {
    console.log("Starting downloadLatestPatent...");

    // Ensure downloads directory exists
    const downloadsDir = path.join(process.cwd(), "downloads");
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir);
    }


    const stagehand = new Stagehand({
        env: "LOCAL",
        localBrowserLaunchOptions: {
            executablePath: require('playwright-core').chromium.executablePath(),
            headless: true,
        },
    });

    try {
        await stagehand.init();
        const page = stagehand.context.pages()[0];

        console.log("Navigating to INPI...");
        await page.goto("https://revistas.inpi.gov.br/rpi/");

        console.log("Extracting PDF link...");
        // Using extract to find the link. 
        // Note: Stagehand.extract takes (instruction, schema)
        const extractionResult = await stagehand.extract(
            "Find the link to the most recent PDF for 'SEÇÃO V MARCAS'. Return the absolute URL.",
            z.object({
                pdfUrl: z.string().describe("The absolute URL of the PDF file."),
            })
        );

        const { pdfUrl } = extractionResult;

        if (!pdfUrl) {
            throw new Error("Could not find the PDF URL.");
        }

        console.log(`Found PDF URL: ${pdfUrl}`);

        // Download the PDF
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const fileName = `patent-marcas-${Date.now()}.pdf`;
        const filePath = path.join(downloadsDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`Saved PDF to ${filePath}`);

        // Parse the downloaded PDF
        console.log("Parsing PDF...");
        const parseResult = await parsePatentPdf(filePath);

        if (!parseResult.success) {
            console.warn("PDF parsing failed:", parseResult.error);
            return {
                success: true,
                filePath,
                parsed: false,
                parseError: parseResult.error
            };
        }

        console.log(`Parsed ${parseResult.data?.length || 0} entries`);

        return {
            success: true,
            filePath,
            parsed: true,
            data: parseResult.data
        };

    } catch (error: any) {
        console.error("Error in downloadLatestPatent:", error);
        return { success: false, error: error.message || String(error) };
    } finally {
        await stagehand.close();
    }
}
