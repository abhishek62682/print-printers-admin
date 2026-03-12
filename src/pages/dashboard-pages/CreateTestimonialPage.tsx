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
import { LoaderCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type FormValues = {
    name: string;
    designation: string;
    content: string;
    isActive: boolean;
    image?: FileList;
};

const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    designation: z.string().min(2, { message: 'Designation must be at least 2 characters.' }),
    content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
    isActive: z.boolean(),
    image: z
        .instanceof(FileList)
        .refine((file) => file.length === 0 || file.length === 1, 'Only one image allowed.')
        .optional(),
});

const CreateTestimonial = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            designation: '',
            content: '',
            isActive: true, // ✅ default active
        },
    });

    const imageRef = form.register('image');
    const isActiveValue = form.watch('isActive');

    const mutation = useMutation({
        mutationFn: createTestimonial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success('Testimonial created successfully.');
            navigate('/dashboard/testimonials');
        },
        onError: () => {
            toast.error('Failed to create testimonial', {
                description: 'Something went wrong. Please try again.',
            });
        },
    });

    function onSubmit(values: FormValues) {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('designation', values.designation);
        formData.append('content', values.content);
        formData.append('isActive', String(values.isActive));
        if (values.image && values.image.length === 1) {
            formData.append('image', values.image[0]);
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

                                {/* Status toggle */}
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
                            <Link to="/dashboard/testimonials">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="theme" type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <LoaderCircle className="animate-spin mr-2" />
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