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
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { createTestimonial } from '@/config/api/testimonial.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, ImagePlus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { AxiosError } from 'axios';

// ── Required label helper ──────────────────────────────────────────────────
const Required = () => <span className="text-destructive ml-0.5">*</span>;

type FormValues = {
    name: string;
    designation: string;
    content: string;
    isActive: boolean;
};

const formSchema = z.object({
    name:        z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    designation: z.string().min(2, { message: 'Designation must be at least 2 characters.' }),
    content:     z.string().min(10, { message: 'Content must be at least 10 characters.' }),
    isActive:    z.boolean(),
});

const CreateTestimonial = () => {
    const navigate    = useNavigate();
    const queryClient = useQueryClient();

    // ── Image state ────────────────────────────────────────────────────────
    const [imageFile, setImageFile]       = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageInputRef                   = useRef<HTMLInputElement | null>(null);

    const form = useForm<FormValues>({
        resolver:      zodResolver(formSchema),
        defaultValues: {
            name:        '',
            designation: '',
            content:     '',
            isActive:    true,
        },
    });

    const isActiveValue = form.watch('isActive');

    // ── Image handlers ─────────────────────────────────────────────────────
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    // ── Mutation ───────────────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: createTestimonial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Testimonial created', {
                description: 'New testimonial has been published successfully.',
            });
            navigate('/dashboard/testimonials');
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message ?? 'Something went wrong. Please try again.';
            toast.error('Failed to create testimonial', { description: message });
        },
    });

    function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append('name',        values.name);
        formData.append('designation', values.designation);
        formData.append('content',     values.content);
        formData.append('isActive',    String(values.isActive));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        mutation.mutate(formData);
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
                                <BreadcrumbLink href="/dashboard/testimonials">
                                    Testimonials
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Create</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Create a new testimonial</CardTitle>
                            <CardDescription>
                                Fill out the form below to add a new client testimonial.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="grid gap-6">

                                {/* ── Name ──────────────────────────────────── */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name <Required /></FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* ── Designation ───────────────────────────── */}
                                <FormField
                                    control={form.control}
                                    name="designation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Designation <Required /></FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* ── Content ───────────────────────────────── */}
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Content <Required /></FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-32" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* ── Status toggle ─────────────────────────── */}
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                                            <div>
                                                <FormLabel>Status</FormLabel>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {isActiveValue
                                                        ? 'This testimonial will be visible on site.'
                                                        : 'This testimonial will be hidden from site.'}
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

                                {/* ── Profile Image ─────────────────────────── */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            Profile Image{' '}
                                            <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                                        </p>
                                        <span className="text-xs text-muted-foreground">80 × 80px recommended</span>
                                    </div>

                                    {/* Upload box — always visible */}
                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 hover:border-muted-foreground/60 hover:bg-muted/40 transition-all"
                                    >
                                        <ImagePlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                                        <span className="ml-auto text-xs text-muted-foreground">JPEG, PNG, WEBP • 2MB</span>
                                    </div>

                                    {/* Preview with red X — shown below box */}
                                    {imagePreview && (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-28 w-auto rounded-lg border object-cover shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow hover:bg-destructive/80 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>

                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end gap-4 border-t pt-6">
                            <Link to="/dashboard/testimonials">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="theme" type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                                )}
                                Submit
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </section>
    );
};

export default CreateTestimonial;