"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default function Profile() {
    return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                    <AvatarFallback>OM</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Change Avatar</Button>
                            </div>
                            <Separator />

                            {/* Basic Information */}
                            <div>
                                <h2 className="text-lg font-semibold">Basic Information</h2>
                                <div className="grid gap-4 mt-4">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" placeholder="Olivia Martin" />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="olivia.martin@email.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea id="bio" placeholder="Tell us about yourself..." />
                                    </div>
                                </div>
                            </div>
                            <Separator />

                            {/* Contact Details */}
                            <div>
                                <h2 className="text-lg font-semibold">Contact Details</h2>
                                <div className="grid gap-4 mt-4">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" placeholder="+1 234 567 890" />
                                        </div>
                                        <div>
                                            <Label htmlFor="location">Location</Label>
                                            <Input id="location" placeholder="New York, USA" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Separator />

                            {/* Settings */}
                            <div>
                                <h2 className="text-lg font-semibold">Settings</h2>
                                <div className="grid gap-4 mt-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifications">Email Notifications</Label>
                                        <Switch id="notifications" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="darkmode">Dark Mode</Label>
                                        <Switch id="darkmode" />
                                    </div>
                                </div>
                            </div>
                            <Separator />

                            {/* Save Changes Button */}
                            <div className="flex justify-end">
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
    )
}