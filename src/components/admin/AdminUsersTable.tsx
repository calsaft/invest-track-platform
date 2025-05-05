
import React, { useState } from "react";
import { User } from "@/types/auth";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface AdminUsersTableProps {
  users: User[];
  onDeleteUser: (userId: string) => Promise<void>;
  onUpdateUserBalance: (userId: string, amount: number) => Promise<void>;
  currentUserId: string | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AdminUsersTable({
  users,
  onDeleteUser,
  onUpdateUserBalance,
  currentUserId,
  isLoading,
  onRefresh,
}: AdminUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [balanceToAdd, setBalanceToAdd] = useState<number>(0);

  const filteredUsers = searchQuery.trim()
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id.includes(searchQuery)
      )
    : users;

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setBalanceToAdd(0);
  };

  const handleUpdateBalance = async () => {
    if (editingUser) {
      await onUpdateUserBalance(editingUser.id, balanceToAdd);
      setEditingUser(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-xs">
          <Input
            placeholder="Search users..."
            className="pl-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Table>
        <TableCaption>List of all registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Referrals</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${user.balance.toFixed(2)}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.referrals?.length || 0}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {user.id !== currentUserId && user.role !== "admin" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete User Account
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action
                              cannot be undone, and all data associated with this
                              account will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Balance</DialogTitle>
            <DialogDescription>
              Add or subtract funds from {editingUser?.name}'s account.
              Enter a positive number to add funds, or a negative number to subtract.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-balance" className="text-right">
                Current Balance:
              </Label>
              <div className="col-span-3">
                <span className="font-bold">${editingUser?.balance.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount:
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  type="number"
                  value={balanceToAdd === 0 ? "" : balanceToAdd}
                  onChange={(e) => setBalanceToAdd(Number(e.target.value))}
                  placeholder="Enter amount (negative to subtract)"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-balance" className="text-right">
                New Balance:
              </Label>
              <div className="col-span-3">
                <span className="font-bold">
                  ${editingUser ? (editingUser.balance + balanceToAdd).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance}>Update Balance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
