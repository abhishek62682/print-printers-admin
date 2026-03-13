import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Required from '@/components/required';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import JoditEditor from 'jodit-react';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { updateBlog, getAllBlogs } from '@/config/api/blogs.api';
import type { Blog } from '@/config/api/blogs.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { API_BASE_URL } from '@/Utils/constant';

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────
const formSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
    isActive: z.boolean(),
});

type FormValues = {
    title: string;
    content: string;
    isActive: boolean;
};

// ─────────────────────────────────────────────
// Image Upload Box
// ─────────────────────────────────────────────
const ImageUploadBox = ({
    label,
    hint,
    preview,
    onFileChange,
    onClear,
    inputRef,
}: {
    label: string;
    hint: string;
    preview: string | null;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>; // ✅ fixed type
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">{label}</FormLabel>
                <span className="text-xs text-muted-foreground">{hint}</span>
            </div>

            <div
                className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 hover:border-muted-foreground/60 hover:bg-muted/40 transition-all"
                onClick={() => inputRef?.current?.click()}
            >
                <ImagePlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="ml-auto text-xs text-muted-foreground">JPEG, PNG, WEBP • 2MB</span>
            </div>

            {preview && (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-28 w-auto rounded-lg border object-cover shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow hover:bg-destructive/80 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={onFileChange}
            />
        </div>
    );
};

// ─────────────────────────────────────────────
// UpdateBlogPage
// ─────────────────────────────────────────────
const UpdateBlogPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [tags, setTags]                   = useState<string[]>([]);
    const [tagInput, setTagInput]           = useState('');
    const [coverPreview, setCoverPreview]   = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile]         = useState<File | null>(null);
    const [bannerFile, setBannerFile]       = useState<File | null>(null);

    const coverInputRef  = useRef<HTMLInputElement | null>(null); // ✅ fixed type
    const bannerInputRef = useRef<HTMLInputElement | null>(null); // ✅ fixed type

    const { data: response, isLoading: isFetching } = useQuery({
        queryKey: ['blogs'],
        queryFn: () => getAllBlogs(),
        staleTime: 10000,
    });

    const blog: Blog | undefined = response?.data?.find((b: Blog) => b?._id === id);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: '', content: '', isActive: true },
    });

    const isActiveValue = form.watch('isActive');

    // ✅ Populate form + tags + image previews once blog loads
    useEffect(() => {
        if (blog) {
            form.reset({
                title:    blog.title    ?? '',
                content:  blog.content  ?? '',
                isActive: blog.isActive ?? true,
            });
            setTags(blog.tags ?? []);
            if (blog.coverImage)  setCoverPreview(`${API_BASE_URL}/${blog.coverImage}`);
            if (blog.bannerImage) setBannerPreview(`${API_BASE_URL}/${blog.bannerImage}`);
        }
    }, [blog]);

    const mutation = useMutation({
        mutationFn: (formData: FormData) => updateBlog(id!, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog updated', {
                description: 'Your changes have been saved successfully.',
            });
            navigate('/dashboard/blogs');
        },
        onError: () => {
            toast.error('Failed to update blog', {
                description: 'Something went wrong. Please try again.',
            });
        },
    });

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput?.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (!tags.includes(newTag)) setTags([...tags, newTag]);
            setTagInput('');
        }
    };

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append('title',    values?.title    ?? '');
        formData.append('content',  values?.content  ?? '');
        formData.append('isActive', String(values?.isActive ?? true));
        if (tags?.length > 0) formData.append('tags', JSON.stringify(tags));
        if (coverFile)  formData.append('coverImage',  coverFile);
        if (bannerFile) formData.append('bannerImage', bannerFile);
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
                                            <FormLabel>Title <Required /></FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Content — JoditEditor */}
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Content <Required /></FormLabel>
                                            <FormControl>
                                                <JoditEditor
                                                    value={field.value}
                                                    onBlur={(newContent) => field.onChange(newContent)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tags */}
                                <div className="space-y-2">
                                    <FormLabel>
                                        Tags{' '}
                                        <span className="text-muted-foreground font-normal text-xs">
                                            (press Enter or comma to add)
                                        </span>
                                    </FormLabel>
                                    <Input
                                        type="text"
                                        placeholder="e.g. react, dev, tutorial"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e?.target?.value ?? '')}
                                        onKeyDown={handleTagKeyDown}
                                    />
                                    {(tags?.length ?? 0) > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                                                        className="ml-1 hover:text-destructive transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                                            <div>
                                                <FormLabel>Status</FormLabel>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {isActiveValue
                                                        ? 'This blog will be visible on site.'
                                                        : 'This blog will be hidden from site.'}
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    className={isActiveValue ? 'bg-[#31A2FF]!' : 'bg-gray-300'}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Cover Image */}
                                <ImageUploadBox
                                    label="Cover Image"
                                    hint="400 × 330px recommended"
                                    preview={coverPreview}
                                    onFileChange={handleCoverChange}
                                    onClear={() => {
                                        setCoverPreview(null);
                                        setCoverFile(null);
                                        if (coverInputRef?.current) coverInputRef.current.value = '';
                                    }}
                                    inputRef={coverInputRef}
                                />

                                {/* Banner Image */}
                                <ImageUploadBox
                                    label="Banner Image"
                                    hint="804 × 473px recommended"
                                    preview={bannerPreview}
                                    onFileChange={handleBannerChange}
                                    onClear={() => {
                                        setBannerPreview(null);
                                        setBannerFile(null);
                                        if (bannerInputRef?.current) bannerInputRef.current.value = '';
                                    }}
                                    inputRef={bannerInputRef}
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
                                {mutation.isPending && <LoaderCircle className="animate-spin mr-2" />}
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