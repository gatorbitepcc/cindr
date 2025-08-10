// src/pages/Settings.tsx
import { useRef, useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  UserRound,
  Camera,
  ImagePlus,
  Save,
  X,
} from "lucide-react";
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const BIO_MAX = 500;

export default function Settings() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  // Profile state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Load user profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.name || '');
          setBio(data.bio || '');
          
          // Load actual avatar URL if it exists
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          }
          
          // Load actual photo URLs from Firestore
          if (data.photos && Array.isArray(data.photos)) {
            setPhotos(data.photos);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user?.uid, toast]);

  const onPickAvatar = () => avatarInputRef.current?.click();
  const onPickGallery = () => galleryInputRef.current?.click();

  // Convert file to base64 string
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Check file size (limit to 1MB for Firestore efficiency)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 1MB",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const base64String = await convertFileToBase64(file);
      
      // Update state immediately for UI feedback
      setAvatarUrl(base64String);

      // Save the base64 string to Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        avatarUrl: base64String,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
        className: "bg-success-soft border-success text-success-foreground"
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update avatar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    if (photos.length >= 12) {
      toast({ 
        title: "Limit reached", 
        description: "You can add up to 12 photos.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (limit to 1MB for Firestore efficiency)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 1MB",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const base64String = await convertFileToBase64(file);
      
      // Update state immediately for UI feedback
      const newPhotos = [...photos, base64String];
      setPhotos(newPhotos);

      // Save the updated photos array to Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photos: newPhotos,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Photo added",
        description: "Your photo has been added to the gallery",
        className: "bg-success-soft border-success text-success-foreground"
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to add photo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const newPhotos = photos.filter((_, i) => i !== index);
      
      // Update state immediately for UI feedback
      setPhotos(newPhotos);

      // Update Firestore with new photos array
      await updateDoc(doc(db, 'users', user.uid), {
        photos: newPhotos,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Photo removed",
        description: "Photo has been removed from your gallery",
        className: "bg-success-soft border-success text-success-foreground"
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Failed to remove photo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: username,
        bio: bio,
        updatedAt: serverTimestamp()
      });

      toast({ 
        title: "Profile saved", 
        description: "Your changes have been updated.",
        className: "bg-success-soft border-success text-success-foreground"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ff6a3d] via-[#ff7b59] to-[#ff5fa8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-white mb-2">Loading Settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6a3d] via-[#ff7b59] to-[#ff5fa8]">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-sm">Settings</h1>
          <p className="text-white/90 mt-2">Customize your profile and preferences</p>
        </div>

        <div className="grid gap-6">
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
                        <span>{username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onPickAvatar}
                      disabled={loading}
                      className="absolute -bottom-1 -right-1 p-2 rounded-full bg-orange-500 text-white shadow hover:bg-orange-600 disabled:opacity-50"
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
                      disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                  <div className="text-xs text-neutral-500 text-right">
                    {bio.length}/{BIO_MAX}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
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
                  className={`border-2 border-dashed border-neutral-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ImagePlus className="w-6 h-6 text-neutral-500 mb-2" />
                  <p className="text-sm text-neutral-600">
                    {loading ? 'Uploading...' : 'Add Photo'}
                  </p>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddGallery}
                  disabled={loading}
                />

                {/* Thumbnails */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {photos.map((src, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden relative group">
                        <img src={src} className="w-full h-full object-cover" alt={`Gallery ${i + 1}`} />
                        <button
                          onClick={() => handleRemovePhoto(i)}
                          disabled={loading}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                          aria-label="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
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