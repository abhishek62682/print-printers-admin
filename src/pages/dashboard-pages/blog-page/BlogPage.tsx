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
import { getAllBlogs, deleteBlog, updateBlog } from '@/config/api/blogs.api';
import type { Blog, GetBlogsParams } from '@/config/api/blogs.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageOff, MoreHorizontal, Plus, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/Utils/constant';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const BlogsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState<GetBlogsParams['status'] | 'all'>('all');

    const queryParams: GetBlogsParams = {
        page,
        limit,
        ...(status !== 'all' ? { status } : {}),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['blogs', queryParams],
        queryFn: () => getAllBlogs(queryParams),
        staleTime: 10000,
    });

    const blogs = data?.data ?? [];
    const pagination = data?.pagination;

    const deleteMutation = useMutation({
        mutationFn: () => deleteBlog(deleteId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            setDialogOpen(false);
            setDeleteId(null);
            toast.success('Blog deleted', {
                description: 'The blog post has been permanently removed.',
            });
        },
        onError: () => {
            toast.error('Failed to delete blog', {
                description: 'Something went wrong. Please try again.',
            });
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
            const fd = new FormData();
            fd.append('isActive', String(isActive));
            return updateBlog(id, fd);
        },
        onSuccess: (_, { isActive }) => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Status updated', {
                description: `Blog marked as ${isActive ? 'Active' : 'Inactive'}.`,
            });
        },
        onError: () => {
            toast.error('Failed to update status', {
                description: 'Something went wrong. Please try again.',
            });
        },
    });

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setTimeout(() => setDialogOpen(true), 100);
    };

    const handleStatusChange = (val: string) => {
        setStatus(val as GetBlogsParams['status'] | 'all');
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
                            <BreadcrumbPage>Blogs</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Link to="/dashboard/blogs/create">
                    <Button variant="theme">
                        <Plus size={20} />
                        <span className="ml-1">Add Blog</span>
                    </Button>
                </Link>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle>Blogs</CardTitle>
                            <CardDescription className="mt-1">
                                Manage blog posts published on your site.
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
                        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
                            <LoaderCircle className="animate-spin h-4 w-4" />
                            Loading blogs...
                        </div>
                    )}
                    {isError && (
                        <div className="py-16 text-center text-sm text-destructive">
                            Failed to load blogs. Please try again.
                        </div>
                    )}
                    {!isLoading && !isError && (blogs?.length ?? 0) > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs w-[64px]">Cover</TableHead>
                                    <TableHead className="text-xs">Title</TableHead>
                                    <TableHead className="text-xs">Author</TableHead>
                                    <TableHead className="hidden text-xs md:table-cell">Tags</TableHead>
                                    <TableHead className="text-xs">Active</TableHead>
                                    <TableHead className="hidden text-xs md:table-cell">Created at</TableHead>
                                    <TableHead className="text-xs">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogs?.map((blog: Blog) => (
                                    <TableRow key={blog?._id}>
                                        <TableCell className="hidden sm:table-cell">
                                            {blog?.coverImage ? (
                                                <img
                                                    src={`${API_BASE_URL}/${blog.coverImage}`}
                                                    alt={blog?.coverImageAlt ?? blog?.title ?? 'Blog cover'}
                                                    className="h-10 w-10 rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                    <ImageOff className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="font-medium max-w-[180px]">
                                            <p className="truncate">{blog?.title ?? '—'}</p>
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground">
                                            {blog?.createdBy?.username ?? '—'}
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell">
                                            {(blog?.tags?.length ?? 0) > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {blog?.tags?.slice(0, 3)?.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {(blog?.tags?.length ?? 0) > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{(blog?.tags?.length ?? 0) - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No tags</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Switch
                                                className={blog?.isActive ? 'bg-[#31A2FF]' : 'bg-gray-300'}
                                                checked={blog?.isActive ?? false}
                                                disabled={toggleMutation?.isPending}
                                                onCheckedChange={(checked) =>
                                                    toggleMutation?.mutate({ id: blog._id, isActive: checked })
                                                }
                                            />
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {blog?.createdAt
                                                ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : '—'}
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
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/dashboard/blogs/${blog?._id}/edit`)}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onSelect={(e) => {
                                                            e?.preventDefault();
                                                            handleDeleteClick(blog?._id);
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!isLoading && !isError && (blogs?.length ?? 0) === 0 && (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            {status !== 'all'
                                ? `No ${status} blogs found. Try changing the filter.`
                                : 'No blogs found. Create your first one!'}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        {pagination && pagination?.total > 0 ? (
                            <>
                                Showing{' '}
                                <strong>
                                    {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10) + 1}–
                                    {Math.min((pagination?.page ?? 1) * (pagination?.limit ?? 10), pagination?.total ?? 0)}
                                </strong>{' '}
                                of <strong>{pagination?.total ?? 0}</strong> blog{pagination?.total !== 1 ? 's' : ''}
                            </>
                        ) : (
                            <>Showing <strong>0</strong> blogs</>
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
                                <span className="text-xs text-muted-foreground">
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
                            This action cannot be undone. This blog post will be permanently
                            deleted from your site.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation?.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation?.mutate()}
                            disabled={deleteMutation?.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation?.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BlogsPage;