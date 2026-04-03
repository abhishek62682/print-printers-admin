import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllRequestQuotes, exportRequestQuotes, deleteRequestQuote, updateRequestQuote } from '@/config/api/enquiry.api';
import type { RequestQuote, QuoteStatus, PaginatedRequestQuotes, ExportRequestQuotesParams } from '@/config/api/enquiry.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
    MoreHorizontal, ChevronLeft, ChevronRight,
    Download, Filter, X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';

interface ApiErrorResponse {
    message: string;
}

const STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
    new:       { label: 'New',       className: 'bg-blue-50 text-blue-700 border-blue-200' },
    contacted: { label: 'Contacted', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    quoted:    { label: 'Quoted',    className: 'bg-purple-50 text-purple-700 border-purple-200' },
    converted: { label: 'Converted', className: 'bg-green-50 text-green-700 border-green-200' },
    closed:    { label: 'Closed',    className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const StatusBadge = ({ status }: { status: QuoteStatus }) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
    return (
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    } catch {
        return '—';
    }
};

/* ─── Helper: download an ExcelJS workbook in the browser ─────────────────── */
const downloadWorkbook = async (wb: ExcelJS.Workbook, filename: string) => {
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

/* ─── Helper: auto-fit column widths ──────────────────────────────────────── */
const autoFitColumns = (ws: ExcelJS.Worksheet, rows: Record<string, string | number>[]) => {
    if (!rows.length) return;
    ws.columns = Object.keys(rows[0]).map((key) => ({
        header: key,
        key,
        width: Math.max(
            key.length,
            ...rows.map((r) => String(r[key] ?? '').length),
        ) + 2,
    }));
};

/* ─── Drawer field row ─────────────────────────────────────────────────────── */
const Field = ({ label, value }: { label: string; value?: string | number | null }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400">{label}</p>
            <p className="text-sm text-slate-700">{value}</p>
        </div>
    );
};

/* ─── Drawer section heading ───────────────────────────────────────────────── */
const DrawerSection = ({ title }: { title: string }) => (
    <div className="pt-2 pb-1">
        <p className="text-xs text-slate-400">{title}</p>
        <Separator className="mt-1.5" />
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const RequestQuotesPage = () => {
    const queryClient = useQueryClient();

    const [page, setPage]   = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');

    const [startDate, setStartDate]               = useState('');
    const [endDate, setEndDate]                   = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate]     = useState('');
    const [isExporting, setIsExporting]           = useState(false);

    const [deleteId, setDeleteId]     = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [viewQuote, setViewQuote]   = useState<RequestQuote | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const queryParams = {
        page, limit,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(appliedStartDate ? { startDate: appliedStartDate } : {}),
        ...(appliedEndDate   ? { endDate:   appliedEndDate   } : {}),
    };

    const { data, isLoading, isError } = useQuery<PaginatedRequestQuotes>({
        queryKey: ['requestQuotes', queryParams],
        queryFn:  () => getAllRequestQuotes(queryParams),
        staleTime: 10000,
    });

    const quotes     = data?.data      ?? [];
    const pagination = data?.pagination;

    // ── Mutations ──────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: () => deleteRequestQuote(deleteId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requestQuotes'] });
            setDialogOpen(false);
            setDeleteId(null);
            setDrawerOpen(false);
            toast.success('Quote deleted', { description: 'The quote request has been permanently removed.' });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error('Failed to delete quote', { description: error.response?.data?.message ?? 'Something went wrong.' });
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) => updateRequestQuote(id, { status }),
        onSuccess: (_, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['requestQuotes'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            if (viewQuote) setViewQuote((prev) => prev ? { ...prev, status } : prev);
            toast.success('Status updated', { description: `Marked as ${STATUS_CONFIG[status]?.label ?? status}.` });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error('Failed to update status', { description: error.response?.data?.message ?? 'Something went wrong.' });
        },
    });

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleDeleteClick = (id: string) => { setDeleteId(id); setTimeout(() => setDialogOpen(true), 100); };
    const handleViewClick   = (quote: RequestQuote) => { setViewQuote(quote); setDrawerOpen(true); };

    const handleStatusFilterChange = (val: string) => { setStatusFilter(val as QuoteStatus | 'all'); setPage(1); };
    const handleLimitChange        = (val: string) => { setLimit(Number(val)); setPage(1); };

    const handleApplyFilter = () => {
        if (startDate && endDate && startDate > endDate) {
            toast.error('Invalid date range', { description: 'Start date must not be after end date.' });
            return;
        }
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setPage(1);
    };

    const handleClearFilter = () => {
        setStartDate(''); setEndDate('');
        setAppliedStartDate(''); setAppliedEndDate('');
        setPage(1);
    };

    const isFilterApplied = Boolean(appliedStartDate || appliedEndDate);

    // ── Download individual quote ──────────────────────────────────────────
    const handleDownloadQuote = async (quote: RequestQuote) => {
        try {
            const row = {
                'Full Name':           quote?.fullName ?? '',
                'Company Name':        quote?.companyName ?? '',
                'Email':               quote?.email ?? '',
                'Phone':               quote?.phone ?? '',
                'Country':             quote?.country ?? '',
                'State/Province':      quote?.stateProvince ?? '',
                'City':                quote?.city ?? '',
                'Zip Code':            quote?.zipCode ?? '',
                'Book Title':          quote?.bookTitle ?? '',
                'Book Category':       quote?.bookCategory ?? '',
                'Trim Size':           quote?.trimSize ?? '',
                'Orientation':         quote?.orientation ?? '',
                'Proof Type':          quote?.proofType ?? '',
                'Binding Type':        quote?.bindingType ?? '',
                'Cover Stock':         quote?.coverStock ?? '',
                'Cover Ink':           quote?.coverInk ?? '',
                'Total Pages':         quote?.totalPages ?? '',
                'Text Paper Stock':    quote?.textPaperStock ?? '',
                'Text Ink':            quote?.textInk ?? '',
                'Quantities':          quote?.quantities?.join(', ') ?? '',
                'Packing Method':      quote?.packingMethod ?? '',
                'Shipping Method':     quote?.shippingMethod ?? '',
                'Delivery Address':    quote?.deliveryAddress ?? '',
                'Delivery City':       quote?.deliveryCity ?? '',
                'Delivery Country':    quote?.deliveryCountry ?? '',
                'Status':              STATUS_CONFIG[quote?.status as QuoteStatus]?.label ?? quote?.status ?? '',
                'Special Instructions': quote?.specialInstructions ?? '',
                'Received On':         quote?.createdAt ? formatDate(quote.createdAt) : '',
            };

            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Quote Request');
            autoFitColumns(ws, [row]);
            ws.addRow(Object.values(row));

            // Bold header row
            ws.getRow(1).font = { bold: true };

            const filename = `quote-${quote?.fullName?.replace(/\s+/g, '-')}-${quote?.bookTitle?.replace(/\s+/g, '-')}.xlsx`;
            await downloadWorkbook(wb, filename);
            toast.success('Downloaded successfully', { description: `Quote for ${quote?.fullName} downloaded.` });
        } catch {
            toast.error('Download failed', { description: 'Something went wrong. Please try again.' });
        }
    };

    // ── Export Excel ───────────────────────────────────────────────────────
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const exportParams: ExportRequestQuotesParams = {
                ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
                ...(appliedStartDate ? { startDate: appliedStartDate } : {}),
                ...(appliedEndDate   ? { endDate:   appliedEndDate   } : {}),
            };
            const rows = await exportRequestQuotes(exportParams);

            if (!rows?.length) {
                toast.warning('No data to export', { description: 'No quote requests found for the selected filters.' });
                return;
            }

            const sheetRows = rows.map((q: RequestQuote) => ({
                'Full Name':        q?.fullName ?? '',
                'Company Name':     q?.companyName ?? '',
                'Email':            q?.email ?? '',
                'Phone':            q?.phone ?? '',
                'Country':          q?.country ?? '',
                'State/Province':   q?.stateProvince ?? '',
                'City':             q?.city ?? '',
                'Zip Code':         q?.zipCode ?? '',
                'Book Title':       q?.bookTitle ?? '',
                'Book Category':    q?.bookCategory ?? '',
                'Trim Size':        q?.trimSize ?? '',
                'Orientation':      q?.orientation ?? '',
                'Proof Type':       q?.proofType ?? '',
                'Binding Type':     q?.bindingType ?? '',
                'Cover Stock':      q?.coverStock ?? '',
                'Cover Ink':        q?.coverInk ?? '',
                'Total Pages':      q?.totalPages ?? '',
                'Text Paper Stock': q?.textPaperStock ?? '',
                'Text Ink':         q?.textInk ?? '',
                'Quantities':       q?.quantities?.join(', ') ?? '',
                'Packing Method':   q?.packingMethod ?? '',
                'Shipping Method':  q?.shippingMethod ?? '',
                'Delivery Address': q?.deliveryAddress ?? '',
                'Delivery City':    q?.deliveryCity ?? '',
                'Delivery Country': q?.deliveryCountry ?? '',
                'Status':           STATUS_CONFIG[q?.status as QuoteStatus]?.label ?? q?.status ?? '',
                'Received On':      q?.createdAt ? formatDate(q.createdAt) : '',
            }));

            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Quote Requests');
            autoFitColumns(ws, sheetRows);
            sheetRows.forEach((r) => ws.addRow(Object.values(r)));

            // Bold header row
            ws.getRow(1).font = { bold: true };

            const filename = `quote-requests-${appliedStartDate || 'all'}-to-${appliedEndDate || 'all'}.xlsx`;
            await downloadWorkbook(wb, filename);
            toast.success('Export successful', { description: `${rows.length} quote request${rows.length !== 1 ? 's' : ''} exported.` });
        } catch {
            toast.error('Export failed', { description: 'Something went wrong while exporting.' });
        } finally {
            setIsExporting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Quote Requests</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Card className="mt-6 border-slate-200">
                <CardHeader className="space-y-0 pb-0">
                    <div className="flex items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-xl font-bold">Quote Requests</CardTitle>
                            <CardDescription className="mt-0.5">
                                All quote requests submitted for book printing services. ({pagination?.total ?? 0} total)
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-3 pt-3 pb-2">
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-slate-600 font-semibold">Start Date</Label>
                            <Input type="date" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-[148px] text-sm" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-slate-600 font-semibold">End Date</Label>
                            <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-[148px] text-sm" />
                        </div>
                        <Button variant="outline" size="sm" className="h-9 font-semibold" onClick={handleApplyFilter} disabled={isLoading}>
                            <Filter className="h-3.5 w-3.5 mr-1.5" /> Apply
                        </Button>
                        {isFilterApplied && (
                            <Button variant="ghost" size="sm" className="h-9 text-slate-600" onClick={handleClearFilter}>
                                <X className="h-3.5 w-3.5 mr-1.5" /> Clear
                            </Button>
                        )}
                        <div className="flex-1" />
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-slate-600 font-semibold">Status</Label>
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => (
                                        <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="default" size="sm" className="h-9 font-semibold" onClick={handleExportExcel} disabled={isExporting || isLoading}>
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            {isExporting ? 'Exporting...' : 'Export'}
                        </Button>
                    </div>

                    {isFilterApplied && (
                        <p className="text-xs text-slate-600 pb-2 font-medium">
                            Showing: <strong>{appliedStartDate || '—'}</strong> → <strong>{appliedEndDate || '—'}</strong>
                        </p>
                    )}
                </CardHeader>

                <CardContent className="pt-6">
                    {isLoading && <div className="py-16 text-center text-sm text-slate-500">Loading quote requests...</div>}
                    {isError  && <div className="py-16 text-center text-sm text-red-600">Failed to load quote requests. Please try again.</div>}
                    {!isLoading && !isError && (
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead className="text-xs font-semibold text-slate-600">Name / Company</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Email & Phone</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Book</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Binding / Pages</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Qty / Shipping</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Delivery</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Date</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotes.map((quote: RequestQuote) => (
                                        <TableRow
                                            key={quote?._id}
                                            onDoubleClick={() => handleViewClick(quote)}
                                            className="group hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                                        >
                                            {/* Name / Company */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm text-slate-700">{quote?.fullName ?? '—'}</p>
                                                    <p className="text-xs text-slate-400">{quote?.companyName ?? '—'}</p>
                                                </div>
                                            </TableCell>
                                            {/* Email / Phone */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm text-slate-700">{quote?.email ?? '—'}</p>
                                                    <p className="text-xs text-slate-400">{quote?.phone ?? '—'}</p>
                                                </div>
                                            </TableCell>
                                            {/* Book */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm text-slate-700">{quote?.bookTitle ?? '—'}</p>
                                                    <p className="text-xs text-slate-400">{quote?.bookCategory ?? '—'}</p>
                                                </div>
                                            </TableCell>
                                            {/* Binding / Pages */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm text-slate-700">{quote?.bindingType ?? '—'}</p>
                                                    <p className="text-xs text-slate-400">{quote?.totalPages ? `${quote.totalPages} pages` : '—'}</p>
                                                </div>
                                            </TableCell>
                                            {/* Quantities / Shipping */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm text-slate-700">{quote?.quantities?.join(', ') ?? '—'}</p>
                                                    <p className="text-xs text-slate-400">{quote?.shippingMethod ?? '—'}</p>
                                                </div>
                                            </TableCell>
                                            {/* Delivery */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm text-slate-700">{quote?.deliveryCountry ?? '—'}</p>
                                                    <p className="text-xs text-slate-400">{quote?.deliveryCity ?? '—'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <Select
                                                    value={quote?.status ?? 'new'}
                                                    disabled={statusMutation.isPending}
                                                    onValueChange={(val) => statusMutation.mutate({ id: quote?._id, status: val as QuoteStatus })}
                                                >
                                                    <SelectTrigger className="h-auto w-fit border-0 shadow-none focus:ring-0 bg-transparent p-0">
                                                        <SelectValue><StatusBadge status={quote?.status ?? 'new'} /></SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => (
                                                            <SelectItem key={s} value={s} className="text-xs">{STATUS_CONFIG[s].label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="py-3.5 text-sm text-slate-600 whitespace-nowrap">
                                                {formatDate(quote?.createdAt)}
                                            </TableCell>
                                            <TableCell className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">More</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuLabel className="font-semibold text-slate-900 text-xs">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDownloadQuote(quote)} className="cursor-pointer text-sm">
                                                            <Download className="h-4 w-4 mr-2" /> Download Excel
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 cursor-pointer text-sm"
                                                            onSelect={(e) => { e.preventDefault(); handleDeleteClick(quote?._id); }}
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {quotes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-16 text-center text-sm text-slate-400">
                                                {statusFilter !== 'all'
                                                    ? `No ${STATUS_CONFIG[statusFilter as QuoteStatus]?.label} quote requests found.`
                                                    : isFilterApplied
                                                        ? 'No quote requests found for the selected date range.'
                                                        : 'No quote requests found.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t bg-white">
                    <div className="text-xs text-slate-600 font-medium">
                        {pagination && (pagination?.total ?? 0) > 0 ? (
                            <>Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, pagination?.total ?? 0)}</strong> of <strong>{pagination?.total ?? 0}</strong> requests</>
                        ) : <>Showing <strong>0</strong> requests</>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 whitespace-nowrap font-medium">Rows per page</span>
                            <Select value={String(limit)} onValueChange={handleLimitChange}>
                                <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <SelectItem key={size} value={String(size)} className="text-xs">{size}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {(pagination?.totalPages ?? 0) > 1 && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!pagination?.hasPrevPage || isLoading}>
                                    <ChevronLeft className="h-4 w-4" /> Prev
                                </Button>
                                <span className="text-xs text-slate-600 font-medium">
                                    Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!pagination?.hasNextPage || isLoading}>
                                    Next <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>

            {/* ══════════════════════════════════════════════════════════════
                 DETAILS DRAWER
                 ══════════════════════════════════════════════════════════════ */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-2xl p-0 flex flex-col gap-0 overflow-hidden"
                >
                    {viewQuote && (
                        <>
                            {/* ─── Drawer Header ─── */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                                <StatusBadge status={viewQuote.status ?? 'new'} />
                                <p className="text-xs text-slate-400 whitespace-nowrap pr-8">
                                    {formatDate(viewQuote.createdAt)}
                                </p>
                            </div>

                            {/* ─── Drawer Body ─── */}
                            <ScrollArea className="flex-1 min-h-0">
                                <div className="px-6 py-5 space-y-6">

                                    {/* Contact */}
                                    <div>
                                        <DrawerSection title="Contact" />
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                                            <Field label="Name"             value={viewQuote.fullName} />
                                            <Field label="Company"          value={viewQuote.companyName} />
                                            <Field label="Email"            value={viewQuote.email} />
                                            <Field label="Phone"            value={viewQuote.phone} />
                                            <Field label="Country"          value={viewQuote.country} />
                                            <Field label="State / Province" value={viewQuote.stateProvince} />
                                            <Field label="City"             value={viewQuote.city} />
                                            <Field label="Zip Code"         value={viewQuote.zipCode} />
                                        </div>
                                        {viewQuote.howDidYouHear && (
                                            <div className="mt-4">
                                                <Field label="How Did You Hear About Us?" value={viewQuote.howDidYouHear} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Book Information */}
                                    <div>
                                        <DrawerSection title="Book Information" />
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                                            <div className="col-span-2 space-y-0.5">
                                                <p className="text-[11px] text-slate-400">Book Title</p>
                                                <p className="text-sm text-slate-700">{viewQuote.bookTitle}</p>
                                                {viewQuote.bookCategory && (
                                                    <p className="text-xs text-slate-400">{viewQuote.bookCategory}</p>
                                                )}
                                            </div>
                                            <Field label="Trim Size"   value={viewQuote.trimSize} />
                                            <Field label="Orientation" value={viewQuote.orientation} />
                                            <Field label="Total Pages" value={viewQuote.totalPages ? `${viewQuote.totalPages} pages` : null} />
                                            <Field label="Proof Type"  value={viewQuote.proofType} />
                                        </div>
                                    </div>

                                    {/* Binding & Cover */}
                                    <div>
                                        <DrawerSection title="Binding & Cover" />
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                                            <Field label="Binding Type"      value={viewQuote.bindingType} />
                                            <Field label="Cover Stock"        value={viewQuote.coverStock} />
                                            <Field label="Cover Ink"          value={viewQuote.coverInk} />
                                            <Field label="Cover Lamination"   value={viewQuote.coverLamination} />
                                            <Field label="Board Calliper"     value={viewQuote.boardCalliper} />
                                            <Field label="Dust Jacket"        value={viewQuote.dustJacket} />
                                            <Field label="Specialty Finishes" value={viewQuote.specialtyFinishes} />
                                            <Field label="Binding Notes"      value={viewQuote.bindingNotes} />
                                        </div>
                                    </div>

                                    {/* Text & Paper */}
                                    <div>
                                        <DrawerSection title="Text & Paper" />
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                                            <Field label="Paper Stock"        value={viewQuote.textPaperStock} />
                                            <Field label="Text Ink"           value={viewQuote.textInk} />
                                            <Field label="Endsheet Stock"     value={viewQuote.endsheetStock} />
                                            <Field label="Endsheet Printing"  value={viewQuote.endsheetPrinting} />
                                        </div>
                                    </div>

                                    {/* Shipping & Delivery */}
                                    <div>
                                        <DrawerSection title="Shipping & Delivery" />
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                                            <Field label="Quantities"      value={viewQuote.quantities?.join(', ')} />
                                            <Field label="Packing Method"  value={viewQuote.packingMethod} />
                                            <Field label="Shipping Method" value={viewQuote.shippingMethod} />
                                        </div>
                                        {(viewQuote.deliveryAddress || viewQuote.deliveryCity || viewQuote.deliveryCountry || viewQuote.deliveryZip) && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <div className="space-y-0.5 mb-3">
                                                    <p className="text-[11px] text-slate-400">Delivery Address</p>
                                                    {viewQuote.deliveryAddress && (
                                                        <p className="text-sm text-slate-700">{viewQuote.deliveryAddress}</p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                                                    <Field label="City"    value={viewQuote.deliveryCity} />
                                                    <Field label="Country" value={viewQuote.deliveryCountry} />
                                                    <Field label="Zip"     value={viewQuote.deliveryZip} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Special Instructions */}
                                    {viewQuote.specialInstructions && (
                                        <div>
                                            <DrawerSection title="Special Instructions" />
                                            <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                {viewQuote.specialInstructions}
                                            </p>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div>
                                        <DrawerSection title="Timeline" />
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                                            <Field label="Created"  value={formatDate(viewQuote.createdAt)} />
                                            <Field label="Updated"  value={formatDate(viewQuote.updatedAt)} />
                                        </div>
                                    </div>

                                    <div className="h-4" />
                                </div>
                            </ScrollArea>

                            {/* ─── Drawer Footer ─── */}
                            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0 bg-white">
                                <Select
                                    value={viewQuote.status ?? 'new'}
                                    disabled={statusMutation.isPending}
                                    onValueChange={(val) =>
                                        statusMutation.mutate({ id: viewQuote._id, status: val as QuoteStatus })
                                    }
                                >
                                    <SelectTrigger className="w-[150px] h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => (
                                            <SelectItem key={s} value={s} className="text-sm">{STATUS_CONFIG[s].label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleDownloadQuote(viewQuote)} className="gap-1.5">
                                        <Download className="h-3.5 w-3.5" /> Download
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteClick(viewQuote._id)}
                                        className="gap-1.5"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* ── DELETE CONFIRMATION ────────────────────────────────────────────── */}
            <AlertDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quote Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The quote request will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RequestQuotesPage;