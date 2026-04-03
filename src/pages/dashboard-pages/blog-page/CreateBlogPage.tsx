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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { createBlog } from '@/config/api/blogs.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { KeyboardEvent, ChangeEvent } from 'react';
import type { ApiAxiosError } from '@/types/error';

const formSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    authorName: z.string().min(2, { message: 'Author name must be at least 2 characters.' }).optional(),
    content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
    excerpt: z.string().max(300, { message: 'Excerpt cannot exceed 300 characters.' }).optional(),
    coverImageAlt: z.string().optional(),
    bannerImageAlt: z.string().optional(),
    seoMetaTitle: z.string().max(60, { message: 'Meta title cannot exceed 60 characters.' }).optional(),
    seoMetaDescription: z.string().max(160, { message: 'Meta description cannot exceed 160 characters.' }).optional(),
    seoCanonicalUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
    isActive: z.boolean(),
});


type FormValues = z.infer<typeof formSchema>;

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
    inputRef: React.RefObject<HTMLInputElement | null>;
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
                <span className="ml-auto text-xs text-muted-foreground">JPEG, PNG, WEBP • 6MB</span>
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

const CreateBlog = () => {
    const navigate    = useNavigate();
    const queryClient = useQueryClient();

    const [tags, setTags]                   = useState<string[]>([]);
    const [seoKeywords, setSeoKeywords]     = useState<string[]>([]);
    const [tagInput, setTagInput]           = useState('');
    const [keywordInput, setKeywordInput]   = useState('');
    const [coverPreview, setCoverPreview]   = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile]         = useState<File | null>(null);
    const [bannerFile, setBannerFile]       = useState<File | null>(null);

    const coverInputRef  = useRef<HTMLInputElement | null>(null);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title:              '',
            authorName:         '',
            content:            '',
            excerpt:            '',
            coverImageAlt:      '',
            bannerImageAlt:     '',
            seoMetaTitle:       '',
            seoMetaDescription: '',
            seoCanonicalUrl:    '',
            isActive:           true,
        },
    });

    const isActiveValue     = form.watch('isActive');
    const titleValue        = form.watch('title');
    const excerptValue      = form.watch('excerpt');
    const seoMetaTitleValue = form.watch('seoMetaTitle');
    const seoMetaDescValue  = form.watch('seoMetaDescription');

    const mutation = useMutation({
        mutationFn: createBlog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog created', {
                description: 'Your blog post has been published successfully.',
            });
            navigate('/dashboard/blogs');
        },
        onError: (error: ApiAxiosError) => {
            const fieldErrors = error?.response?.data?.fieldErrors;

            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([field, errors]) => {
                    form.setError(field as keyof FormValues, {
                        type:    errors[0]?.type    ?? 'server',
                        message: errors[0]?.message ?? 'Invalid value',
                    });
                });
            }

            toast.error('Failed to create blog', {
                description:
                    error?.response?.data?.message ?? 'Something went wrong. Please try again.',
            });
        },
    });

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput?.trim()) {
            e.preventDefault();
            const newTag = tagInput?.trim().toLowerCase();
            if (!tags?.includes(newTag)) setTags([...(tags ?? []), newTag]);
            setTagInput('');
        }
    };

    const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && keywordInput?.trim()) {
            e.preventDefault();
            const newKeyword = keywordInput?.trim().toLowerCase();
            if (!seoKeywords?.includes(newKeyword)) setSeoKeywords([...(seoKeywords ?? []), newKeyword]);
            setKeywordInput('');
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
        formData.append('title',      values?.title      ?? '');
        formData.append('authorName', values?.authorName ?? '');
        formData.append('content',    values?.content    ?? '');
        formData.append('isActive',   String(values?.isActive ?? true));

        if (values?.excerpt)        formData.append('excerpt',        values.excerpt);
        if (values?.coverImageAlt)  formData.append('coverImageAlt',  values.coverImageAlt);
        if (values?.bannerImageAlt) formData.append('bannerImageAlt', values.bannerImageAlt);

        if ((tags?.length ?? 0) > 0) formData.append('tags', JSON.stringify(tags));

        if (
            (seoKeywords?.length ?? 0) > 0 ||
            values?.seoMetaTitle ||
            values?.seoMetaDescription ||
            values?.seoCanonicalUrl
        ) {
            formData.append('seo', JSON.stringify({
                metaTitle:       values?.seoMetaTitle       ?? '',
                metaDescription: values?.seoMetaDescription ?? '',
                metaKeywords:    seoKeywords                ?? [],
                canonicalUrl:    values?.seoCanonicalUrl    ?? '',
            }));
        }

        if (coverFile)  formData.append('coverImage',  coverFile);
        if (bannerFile) formData.append('bannerImage', bannerFile);

        mutation.mutate(formData);
    }

    return (
        <section>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, () => {
                    toast.error('Please fix the errors', {
                        description: 'Fill in all required fields correctly before submitting.',
                    });
                })}>
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
                                <BreadcrumbPage>Create</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Create a new blog</CardTitle>
                            <CardDescription>
                                Fill out the form below to publish a new blog post.
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
                                            <div className="flex items-center justify-between mt-1">
                                                <FormMessage />
                                                <p className={`text-xs ml-auto ${
                                                    (titleValue?.length ?? 0) >= 200
                                                        ? 'text-destructive'
                                                        : (titleValue?.length ?? 0) >= 180
                                                        ? 'text-yellow-500'
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {titleValue?.length ?? 0}/200
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Author Name */}
                                <FormField
                                    control={form.control}
                                    name="authorName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Author Name </FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="e.g. John Doe" className="w-full" {...field} />
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
                                            <FormLabel>Content <Required /></FormLabel>
                                            <FormControl>
                                               <JoditEditor
  value={field.value}
 
  onChange={(newContent) => field.onChange(newContent)}
  onBlur={(newContent) => field.onChange(newContent)}
/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Excerpt */}
                                <FormField
                                    control={form.control}
                                    name="excerpt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Excerpt (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief summary of the blog post (max 300 characters)"
                                                    className="resize-none"
                                                    maxLength={300}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="flex items-center justify-between mt-1">
                                                <FormMessage />
                                                <p className={`text-xs ml-auto ${
                                                    (excerptValue?.length ?? 0) >= 300
                                                        ? 'text-destructive'
                                                        : (excerptValue?.length ?? 0) >= 270
                                                        ? 'text-yellow-500'
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {excerptValue?.length ?? 0}/300
                                                </p>
                                            </div>
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
                                            {tags?.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => setTags(tags?.filter((t) => t !== tag) ?? [])}
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

                                {/* SEO Section */}
                                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                                    <h3 className="font-semibold text-sm">SEO Settings (Optional)</h3>

                                    {/* Meta Title */}
                                    <FormField
                                        control={form.control}
                                        name="seoMetaTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Meta Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="SEO title for search engines (max 60 chars)"
                                                        maxLength={60}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <div className="flex items-center justify-between mt-1">
                                                    <FormMessage />
                                                    <p className={`text-xs ml-auto ${
                                                        (seoMetaTitleValue?.length ?? 0) >= 60
                                                            ? 'text-destructive'
                                                            : (seoMetaTitleValue?.length ?? 0) >= 50
                                                            ? 'text-yellow-500'
                                                            : 'text-muted-foreground'
                                                    }`}>
                                                        {seoMetaTitleValue?.length ?? 0}/60
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Meta Description */}
                                    <FormField
                                        control={form.control}
                                        name="seoMetaDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Meta Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Description shown in search results (max 160 chars)"
                                                        className="resize-none h-16"
                                                        maxLength={160}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <div className="flex items-center justify-between mt-1">
                                                    <FormMessage />
                                                    <p className={`text-xs ml-auto ${
                                                        (seoMetaDescValue?.length ?? 0) >= 160
                                                            ? 'text-destructive'
                                                            : (seoMetaDescValue?.length ?? 0) >= 140
                                                            ? 'text-yellow-500'
                                                            : 'text-muted-foreground'
                                                    }`}>
                                                        {seoMetaDescValue?.length ?? 0}/160
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* SEO Keywords */}
                                    <div className="space-y-2">
                                        <FormLabel className="text-xs">SEO Keywords</FormLabel>
                                        <Input
                                            type="text"
                                            placeholder="e.g. javascript, web development"
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e?.target?.value ?? '')}
                                            onKeyDown={handleKeywordKeyDown}
                                        />
                                        {(seoKeywords?.length ?? 0) > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {seoKeywords?.map((keyword) => (
                                                    <Badge key={keyword} variant="outline" className="flex items-center gap-1 pr-1">
                                                        {keyword}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSeoKeywords(seoKeywords?.filter((k) => k !== keyword) ?? [])}
                                                            className="ml-1 hover:text-destructive transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Canonical URL */}
                                    <FormField
                                        control={form.control}
                                        name="seoCanonicalUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Canonical URL</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://yourdomain.com/blogs/your-blog"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Cover Image */}
                                <div className="space-y-3">
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
                                    <FormField
                                        control={form.control}
                                        name="coverImageAlt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Cover Image Alt Text</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Describe the cover image for accessibility"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Banner Image */}
                                <div className="space-y-3">
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
                                    <FormField
                                        control={form.control}
                                        name="bannerImageAlt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Banner Image Alt Text</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Describe the banner image for accessibility"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                Submit
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </section>
    );
};

export default CreateBlog;