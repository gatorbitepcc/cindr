// src/pages/Settings.tsx
import { useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  UserRound,
  Lock,
  Camera,
  ImagePlus,
  Save,
} from "lucide-react";

const BIO_MAX = 500;

export default function Settings() {
  const { toast } = useToast();

  // profile state (mock; wire to Firebase later)
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // security (visual only for now)
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // gallery (visual only)
  const [photos, setPhotos] = useState<string[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const onPickAvatar = () => avatarInputRef.current?.click();
  const onPickGallery = () => galleryInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleAddGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 12) {
      toast({ title: "Limit reached", description: "You can add up to 12 photos." });
      return;
    }
    const url = URL.createObjectURL(file);
    setPhotos((p) => [...p, url]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: upload avatar to Firebase Storage, save username/bio to Firestore
    await new Promise((r) => setTimeout(r, 400));
    toast({ title: "Profile saved", description: "Your changes have been updated." });
  };

  const canUpdatePassword = currentPw.length > 0 && newPw.length >= 6 && newPw === confirmPw;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6a3d] via-[#ff7b59] to-[#ff5fa8]">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-sm">Settings</h1>
          <p className="text-white/90 mt-2">Customize your profile and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card className="bg-white/95">
            <CardHeader className="flex flex-row items-center gap-2">
              <UserRound className="w-5 h-5 text-orange-500" />
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="size-20 md:size-24 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center text-neutral-500 text-xl font-semibold">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>U</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onPickAvatar}
                      className="absolute -bottom-1 -right-1 p-2 rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
                      aria-label="Change photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Bio with counter */}
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    maxLength={BIO_MAX}
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <div className="text-xs text-neutral-500 text-right">
                    {bio.length}/{BIO_MAX}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-white/95">
            <CardHeader className="flex flex-row items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  placeholder="Enter new password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={!canUpdatePassword}
                variant={canUpdatePassword ? "default" : "secondary"}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Photo Gallery */}
        <div className="mt-6">
          <Card className="bg-white/95">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-orange-500" />
                <CardTitle>Photo Gallery</CardTitle>
              </div>
              <div className="text-sm text-neutral-600">
                {photos.length}/12 photos
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Add Photo tile */}
                <div
                  onClick={onPickGallery}
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50"
                >
                  <ImagePlus className="w-6 h-6 text-neutral-500 mb-2" />
                  <p className="text-sm text-neutral-600">Add Photo</p>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddGallery}
                />

                {/* Thumbnails */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {photos.map((src, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden">
                        <img src={src} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-neutral-500">
                  Add up to 12 photos to showcase your personality. These will be visible on your profile.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
