import React, { useEffect, useState } from "react";
import { getProfile, getUserById, updateUser } from "../../../core/services/auth.service";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Mail,
  UserRoundPlus,
  Phone,
  Globe,
  Calendar,
  Award,
  UserCircle,
  Pencil,
  AlignJustify,
  LayoutDashboard,
  Camera,
  FileText,
  MapPin,
  AtSign,
  User,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateClientProfile } from "../../../core/services/clientProfile.service";
import { Inter } from "next/font/google";
import { createConversation, findConversationBetween } from "../../../core/services/conversations.service";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelect } from "@/component/countrySelector";
const fira = Inter({ subsets: ["latin"], weight: ["300", "400", "700"] });

const Profile = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userRole, setUserRole] = useState('')

  // ALWAYS define formData at the top—never conditionally.
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    description: "",
    phoneNumber: "",
    country: "",
  });

  const router = useRouter();
  const { id } = router.query;

  // Fetch user once “id” is defined
  useEffect(() => {
    if (!id) return;
    const numericId = Array.isArray(id) ? Number(id[0]) : Number(id);
    if (isNaN(numericId)) {
      console.error("Invalid id:", id);
      setLoading(false);
      return;
    }

    getUserById(numericId)
      .then((me: any) => {
        setUserInfo(me);
      })
      .catch((err) => {
        console.error("Could not load profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    getProfile()
      .then((me) => {
        if (!me) {
          return
        }
        console.log("Logged-in user:", me);
        setUserRole(me.role)
      })
      .catch((err) => {
        console.error("Could not load profile:", err);
      });
  }, []);

  useEffect(() => {
    if (userInfo?.clientProfile) {
      const cp = userInfo.clientProfile;
      setFormData({
        name: cp.name || "",
        username: cp.username || "",
        description: cp.description || "",
        phoneNumber: cp.phoneNumber || "",
        country: cp.country || "",
      });
    }
  }, [userInfo]);

  const handleStartConversation = async () => {
    const me = await getProfile();
    const myId = String(me?.id);
    const rawId = router.query.id as string;

    // Try to find an existing conversation (your “between” call),
    // but DON’T navigate to its _id—just use targetId:
    const existing = await findConversationBetween(myId, rawId);
    if (existing) {
      // ← DON’T do router.push(`/messages/${existing._id}`);
      router.push(`/messages/${rawId}`);
      return;
    }

    // Create a new conversation doc on the server:
    await createConversation(myId, rawId);

    // NOW navigate to /messages/<rawId> (the other user’s ID)
    router.push(`/messages/${rawId}`);
  };



  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="animate-pulse">
          <div className="h-80 w-full bg-gray-300 rounded-lg mb-8" />
          <div className="flex flex-col md:flex-row gap-8 -mt-24 px-4">
            <div className="w-32 h-32 md:w-52 md:h-52 rounded-full bg-gray-400 border-8 border-white" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4" />
              <div className="h-6 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="text-red-500 text-lg font-medium">
          Failed to load profile data
        </div>
      </div>
    );
  }

  const { email, clientProfile } = userInfo;
  const ENGINE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // If this user really has no clientProfile at all, show a fallback
  if (!clientProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="text-gray-500 text-lg font-medium">
          No client profile available.
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      ;
      setIsEditModalOpen(false);
      updateClientProfile(formData)
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="relative bg-gray-50">
      {/* Hero Banner with Parallax Effect */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-purple-900/90" />
      </div>

      {/* Profile Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Header Section */}
        <div className="relative flex flex-col sm:flex-row justify-between gap-6 -mt-16 sm:-mt-24">
          {/* Avatar with Floating Effect */}
          <div className="relative flex-shrink-0 self-center sm:self-start transform hover:-translate-y-2 transition-transform duration-300">
            <div className="relative rounded-full p-1 bg-white backdrop-blur-lg border-4 border-white shadow-xl">
              <div className="relative overflow-hidden rounded-full w-36 h-36 sm:w-56 sm:h-56">
                <img
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  src={`${ENGINE_URL}${clientProfile.avatar}`}
                  alt="User avatar"
                />
              </div>
            </div>
            <div className="absolute -z-10 inset-0 rounded-full bg-purple-500/20 blur-md animate-pulse" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-end sm:self-end mb-6 sm:mb-0">
            {userRole !== "client" ? (
              <Button
                onClick={handleStartConversation}
                variant="outline"
                className="w-full sm:w-auto bg-white/90 hover:bg-white backdrop-blur-sm border-purple-300 text-purple-700 hover:text-purple-900 hover:shadow-md transition-all"
              >
                <Mail className="w-4 h-4 mr-2" />
                Message
              </Button>
            ) : (
              <>
                <button className='bg-violet-800 mt-5 py-1 px-6 rounded-lg hover:rounded-sm transition-all text-white flex flex-row items-center gap-2'>
                  <LayoutDashboard /> DASHBOARD
                </button>
              </>
            )}
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg transition-all">
              <UserRoundPlus className="w-4 h-4 mr-2" />
              Write a review
            </Button>
            {userRole === 'client' && (
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto bg-white/90 hover:bg-white backdrop-blur-sm border-gray-300 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all group"
                  >
                    <Pencil className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${fira.className} max-w-4xl pt-6 pb-8 overflow-hidden sm:rounded-2xl border-0 shadow-xl`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 -z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-50/50 to-transparent -z-10" />

                  <DialogHeader className="px-6 pt-4">
                    <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-blue-500" />
                      Edit Profile
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-gray-600 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border-gray-300 hover:border-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                          placeholder="John Doe"
                        />
                      </div>

                      {/* Username Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-gray-600 flex items-center gap-1">
                          <AtSign className="w-4 h-4" />
                          Username
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="border-gray-300 hover:border-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                          placeholder="@johndoe"
                        />
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phoneNumber" className="text-gray-600 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="border-gray-300 hover:border-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      {/* Country Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor="country" className="text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Country
                        </Label>
                        <CountrySelect
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Search and select country"
                        />
                      </div>
                    </div>

                    {/* About Field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-gray-600 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        About
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="border-gray-300 hover:border-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition min-h-[120px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Avatar Upload */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-600 flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        Profile Picture
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-full border-2 border-white shadow-sm overflow-hidden">
                          <img
                            src={formData.avatar || "/default-avatar.jpg"}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          Change Photo
                        </Button>
                        <input type="file" id="avatar-upload" className="hidden" accept="image/*" />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditModalOpen(false)}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                {clientProfile.name}
              </h1>

              {clientProfile.username && (
                <p className="text-lg text-blue-950 font-medium">@{clientProfile.username}</p>
              )}
            </div>

            {clientProfile.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{clientProfile.description}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-violet-500/20 p-6 rounded-xl shadow-sm border-2 border-gray-100 hover:shadow-md transition-shadow">
                <p className='font-bold text-3xl text-purple-600'>20</p>
                <p className="text-gray-600">Orders Completed</p>
              </div>
              <div className="bg-yellow-500/30 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <p className='font-bold text-3xl text-yellow-600'>4.9</p>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                <UserCircle className="w-6 h-6 text-purple-600 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="p-2 rounded-lg mr-4">
                    <Mail className="w-5 h-5 text-blue-950" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium">{email}</p>
                  </div>
                </div>

                {clientProfile.phoneNumber && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg mr-4">
                      <Phone className="w-5 h-5 text-blue-950" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">{clientProfile.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {clientProfile.country && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg mr-4">
                      <Globe className="w-5 h-5 text-blue-950" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800 font-medium">{clientProfile.country}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="p-2 rounded-lg mr-4">
                    <Calendar className="w-5 h-5 text-blue-950" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-800 font-medium">
                      {format(new Date(clientProfile.createdAt), 'MMMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;