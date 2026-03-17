import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { updateProfile, changePassword } from '@/config/api/profile.api';
import { useMutation } from '@tanstack/react-query';
import { useProfileStore } from '@/config/store/profile';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/Utils/constant';
import type { ChangeEvent } from 'react';
import type { AxiosError } from 'axios';

// ── Schemas ────────────────────────────────────────────────────────────────
const profileSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, { message: 'Username must be at least 3 characters' })
        .max(30, { message: 'Username cannot exceed 30 characters' }),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(6, { message: 'Must be at least 6 characters' }),
        newPassword:     z.string().min(6, { message: 'Must be at least 6 characters' }),
        confirmPassword: z.string().min(6, { message: 'Please confirm your new password' }),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .refine((d) => d.currentPassword !== d.newPassword, {
        message: 'Must be different from current password',
        path: ['newPassword'],
    });

type ProfileFormValues  = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const getInitials = (name?: string) =>
    (name ?? 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ─────────────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
    const [imageFile, setImageFile]       = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const imageInputRef                   = useRef<HTMLInputElement | null>(null);

    const profile = useProfileStore((s) => s.profile);
    const { setProfile } = useProfileStore();

    const profileForm = useForm<ProfileFormValues>({
        resolver:      zodResolver(profileSchema),
        defaultValues: { username: profile?.username ?? '' },
    });

    useEffect(() => {
        if (!profile) return;
        profileForm.reset({ username: profile.username ?? '' });
        if (profile.profileImage) {
            setImagePreview(`${API_BASE_URL}/${profile.profileImage}`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.username]);

    const passwordForm = useForm<PasswordFormValues>({
        resolver:      zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    // ── Mutations ──────────────────────────────────────────────────────────
    const profileMutation = useMutation({
        mutationFn: ({ values, file }: { values: ProfileFormValues; file: File | null }) =>
            updateProfile({ username: values.username }, file),
        onSuccess: (updatedProfile) => {
            setProfile(updatedProfile);
            setImageFile(null);
            toast.success('Profile updated', {
                description: 'Your profile information has been saved.',
            });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message ?? 'Something went wrong. Please try again.';
            toast.error('Failed to update profile', { description: message });
        },
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            passwordForm.reset();
            toast.success('Password changed', {
                description: 'Your password has been updated successfully.',
            });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message ?? 'Current password is incorrect.';
            toast.error('Password update failed', { description: message });
        },
    });

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const onProfileSubmit  = (values: ProfileFormValues) => {
        profileMutation.mutate({ values, file: imageFile });
    };

    const onPasswordSubmit = (values: PasswordFormValues) => {
        passwordMutation.mutate({
            currentPassword: values.currentPassword,
            newPassword:     values.newPassword,
        });
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" />
                Loading profile...
            </div>
        );
    }

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6 space-y-4">

                {/* ── Box 1: Personal Information ──────────────────────────── */}
                <div className="rounded-xl border bg-card">
                    <div className="px-6 py-5">
                        <h2 className="text-sm font-semibold">Personal Information</h2>
                    </div>

                    <Separator />

                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                            <div className="px-6 py-6 space-y-6">

                                {/* Avatar + Change button */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-muted">
                                        <AvatarImage
                                            src={imagePreview ?? undefined}
                                            alt={profile?.username ?? 'User'}
                                        />
                                        <AvatarFallback className="text-sm font-semibold bg-muted">
                                            {getInitials(profile?.username)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => imageInputRef.current?.click()}
                                        >
                                            Change
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            JPG, PNG, WEBP · Max 2MB
                                        </span>
                                    </div>

                                    {imageFile && (
                                        <span className="text-xs text-green-600 truncate max-w-[200px]">
                                            ✓ {imageFile.name}
                                        </span>
                                    )}

                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* Name + Email side by side */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={profileForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter your name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <Input
                                            type="email"
                                            value={profile?.email ?? ''}
                                            disabled
                                            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                                        />
                                    </FormItem>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-end px-6 py-4">
                                <Button
                                    type="submit"
                                    variant="theme"
                                    size="sm"
                                    disabled={profileMutation.isPending}
                                >
                                    {profileMutation.isPending && (
                                        <LoaderCircle className="animate-spin mr-2 h-3.5 w-3.5" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* ── Box 2: Change Password ────────────────────────────────── */}
                <div className="rounded-xl border bg-card">
                    <div className="px-6 py-5">
                        <h2 className="text-sm font-semibold">Change Password</h2>
                    </div>

                    <Separator />

                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                            <div className="px-6 py-6">
                                {/* 3 password fields side by side */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Old Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPasswords.currentPassword ? 'text' : 'password'}
                                                            placeholder="Enter your password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('currentPassword')}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPasswords.currentPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPasswords.newPassword ? 'text' : 'password'}
                                                            placeholder="Enter your password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('newPassword')}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPasswords.newPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password Again</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPasswords.confirmPassword ? 'text' : 'password'}
                                                            placeholder="Enter your password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPasswords.confirmPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-end px-6 py-4">
                                <Button
                                    type="submit"
                                    variant="theme"
                                    size="sm"
                                    disabled={passwordMutation.isPending}
                                >
                                    {passwordMutation.isPending && (
                                        <LoaderCircle className="animate-spin mr-2 h-3.5 w-3.5" />
                                    )}
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;