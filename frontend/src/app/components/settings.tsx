"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                        Manage your personal information and notification preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        {/* Personal Information Section */}
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" placeholder="John Doe" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="john.doe@example.com" />
                        </div>
                        <Separator />
                        {/* Notifications Section */}
                        <div>
                            <Label htmlFor="notifications">Notifications</Label>
                            <div className="flex items-center justify-between py-2">
                                <Label htmlFor="emailNotifications" className="text-sm">
                                    Email Notifications
                                </Label>
                                <Switch
                                    id="emailNotifications"
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                        </div>
                        <Separator />
                        {/* Save Changes Button */}
                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
