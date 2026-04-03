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
import { updateTestimonial, getAllTestimonials } from '@/config/api/testimonial.api';
import type { Testimonial } from '@/config/api/testimonial.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, ImagePlus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/Utils/constant';
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { ApiAxiosError } from '@/types/error';

const Required = () => <span className="text-destructive ml-0.5">*</span>;

const formSchema = z.object({
    name:        z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100, { message: 'Name cannot exceed 100 characters.' }),
    designation: z.string().min(2, { message: 'Designation must be at least 2 characters.' }).max(100, { message: 'Designation cannot exceed 100 characters.' }),
    content:     z.string().min(10, { message: 'Content must be at least 10 characters.' }),
    isActive:    z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const UpdateTestimonial = () => {
    const { id }      = useParams<{ id: string }>();
    const navigate    = useNavigate();
    const queryClient = useQueryClient();

    const [imageFile, setImageFile]       = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage]   = useState(false);
    const imageInputRef                   = useRef<HTMLInputElement | null>(null);

    const { data: response, isLoading: isFetching } = useQuery({
        queryKey: ['testimonials'],
        queryFn:  () => getAllTestimonials(),
        staleTime: 10000,
    });

    const testimonial: Testimonial | undefined = response?.data?.find(
        (t: Testimonial) => t._id === id
    );

    const existingImageUrl = testimonial?.imageUrl
        ? `${API_BASE_URL}/${testimonial.imageUrl}`
        : null;

    const avatarSrc = imageFile
        ? (imagePreview ?? undefined)
        : removeImage
            ? undefined
            : (existingImageUrl ?? undefined);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        values: {
            name:        testimonial?.name        ?? '',
            designation: testimonial?.designation ?? '',
            content:     testimonial?.content     ?? '',
            isActive:    testimonial?.isActive    ?? true,
        },
    });

    const isActiveValue    = form.watch('isActive');
    const nameValue        = form.watch('name');
    const designationValue = form.watch('designation');

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const mutation = useMutation({
        mutationFn: (formData: FormData) => updateTestimonial(id!, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Testimonial updated', {
                description: 'Your changes have been saved successfully.',
            });
            navigate('/dashboard/testimonials');
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

            toast.error('Failed to update testimonial', {
                description: error?.response?.data?.message ?? 'Something went wrong. Please try again.',
            });
        },
    });

    function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append('name',        values.name);
        formData.append('designation', values.designation);
        formData.append('content',     values.content);
        formData.append('isActive',    String(values.isActive));
        if (imageFile)    formData.append('image',       imageFile);
        if (removeImage)  formData.append('removeImage', 'true');
        mutation.mutate(formData);
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" />
                Loading testimonial...
            </div>
        );
    }

    if (!testimonial) {
        return (
            <div className="flex items-center justify-center py-24 text-destructive text-sm">
                Testimonial not found.
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
                                <BreadcrumbLink href="/dashboard/testimonials">Testimonials</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Edit</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Update Testimonial</CardTitle>
                            <CardDescription>
                                Edit the details below to update this testimonial.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="grid gap-6">

                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name <Required /></FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <div className="flex items-center justify-between mt-1">
                                                <FormMessage />
                                                <p className={`text-xs ml-auto ${
                                                    (nameValue?.length ?? 0) >= 100
                                                        ? 'text-destructive'
                                                        : (nameValue?.length ?? 0) >= 85
                                                        ? 'text-yellow-500'
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {nameValue?.length ?? 0}/100
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Designation */}
                                <FormField
                                    control={form.control}
                                    name="designation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Designation <Required /></FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <div className="flex items-center justify-between mt-1">
                                                <FormMessage />
                                                <p className={`text-xs ml-auto ${
                                                    (designationValue?.length ?? 0) >= 100
                                                        ? 'text-destructive'
                                                        : (designationValue?.length ?? 0) >= 85
                                                        ? 'text-yellow-500'
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {designationValue?.length ?? 0}/100
                                                </p>
                                            </div>
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
                                                <Textarea className="min-h-32" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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

                                {/* Profile Image */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            Profile Image{' '}
                                            <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                                        </p>
                                        <span className="text-xs text-muted-foreground">80 × 80px recommended</span>
                                    </div>

                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 hover:border-muted-foreground/60 hover:bg-muted/40 transition-all"
                                    >
                                        <ImagePlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                                        <span className="ml-auto text-xs text-muted-foreground">JPEG, PNG, WEBP • 2MB</span>
                                    </div>

                                    {avatarSrc && (
                                        <div className="relative inline-block">
                                            <img
                                                src={avatarSrc}
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

                                    {removeImage && (
                                        <p className="text-xs text-destructive">
                                            Image will be removed on save
                                        </p>
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/dashboard/testimonials')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="theme" disabled={mutation.isPending}>
                                {mutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
                                Update
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </section>
    );
};

export default UpdateTestimonial;