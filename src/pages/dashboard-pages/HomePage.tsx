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
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new:       { label: 'New',       className: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  quoted:    { label: 'Quoted',    className: 'bg-purple-50 text-purple-700 border-purple-200' },
  converted: { label: 'Converted', className: 'bg-green-50 text-green-700 border-green-200' },
  closed:    { label: 'Closed',    className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ── Drawer field ────────────────────────────────────────────────────────────
const Field = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
};

const DrawerSection = ({ title }: { title: string }) => (
  <div className="pt-2 pb-1">
    <p className="text-xs text-slate-400">{title}</p>
    <Separator className="mt-1.5" />
  </div>
);

const formatDate = (d?: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // ── Enquiry state ──────────────────────────────────────────────────────
  const [enqDeleteId,   setEnqDeleteId]   = useState<string | null>(null);
  const [enqDeleteOpen, setEnqDeleteOpen] = useState(false);
  const [viewEnquiry,   setViewEnquiry]   = useState<RecentEnquiry | null>(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);

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
      setDrawerOpen(false);
      toast.success('Enquiry deleted', { description: 'The enquiry has been permanently removed.' });
    },
    onError: () => toast.error('Failed to delete enquiry', { description: 'Something went wrong. Please try again.' }),
  });

  const deleteBlogMutation = useMutation({
    mutationFn: () => deleteBlog(blogDeleteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setBlogDeleteOpen(false);
      setBlogDeleteId(null);
      toast.success('Blog deleted', { description: 'The blog post has been permanently removed.' });
    },
    onError: () => toast.error('Failed to delete blog', { description: 'Something went wrong. Please try again.' }),
  });

  const handleViewEnquiry = (enq: RecentEnquiry) => {
    setViewEnquiry(enq);
    setDrawerOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────
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
        <Card className="mt-6 border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Enquiries</CardTitle>
            <CardDescription className="mt-0.5">Latest inquiries from your contact form.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-slate-500 gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" /> Loading...
              </div>
            )}
            {!isLoading && (data?.recentEnquiries?.length ?? 0) === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No enquiries yet.</p>
            )}
            {!isLoading && (data?.recentEnquiries?.length ?? 0) > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-600">Name / Company</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Email</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Received</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentEnquiries?.map((enq: RecentEnquiry) => (
                      <TableRow
                        key={enq._id}
                        onDoubleClick={() => handleViewEnquiry(enq)}
                        className="hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                      >
                        <TableCell className="py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm text-slate-700">{enq.fullName ?? '—'}</p>
                            <p className="text-xs text-slate-400">{enq.companyName ?? '—'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-sm text-slate-700">{enq.email ?? '—'}</p>
                        </TableCell>
                        <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                          <StatusBadge status={enq.status} />
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-sm text-slate-600 whitespace-nowrap">{formatDate(enq.createdAt)}</p>
                        </TableCell>
                        <TableCell className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-xs font-semibold">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => handleViewEnquiry(enq)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => navigate('/dashboard/enquiries')}>
                                Go to Enquiries
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 text-sm cursor-pointer"
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Recent Blogs ─────────────────────────────────────────────── */}
        <Card className="mt-6 border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Blogs</CardTitle>
            <CardDescription className="mt-0.5">Latest blog posts published on your site.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-slate-500 gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" /> Loading...
              </div>
            )}
            {!isLoading && (data?.recentBlogs?.length ?? 0) === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No blogs yet.</p>
            )}
            {!isLoading && (data?.recentBlogs?.length ?? 0) > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-600 w-16">Cover</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Title</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Author</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 hidden md:table-cell">Tags</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 hidden md:table-cell">Created</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentBlogs?.map((blog: RecentBlog) => (
                      <TableRow
                        key={blog._id}
                        className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="py-3">
                          {blog?.coverImage ? (
                            <img
                              src={`${API_BASE_URL}/${blog.coverImage}`}
                              alt={blog?.title ?? ''}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                              <ImageOff className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3 max-w-[200px]">
                          <p className="text-sm text-slate-700 truncate">{blog?.title ?? '—'}</p>
                        </TableCell>
                        <TableCell className="py-3">
                          {/* API returns createdBy as { _id, username } object */}
                          <p className="text-sm text-slate-600">
                            {typeof blog?.createdBy === 'object' && blog.createdBy !== null
                              ? blog.createdBy.username
                              : (blog?.author ?? '—')}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          {(blog?.tags?.length ?? 0) > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {blog?.tags?.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                              {(blog?.tags?.length ?? 0) > 3 && (
                                <Badge variant="outline" className="text-xs">+{(blog?.tags?.length ?? 0) - 3}</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No tags</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                            blog?.isActive
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {blog?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <p className="text-sm text-slate-600 whitespace-nowrap">{formatDate(blog?.createdAt)}</p>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-xs font-semibold">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => navigate(`/dashboard/blogs/${blog._id}/edit`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 text-sm cursor-pointer"
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
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Enquiry Detail Drawer ──────────────────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0 overflow-hidden">
          {viewEnquiry && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <StatusBadge status={viewEnquiry.status} />
                  <p className="text-sm text-slate-700 mt-1">{viewEnquiry.fullName}</p>
                  {viewEnquiry.companyName && (
                    <p className="text-xs text-slate-400">{viewEnquiry.companyName}</p>
                  )}
                </div>
                <p className="text-xs text-slate-400 whitespace-nowrap pt-1 pr-8">
                  {formatDate(viewEnquiry.createdAt)}
                </p>
              </div>

              {/* Body */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-6 py-5 space-y-6">
                  <div>
                    <DrawerSection title="Contact" />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                      <Field label="Name"    value={viewEnquiry.fullName} />
                      <Field label="Company" value={viewEnquiry.companyName} />
                      <Field label="Email"   value={viewEnquiry.email} />
                    </div>
                  </div>
                  <div>
                    <DrawerSection title="Enquiry" />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-3">
                      <Field label="Status"  value={STATUS_CONFIG[viewEnquiry.status]?.label ?? viewEnquiry.status} />
                      <Field label="Received" value={formatDate(viewEnquiry.createdAt)} />
                    </div>
                  </div>
                  <div className="h-4" />
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 shrink-0 bg-white">
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/enquiries')}>
                  Go to Enquiries
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { setEnqDeleteId(viewEnquiry._id); setTimeout(() => setEnqDeleteOpen(true), 100); }}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Enquiry Delete Dialog ──────────────────────────────────────────── */}
      <AlertDialog
        open={enqDeleteOpen}
        onOpenChange={(open) => { setEnqDeleteOpen(open); if (!open) setEnqDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This enquiry will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEnquiryMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEnquiryMutation.mutate()}
              disabled={deleteEnquiryMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
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
            <AlertDialogTitle>Delete Blog?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This blog post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBlogMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBlogMutation.mutate()}
              disabled={deleteBlogMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
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