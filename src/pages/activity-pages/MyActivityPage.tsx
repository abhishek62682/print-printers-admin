import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Search,
    Plus,
    RefreshCw,
    Trash2,
    LogIn,
    LogOut,
    User,
} from 'lucide-react';
import { getMyAuditLogs } from '@/config/api/auditLog.api';
import type { AuditLog, GetMyLogsParams } from '@/config/api/auditLog.api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const getActionIcon = (action: string) => {
    switch (action) {
        case 'CREATE':
            return <Plus className="h-4 w-4" />;
        case 'UPDATE':
            return <RefreshCw className="h-4 w-4" />;
        case 'DELETE':
            return <Trash2 className="h-4 w-4" />;
        case 'LOGIN':
            return <LogIn className="h-4 w-4" />;
        case 'LOGOUT':
            return <LogOut className="h-4 w-4" />;
        case 'PROFILE_UPDATE':
            return <User className="h-4 w-4" />;
        case 'PASSWORD_CHANGE':
            return <RefreshCw className="h-4 w-4" />;
        default:
            return <RefreshCw className="h-4 w-4" />;
    }
};

const getActionColor = (action: string) => {
    switch (action) {
        case 'CREATE':
            return 'text-green-600';
        case 'UPDATE':
            return 'text-blue-600';
        case 'DELETE':
            return 'text-red-600';
        case 'LOGIN':
            return 'text-emerald-600';
        case 'LOGOUT':
            return 'text-amber-600';
        case 'PROFILE_UPDATE':
            return 'text-purple-600';
        case 'PASSWORD_CHANGE':
            return 'text-orange-600';
        default:
            return 'text-gray-600';
    }
};

const getActionLabel = (action: string) => {
    switch (action) {
        case 'CREATE':
            return 'Created';
        case 'UPDATE':
            return 'Updated';
        case 'DELETE':
            return 'Deleted';
        case 'LOGIN':
            return 'Logged In';
        case 'LOGOUT':
            return 'Logged Out';
        case 'PROFILE_UPDATE':
            return 'Profile Updated';
        case 'PASSWORD_CHANGE':
            return 'Password Changed';
        default:
            return action;
    }
};

const MyAuditLogsPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [action, setAction] = useState<GetMyLogsParams['action'] | 'all'>('all');
    const [status, setStatus] = useState<GetMyLogsParams['status'] | 'all'>('all');
    const [search, setSearch] = useState('');

    const queryParams: GetMyLogsParams = {
        page,
        limit,
        ...(action !== 'all' ? { action } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(search ? { search } : {}),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['my-audit-logs', queryParams],
        queryFn: () => getMyAuditLogs(queryParams),
        staleTime: 10000,
    });

    const logs = data?.data ?? [];
    const pagination = data?.pagination;

    const handleActionChange = (val: string) => {
        setAction(val as GetMyLogsParams['action'] | 'all');
        setPage(1);
    };

    const handleStatusChange = (val: string) => {
        setStatus(val as GetMyLogsParams['status'] | 'all');
        setPage(1);
    };

    const handleLimitChange = (val: string) => {
        setLimit(Number(val));
        setPage(1);
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

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
                            <BreadcrumbPage>Audit Logs</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription className="mt-1">
                                Track all your activities and actions across the platform.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Search by resource or action
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 flex-col sm:flex-row">
                            <Select value={action} onValueChange={handleActionChange}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="CREATE">Create</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                    <SelectItem value="DELETE">Delete</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                    <SelectItem value="LOGOUT">Logout</SelectItem>
                                    <SelectItem value="PROFILE_UPDATE">Profile Update</SelectItem>
                                    <SelectItem value="PASSWORD_CHANGE">Password Change</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="SUCCESS">Success</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
                            <LoaderCircle className="animate-spin h-4 w-4" />
                            Loading audit logs...
                        </div>
                    )}

                    {isError && (
                        <div className="py-16 text-center text-sm text-destructive">
                            Failed to load audit logs. Please try again.
                        </div>
                    )}

                    {!isLoading && !isError && (logs?.length ?? 0) > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-muted/50">
                                        <TableHead className="text-xs font-semibold">Action</TableHead>
                                        <TableHead className="text-xs font-semibold">Resource</TableHead>
                                        <TableHead className="text-xs font-semibold">Status</TableHead>
                                        <TableHead className="hidden text-xs font-semibold md:table-cell">IP Address</TableHead>
                                        <TableHead className="hidden text-xs font-semibold lg:table-cell">User Agent</TableHead>
                                        <TableHead className="text-xs font-semibold text-right">Date & Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs?.map((log: AuditLog) => (
                                        <TableRow key={log?._id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg bg-muted ${getActionColor(log?.action)}`}>
                                                        {getActionIcon(log?.action)}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {getActionLabel(log?.action)}
                                                    </span>
                                                </div>
                                            </TableCell>
<TableCell>
    <div className="max-w-sm">
        <p className="text-sm font-medium break-words">
            {log?.targetLabel || '—'}
        </p>
        <p className="text-xs text-muted-foreground break-words">
            {log?.message || '—'}
        </p>
    </div>
</TableCell>

                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${log?.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {log?.status || '—'}
                                                </span>
                                            </TableCell>

                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                                                {log?.ipAddress || '—'}
                                            </TableCell>

                                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                                                {log?.userAgent || '—'}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="text-sm font-medium">
                                                    {log?.createdAt
                                                        ? new Date(log.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })
                                                        : '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {log?.createdAt
                                                        ? new Date(log.createdAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '—'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {!isLoading && !isError && (logs?.length ?? 0) === 0 && (
                        <div className="py-16 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-muted">
                                    <LoaderCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {search || action !== 'all' || status !== 'all'
                                    ? 'No logs found. Try adjusting your filters.'
                                    : 'No audit logs yet. Your activities will appear here.'}
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-6">
                    <div className="text-xs text-muted-foreground">
                        {pagination && pagination?.total > 0 ? (
                            <>
                                Showing{' '}
                                <strong>
                                    {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10) + 1}–
                                    {Math.min((pagination?.page ?? 1) * (pagination?.limit ?? 10), pagination?.total ?? 0)}
                                </strong>{' '}
                                of <strong>{pagination?.total ?? 0}</strong> log{pagination?.total !== 1 ? 's' : ''}
                            </>
                        ) : (
                            <>Showing <strong>0</strong> logs</>
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
                                    {PAGE_SIZE_OPTIONS?.map((size) => (
                                        <SelectItem key={size} value={String(size)} className="text-xs">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {pagination && (pagination?.totalPages ?? 0) > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p - 1)}
                                    disabled={!(pagination?.hasPrevPage) || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </Button>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!(pagination?.hasNextPage) || isLoading}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MyAuditLogsPage;