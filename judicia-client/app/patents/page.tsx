'use client'
import { useState } from 'react';
import { downloadLatestPatent } from '../actions/download-patent';
import type { PatentEntry } from '../actions/parse-patent';

export default function PatentsPage() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [patents, setPatents] = useState<PatentEntry[]>([]);

    const handleDownload = async () => {
        setLoading(true);
        setStatus('Starting download...');
        setPatents([]);
        try {
            const result = await downloadLatestPatent();
            if (result.success) {
                setStatus(`Success! Saved to: ${result.filePath}`);
                if (result.parsed && result.data) {
                    setPatents(result.data);
                    setStatus(`Success! Downloaded and parsed ${result.data.length} entries.`);
                } else if (result.parseError) {
                    setStatus(`Downloaded but parsing failed: ${result.parseError}`);
                }
            } else {
                setStatus(`Error: ${result.error}`);
            }
        } catch (e) {
            setStatus(`Error: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Patents</h1>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                {loading ? 'Downloading...' : 'Download Latest Marcas PDF'}
            </button>
            {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}

            {patents.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Parsed Entries ({patents.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 border">Titular</th>
                                    <th className="px-4 py-2 border">Data</th>
                                    <th className="px-4 py-2 border">Elemento Nominativo</th>
                                    <th className="px-4 py-2 border">NCL</th>
                                    <th className="px-4 py-2 border">Natureza</th>
                                    <th className="px-4 py-2 border">Procurador</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patents.map((patent, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border text-sm">{patent.titular}</td>
                                        <td className="px-4 py-2 border text-sm">{patent.dataDeposito}</td>
                                        <td className="px-4 py-2 border text-sm">{patent.elementoNominativo}</td>
                                        <td className="px-4 py-2 border text-sm">{patent.ncl}</td>
                                        <td className="px-4 py-2 border text-sm">{patent.natureza}</td>
                                        <td className="px-4 py-2 border text-sm">{patent.procurador}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}