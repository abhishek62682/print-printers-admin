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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getAllUsers, createUser, updateUserRole, deleteUser } from '@/config/api/users.api';
import type { User, UserRole, CreateUserPayload } from '@/config/api/users.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    MoreHorizontal,
    Plus,
    LoaderCircle,
    ShieldCheck,
    UserRound,
    KeyRound,
    Copy,
    Check,
} from 'lucide-react';
import { useState } from 'react';

/* ─── Role badge helper ───────────────────────────────────────────── */
const RoleBadge = ({ role }: { role: UserRole }) =>
    role === 'SUPER_ADMIN' ? (
        <Badge className="gap-1 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
            <ShieldCheck className="h-3 w-3" />
            Super Admin
        </Badge>
    ) : (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
            <UserRound className="h-3 w-3" />
            Blog Manager
        </Badge>
    );

/* ─── Copy button for authSecret ─────────────────────────────────── */
const CopySecret = ({ secret }: { secret: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Copy TOTP secret"
        >
            <KeyRound className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[120px]">{secret}</span>
            {copied ? (
                <Check className="h-3 w-3 text-green-500 shrink-0" />
            ) : (
                <Copy className="h-3 w-3 shrink-0" />
            )}
        </button>
    );
};

/* ─── Create User Form State ─────────────────────────────────────── */
const defaultForm: CreateUserPayload = {
    username: '',
    email: '',
    password: '',
    role: 'BLOG_MANAGER',
};

/* ═══════════════════════════════════════════════════════════════════
   UsersPage
══════════════════════════════════════════════════════════════════════ */
const UsersPage = () => {
    const queryClient = useQueryClient();

    // ── dialog / modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleTarget, setRoleTarget] = useState<User | null>(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('BLOG_MANAGER');

    // ── form state
    const [form, setForm] = useState<CreateUserPayload>(defaultForm);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateUserPayload, string>>>({});

    /* ── Queries ─────────────────────────────────────────────────── */
    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
        staleTime: 10_000,
    });

    /* ── Mutations ───────────────────────────────────────────────── */
    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setCreateOpen(false);
            setForm(defaultForm);
            toast.success('User created', {
                description: 'New user has been added successfully.',
            });
        },
        onError: (err: any) => {
            toast.error('Failed to create user', {
                description: err?.response?.data?.message ?? 'Something went wrong.',
            });
        },
    });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
            updateUserRole(id, { role }),
        onSuccess: (_, { role }) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setRoleDialogOpen(false);
            setRoleTarget(null);
            toast.success('Role updated', {
                description: `User role changed to ${role === 'SUPER_ADMIN' ? 'Super Admin' : 'Blog Manager'}.`,
            });
        },
        onError: (err: any) => {
            toast.error('Failed to update role', {
                description: err?.response?.data?.message ?? 'Something went wrong.',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteUser(deleteId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteDialogOpen(false);
            setDeleteId(null);
            toast.success('User deleted', {
                description: 'The user has been permanently removed.',
            });
        },
        onError: (err: any) => {
            toast.error('Failed to delete user', {
                description: err?.response?.data?.message ?? 'Something went wrong.',
            });
        },
    });

    /* ── Handlers ────────────────────────────────────────────────── */
    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setTimeout(() => setDeleteDialogOpen(true), 100);
    };

    const handleRoleClick = (user: User) => {
        setRoleTarget(user);
        setSelectedRole(user.role);
        setTimeout(() => setRoleDialogOpen(true), 100);
    };

    const validateForm = (): boolean => {
        const errors: Partial<Record<keyof CreateUserPayload, string>> = {};
        if (!form.username || form.username.length < 3)
            errors.username = 'Username must be at least 3 characters.';
        if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
            errors.email = 'Please enter a valid email.';
        if (!form.password || form.password.length < 6)
            errors.password = 'Password must be at least 6 characters.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateSubmit = () => {
        if (!validateForm()) return;
        createMutation.mutate(form);
    };

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div>
            {/* ── Breadcrumb + Add button ── */}
            <div className="flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Users</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Button variant="theme" onClick={() => setCreateOpen(true)}>
                    <Plus size={20} />
                    <span className="ml-1">Add User</span>
                </Button>
            </div>

            {/* ── Table card ── */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription className="mt-1">
                        Manage team members and their access roles.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
                            <LoaderCircle className="animate-spin h-4 w-4" />
                            Loading users...
                        </div>
                    )}
                    {isError && (
                        <div className="py-16 text-center text-sm text-destructive">
                            Failed to load users. Please try again.
                        </div>
                    )}
                    {!isLoading && !isError && users.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Username</TableHead>
                                    <TableHead className="text-xs">Email</TableHead>
                                    <TableHead className="text-xs">Role</TableHead>
                                    <TableHead className="text-xs hidden md:table-cell">TOTP Secret</TableHead>
                                    <TableHead className="text-xs hidden md:table-cell">Verified</TableHead>
                                    <TableHead className="text-xs hidden md:table-cell">Created By</TableHead>
                                    <TableHead className="text-xs hidden md:table-cell">Created At</TableHead>
                                    <TableHead className="text-xs">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: User) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">
                                            {user.username}
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.email}
                                        </TableCell>

                                        <TableCell>
                                            <RoleBadge role={user.role} />
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell">
                                            {user.authSecret ? (
                                                <CopySecret secret={user.authSecret} />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell">
                                            {user.isVerified ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                                    Unverified
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {user.createdBy?.username ?? (
                                                <span className="text-xs italic">System</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
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
                                                    <DropdownMenuItem onClick={() => handleRoleClick(user)}>
                                                        Change Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteClick(user._id);
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

                    {!isLoading && !isError && users.length === 0 && (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No users found. Add your first team member!
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        {users.length > 0 ? (
                            <>
                                Showing <strong>{users.length}</strong> user{users.length !== 1 ? 's' : ''}
                            </>
                        ) : null}
                    </p>
                </CardFooter>
            </Card>

            {/* ══════════════════════════════════════════════════════
                Create User Modal
            ══════════════════════════════════════════════════════ */}
            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open);
                    if (!open) {
                        setForm(defaultForm);
                        setFormErrors({});
                    }
                }}
            >
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to add a new team member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {/* Username */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="johndoe"
                                value={form.username}
                                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                            />
                            {formErrors.username && (
                                <p className="text-xs text-destructive">{formErrors.username}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            />
                            {formErrors.email && (
                                <p className="text-xs text-destructive">{formErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            />
                            {formErrors.password && (
                                <p className="text-xs text-destructive">{formErrors.password}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="grid gap-1.5">
                            <Label>Role</Label>
                            <Select
                                value={form.role}
                                onValueChange={(val) => setForm((f) => ({ ...f, role: val as UserRole }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BLOG_MANAGER">Blog Manager</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreateOpen(false)}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="theme"
                            onClick={handleCreateSubmit}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════════════════
                Change Role Dialog
            ══════════════════════════════════════════════════════ */}
            <Dialog
                open={roleDialogOpen}
                onOpenChange={(open) => {
                    setRoleDialogOpen(open);
                    if (!open) setRoleTarget(null);
                }}
            >
                <DialogContent className="sm:max-w-[380px]">
                    <DialogHeader>
                        <DialogTitle>Change Role</DialogTitle>
                        <DialogDescription>
                            Update the role for{' '}
                            <span className="font-medium text-foreground">
                                {roleTarget?.username}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <Label className="mb-1.5 block">New Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={(val) => setSelectedRole(val as UserRole)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BLOG_MANAGER">Blog Manager</SelectItem>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRoleDialogOpen(false)}
                            disabled={roleMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="theme"
                            disabled={roleMutation.isPending || selectedRole === roleTarget?.role}
                            onClick={() =>
                                roleTarget &&
                                roleMutation.mutate({ id: roleTarget._id, role: selectedRole })
                            }
                        >
                            {roleMutation.isPending ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════════════════
                Delete Confirm Dialog
            ══════════════════════════════════════════════════════ */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setDeleteId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This user will be permanently deleted
                            and will lose all access to the dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UsersPage;