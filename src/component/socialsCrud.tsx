// src/components/SocialsCrud.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Share2,
    Plus,
    Pencil,
    ExternalLink,
    Trash2,
    Dribbble,
    ImageIcon,
    Instagram,
    Linkedin,
    Twitter,
    Globe,
} from 'lucide-react';
import socialsService, { SocialLink } from '../../core/services/socials.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


type Props = {
    userId?: number;
};

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


export default function SocialsCrud({ userId }: Props) {
    const router = useRouter();
    const effectiveUserId = userId ?? undefined;

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [draftLinks, setDraftLinks] = useState<Partial<SocialLink>[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load either public or protected
    useEffect(() => {
        if (effectiveUserId != null) {
            socialsService.getByUser(effectiveUserId).then(setSocialLinks);
        } else {
            socialsService.getMine().then(setSocialLinks);
        }
    }, [effectiveUserId]);

    function openEditor() {
        setDraftLinks(
            SOCIAL_PLATFORMS.map((p: any) => {
                const existing = socialLinks.find((l) => l.platform === p.value);
                return {
                    id: existing?.id,
                    platform: p.value,
                    username: existing?.username,
                    url: existing?.url,
                };
            })
        );
        setIsOpen(true);
    }

    function onChange(
        platform: string,
        value: string,
        isUrl = false
    ) {
        setDraftLinks((prev) =>
            prev.map((l) =>
                l.platform === platform
                    ? { ...l, ...(isUrl ? { url: value } : { username: value }) }
                    : l
            )
        );
    }

    async function handleSave() {
        // POST new + PATCH existing
        await Promise.all(
            draftLinks.map((l) => {
                if (l.id) {
                    return socialsService.patch(l.id, {
                        username: l.username,
                        url: l.url,
                    });
                } else if (l.username || l.url) {
                    return socialsService.create({
                        platform: l.platform!,
                        username: l.username,
                        url: l.url,
                    });
                }
            })
        );
        setIsOpen(false);
        // reload
        if (effectiveUserId != null) {
            setSocialLinks(await socialsService.getByUser(effectiveUserId));
        } else {
            setSocialLinks(await socialsService.getMine());
        }
    }

    async function handleDelete(id: number) {
        await socialsService.deleteOne(id);
        setSocialLinks((s) => s.filter((l) => l.id !== id));
    }

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

    return (
        <div className="space-y-6">
            {socialLinks.length === 0 ? (
                <div
                    className="border border-dashed rounded-lg p-6 text-center cursor-pointer"
                    onClick={openEditor}
                >
                    <Share2 className="w-8 h-8 text-gray-400" />
                    <h3 className="mt-2 font-medium">Add Your Social Profiles</h3>
                    <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="w-4 h-4 mr-1" /> Add Socials
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium">Your Social Profiles</h3>
                        {!effectiveUserId && (
                            <Button variant="ghost" size="sm" onClick={openEditor}>
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {socialLinks.map((link) => (
                            <div
                                key={link.id}
                                className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                                <div className={`p-2 rounded-lg ${getPlatformColor(link.platform)}`}>
                                    {getPlatformIcon(link.platform)}
                                </div>
                                <div className="flex-1">
                                    <p className="truncate">{link.username || link.url}</p>
                                    <p className="text-xs text-gray-500">{link.platform}</p>
                                </div>
                                {link.url && (
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mr-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                {!effectiveUserId && (
                                    <Trash2
                                        className="w-4 h-4 cursor-pointer text-red-500"
                                        onClick={() => handleDelete(link.id)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Social Profiles</DialogTitle>
                        <DialogDescription>Add or update your social links</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {SOCIAL_PLATFORMS.map((p) => {
                            // if there’s no draft for this platform yet, fall back to an empty one
                            const draft =
                                draftLinks.find((d) => d.platform === p.value) || {
                                    platform: p.value,
                                    username: '',
                                    url: '',
                                };

                            return (
                                <div key={p.value} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${getPlatformColor(p.value)}`}>
                                            {p.icon}
                                        </div>
                                        <Label>{p.label}</Label>
                                    </div>

                                    {p.value === 'website' ? (
                                        <Input
                                            type="url"
                                            placeholder="https://yourwebsite.com"
                                            value={draft.url}
                                            onChange={(e) => onChange(p.value, e.target.value, true)}
                                        />
                                    ) : (
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border">
                                                {p.prefix}
                                            </span>
                                            <Input
                                                className="flex-1 rounded-l-none"
                                                placeholder={p.placeholder}
                                                value={draft.username}
                                                onChange={(e) => onChange(p.value, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
