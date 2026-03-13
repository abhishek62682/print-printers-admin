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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { getAllEnquiries, exportEnquiries, deleteEnquiry, updateEnquiry } from '@/config/api/enquiry.api';
import type { Enquiry, EnquiryStatus } from '@/config/api/enquiry.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
    MoreHorizontal, ChevronLeft, ChevronRight,
    Mail, Phone, Building2, Globe, Package,
    BookOpen, Calendar, Sparkles, FileText,
    Megaphone, Download, Filter, X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ApiErrorResponse {
    message: string;
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<EnquiryStatus, { label: string; className: string }> = {
    new:       { label: 'New',       className: 'bg-blue-100 text-blue-700 border-blue-200' },
    contacted: { label: 'Contacted', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    quoted:    { label: 'Quoted',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
    converted: { label: 'Converted', className: 'bg-green-100 text-green-700 border-green-200' },
    closed:    { label: 'Closed',    className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const StatusBadge = ({ status }: { status: EnquiryStatus }) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};

// ── Detail row helper ──────────────────────────────────────────────────────
const DetailRow = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
}) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
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

// ─────────────────────────────────────────────────────────────────────────────
const EnquiriesPage = () => {
    const queryClient = useQueryClient();

    const [page, setPage]   = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');

    const [startDate, setStartDate]               = useState('');
    const [endDate, setEndDate]                   = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate]     = useState('');
    const [isExporting, setIsExporting]           = useState(false);

    const [deleteId, setDeleteId]     = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null);
    const [viewOpen, setViewOpen]       = useState(false);

    const queryParams = {
        page,
        limit,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(appliedStartDate ? { startDate: appliedStartDate } : {}),
        ...(appliedEndDate   ? { endDate:   appliedEndDate   } : {}),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['enquiries', queryParams],
        queryFn: () => getAllEnquiries(queryParams),
        staleTime: 10000,
    });

    const enquiries  = data?.data      ?? [];
    const pagination = data?.pagination;

    // ── Mutations ──────────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: () => deleteEnquiry(deleteId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            setDialogOpen(false);
            setDeleteId(null);
            toast.success('Enquiry deleted', {
                description: 'The enquiry has been permanently removed.',
            });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = error.response?.data?.message ?? 'Something went wrong. Please try again.';
            toast.error('Failed to delete enquiry', { description: message });
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) =>
            updateEnquiry(id, { status }),
        onSuccess: (_, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            if (viewEnquiry) setViewEnquiry((prev) => prev ? { ...prev, status } : prev);
            toast.success('Status updated', {
                description: `Enquiry marked as ${STATUS_CONFIG[status]?.label ?? status}.`,
            });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = error.response?.data?.message ?? 'Something went wrong. Please try again.';
            toast.error('Failed to update status', { description: message });
        },
    });

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setTimeout(() => setDialogOpen(true), 100);
    };

    const handleViewClick = (enquiry: Enquiry) => {
        setViewEnquiry(enquiry);
        setViewOpen(true);
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val as EnquiryStatus | 'all');
        setPage(1);
    };

    const handleLimitChange = (val: string) => {
        setLimit(Number(val));
        setPage(1);
    };

    const handleApplyFilter = () => {
        if (startDate && endDate && startDate > endDate) {
            toast.error('Invalid date range', {
                description: 'Start date must not be after end date.',
            });
            return;
        }
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setPage(1);
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        setPage(1);
    };

    const isFilterApplied = Boolean(appliedStartDate || appliedEndDate);

    // ── Export Excel ───────────────────────────────────────────────────────
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const rows = await exportEnquiries({
                ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
                ...(appliedStartDate ? { startDate: appliedStartDate } : {}),
                ...(appliedEndDate   ? { endDate:   appliedEndDate   } : {}),
            });

            if (!rows?.length) {
                toast.warning('No data to export', {
                    description: 'No enquiries found for the selected filters.',
                });
                return;
            }

            const sheetData = rows.map((e) => ({
                'Full Name':           e?.fullName             ?? '',
                'Company Name':        e?.companyName          ?? '',
                'Email':               e?.email                ?? '',
                'Phone Number':        e?.phoneNumber          ?? '',
                'Country':             e?.country              ?? '',
                'Product Type':        e?.productType          ?? '',
                'Binding Type':        e?.bindingType          ?? '',
                'Approx. Quantity':    e?.approximateQuantity  ?? '',
                'Specialty Finishing': e?.specialtyFinishing   ?? '',
                'Required Delivery':   e?.requiredDeliveryDate ?? '',
                'Project Description': e?.projectDescription   ?? '',
                'How Did You Hear':    e?.howDidYouHear        ?? '',
                'Status':              STATUS_CONFIG[e?.status as EnquiryStatus]?.label ?? e?.status ?? '',
                'Received On':         e?.createdAt
                    ? new Date(e.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                    })
                    : '',
            }));

            const worksheet = XLSX.utils.json_to_sheet(sheetData);
            const workbook  = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

            const colWidths = Object.keys(sheetData[0]).map((key) => ({
                wch: Math.max(
                    key.length,
                    ...sheetData.map((row) => String(row[key as keyof typeof row] ?? '').length)
                ) + 2,
            }));
            worksheet['!cols'] = colWidths;

            const from     = appliedStartDate || 'all';
            const to       = appliedEndDate   || 'all';
            const filename = `enquiries-${from}-to-${to}.xlsx`;

            XLSX.writeFile(workbook, filename);
            toast.success('Export successful', {
                description: `${rows.length} enquir${rows.length !== 1 ? 'ies' : 'y'} exported to Excel.`,
            });
        } catch {
            toast.error('Export failed', {
                description: 'Something went wrong while exporting. Please try again.',
            });
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
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Enquiries</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Card className="mt-6">
                <CardHeader className="space-y-0 pb-0">
                    <div className="flex items-center justify-between pb-4">
                        <div>
                            <CardTitle>Contact Enquiries</CardTitle>
                            <CardDescription className="mt-0.5">
                                All enquiries submitted through the contact form.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-3 pt-3 pb-2">
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) => setStartDate(e?.target?.value ?? '')}
                                className="h-9 w-[148px] text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e?.target?.value ?? '')}
                                className="h-9 w-[148px] text-sm"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-9" onClick={handleApplyFilter} disabled={isLoading}>
                            <Filter className="h-3.5 w-3.5 mr-1.5" />
                            Apply
                        </Button>
                        {isFilterApplied && (
                            <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={handleClearFilter}>
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Clear
                            </Button>
                        )}
                        <div className="flex-1" />
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="h-9 w-[130px]">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {(Object.keys(STATUS_CONFIG) as EnquiryStatus[]).map((s) => (
                                        <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={handleExportExcel}
                            disabled={isExporting || isLoading}
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </div>

                    {isFilterApplied && (
                        <p className="text-xs text-muted-foreground pb-2">
                            Showing: <strong>{appliedStartDate || '—'}</strong>{' → '}<strong>{appliedEndDate || '—'}</strong>
                        </p>
                    )}
                </CardHeader>

                <CardContent>
                    {isLoading && (
                        <div className="py-16 text-center text-sm text-muted-foreground">Loading enquiries...</div>
                    )}
                    {isError && (
                        <div className="py-16 text-center text-sm text-destructive">Failed to load enquiries. Please try again.</div>
                    )}
                    {!isLoading && !isError && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Name</TableHead>
                                    <TableHead className="text-xs">Company</TableHead>
                                    <TableHead className="text-xs">Email</TableHead>
                                    <TableHead className="hidden text-xs md:table-cell">Product Type</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="hidden text-xs md:table-cell">Received</TableHead>
                                    <TableHead className="text-xs">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enquiries.map((enquiry: Enquiry) => (
                                    <TableRow key={enquiry?._id}>
                                        <TableCell className="font-medium max-w-[140px]">
                                            <p className="truncate">{enquiry?.fullName ?? '—'}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[140px]">
                                            <p className="truncate">{enquiry?.companyName ?? '—'}</p>
                                        </TableCell>
                                        <TableCell className="text-sm max-w-[180px]">
                                            <p className="truncate">{enquiry?.email ?? '—'}</p>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline" className="text-xs">
                                                {enquiry?.productType ?? '—'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={enquiry?.status ?? 'new'}
                                                disabled={statusMutation.isPending}
                                                onValueChange={(val) =>
                                                    statusMutation.mutate({ id: enquiry?._id, status: val as EnquiryStatus })
                                                }
                                            >
                                                <SelectTrigger className="h-7 w-[120px] text-xs px-2 border-0 shadow-none focus:ring-0">
                                                    <SelectValue>
                                                        <StatusBadge status={enquiry?.status ?? 'new'} />
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(Object.keys(STATUS_CONFIG) as EnquiryStatus[]).map((s) => (
                                                        <SelectItem key={s} value={s} className="text-xs">
                                                            <span className="flex items-center gap-2">
                                                                <span className={`h-2 w-2 rounded-full shrink-0 border ${STATUS_CONFIG[s].className}`} />
                                                                {STATUS_CONFIG[s].label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {formatDate(enquiry?.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewClick(enquiry)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteClick(enquiry?._id);
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {enquiries.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                                            {statusFilter !== 'all'
                                                ? `No ${STATUS_CONFIG[statusFilter as EnquiryStatus]?.label} enquiries found.`
                                                : isFilterApplied
                                                    ? 'No enquiries found for the selected date range.'
                                                    : 'No enquiries found.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        {pagination && (pagination?.total ?? 0) > 0 ? (
                            <>
                                Showing{' '}
                                <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, pagination?.total ?? 0)}</strong>
                                {' '}of <strong>{pagination?.total ?? 0}</strong>{' '}
                                enquir{(pagination?.total ?? 0) !== 1 ? 'ies' : 'y'}
                            </>
                        ) : (
                            <>Showing <strong>0</strong> enquiries</>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                            <Select value={String(limit)} onValueChange={handleLimitChange}>
                                <SelectTrigger className="w-[70px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
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
                                <span className="text-xs text-muted-foreground">
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

            {/* ── View Details Dialog ──────────────────────────────────────── */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <DialogTitle>Enquiry Details</DialogTitle>
                            {viewEnquiry && <StatusBadge status={viewEnquiry?.status ?? 'new'} />}
                        </div>
                    </DialogHeader>
                    {viewEnquiry && (
                        <div className="space-y-5 pt-1">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact Info</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <DetailRow icon={Mail}      label="Full Name" value={viewEnquiry?.fullName} />
                                    <DetailRow icon={Building2} label="Company"   value={viewEnquiry?.companyName} />
                                    <DetailRow icon={Mail}      label="Email"     value={viewEnquiry?.email} />
                                    <DetailRow icon={Phone}     label="Phone"     value={viewEnquiry?.phoneNumber} />
                                    <DetailRow icon={Globe}     label="Country"   value={viewEnquiry?.country} />
                                    {viewEnquiry?.howDidYouHear && (
                                        <DetailRow icon={Megaphone} label="How Did You Hear" value={viewEnquiry?.howDidYouHear} />
                                    )}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Project Info</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <DetailRow icon={Package}  label="Product Type" value={viewEnquiry?.productType} />
                                    <DetailRow icon={BookOpen} label="Binding Type" value={viewEnquiry?.bindingType} />
                                    <DetailRow icon={FileText} label="Approx. Qty"  value={viewEnquiry?.approximateQuantity} />
                                    {viewEnquiry?.requiredDeliveryDate && (
                                        <DetailRow icon={Calendar} label="Delivery Date" value={viewEnquiry?.requiredDeliveryDate} />
                                    )}
                                    <div className="col-span-2">
                                        <DetailRow icon={Sparkles} label="Specialty Finishing" value={viewEnquiry?.specialtyFinishing} />
                                    </div>
                                    {viewEnquiry?.projectDescription && (
                                        <div className="col-span-2">
                                            <DetailRow icon={FileText} label="Project Description" value={viewEnquiry?.projectDescription} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground border-t pt-3">
                                Received on {formatDate(viewEnquiry?.createdAt)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ────────────────────────────────────────────── */}
            <AlertDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setDeleteId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This enquiry will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EnquiriesPage;