import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
    getAllTestimonials,
    deleteTestimonial,
    updateTestimonial,
} from '@/config/api/testimonial.api';
import type { Testimonial, GetTestimonialsParams } from '@/config/api/testimonial.api';
import type { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CirclePlus, MoreHorizontal, UserCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/Utils/constant';

interface ApiErrorResponse {
    message: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const TestimonialsPage = () => {
    const navigate    = useNavigate();
    const queryClient = useQueryClient();

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [page, setPage]   = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState<GetTestimonialsParams['status'] | 'all'>('all');

    const queryParams: GetTestimonialsParams = {
        page,
        limit,
        ...(status !== 'all' ? { status } : {}),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['testimonials', queryParams],
        queryFn:  () => getAllTestimonials(queryParams),
        staleTime: 10000,
    });

    const testimonials = data?.data      ?? [];
    const pagination   = data?.pagination;

    const deleteMutation = useMutation({
        mutationFn: () => deleteTestimonial(deleteId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            setDialogOpen(false);
            setDeleteId(null);
            toast.success('Testimonial deleted', {
                description: 'The testimonial has been permanently removed.',
            });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = error.response?.data?.message ?? 'Something went wrong. Please try again.';
            toast.error('Failed to delete testimonial', { description: message });
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
            const fd = new FormData();
            fd.append('isActive', String(isActive));
            return updateTestimonial(id, fd);
        },
        onSuccess: (_, { isActive }) => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Status updated', {
                description: `Testimonial marked as ${isActive ? 'Active' : 'Inactive'}.`,
            });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = error.response?.data?.message ?? 'Something went wrong. Please try again.';
            toast.error('Failed to update status', { description: message });
        },
    });

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setTimeout(() => setDialogOpen(true), 100);
    };

    const handleStatusChange = (val: string) => {
        setStatus(val as GetTestimonialsParams['status'] | 'all');
        setPage(1);
    };

    const handleLimitChange = (val: string) => {
        setLimit(Number(val));
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
                            <BreadcrumbPage>Testimonials</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Link to="/dashboard/testimonials/create">
                    <Button variant="theme">
                        <CirclePlus size={16} />
                        <span className="ml-2">Add Testimonial</span>
                    </Button>
                </Link>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle>Testimonials</CardTitle>
                            <CardDescription className="mt-1">
                                Manage client testimonials displayed on your site.
                            </CardDescription>
                        </div>
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading && (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            Loading testimonials…
                        </div>
                    )}
                    {isError && (
                        <div className="py-16 text-center text-sm text-destructive">
                            Failed to load testimonials. Please try again.
                        </div>
                    )}
                    {!isLoading && !isError && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs w-[64px]">Avatar</TableHead>
                                    <TableHead className="text-xs">Name</TableHead>
                                    <TableHead className="text-xs">Designation</TableHead>
                                    <TableHead className="hidden text-xs md:table-cell">Content</TableHead>
                                    <TableHead className="text-xs">Active</TableHead>
                                    <TableHead className="hidden text-xs md:table-cell">Created at</TableHead>
                                    <TableHead className="text-xs">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {testimonials.map((testimonial: Testimonial) => (
                                    <TableRow key={testimonial._id}>

                                        {/* Avatar */}
                                        <TableCell className="hidden sm:table-cell">
                                            {testimonial?.imageUrl ? (
                                                <img
                                                    src={`${API_BASE_URL}/${testimonial.imageUrl}`}
                                                    alt={testimonial?.name ?? ''}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                    <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Name */}
                                        <TableCell className="font-medium max-w-[140px]">
                                            <p className="truncate">{testimonial?.name ?? '—'}</p>
                                        </TableCell>

                                        {/* Designation — truncated if long */}
                                        <TableCell className="max-w-[160px]">
                                            <Badge
                                                variant="outline"
                                                className="max-w-full text-xs"
                                                title={testimonial?.designation ?? ''}
                                            >
                                                <span className="truncate block max-w-[140px]">
                                                    {testimonial?.designation ?? '—'}
                                                </span>
                                            </Badge>
                                        </TableCell>

                                        {/* Content */}
                                        <TableCell className="hidden md:table-cell max-w-xs">
                                            <p className="line-clamp-1 text-muted-foreground text-sm">
                                                {testimonial?.content ?? '—'}
                                            </p>
                                        </TableCell>

                                        {/* Toggle */}
                                        <TableCell>
                                            <Switch
                                                className={testimonial?.isActive ? 'bg-col-blue' : 'bg-gray-300'}
                                                checked={testimonial?.isActive ?? false}
                                                disabled={toggleMutation.isPending}
                                                onCheckedChange={(checked) =>
                                                    toggleMutation.mutate({ id: testimonial?._id, isActive: checked })
                                                }
                                            />
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {testimonial?.createdAt
                                                ? new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : '—'}
                                        </TableCell>

                                        {/* Actions */}
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
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate(`/dashboard/testimonials/${testimonial._id}/edit`)
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteClick(testimonial._id);
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {testimonials.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-16 text-center text-sm text-muted-foreground"
                                        >
                                            No testimonials found. Add your first one!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        {pagination && pagination.total > 0 ? (
                            <>
                                Showing{' '}
                                <strong>
                                    {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}
                                </strong>{' '}
                                of <strong>{pagination.total}</strong> testimonial{pagination.total !== 1 ? 's' : ''}
                            </>
                        ) : (
                            <>Showing <strong>0</strong> testimonials</>
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
                                        <SelectItem key={size} value={String(size)} className="text-xs">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p - 1)}
                                    disabled={!pagination.hasPrevPage || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Page {pagination?.page} of {pagination?.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!pagination.hasNextPage || isLoading}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>

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
                            This action cannot be undone. This testimonial will be permanently
                            deleted from your site.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 text-destructive-foreground hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TestimonialsPage;