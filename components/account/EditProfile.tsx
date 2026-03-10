"use client";
import { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Mail, Calendar, Pencil, Loader2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateProfile, uploadProfileImage } from "@/lib/redux/authSlice";
import { toast } from "sonner";

{
  /* Profile Overview Card */
}
export function ProfileOverview() {
  const dispatch = useAppDispatch();
  const { user, profileUpdating, imageUploading } = useAppSelector((s) => s.auth);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const dialogFileInputRef = useRef<HTMLInputElement>(null);
  const [editedUser, setEditedUser] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    profileImage: user?.profileImage ?? "",
  });

  const handleEditClick = () => {
    setEditedUser({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      profileImage: user?.profileImage ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    const result = await dispatch(
      updateProfile({
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
      })
    );
    if (updateProfile.fulfilled.match(result)) {
      setIsEditDialogOpen(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error(result.payload as string || "Failed to update profile");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await dispatch(uploadProfileImage(file));
    if (uploadProfileImage.fulfilled.match(result)) {
      toast.success("Profile image updated");
    } else {
      toast.error((result.payload as string) || "Failed to upload image");
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  if (!user) return null;

  return (
    <>
      <div className="overflow-hidden border shadow-sm rounded-xl bg-background">
        <div className="relative p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between pb-6 sm:pb-10">
            {/* Left Section */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-background ring-2 ring-primary/20 sm:h-20 sm:w-20 md:h-24 md:w-24">
                  <AvatarImage
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary md:text-xl">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <input
                  ref={cardFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  size="icon"
                  variant="outline"
                  disabled={imageUploading}
                  onClick={() => cardFileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background shadow-md transition-all hover:scale-110 hover:shadow-lg md:h-8 md:w-8"
                >
                  {imageUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin md:h-4 md:w-4" />
                  ) : (
                    <Camera className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <h2 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                  {user.firstName} {user.lastName}
                </h2>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-4">
                  <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                    <Mail className="h-4 w-4 text-primary/60" />
                    <span className="text-xs font-medium md:text-sm">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                    <Calendar className="h-4 w-4 text-primary/60" />
                    <span className="text-xs font-medium md:text-sm">
                      Joined {new Date(user.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="w-full gap-2 border-primary/20 bg-primary/5 font-medium text-primary transition-all hover:bg-primary/10 hover:text-primary sm:w-auto"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile information here. Click save when
              you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 sm:gap-4 sm:py-4">
            {/* Profile Image Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-primary/20 sm:h-24 sm:w-24">
                  <AvatarImage
                    src={editedUser.profileImage || user.profileImage}
                    alt={`${editedUser.firstName} ${editedUser.lastName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                    {editedUser.firstName?.[0]}
                    {editedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={dialogFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  size="icon"
                  variant="outline"
                  disabled={imageUploading}
                  onClick={() => dialogFileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background shadow-md"
                >
                  {imageUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* First Name Input */}
            <div className="grid gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="firstName" className="text-sm sm:text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={editedUser.firstName}
                onChange={handleInputChange}
                className="sm:col-span-3"
              />
            </div>

            {/* Last Name Input */}
            <div className="grid gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="lastName" className="text-sm sm:text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={editedUser.lastName}
                onChange={handleInputChange}
                className="sm:col-span-3"
              />
            </div>

            {/* Email Input */}
            <div className="grid gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="email" className="text-sm sm:text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editedUser.email}
                onChange={handleInputChange}
                className="sm:col-span-3"
              />
            </div>

            {/* Join Date (Read-only) */}
            <div className="grid gap-1.5 sm:grid-cols-4 sm:items-center sm:gap-4">
              <Label htmlFor="joinDate" className="text-sm sm:text-right">
                Joined
              </Label>
              <Input
                id="joinDate"
                value={new Date(user.joinDate).toLocaleDateString()}
                disabled
                className="sm:col-span-3 bg-muted"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleCloseDialog} disabled={profileUpdating} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={profileUpdating}>
              {profileUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
