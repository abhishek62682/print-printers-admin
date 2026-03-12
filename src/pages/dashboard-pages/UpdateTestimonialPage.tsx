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
import { updateTestimonial, getAllTestimonials } from '@/config/api/testimonial.api';
import type { Testimonial } from '@/config/api/testimonial.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    designation: z.string().min(2, {
        message: 'Designation must be at least 2 characters.',
    }),
    content: z.string().min(10, {
        message: 'Content must be at least 10 characters.',
    }),
    image: z
        .instanceof(FileList)
        .refine((file) => file.length === 0 || file.length === 1, 'Only one image allowed.')
        .optional(),
});

const UpdateTestimonial = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: response, isLoading: isFetching } = useQuery({
        queryKey: ['testimonials'],
        queryFn: () => getAllTestimonials(),
        staleTime: 10000,
    });

    // ✅ getAllTestimonials now returns { data, pagination } — access .data array
    const testimonial: Testimonial | undefined = response?.data?.find(
        (t: Testimonial) => t?._id === id
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            name: testimonial?.name ?? '',
            designation: testimonial?.designation ?? '',
            content: testimonial?.content ?? '',
        },
    });

    const imageRef = form.register('image');

    const mutation = useMutation({
        mutationFn: (formData: FormData) => updateTestimonial(id!, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Testimonial updated successfully.');
            navigate('/dashboard/testimonials');
        },
        onError: () => {
            toast.error('Failed to update testimonial.', {
                description: 'Something went wrong. Please try again.',
            });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('name', values?.name ?? '');
        formData.append('designation', values?.designation ?? '');
        formData.append('content', values?.content ?? '');
        if (values?.image && values.image.length === 1) {
            formData.append('image', values.image[0]);
        }
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
                                <BreadcrumbLink href="/dashboard/testimonials">
                                    Testimonials
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Edit</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Update testimonial</CardTitle>
                            <CardDescription>
                                Edit the details below to update this testimonial.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="designation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Designation</FormLabel>
                                            <FormControl>
                                                <Input type="text" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Content</FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-32" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Current image preview */}
                                {testimonial?.imageUrl && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`http://localhost:3000/${testimonial.imageUrl}`}
                                            alt={testimonial?.name ?? ''}
                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-muted"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Current profile image. Upload a new one to replace it.
                                        </p>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>
                                                Profile Image{' '}
                                                <span className="text-muted-foreground font-normal">
                                                    (optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    className="w-full"
                                                    {...imageRef}
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
                                onClick={() => navigate('/dashboard/testimonials')}
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

export default UpdateTestimonial;