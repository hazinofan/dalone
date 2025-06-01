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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateClientProfile } from "../../../core/services/clientProfile.service";
import { Inter } from "next/font/google";
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
    try {;
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
            <Button variant="outline" className="w-full sm:w-auto bg-white/90 hover:bg-white backdrop-blur-sm border-purple-300 text-purple-700 hover:text-purple-900 hover:shadow-md transition-all">
              <Mail className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg transition-all">
              <UserRoundPlus className="w-4 h-4 mr-2" />
              Write a review
            </Button>
            {userRole === 'client' && (
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto bg-white/90 hover:bg-white backdrop-blur-sm border-gray-300 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${fira.className} max-w-5xl pt-10 overflow-hidden w-[900px] h-[600px] max-h-[90vh] rounded-xl`}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                    <div className="flex flex-row items-center gap-8">
                      <Label htmlFor="name" className="text-right">
                        Name 
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-row items-center gap-8">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-row items-center gap-8">
                      <Label htmlFor="phoneNumber" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-row items-center gap-8">
                      <Label htmlFor="country" className="text-right">
                        Country
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-row items-center gap-8">
                      <Label htmlFor="description" className="text-right">
                        About
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full"
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
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