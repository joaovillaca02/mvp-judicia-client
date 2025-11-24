"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchDataJud } from "@/lib/datajud";
import { TRIBUNAL_GROUPS, DataJudResponse } from "@/lib/datajud-types";
import { Search, Loader2 } from "lucide-react";

const AVAILABLE_FILTERS = [
    { id: "numeroProcesso", label: "Número do Processo" },
    { id: "classe.codigo", label: "Código da Classe" },
    { id: "assunto.codigo", label: "Código do Assunto" },
    { id: "dataAjuizamento", label: "Data de Ajuizamento" },
    { id: "orgaoJulgador.codigo", label: "Código do Órgão Julgador" },
];

interface FilterState {
    id: string;
    value: string;
    enabled: boolean;
}

export default function DataJudPage() {
    const [activeTab, setActiveTab] = useState(TRIBUNAL_GROUPS[0].label);
    const [tribunal, setTribunal] = useState(TRIBUNAL_GROUPS[0].options[0].value);
    const [filters, setFilters] = useState<FilterState[]>(
        AVAILABLE_FILTERS.map(f => ({ id: f.id, value: "", enabled: false }))
    );

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<DataJudResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [pageSize] = useState(10);
    const [history, setHistory] = useState<any[][]>([]); // Stack of searchAfter values
    const [currentSearchAfter, setCurrentSearchAfter] = useState<any[]>([]);

    const handleFilterChange = (id: string, field: 'value' | 'enabled', value: any) => {
        setFilters(prev => prev.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ));
    };

    const executeSearch = async (searchAfter: any[] = []) => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const activeFilters = filters
                .filter(f => f.enabled && f.value.trim() !== "")
                .map(f => ({ field: f.id, value: f.value }));

            const data = await searchDataJud({
                tribunal,
                filters: activeFilters,
                size: pageSize,
                searchAfter: searchAfter.length > 0 ? searchAfter : undefined
            });

            setResults(data);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao buscar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setHistory([]);
        setCurrentSearchAfter([]);
        executeSearch([]);
    };

    const handleNextPage = () => {
        if (results && results.hits.hits.length > 0) {
            const lastHit = results.hits.hits[results.hits.hits.length - 1];
            // @ts-ignore - sort is present in hit but not typed in basic response yet
            const nextSearchAfter = lastHit.sort;

            if (nextSearchAfter) {
                setHistory(prev => [...prev, currentSearchAfter]);
                setCurrentSearchAfter(nextSearchAfter);
                executeSearch(nextSearchAfter);
            }
        }
    };

    const handlePreviousPage = () => {
        if (history.length > 0) {
            const prevSearchAfter = history[history.length - 1];
            const newHistory = history.slice(0, -1);

            setHistory(newHistory);
            setCurrentSearchAfter(prevSearchAfter);
            executeSearch(prevSearchAfter);
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Consulta DataJud</h1>
                <p className="text-muted-foreground">
                    Pesquise dados processuais nos tribunais superiores utilizando a API Pública do CNJ.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Parâmetros de Busca</CardTitle>
                    <CardDescription>Selecione a instância e preencha os filtros desejados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-medium">Instância e Tribunal</label>
                        <Tabs value={activeTab} onValueChange={(val) => {
                            setActiveTab(val);
                            // Auto-select first option of the new group
                            const group = TRIBUNAL_GROUPS.find(g => g.label === val);
                            if (group && group.options.length > 0) {
                                setTribunal(group.options[0].value);
                            }
                        }}>
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
                                {TRIBUNAL_GROUPS.map((group) => (
                                    <TabsTrigger key={group.label} value={group.label} className="text-xs md:text-sm whitespace-normal h-full">
                                        {group.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {TRIBUNAL_GROUPS.map((group) => (
                                <TabsContent key={group.label} value={group.label} className="mt-4">
                                    {group.options.length > 0 ? (
                                        <Select value={tribunal} onValueChange={setTribunal}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione o tribunal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {group.options.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 text-sm text-muted-foreground text-center border rounded-md bg-muted/50">
                                            Em breve: Endpoints para {group.label} ainda não implementados.
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {AVAILABLE_FILTERS.map((filterDef) => {
                            const filterState = filters.find(f => f.id === filterDef.id)!;
                            return (
                                <div key={filterDef.id} className="flex items-end space-x-4 p-4 border rounded-lg">
                                    <div className="flex items-center space-x-2 h-10">
                                        <Checkbox
                                            id={`check-${filterDef.id}`}
                                            checked={filterState.enabled}
                                            onCheckedChange={(checked) => handleFilterChange(filterDef.id, 'enabled', checked)}
                                        />
                                        <Label htmlFor={`check-${filterDef.id}`}>{filterDef.label}</Label>
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            placeholder={`Valor para ${filterDef.label}`}
                                            value={filterState.value}
                                            onChange={(e) => handleFilterChange(filterDef.id, 'value', e.target.value)}
                                            disabled={!filterState.enabled}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Pesquisando...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Pesquisar
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados</CardTitle>
                        <CardDescription>
                            Encontrados {results.hits.total.value} registros em {results.took}ms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Dados (Source)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.hits.hits.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                Nenhum resultado encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        results.hits.hits.map((hit) => (
                                            <TableRow key={hit._id}>
                                                <TableCell className="font-medium text-xs">{hit._id}</TableCell>
                                                <TableCell>{hit._score}</TableCell>
                                                <TableCell>
                                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 max-w-xl">
                                                        {JSON.stringify(hit._source, null, 2)}
                                                    </pre>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handlePreviousPage(); }}
                                        className={history.length === 0 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handleNextPage(); }}
                                        className={results.hits.hits.length < pageSize ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>

                    </CardContent>
                </Card>
            )}
        </div>
    );
}
