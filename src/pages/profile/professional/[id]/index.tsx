import React, { JSX, useState } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from "date-fns"
import { Badge, Calendar as CalendarIcon, Dribbble, ExternalLink, FilePlus2, FileText, Globe, ImageIcon, Instagram, LayoutDashboard, Linkedin, Loader2, MoveLeft, Pencil, Plus, PlusIcon, Share2, Star, Trash2, Twitter, Upload, UploadCloud, User, UserRoundMinus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'

import { CalendarFold, Mail, PlusCircle, UserRoundPlus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { DragDropFileUpload } from '@/component/DragDropFileUpload'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Inter } from "next/font/google";
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { DialogClose } from '@radix-ui/react-dialog'
import worksService, { CreateWorkPayload, Work } from '../../../../../core/services/work.services'
import { useRouter } from 'next/router'
import { createGig, getGigByUser } from '../../../../../core/services/gigs.services'
import GigCard from '@/component/gigs'
import { createReview, fetchReviewsForProfessional, getReviews } from '../../../../../core/services/reviews.services'
import SocialsCrud from '@/component/socialsCrud'
import { getProfile } from '../../../../../core/services/auth.service'
import { checkIfFollowing, followProfessional, getFollowersCount, unfollowProfessional } from '../../../../../core/services/followers.service'
import { createConversation, findConversationBetween } from '../../../../../core/services/conversations.service'
import Link from 'next/link'
import { HorizontalTimeline } from '@/component/Availabiility'
const fira = Inter({ subsets: ["latin"], weight: ["300", "400", "700"] });

const TABS = [
    { id: 'work', label: 'Work' },
    { id: 'services', label: 'Services' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'User Infos ' },
    { id: 'availability', label: 'Availability' },
]

interface Works {
    id: number;
    imageUrl: string[];
    title: string;
    date: string;
    category: string;
}


interface Language {
    name: string;
    level: string;
}

interface ProfessionalProfile {
    id: number;
    name: string;
    username: string;
    description: string;
    occupation: string;
    languages: Language[];
    country: string;
    city: string;
    skills: string[];
    createdAt: string;
}

const Index = () => {
    const [activeTab, setActiveTab] = useState('work');
    const [user, setUser] = useState(0);
    const [loadingData, setLoadingData] = useState(false)
    const [files, setFiles] = useState<string[]>([])
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [gigs, setGigs] = useState<any>([]);
    const [workContent, setWorkContent] = useState<any>([])
    const [workLength, setWorkLength] = useState<any>([])
    const [isClient, setIsClient] = useState(false)
    const [authUser, setAuthUser] = useState<any>(false)
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
    const [gigsCount, setGigsCount] = useState(0);
    const [lastLogin, setLastLogin] = useState("")
    const [worksCount, setWorksCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { query } = useRouter();
    const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
    const userId = Array.isArray(query.id) ? query.id[0] : query.id;
    const [formData, setFormData] = useState<any>({
        title: "",
        heroImage: "",
        about: "",
        whatsIncluded: [],
        servicePeriod: "",
        priceBeforePromo: 0,
        priceAfterPromo: null,
        availability: {},
        enableCustomOffers: false,
        customOfferPriceBeforePromo: null,
        customOfferPriceAfterPromo: null,
        customOfferDescription: "",
    });
    const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false)
    const [userAvatar, setUserAvatar] = useState("")
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedWork, setSelectedWork] = useState<any>(null);
    const { toast } = useToast()
    const [workDescription, setWorkDescription] = useState("")
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const [underlineStyle, setUnderlineStyle] = useState({
        left: 0,
        width: 0,
        opacity: 0
    });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const router = useRouter();
    const [id, setId] = useState<any>(null);


    useEffect(() => {
        if (router.isReady && typeof router.query.id === 'string') {
            setId(router.query.id);
        }
    }, [router.isReady]);

    // get the user
    useEffect(() => {
        const token = localStorage.getItem("dalone:token");
        console.log("🔑 token from localStorage:", token);
        if (!token) return;

        fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                console.log("🌐 /users/me status:", res.status, res.statusText);
                if (!res.ok) throw new Error("Not authenticated");
                return res.json();
            })
            .then((me) => {
                const role = me.role.toLowerCase()
                if (role === "client") {
                    setIsClient(true)
                }
                console.log(me.lastLogin, 'last')
                setUser(me.id);
                // if (me.lastLogin) {
                //     setLastLogin(getTimeAgo(me.lastLogin));
                // } else {
                //     setLastLogin("Just Now");
                // }
            })
            .catch((err) => {
                console.warn("Failed to load user:", err);
                localStorage.removeItem("dalone:token");
                setUser(0);
            });
    }, []);

    useEffect(() => {
        if (!id) return;
        getFollowersCount(Number(id)).then(setFollowerCount);
        if (authUser) {
            checkIfFollowing(Number(id)).then(setIsFollowing);
        }

        // Optional: check if already following
        // fetch(`/followers/is-following/${id}`) → if you implement it later
    }, [id]);

    function getTimeAgo(dateString: string): string {
        const now = new Date();
        const date = new Date(dateString);
        const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffSec < 60) {
            return "just now";
        }
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
        }
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) {
            return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
        }
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        }
        // fallback: show actual date
        return date.toLocaleDateString();
    }


    // slider animation
    useEffect(() => {
        const activeTabIndex = TABS.findIndex(tab => tab.id === activeTab);
        if (activeTabIndex >= 0 && tabsRef.current[activeTabIndex]) {
            const activeTabElement = tabsRef.current[activeTabIndex];
            if (activeTabElement) {
                setUnderlineStyle({
                    left: activeTabElement.offsetLeft,
                    width: activeTabElement.offsetWidth,
                    opacity: 1
                });
            }
        }
    }, [activeTab]);

    // Add a new Gig
    async function handleAddGig(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        try {
            const payload = {
                title: formData.title,
                heroImage: formData.heroImage,
                about: formData.about,
                whatsIncluded: formData.whatsIncluded,
                servicePeriod: formData.servicePeriod,
                priceBeforePromo: parseFloat(formData.priceBeforePromo),
                priceAfterPromo: formData.priceAfterPromo
                    ? parseFloat(formData.priceAfterPromo)
                    : null,
                availability: formData.availability,
                enableCustomOffers: formData.enableCustomOffers,
                customOfferPriceBeforePromo: formData.enableCustomOffers
                    ? parseFloat(formData.customOfferPriceBeforePromo)
                    : null,
                customOfferPriceAfterPromo: formData.enableCustomOffers
                    ? parseFloat(formData.customOfferPriceAfterPromo)
                    : null,
                customOfferDescription: formData.enableCustomOffers
                    ? formData.customOfferDescription
                    : null,
                userId: id
            };
            const newGig = await createGig(payload);
            console.log(payload, 'this is the payload')
            await getAllUserGigs()
            toast({
                title: "Gig created Successfully",
                description: "Your GIG is now visible on your public profile !",
            })

            // return

        } catch (err) {
            console.error("❌ Failed to create gig:", err);
        }
    }

    useEffect(() => {
        // Only attempt to load “/users/me” if we actually have a token
        const token = typeof window !== "undefined"
            ? localStorage.getItem("dalone:token")
            : null;

        if (!token) {
            // not logged in, so skip getProfile()
            return;
        }

        getProfile()
            .then((me) => {
                if (!me) return;
                setAuthUser(me.id);
                if (me.lastLogin) {
                    setLastLogin(getTimeAgo(me.lastLogin));
                } else {
                    setLastLogin("Just Now");
                }
            })
            .catch((err) => {
                console.error("Could not load profile:", err);
                // Optionally, remove bad token:
                localStorage.removeItem("dalone:token");
            });
    }, []);



    // get a user informations 
    useEffect(() => {
        if (!id) {
            // `id` is still null or undefined; skip the fetch entirely.
            return;
        }
        async function loadData() {
            setLoading(true);
            try {
                // 1) fetch the user + nested professionalProfile
                const userRes = await fetch(`${API_BASE_URL}/users/${id}`);
                if (!userRes.ok) throw new Error("Failed to load user");
                const userData = await userRes.json();
                console.log(userData, 'data bb')
                if (userData.lastLogin) {
                    setLastLogin(getTimeAgo(userData.lastLogin));
                }
                setProfile(userData.professionalProfile);
                setUserAvatar(userData.professionalProfile.avatar)

                // 2) fetch gigs for this professional
                const gigsRes = await fetch(`${API_BASE_URL}/gigs?professionalId=${id}`);
                if (gigsRes.ok) {
                    const gigs = await gigsRes.json();
                    setGigsCount(Array.isArray(gigs) ? gigs.length : 0);
                }

                // 3) fetch works (assuming you have an endpoint)
                const worksRes = await fetch(`${API_BASE_URL}/works?professionalId=${id}`);
                if (worksRes.ok) {
                    const works = await worksRes.json();
                    setWorksCount(Array.isArray(works) ? works.length : 0);
                    console.log(works, 'pui bb')
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);


    // get all work items for a user 
    async function getWorksByUser() {
        setLoadingData(true)
        try {
            const response = await worksService.getByUser(id)
            setWorkContent(response)
            setWorkLength(response.length)
        } catch (error) {
            console.error(error, 'error while fetching works')
        } finally {
            setLoadingData(false)
        }
    }

    // add a new work
    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const form = e.currentTarget
            const data = new FormData(form)
            // build the payload to match CreateWorkPayload
            const payload: CreateWorkPayload = {
                title: data.get('title') as string,
                description: data.get('description') as string,
                category: data.get('category') as string,
                imageUrl: files,
                userId: id,
                date: data.get('date') as string,
            }
            console.log(payload)
            // send to your API
            const created: Work = await worksService.create(payload)
            toast({
                title: "Work Added Successfully",
                description: "Your work is now visible on your public profile !",
            })
            setIsWorkDialogOpen(false)

            // update local UI state
            setWorkContent((prev: any) => [...prev, created])

            // cleanup
            form.reset()
            setFiles([])
            setWorkDescription('')
            getWorksByUser()
            setDate(undefined)
        } catch (err) {
            console.error('Failed to create work:', err)
        }
    }


    // get all gigs for a user 
    async function getAllUserGigs() {
        setLoadingData(true)
        try {
            const response = await getGigByUser(id)
            console.log(response, 'gigs')
            setGigs(response)
        } catch (error) {
            console.error(error)
        }
    }

    // get reviews
    async function fetchReviews() {
        setLoadingData(true)
        try {
            const res = await getReviews()
            console.log(res, 'response reviews')
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingData(false)
        }
    }

    useEffect(() => {
        if (id) {
            getAllUserGigs()
            getWorksByUser();
            fetchReviews()
        }
    }, [id]);

    // 2) In your component’s state:
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);

    // 3) A helper to load just this pro’s reviews:
    async function loadReviews() {
        if (!id) return;
        setLoadingReviews(true);
        try {
            // if your endpoint is public:
            const res = await fetchReviewsForProfessional(id);
            setReviews(res);
        } catch (err) {
            console.error('Error loading reviews', err);
        } finally {
            setLoadingReviews(false);
        }
    }

    // 4) Run it whenever we switch to “reviews” or the pro ID changes:
    useEffect(() => {
        if (activeTab === 'reviews') {
            loadReviews();
        }
    }, [activeTab, id]);

    // 5) Update your submit handler to re-load after posting:
    const handleSubmit = async () => {
        const professionalId = id
        const token = localStorage.getItem('dalone:token')
        if (!token || !isClient || !professionalId) return;
        setLoadingReviews(true);
        try {
            await createReview(
                { rating, comment, professionalId },
                token
            );
            setComment('');
            setRating(5);
            setShowForm(false);
            await loadReviews();    // refresh the list
        } catch (err) {
            console.error('Failed to submit review', err);
        } finally {
            setLoadingReviews(false);
        }
    };

    //delete works 
    async function handleDelete(id: number | string) {
        try {
            await worksService.remove(Number(id));
            console.log(`Work ${id} deleted`);
            await getWorksByUser()
            setIsDialogOpen(false);

            toast({
                title: "Work Deleted Successfully",
                description: "Your work item has been deleted permanently!",
            });
        } catch (error) {
            console.error("Failed to delete work:", error);

            toast({
                title: "Not authorized",
                description: "You are not authorized to delete this work item!",
            });
        }
    }

    if (loading) return <p>Loading…</p>;
    if (!profile) return <p style={{ justifySelf: 'center', height: '100vh', alignContent: 'center', fontSize: '25px' }}>User not found.</p>;

    const initial = profile.name
        ? profile.name.charAt(0).toUpperCase()
        : "";


    const handleFollowToggle = async () => {
        if (!id) return;
        const proId = Number(id);

        try {
            if (isFollowing) {
                await unfollowProfessional(proId);
                setFollowerCount((c) => c - 1);
                setIsFollowing(false);
            } else {
                await followProfessional(proId);
                setFollowerCount((c) => c + 1);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error(err);
            toast({
                variant: 'destructive',
                title: "Unauthorized !",
                description: "You should be authentificated first !",
            })
        }
    };

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


    return (
        <div className="relative">
            <Toaster />
            {/* Background image with gradient overlay */}
            <div className="relative h-80 w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://img.freepik.com/free-vector/watercolor-abstract-purple-background_23-2149120778.jpg')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-purple-900/70" />
            </div>

            {/* Profile container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                <div className="relative -mt-24 flex flex-col items-center sm:flex-row sm:items-end gap-6 justify-between">
                    <div className="flex flex-row gap-7">
                        {/* Profile picture with modern border effect */}
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 transition-all duration-200 blur-sm" />
                            <div className="relative rounded-full p-1 bg-white/30 backdrop-blur-lg border-8 border-white/50">
                                <img
                                    className="rounded-full w-52 h-52 sm:w-52 sm:h-56 object-cover"
                                    src={`${API_BASE_URL}${userAvatar}`}
                                    alt="Adriana Lima"
                                />
                            </div>
                        </div>

                        {/* Profile info */}
                        <div className="text-center sm:text-left mb-8 mt-28">
                            <div className="flex flex-row items-center gap-2">
                                <h1 className="text-3xl font-bold text-black">{profile.name}</h1>
                                <img
                                    width={20}
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/768px-Twitter_Verified_Badge.svg.png"
                                    alt="Verified"
                                    className="mb-1"
                                />
                            </div>
                            <p className="font-semibold mt-2">{profile.occupation}</p>
                            <div className="flex justify-center sm:justify-start">
                                <span className=" bg-white/20 backdrop-blur-sm rounded-full text-sm ">{profile.city},</span>
                                <span className="px-3 bg-white/20 backdrop-blur-sm rounded-full text-sm">{profile.country}</span>
                            </div>
                            {Number(userId) === Number(authUser) ? (
                                // If viewing your own profile → show dashboard
                                <button className='bg-violet-800 mt-5 py-1 px-6 rounded-lg hover:rounded-sm transition-all text-white flex flex-row items-center gap-2'>
                                    <LayoutDashboard /> DASHBOARD
                                </button>
                            ) : (
                                // If viewing someone else's profile → show follow + contact
                                <div className="mt-4 flex flex-row gap-3">
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`py-1 px-6 rounded-tr-xl rounded-bl-xl hover:rounded-sm transition-all flex flex-row items-center gap-2
                                            ${isFollowing ? 'bg-gray-600 text-white hover:bg-red-700' : 'bg-blue-950 text-white hover:bg-blue-900'}
                                        `}
                                    >
                                        {isFollowing ? <UserRoundMinus /> : <UserRoundPlus />}
                                        {isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
                                    </button>
                                    <button onClick={handleStartConversation} className='bg-blue-950 py-1 px-6 rounded-tr-xl rounded-bl-xl hover:rounded-sm transition-all text-white flex flex-row items-center gap-2'>
                                        <Mail /> GET IN TOUCH
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className=" flex flex-col items-center gap-5 " style={{ marginRight: '75px', alignSelf: 'center', marginTop: '100px' }}>
                        {/* Followers */}
                        <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg p-px bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 shadow-lg">
                            <div className="relative flex items-center justify-center gap-2 w-full py-3 px-6 rounded-[calc(0.5rem-1px)] bg-gray-900 backdrop-blur-sm">
                                <svg className="h-5 w-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                                </svg>
                                <span className="text-sm font-medium text-white">
                                    DALONE member since September 2021
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-row gap-10">
                            <div className="mt-4 sm:mt-0 sm:ml-auto text-center text-2xl">
                                <p className="text-2xl text-gray-500">Followers</p>
                                <p className="text-3xl font-bold">{followerCount}</p>
                            </div>
                            {/* Projects */}
                            <div className="mt-4 sm:mt-0 sm:ml-auto text-center">
                                <p className="text-2xl text-gray-500">Portfolio PRO</p>
                                <p className="text-3xl font-bold">{workLength}</p>
                            </div>
                            {/* Orders */}
                            <div className="mt-4 sm:mt-0 sm:ml-auto text-center">
                                <p className="text-2xl text-gray-500">Orders</p>
                                <p className="text-3xl font-bold">122</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs with animated underline */}
                <div className="border-b border-gray-200 relative">
                    <nav className="-mb-px flex space-x-8">
                        {TABS.map((tab, index) => {
                            const isActive = tab.id === activeTab;
                            return (
                                <button
                                    key={tab.id}
                                    ref={el => {
                                        tabsRef.current[index] = el;
                                    }}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-4 px-1 text-md font-medium relative z-10 ${isActive ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Animated underline */}
                    <div
                        className="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-in-out"
                        style={{
                            left: underlineStyle.left,
                            width: underlineStyle.width,
                            opacity: underlineStyle.opacity
                        }}
                    />
                </div>

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'work' && (
                        <>
                            <div className="" style={{ width: '100%' }}>
                                <div className="mt-8 ">
                                    {/* Add New Card */}
                                    <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
                                        {Number(userId) === Number(authUser) && (
                                            <DialogTrigger asChild>
                                                <div
                                                    className="border-2 border-dashed border-gray-300 rounded-3xl p-6 hover:border-gray-400 transition-colors cursor-pointer"
                                                    onClick={() => setIsWorkDialogOpen(true)}
                                                >
                                                    <div className="h-[250px] bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                                        <div className="text-center">
                                                            <PlusCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                            <p className="text-gray-500 font-medium">Add New Content</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-lg font-medium text-gray-700">New Project</p>
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <CalendarFold className="w-4 h-4" />
                                                            <span className="text-sm">{new Date().toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                        )}

                                        <DialogContent className={`${fira.className} max-w-7xl max-h-[95vh] overflow-y-auto rounded-lg`}>
                                            <DialogHeader>
                                                <DialogTitle>Add New Project</DialogTitle>
                                                <DialogDescription>
                                                    Fill in the details below to add a new portfolio item.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAdd} className="grid gap-4 py-4">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <Label htmlFor="title">Title</Label>
                                                    <Input id="title" name="title" required />
                                                </div>

                                                <p className=' font-semibold'> Images : ( Project Related ) </p>
                                                <DragDropFileUpload
                                                    accept="image/*,application/pdf"
                                                    multiple
                                                    // onFilesSelected={(f: any) => setFiles(f)}
                                                    onUploadSuccess={(responses) => {
                                                        // responses is an array
                                                        const urls = Array.isArray(responses)
                                                            ? responses.map(r => r.url)
                                                            : [responses.url];
                                                        setFiles(prev => [...prev, ...urls]);
                                                    }}
                                                    onUploadError={(err) => {
                                                        alert(`Upload failed: ${err.message}`)
                                                    }}

                                                    className="max-w-md mx-auto"
                                                    folder='works'
                                                />
                                                <div className="space-y-2">
                                                    <Label htmlFor="about">Work description :</Label>
                                                    <Textarea
                                                        id="about"
                                                        name="description"
                                                        rows={4}
                                                        placeholder="List key features…"
                                                        required
                                                        value={workDescription}
                                                        onChange={(e) => setWorkDescription(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex flex-col sm:grid-cols-2 gap-4">
                                                    <div className="grid grid-cols-1 gap-2 mr-3">
                                                        <Label htmlFor="date">Date</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "justify-start text-left font-normal",
                                                                        !date && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <CalendarIcon />
                                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={date}
                                                                    onSelect={setDate}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <input
                                                            type="hidden"
                                                            name="date"
                                                            value={date ? format(date, 'yyyy-MM-dd') : ''}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <Label htmlFor="category">Category</Label>
                                                        <Select name="category" defaultValue="Modeling">
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Modeling">Modeling</SelectItem>
                                                                <SelectItem value="Photography">Photography</SelectItem>
                                                                <SelectItem value="Design">Design</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <DialogFooter>
                                                    <Button type="submit">Save Project</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Work Details Dialog */}
                                    <Dialog
                                        open={isDialogOpen}
                                        onOpenChange={(open) => {
                                            if (!open) {
                                                setSelectedWork(null);
                                            }
                                            setIsDialogOpen(open);
                                        }}
                                    >
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {loadingData ? (
                                                <div className="col-span-3 flex justify-center">
                                                    <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                                                </div>
                                            ) : (
                                                workContent?.map((work: any) => (
                                                    <DialogTrigger asChild key={work.id}>
                                                        <div
                                                            className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                                            onClick={() => {
                                                                setSelectedWork(work);
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            <div className="relative overflow-hidden rounded-3xl shadow-xl h-[350px]">
                                                                <img
                                                                    src={`${API_BASE_URL}/public/${work.imageUrl[0]}`}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    alt={work.title}
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                                    <div className="text-white">
                                                                        <h3 className="text-xl font-bold">{work.title}</h3>
                                                                        <p className="text-sm line-clamp-2">{work.description}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-row mb-2 justify-between items-center mt-2">
                                                                <p className="text-lg font-medium">{work.title}</p>
                                                                <div className="flex flex-row gap-1 items-center border border-gray-300 rounded-full py-1 px-5">
                                                                    <CalendarFold className="w-4 h-4" />
                                                                    <p>{work.date ? format(new Date(work.date), 'dd/MM/yyyy') : 'No date'}</p>
                                                                </div>
                                                            </div>
                                                            <p>
                                                                Category:{' '}
                                                                <span className="text-sm text-gray-500">{work.category || 'Uncategorized'}</span>
                                                            </p>
                                                        </div>
                                                    </DialogTrigger>
                                                ))
                                            )}
                                        </div>

                                        <DialogContent className={`${fira.className} max-w-7xl max-h-[95vh] overflow-y-auto rounded-lg`}>
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">
                                                    {selectedWork ? selectedWork.title : 'Details'}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {selectedWork
                                                        ? 'Here are the project details:'
                                                        : 'Select a project to view details.'}
                                                </DialogDescription>
                                            </DialogHeader>

                                            {selectedWork ? (
                                                <div className="grid gap-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div className="rounded-xl overflow-hidden">
                                                                <img
                                                                    src={`${API_BASE_URL}/public/${selectedWork.imageUrl[0]}`}
                                                                    className="w-full h-auto max-h-[400px] object-cover rounded-xl"
                                                                    alt={selectedWork.title}
                                                                />
                                                            </div>
                                                            {selectedWork.imageUrl.length > 1 && (
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {selectedWork.imageUrl.slice(1).map((img: any, index: any) => (
                                                                        <img
                                                                            key={index}
                                                                            src={`${API_BASE_URL}/public/${img}`}
                                                                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                                            alt={`${selectedWork.title} - ${index + 1}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2">Project Details</h3>
                                                                <p className="text-gray-700 whitespace-pre-line">
                                                                    {selectedWork.description}
                                                                </p>
                                                            </div>

                                                            {Number(userId) === Number(authUser) && (
                                                                <div className="flex gap-2 pt-4">
                                                                    {/* <Button variant="outline" size="sm">
                                                                        <Pencil className="w-4 h-4 mr-2" />
                                                                        Edit
                                                                    </Button> */}
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            {Number(userId) === Number(authUser) && (
                                                                                <Button variant="destructive" size="sm">
                                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                                    Delete
                                                                                </Button>
                                                                            )}
                                                                        </PopoverTrigger>
                                                                        <PopoverContent
                                                                            className={`${fira.className} w-80 p-4 rounded-xl shadow-lg border border-gray-200`}
                                                                            align="end"
                                                                            sideOffset={8}
                                                                        >
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-2">
                                                                                    <h3 className="font-semibold text-gray-900">Delete Gig</h3>
                                                                                    <p className="text-sm text-gray-600">
                                                                                        Are you sure you want to delete this gig? This action cannot be undone.
                                                                                    </p>
                                                                                </div>

                                                                                <div className="flex justify-end space-x-3">
                                                                                    <button
                                                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                                                        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button
                                                                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                                                                        onClick={() => {
                                                                                            handleDelete(selectedWork.id);
                                                                                            // close the popover
                                                                                            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                                                                                        }}
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center text-gray-500">
                                                    Select a project card to see its details.
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'services' && (
                        <>
                            <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
                                {Number(userId) === Number(authUser) && (
                                    <DialogTrigger asChild>
                                        <div className="mb-3 mx-auto mt-8">
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                                onClick={() => {/* Add your click handler here */ }}
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                                                        <PlusIcon color='gray' />
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-gray-700">Add New Gig</h3>
                                                    <p className="text-gray-500 text-sm">Click here to create and list your service</p>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                )}

                                <DialogContent className={`${fira.className} max-w-7xl max-h-[95vh] overflow-y-auto rounded-lg`} >
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl flex items-center gap-3">
                                            <FilePlus2 /> Create a new GIG
                                        </DialogTitle>
                                        <DialogDescription>
                                            Fill in the details below so clients can book your service.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleAddGig} className="">
                                        {/* ─── Left Column ─── */}
                                        {step === 1 && (
                                            <div className="space-y-6 w-full">
                                                <div className=' flex flex-col gap-3'>
                                                    <Label className='text-lg text-blue-950'>Hero Image</Label>
                                                    <DragDropFileUpload
                                                        accept="image/*"
                                                        multiple={false}
                                                        folder="gigs"
                                                        onUploadSuccess={(uploaded) => {
                                                            const urls = Array.isArray(uploaded) ? uploaded.map(f => f.url) : [uploaded.url];
                                                            setFormData((prev: any) => ({ ...prev, heroImage: urls[0] }));
                                                        }}
                                                    />
                                                </div>

                                                <div className=' flex flex-col gap-3 text-xl'>
                                                    <Label className=' text-lg text-blue-950'>Title</Label>
                                                    <Input placeholder='give your service ( gig ) a title ' value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                                </div>

                                                <div className=' flex flex-col gap-3 text-xl'>
                                                    <Label className=' text-lg text-blue-950'>About the Gig</Label>
                                                    <Textarea
                                                        cols={50}
                                                        rows={5}
                                                        required
                                                        value={formData.about}
                                                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                                    />
                                                </div>

                                                <div className=' flex flex-col gap-3'>
                                                    <Label className='text-lg text-blue-950'>What’s Included</Label>
                                                    <Textarea
                                                        cols={50}
                                                        rows={5}
                                                        placeholder="One per line"
                                                        value={formData.whatsIncluded.join("\n")}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, whatsIncluded: e.target.value.split("\n") })
                                                        }
                                                    />
                                                </div>

                                                <div className=' flex flex-col gap-3'>
                                                    <Label className='text-lg text-blue-950'>Service Period</Label>
                                                    <Input
                                                        placeholder="e.g. 3 Days"
                                                        value={formData.servicePeriod}
                                                        onChange={(e) => setFormData({ ...formData, servicePeriod: e.target.value })}
                                                    />
                                                </div>

                                                <Button className=' rounded-none  rounded-tr-xl rounded-bl-xl px-10 bg-blue-950 hover:bg-blue-950 hover:rounded-lg transition-all float-end' onClick={() => setStep(2)}>Next</Button>
                                            </div>
                                        )}

                                        {/* ─── Right Column ─── */}
                                        {step === 2 && (
                                            <div className="space-y-8 px-2 sm:px-4 md:px-6">
                                                <button className='flex flex-row gap-2 items-center hover:underline transition-all' onClick={() => setStep(1)}> <MoveLeft /> Retour </button>

                                                {/* ─── Pricing Section ─── */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-base font-medium text-blue-950">Base Price</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="e.g. 150"
                                                            value={formData.priceBeforePromo}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, priceBeforePromo: parseFloat(e.target.value) })
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-base font-medium text-blue-950">Price After Promo</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="e.g. 120"
                                                            value={formData.priceAfterPromo || ""}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, priceAfterPromo: parseFloat(e.target.value) })
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {/* ─── Availability Section ─── */}
                                                <div className="space-y-3">
                                                    <Label className="text-base font-medium text-blue-950">Availability</Label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {["monday", "tuesday", "wednesday", "thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                                            <div key={day} className="space-y-1">
                                                                <span className="capitalize font-semibold">{day}</span>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        type="time"
                                                                        className="w-1/2"
                                                                        onChange={(e) =>
                                                                            setFormData((prev: any) => ({
                                                                                ...prev,
                                                                                availability: {
                                                                                    ...prev.availability,
                                                                                    [day]: {
                                                                                        ...(prev.availability[day] || {}),
                                                                                        from: e.target.value,
                                                                                    },
                                                                                },
                                                                            }))
                                                                        }
                                                                    />
                                                                    <Input
                                                                        type="time"
                                                                        className="w-1/2"
                                                                        onChange={(e) =>
                                                                            setFormData((prev: any) => ({
                                                                                ...prev,
                                                                                availability: {
                                                                                    ...prev.availability,
                                                                                    [day]: {
                                                                                        ...(prev.availability[day] || {}),
                                                                                        to: e.target.value,
                                                                                    },
                                                                                },
                                                                            }))
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* ─── Custom Offers Toggle ─── */}
                                                <div className="flex items-center space-x-3 pt-4">
                                                    <Switch
                                                        checked={formData.enableCustomOffers}
                                                        onCheckedChange={(checked) =>
                                                            setFormData({ ...formData, enableCustomOffers: checked })
                                                        }
                                                    />
                                                    <Label className="text-sm font-medium text-blue-950">
                                                        Enable Custom Offers
                                                    </Label>
                                                </div>

                                                {/* ─── Custom Offer Details ─── */}
                                                {formData.enableCustomOffers && (
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="flex flex-col gap-2">
                                                                <Label className="text-base font-medium">Custom Price Before Promo</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g. 200"
                                                                    value={formData.customOfferPriceBeforePromo || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            customOfferPriceBeforePromo: parseFloat(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label className="text-base font-medium">Custom Price After Promo</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g. 170"
                                                                    value={formData.customOfferPriceAfterPromo || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            customOfferPriceAfterPromo: parseFloat(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-base font-medium">Custom Offer Description</Label>
                                                            <Textarea
                                                                placeholder="Describe the custom offer"
                                                                rows={4}
                                                                value={formData.customOfferDescription}
                                                                onChange={(e) =>
                                                                    setFormData({ ...formData, customOfferDescription: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ─── Submit Button ─── */}
                                                <div className="pt-4">
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button
                                                                type="submit"
                                                                className="w-full rounded-none rounded-tr-xl rounded-bl-xl bg-blue-950 hover:bg-blue-900 transition-all"
                                                            >
                                                                Submit
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </div>
                                            </div>
                                        )}

                                    </form>
                                </DialogContent>
                            </Dialog>
                            {gigs.map((gig: any) => (
                                <GigCard key={gig.id} gig={gig} />
                            ))}
                        </>
                    )}
                    {activeTab === 'reviews' && (
                        <>
                            {/* only clients can see & post */}
                            {isClient && (
                                <>
                                    {showForm && (
                                        <div className="grid w-full gap-1.5 mb-5">
                                            <Label htmlFor="comment">Your Review</Label>
                                            <Textarea
                                                id="comment"
                                                placeholder="Type your review here…"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />

                                            <div className="mb-4">
                                                <Label>Rating</Label>
                                                <div className="flex items-center space-x-1">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <Star
                                                            key={n}
                                                            size={24}
                                                            // if rating ≥ n, show it “filled” (yellow); otherwise muted gray
                                                            className={`cursor-pointer transition-colors ${rating >= n ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
                                                                }`}
                                                            onClick={() => setRating(n)}
                                                            aria-label={`${n} star${n > 1 ? 's' : ''}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                This will be posted on the professional’s public profile.
                                            </p>

                                            <Button
                                                onClick={handleSubmit}
                                                disabled={loading || !comment.trim()}
                                                className="w-52 py-3 bg-blue-950 hover:bg-[#131e45] flex items-center gap-3"
                                            >
                                                {loading ? 'Submitting…' : 'Submit Review'}
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => setShowForm(v => !v)}
                                        className={`w-52 py-3 flex items-center gap-3 mb-6 transition-colors ${showForm
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-blue-950 hover:bg-[#131e45] text-white"
                                            }`}
                                    >
                                        {showForm ? <X size={16} /> : <Star size={16} />}
                                        {showForm ? "Cancel" : "Add a review"}
                                    </Button>
                                </>
                            )}

                            {/* reviews list */}
                            <div className="space-y-4">
                                {reviews.map((r) => (
                                    <div key={r.id} className="p-4 border rounded">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="text-yellow-500" size={16} /> {r.rating}
                                        </div>
                                        <p className="mb-2">{r.comment}</p>
                                        <small className="text-gray-500">
                                            by {r.client.email} on{' '}
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <p className="text-gray-500">No reviews yet.</p>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === 'about' && (
                        <>
                            {/* <div
                                className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                onClick={() => setIsAboutDialogOpen(true)}
                            >
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-800">Add About Section</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Tell clients about your professional background, skills, and experience
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Now
                                    </Button>
                                </div>
                            </div> */}

                            <div className=" overflow-hidden ">
                                {/* Header */}
                                <div className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {/* Profile image placeholder - replace with actual image */}
                                            <div className="h-16 w-16 rounded-full bg-blue-950 text-white flex items-center justify-center text-xl">
                                                {initial}
                                            </div>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-semibold">{profile.username}</h1>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="p-6 space-y-6">
                                    {/* Information Section */}
                                    <div className="space-y-3">
                                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Information</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="font-medium">{profile.country}, {profile.city}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Member since</p>
                                                <p className="font-medium">{profile.createdAt}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Last active</p>
                                                <p className="font-medium text-green-700"> <span className="inline-block w-3 h-3 bg-green-700 rounded-full mr-1" />{lastLogin}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags Section */}
                                    <div className="space-y-3">
                                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2"> About the User </h2>
                                        {/* <div className="flex flex-wrap gap-2">
                                            {['brave', 'simple', 'sensitive', 'industrious', 'good', 'sincere'].map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div> */}
                                        <div className="flex flex-col justify-between">
                                            <div className="">
                                                <h1 className='pb-3 font-semibold text-xl'> Description :</h1>
                                                <p> {profile.description} </p>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-5">
                                                <label className=' pb-3 font-semibold text-xl'> Languages : </label>
                                                <div className="flex flex-wrap gap-2 mb-5">
                                                    {profile.languages.map((lan) => (
                                                        <span
                                                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                                        >
                                                            {lan.name} - {lan.level}
                                                        </span>
                                                    ))}
                                                </div>
                                                <label className='pb-3 font-semibold text-xl'> Skills : </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((sk) => (
                                                        <span
                                                            className="px-3 py-1 bg-blue-950/90 text-white rounded-full text-sm font-medium"
                                                        >
                                                            {sk}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Section */}
                                    <div className="space-y-3">
                                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-8">Contact</h2>
                                        Contact this professional by sending a direct message : <Link href={`/messages/${id}`} className='text-blue-700 underline hover:text-blue-950 transition-colors cursor-pointer'> Contact Now </Link>
                                    </div>
                                </div>
                            </div>

                            <Dialog open={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen}>
                                <DialogContent className="max-w-2xl rounded-lg">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">Create About Section</DialogTitle>
                                        <DialogDescription>
                                            Add details that showcase your professional identity
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        {/* Professional Headline */}
                                        <div className="space-y-2">
                                            <Label>Professional Headline</Label>
                                            <Input
                                                placeholder="e.g. Senior UI/UX Designer & Brand Strategist"
                                            />
                                        </div>

                                        {/* Profile Photo */}
                                        <div className="space-y-2">
                                            <Label>Profile Photo</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    <User className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Photo
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Bio/Description */}
                                        <div className="space-y-2">
                                            <Label>Professional Bio</Label>
                                            <Textarea
                                                placeholder="Describe your professional journey, expertise, and approach..."
                                                rows={5}
                                                className="min-h-[120px]"
                                            />
                                        </div>

                                        {/* Skills */}
                                        <div className="space-y-2">
                                            <Label>Key Skills</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['UI Design', 'Branding', 'User Research'].map(skill => (
                                                    <Badge key={skill} className="px-3 py-1">
                                                        {skill}
                                                        <X className="w-3 h-3 ml-2 cursor-pointer" />
                                                    </Badge>
                                                ))}
                                                <Input
                                                    placeholder="Add skill..."
                                                    className="w-28"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            // Add skill logic here
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Experience */}
                                        <div className="space-y-4">
                                            <Label>Professional Experience</Label>
                                            <div className="space-y-3">
                                                <div className="border rounded-lg p-4">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h4 className="font-medium">Senior Designer</h4>
                                                            <p className="text-sm text-gray-500">DALONE Studios</p>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            2020 - Present
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="mt-2 text-red-500">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>

                                                <Button variant="outline" size="sm">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Experience
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit">Save About Section</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                    {activeTab === 'availability' && id && (
                        <HorizontalTimeline />
                    )}
                </div>
            </div>
        </div >
    );
};

export default Index;