import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { getStats } from '@/config/api/dashboard.api';
import type { RecentEnquiry, RecentBlog } from '@/config/api/dashboard.api';
import { deleteEnquiry } from '@/config/api/enquiry.api';
import { deleteBlog } from '@/config/api/blogs.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionCards } from '@/components/section-cards';
import { LoaderCircle, MoreHorizontal, ImageOff } from 'lucide-react';
import { API_BASE_URL } from '@/Utils/constant';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  quoted:    'bg-purple-100 text-purple-700 border-purple-200',
  converted: 'bg-green-100 text-green-700 border-green-200',
  closed:    'bg-gray-100 text-gray-600 border-gray-200',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const HomePage = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // ── Enquiry state ──────────────────────────────────────────────────────
  const [enqDeleteId,   setEnqDeleteId]   = useState<string | null>(null);
  const [enqDeleteOpen, setEnqDeleteOpen] = useState(false);
  const [viewEnquiry,   setViewEnquiry]   = useState<RecentEnquiry | null>(null);
  const [viewOpen,      setViewOpen]      = useState(false);

  // ── Blog state ─────────────────────────────────────────────────────────
  const [blogDeleteId,   setBlogDeleteId]   = useState<string | null>(null);
  const [blogDeleteOpen, setBlogDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey:  ['stats'],
    queryFn:   () => getStats(),
    staleTime: 30000,
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  const deleteEnquiryMutation = useMutation({
    mutationFn: () => deleteEnquiry(enqDeleteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setEnqDeleteOpen(false);
      setEnqDeleteId(null);
      toast.success('Enquiry deleted', {
        description: 'The enquiry has been permanently removed.',
      });
    },
    onError: () => toast.error('Failed to delete enquiry', {
      description: 'Something went wrong. Please try again.',
    }),
  });

  const deleteBlogMutation = useMutation({
    mutationFn: () => deleteBlog(blogDeleteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setBlogDeleteOpen(false);
      setBlogDeleteId(null);
      toast.success('Blog deleted', {
        description: 'The blog post has been permanently removed.',
      });
    },
    onError: () => toast.error('Failed to delete blog', {
      description: 'Something went wrong. Please try again.',
    }),
  });

  return (
    <div className="flex flex-col">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">

        {/* Stat Cards */}
        {data && <SectionCards data={data} />}

        {/* ── Recent Enquiries ─────────────────────────────────────────── */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Enquiries</CardTitle>
            <CardDescription className="mt-1">Latest inquiries from your contact form.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" />
                Loading...
              </div>
            )}

            {!isLoading && (data?.recentEnquiries?.length ?? 0) === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No enquiries yet.</p>
            )}

            {!isLoading && (data?.recentEnquiries?.length ?? 0) > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Company</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="hidden md:table-cell text-xs">Product Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-xs">Received</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentEnquiries?.map((enq: RecentEnquiry) => (
                    <TableRow key={enq._id}>
                      <TableCell className="font-medium max-w-[140px]">
                        <p className="truncate">{enq.fullName ?? '—'}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[140px]">
                        <p className="truncate">{enq.companyName ?? '—'}</p>
                      </TableCell>
                      <TableCell className="text-sm max-w-[180px]">
                        <p className="truncate">{enq.email ?? '—'}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {enq.productType ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[enq.status] ?? ''}`}>
                          {enq.status.charAt(0).toUpperCase() + enq.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(enq.createdAt)}
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
                            <DropdownMenuItem onClick={() => { setViewEnquiry(enq); setViewOpen(true); }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/enquiries`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                setEnqDeleteId(enq._id);
                                setTimeout(() => setEnqDeleteOpen(true), 100);
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
          </CardContent>
        </Card>

        {/* ── Recent Blogs ─────────────────────────────────────────────── */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Blogs</CardTitle>
            <CardDescription className="mt-1">Latest blog posts published on your site.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" />
                Loading...
              </div>
            )}

            {!isLoading && (data?.recentBlogs?.length ?? 0) === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No blogs yet.</p>
            )}

            {!isLoading && (data?.recentBlogs?.length ?? 0) > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[64px]">Cover</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Author</TableHead>
                    <TableHead className="hidden md:table-cell text-xs">Tags</TableHead>
                    <TableHead className="text-xs">Active</TableHead>
                    <TableHead className="hidden md:table-cell text-xs">Created at</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentBlogs?.map((blog: RecentBlog) => (
                    <TableRow key={blog._id}>
                      <TableCell className="hidden sm:table-cell">
                        {blog?.coverImage ? (
                          <img
                            src={`${API_BASE_URL}/${blog.coverImage}`}
                            alt={blog?.title ?? ''}
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
                        {blog?.author ?? '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {(blog?.tags?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {blog?.tags?.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
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
                        <Badge
                          variant="outline"
                          className={blog?.isActive
                            ? 'bg-green-100 text-green-700 border-green-200 text-xs'
                            : 'bg-gray-100 text-gray-600 border-gray-200 text-xs'}
                        >
                          {blog?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {blog?.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
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
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/blogs/${blog._id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                setBlogDeleteId(blog._id);
                                setTimeout(() => setBlogDeleteOpen(true), 100);
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
          </CardContent>
        </Card>

      </div>

      {/* ── Enquiry View Dialog ────────────────────────────────────────────── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {viewEnquiry && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{viewEnquiry.fullName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium">{viewEnquiry.companyName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{viewEnquiry.email ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product Type</p>
                  <p className="font-medium">{viewEnquiry.productType ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[viewEnquiry.status] ?? ''}`}>
                    {viewEnquiry.status.charAt(0).toUpperCase() + viewEnquiry.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="font-medium">{formatDate(viewEnquiry.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Enquiry Delete Dialog ──────────────────────────────────────────── */}
      <AlertDialog
        open={enqDeleteOpen}
        onOpenChange={(open) => { setEnqDeleteOpen(open); if (!open) setEnqDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This enquiry will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEnquiryMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEnquiryMutation.mutate()}
              disabled={deleteEnquiryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEnquiryMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Blog Delete Dialog ─────────────────────────────────────────────── */}
      <AlertDialog
        open={blogDeleteOpen}
        onOpenChange={(open) => { setBlogDeleteOpen(open); if (!open) setBlogDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This blog post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBlogMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBlogMutation.mutate()}
              disabled={deleteBlogMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBlogMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default HomePage;