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
import { Badge, Calendar as CalendarIcon, Dribbble, ExternalLink, FilePlus2, FileText, Globe, ImageIcon, Instagram, Linkedin, Loader2, Pencil, Plus, Share2, Star, Trash2, Twitter, Upload, UploadCloud, User, X } from "lucide-react"
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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Fira_Sans } from "next/font/google";
import { DateRange } from 'react-day-picker'
import worksService, { CreateWorkPayload, Work } from '../../../../core/services/work.services'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { DialogClose } from '@radix-ui/react-dialog'
const fira = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "700"] });

const TABS = [
    { id: 'work', label: 'Work' },
    { id: 'services', label: 'Services' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About ' },
    { id: 'socials', label: 'Socials' },
]

const SOCIAL_PLATFORMS = [
    {
        value: 'website',
        label: 'Personal Website',
        icon: <Globe className="w-5 h-5 text-white" />,
        placeholder: 'https://yourportfolio.com'
    },
    {
        value: 'twitter',
        label: 'Twitter/X',
        icon: <Twitter className="w-5 h-5 text-white" />,
        prefix: 'twitter.com/',
        placeholder: 'username'
    },
    {
        value: 'linkedin',
        label: 'LinkedIn',
        icon: <Linkedin className="w-5 h-5 text-white" />,
        prefix: 'linkedin.com/in/',
        placeholder: 'profile-name'
    },
    {
        value: 'instagram',
        label: 'Instagram',
        icon: <Instagram className="w-5 h-5 text-white" />,
        prefix: 'instagram.com/',
        placeholder: 'username'
    },
    {
        value: 'dribbble',
        label: 'Dribbble',
        icon: <Dribbble className="w-5 h-5 text-white" />,
        prefix: 'dribbble.com/',
        placeholder: 'username'
    },
    {
        value: 'behance',
        label: 'Behance',
        icon: <ImageIcon className="w-5 h-5 text-white" />,
        prefix: 'behance.net/',
        placeholder: 'username'
    }
];

const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
        website: 'bg-gray-600',
        twitter: 'bg-black',
        linkedin: 'bg-blue-700',
        instagram: 'bg-pink-600',
        dribbble: 'bg-pink-500',
        behance: 'bg-blue-500'
    };
    return colors[platform] || 'bg-gray-500';
};

const getPlatformIcon = (platform: string) => {
    const icons: Record<string, JSX.Element> = {
        website: <Globe className="w-5 h-5 text-white" />,
        twitter: <Twitter className="w-5 h-5 text-white" />,
        linkedin: <Linkedin className="w-5 h-5 text-white" />,
        instagram: <Instagram className="w-5 h-5 text-white" />,
        dribbble: <Dribbble className="w-5 h-5 text-white" />,
        behance: <ImageIcon className="w-5 h-5 text-white" />
    };
    return icons[platform] || <Globe className="w-5 h-5 text-white" />;
};


type Project = {
    imageUrl: string[]
    title: string
    date: string
    category: string
    description?: string
}

const Index = () => {
    const [activeTab, setActiveTab] = useState('work');
    const [user, setUser] = useState(0);
    const [loadingData, setLoadingData] = useState(false)
    const [files, setFiles] = useState<string[]>([])
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [workContent, setWorkContent] = useState([])
    const [reviewPost, setReviewPost] = useState(false)
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
    const [variablePricing, setVariablePricing] = useState(false)
    const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false)
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const [isSocialsDialogOpen, setIsSocialsDialogOpen] = useState(false);
    const { toast } = useToast()
    const [workDescription, setWorkDescription] = useState("")
    const [socialLinks, setSocialLinks] = useState<Array<{
        platform: string;
        username?: string;
        url: string;
    }>>([]);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const [hasSocials, setHasSocials] = useState(false);
    const [underlineStyle, setUnderlineStyle] = useState({
        left: 0,
        width: 0,
        opacity: 0
    });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("dalone:token");
        if (!token) return;

        fetch("http://localhost:3001/users/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Not authenticated");
                return res.json();
            })
            .then((me) => {
                console.log("User info:", me.id);
                setUser(me.id);
            })
            .catch((err) => {
                console.warn("Failed to load user:", err);
                localStorage.removeItem("dalone:token");
                setUser(0);
            });
    }, []);

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
                userId: user,
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
            setProjects((prev) => [...prev, created])

            // cleanup
            form.reset()
            setFiles([])
            setWorkDescription('')
            setDate(undefined)
        } catch (err) {
            console.error('Failed to create work:', err)
        }
    }

    async function getWorksByUser() {
        setLoadingData(true)
        try {
            const response = await worksService.getByUser(user)
            console.log(response, 'works')
            setWorkContent(response)
        } catch (error) {
            console.error(error, 'error while fetching works')
        } finally {
            setLoadingData(false)
        }
    }

    useEffect(() => {
        if (user > 0) {
            getWorksByUser()
        }
    }, [user])


    const handleSocialLinkChange = (platform: string, value: string, prefix = '') => {
        const newLinks = [...socialLinks];
        const existingIndex = newLinks.findIndex(l => l.platform === platform);

        if (existingIndex >= 0) {
            if (value === '') {
                newLinks.splice(existingIndex, 1);
            } else {
                newLinks[existingIndex] = {
                    platform,
                    username: platform === 'website' ? undefined : value,
                    url: platform === 'website' ? value : `https://${prefix}${value}`
                };
            }
        } else if (value !== '') {
            newLinks.push({
                platform,
                username: platform === 'website' ? undefined : value,
                url: platform === 'website' ? value : `https://${prefix}${value}`
            });
        }

        setSocialLinks(newLinks);
    };

    const handleSaveSocials = () => {
        setHasSocials(socialLinks.length > 0);
        setIsSocialsDialogOpen(false);
    };

    const [projects, setProjects] = useState<Project[]>([
        {
            img: 'https://usercontent.one/wp/.../richard_roelofse_fashion_designer.jpg',
            title: 'Runners Roma',
            date: '25/05/2022',
            category: 'Modeling',
        },
        {
            img: 'https://wwd.com/.../Adriana-Lima-HED.jpg?w=1024',
            title: 'Met Gala Prematch',
            date: '05/12/2024',
            category: 'Modeling',
        },
    ])


    const cardsData = [
        {
            img: 'https://usercontent.one/wp/www.freelancefashiondesign.com/wp-content/uploads/2024/04/richard_roelofse_fashion_designer_01-1024x726.jpg',
            title: 'Runners Roma',
            date: '25/05/2022',
            category: 'Modeling',
        },
        {
            img: 'https://hips.hearstapps.com/hmg-prod/images/executive-producer-adriana-lima-attends-the-thicket-world-news-photo-1729009084.jpg?crop=1xw:0.84394xh;center,top&resize=1200:*',
            title: 'Film Moderns',
            date: '20/11/2023',
            category: 'Modeling',
        },
        {
            img: 'https://wwd.com/wp-content/uploads/2024/06/Adriana-Lima-HED.jpg?w=1024',
            title: 'Met Gala Prematch',
            date: '05/12/2024',
            category: 'Modeling',
        },
        // A “new” card
        { isNew: true },
    ]


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
                                    src="https://wl-sympa.cf.tsp.li/resize/728x/jpg/ed3/1b6/5e4b6f5476bfff189036e15c2b.jpg"
                                    alt="Adriana Lima"
                                />
                            </div>
                        </div>

                        {/* Profile info */}
                        <div className="text-center sm:text-left mb-8 mt-28">
                            <div className="flex flex-row items-center gap-2">
                                <h1 className="text-3xl font-bold text-black">Adriana Lima</h1>
                                <img
                                    width={20}
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/768px-Twitter_Verified_Badge.svg.png"
                                    alt="Verified"
                                    className="mb-1"
                                />
                            </div>
                            <p className="font-semibold mt-2">Model & Actress</p>
                            <div className="flex justify-center sm:justify-start">
                                <span className=" bg-white/20 backdrop-blur-sm rounded-full text-sm ">New York,</span>
                                <span className="px-3 bg-white/20 backdrop-blur-sm rounded-full text-sm">Photography</span>
                            </div>
                            <div className="mt-4 flex flex-row gap-3">
                                <button className=' bg-blue-950 py-1 px-6 rounded-tr-xl rounded-bl-xl hover:rounded-sm transition-all text-white flex flex-row items-center gap-2'> <UserRoundPlus /> FOLLOW </button>
                                <button className=' bg-blue-950 py-1 px-6 rounded-tr-xl rounded-bl-xl hover:rounded-sm transition-all text-white flex flex-row items-center gap-2'> <Mail /> GET IN TOUCH </button>
                            </div>
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
                                <p className="text-3xl font-bold">2,985</p>
                            </div>
                            {/* Projects */}
                            <div className="mt-4 sm:mt-0 sm:ml-auto text-center">
                                <p className="text-2xl text-gray-500">Portfolio PRO</p>
                                <p className="text-3xl font-bold">10</p>
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
                            <div className="flex flex-row gap-10 w-full" style={{ width: '100%'}}>
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {/* Add New Card (kept the same) */}
                                    <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
                                        <DialogTrigger asChild>
                                            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 hover:border-gray-400 transition-colors cursor-pointer" onClick={() => setIsWorkDialogOpen(true)}>
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

                                        <DialogContent className={`${fira.className} max-w-7xl`}>
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

                                    {loadingData ? (
                                        <div className="col-span-3 flex justify-center">
                                            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                                        </div>
                                    ) : (
                                        workContent?.map((work:any) => (
                                            <div key={work.id} className="max-w-full">
                                                <img
                                                    src={`${API_BASE_URL}/public/${work.imageUrl[0]}`} // Add a fallback image
                                                    className="rounded-3xl shadow-xl h-[350px] w-full object-cover"
                                                    alt={work.title}
                                                />
                                                <div className="flex flex-row mb-2 justify-between items-center mt-2">
                                                    <p className="text-lg">{work.title}</p>
                                                    <div className="flex flex-row gap-1 items-center border border-gray-300 rounded-full py-1 px-5">
                                                        <CalendarFold width={18} />
                                                        <p>{work.date ? format(new Date(work.date), 'dd/MM/yyyy') : 'No date'}</p>
                                                    </div>
                                                </div>
                                                <p>
                                                    Category:{' '}
                                                    <span className="text-sm text-gray-500">{work.category || 'Uncategorized'}</span>
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'services' && (
                        <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
                            <DialogTrigger asChild>
                                <div className="max-w-md mx-auto mt-8">
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        onClick={() => {/* Add your click handler here */ }}
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-gray-500"
                                                >
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-700">Add New Gig</h3>
                                            <p className="text-gray-500 text-sm">Click here to create and list your service</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>

                            <DialogContent className="max-w-7xl rounded-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl flex items-center gap-3">
                                        <FilePlus2 /> Create a new GIG
                                    </DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below so clients can book your service.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleAdd} className="flex space-x-8 mt-4">
                                    {/* ─── Left Column ─── */}
                                    <div className="w-1/2 space-y-6">
                                        {/* Hero Image */}
                                        <div className="space-y-2">
                                            <Label htmlFor="heroImage">Hero Image</Label>
                                            <DragDropFileUpload
                                                accept="image/*,application/pdf"
                                                multiple
                                                onFilesSelected={(f: any) => setFiles(f)}
                                                className="max-w-md mx-auto"
                                                folder='gigs'
                                            />
                                        </div>

                                        {/* About the Gig */}
                                        <div className="space-y-2">
                                            <Label htmlFor="about">About the Gig</Label>
                                            <Textarea
                                                id="about"
                                                name="about"
                                                rows={4}
                                                placeholder="List key features or a short description…"
                                                required
                                            />
                                        </div>

                                        {/* What’s Included */}
                                        <div className="space-y-2">
                                            <Label htmlFor="included">What’s Included</Label>
                                            <Textarea
                                                id="included"
                                                name="included"
                                                rows={3}
                                                placeholder="One item per line…"
                                                required
                                            />
                                        </div>

                                        {/* Service Period */}
                                        <div className="space-y-2">
                                            <Label>Service Period</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'justify-start text-left font-normal w-full',
                                                            !dateRange.from && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateRange.from
                                                            ? dateRange.to
                                                                ? `${format(
                                                                    dateRange.from,
                                                                    'LLL dd, y'
                                                                )} – ${format(dateRange.to, 'LLL dd, y')}`
                                                                : format(dateRange.from, 'LLL dd, y')
                                                            : <span>Select date range</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={dateRange.from}
                                                        selected={dateRange}
                                                        onSelect={setDateRange}
                                                        numberOfMonths={2}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* ─── Right Column ─── */}
                                    <div className="w-1/2 space-y-6">
                                        {/* Service Tier & Price */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="serviceTier">Service Tier</Label>
                                                <Select name="serviceTier" defaultValue="">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select service tier" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="basic">Basic</SelectItem>
                                                        <SelectItem value="premium">Premium</SelectItem>
                                                        <SelectItem value="deluxe">Deluxe</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="price">Base Price</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                                        $
                                                    </span>
                                                    <Input
                                                        id="price"
                                                        name="price"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="pl-8"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Availability */}
                                        <div className="space-y-2">
                                            <Label>Availability</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                    <div key={day} className="flex items-center space-x-1">
                                                        <Checkbox id={`day-${day}`} name="availabilityDays" value={day} />
                                                        <label htmlFor={`day-${day}`} className="text-sm">
                                                            {day}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="space-y-1">
                                                    <Label htmlFor="timeFrom">From</Label>
                                                    <Input id="timeFrom" name="timeFrom" type="time" required />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="timeTo">To</Label>
                                                    <Input id="timeTo" name="timeTo" type="time" required />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tiered Pricing */}
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="tieredPricing"
                                                checked={variablePricing}
                                                onCheckedChange={setVariablePricing}
                                            />
                                            <Label htmlFor="tieredPricing" className="text-sm">
                                                Enable tiered pricing
                                            </Label>
                                        </div>
                                        {variablePricing && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="priceBasic">Basic Price</Label>
                                                    <Input
                                                        id="priceBasic"
                                                        name="priceBasic"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="30.00"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pricePremium">Premium Price</Label>
                                                    <Input
                                                        id="pricePremium"
                                                        name="pricePremium"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="75.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="submit" className="w-full">
                                            Save Service
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    {activeTab === 'reviews' && (
                        <>
                            {reviewPost && (
                                <>
                                    <div className="grid w-full gap-1.5 mb-5">
                                        <Label htmlFor="message-2">Add a review</Label>
                                        <Textarea placeholder="Type your message here." id="message-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Your message will be Posted on the professional Public Profile.
                                        </p>
                                    </div>
                                </>
                            )}
                            <Button type="submit" className="w-52 py-3 bg-blue-950 hover:bg-[#131e45] flex flex-row items-center gap-3" onClick={() => setReviewPost(!reviewPost)} style={{ float: 'inline-end' }}>
                                <Star />
                                Add a review
                            </Button>

                        </>
                    )}
                    {activeTab === 'about' && (
                        <>
                            <div
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
                    {activeTab === 'socials' && (
                        <div className="space-y-6">
                            {/* Add Socials Card */}
                            {!hasSocials ? (
                                <div
                                    className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                    onClick={() => setIsSocialsDialogOpen(true)}
                                >
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <Share2 className="w-8 h-8 text-gray-400" />
                                        <h3 className="text-lg font-medium text-gray-800">Add Your Social Profiles</h3>
                                        <p className="text-sm text-gray-500 max-w-xs">
                                            Connect with clients by sharing your social media and website
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Socials
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-lg p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">Your Social Profiles</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsSocialsDialogOpen(true)}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {socialLinks.map((link) => (
                                            <div key={link.platform} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className={`p-2 rounded-lg ${getPlatformColor(link.platform)}`}>
                                                    {getPlatformIcon(link.platform)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{link.username || link.url}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{link.platform}</p>
                                                </div>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Socials Dialog */}
                            <Dialog open={isSocialsDialogOpen} onOpenChange={setIsSocialsDialogOpen}>
                                <DialogContent className="max-w-md rounded-lg">
                                    <DialogHeader>
                                        <DialogTitle>Manage Social Profiles</DialogTitle>
                                        <DialogDescription>
                                            Add your social media links and personal website
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        {SOCIAL_PLATFORMS.map((platform) => (
                                            <div key={platform.value} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${getPlatformColor(platform.value)}`}>
                                                        {platform.icon}
                                                    </div>
                                                    <Label>{platform.label}</Label>
                                                </div>
                                                {platform.value === 'website' ? (
                                                    <Input
                                                        placeholder="https://yourwebsite.com"
                                                        type="url"
                                                        value={socialLinks.find(l => l.platform === 'website')?.url || ''}
                                                        onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                                            {platform.prefix}
                                                        </span>
                                                        <Input
                                                            placeholder={platform.placeholder}
                                                            className="flex-1 rounded-l-none"
                                                            value={socialLinks.find(l => l.platform === platform.value)?.username || ''}
                                                            onChange={(e) => handleSocialLinkChange(platform.value, e.target.value, platform.prefix)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsSocialsDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleSaveSocials}
                                        >
                                            Save Changes
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Index;