import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { updateBlog, getAllBlogs } from '@/config/api/blogs.api';
import type { Blog } from '@/config/api/blogs.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, ImageOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    content: z.string().min(10, {
        message: 'Content must be at least 10 characters.',
    }),
    tags: z.string().optional(),
    coverImage: z
        .instanceof(FileList)
        .refine((file) => file.length === 0 || file.length === 1, 'Only one image allowed.')
        .optional(),
    bannerImage: z
        .instanceof(FileList)
        .refine((file) => file.length === 0 || file.length === 1, 'Only one image allowed.')
        .optional(),
});

const UpdateBlogPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: response, isLoading: isFetching } = useQuery({
        queryKey: ['blogs'],
        queryFn: () => getAllBlogs(),
        staleTime: 10000,
    });

    // ✅ getAllBlogs returns { data, pagination } — drill into .data
    const blog: Blog | undefined = response?.data?.find(
        (b: Blog) => b?._id === id
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            title: blog?.title ?? '',
            content: blog?.content ?? '',
            tags: blog?.tags?.join(', ') ?? '',
        },
    });

    const coverImageRef = form.register('coverImage');
    const bannerImageRef = form.register('bannerImage');

    const mutation = useMutation({
        mutationFn: (formData: FormData) => updateBlog(id!, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog updated successfully.');
            navigate('/dashboard/blogs');
        },
        onError: () => {
            toast.error('Failed to update blog.', {
                description: 'Something went wrong. Please try again.',
            });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('title', values?.title ?? '');
        formData.append('content', values?.content ?? '');

        // convert comma-separated tags string → array and send each
        const tagsArray = (values?.tags ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        tagsArray.forEach((tag) => formData.append('tags[]', tag));

        if (values?.coverImage && values.coverImage.length === 1) {
            formData.append('coverImage', values.coverImage[0]);
        }
        if (values?.bannerImage && values.bannerImage.length === 1) {
            formData.append('bannerImage', values.bannerImage[0]);
        }

        mutation.mutate(formData);
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" />
                Loading blog...
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex items-center justify-center py-24 text-destructive text-sm">
                Blog not found.
            </div>
        );
    }

    return (
        <section>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/blogs">Blogs</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Edit</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Update blog</CardTitle>
                            <CardDescription>
                                Edit the details below to update this blog post.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="grid gap-6">

                                {/* Title */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Content */}
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Content</FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-40" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tags */}
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Tags{' '}
                                                <span className="text-muted-foreground font-normal">
                                                    (comma separated)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. react, typescript, node"
                                                    className="w-full"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Current cover image preview */}
                                {blog?.coverImage && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`http://localhost:3000/${blog.coverImage}`}
                                            alt={blog?.title ?? ''}
                                            className="h-12 w-20 rounded-md object-cover ring-2 ring-muted"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Current cover image. Upload a new one to replace it.
                                        </p>
                                    </div>
                                )}
                                {!blog?.coverImage && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-20 items-center justify-center rounded-md bg-muted">
                                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No cover image set.</p>
                                    </div>
                                )}

                                {/* Cover Image upload */}
                                <FormField
                                    control={form.control}
                                    name="coverImage"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>
                                                Cover Image{' '}
                                                <span className="text-muted-foreground font-normal">
                                                    (optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    className="w-full"
                                                    {...coverImageRef}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Current banner image preview */}
                                {blog?.bannerImage && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`http://localhost:3000/${blog.bannerImage}`}
                                            alt={blog?.title ?? ''}
                                            className="h-12 w-20 rounded-md object-cover ring-2 ring-muted"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Current banner image. Upload a new one to replace it.
                                        </p>
                                    </div>
                                )}
                                {!blog?.bannerImage && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-20 items-center justify-center rounded-md bg-muted">
                                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No banner image set.</p>
                                    </div>
                                )}

                                {/* Banner Image upload */}
                                <FormField
                                    control={form.control}
                                    name="bannerImage"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>
                                                Banner Image{' '}
                                                <span className="text-muted-foreground font-normal">
                                                    (optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    className="w-full"
                                                    {...bannerImageRef}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end gap-4 border-t pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/dashboard/blogs')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="theme" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <LoaderCircle className="animate-spin mr-2" />
                                )}
                                Update
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </section>
    );
};

export default UpdateBlogPage;