"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {ChevronRight} from "lucide-react";

const schema = z.object({
    siteName: z.string().min(1),
    slogan: z.string().min(1),
});

export default function SiteConfiguration() {
    const form = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: any) => {
        console.log(data);
    };

    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-lg font-semibold">General Configuration</h3>
                            <ChevronRight />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Site Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the name of your site.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="slogan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slogan</FormLabel>
                            <FormControl>
                                <Input placeholder="Slogan" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the slogan of your site.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About</FormLabel>
                            <FormControl>
                                <Input placeholder="About" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the about section of your site.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-lg font-semibold">Popular Dishes</h3>
                            <ChevronRight />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                <FormField
                    control={form.control}
                    name="popularDishes.title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Popular Dishes Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Popular Dishes Title" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the title of the popular dishes section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="popularDishes.description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Popular Dishes Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the description of the popular dishes section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-lg font-semibold">Mobile</h3>
                            <ChevronRight />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                <FormField
                    control={form.control}
                    name="mobile.title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mobile Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Mobile Title" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the title of the mobile section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="mobile.description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mobile Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the description of the mobile section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="mobile.googlePlay"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Google Play Link</FormLabel>
                            <FormControl>
                                <Input placeholder="Google Play link for the mobile app" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the Google Play link for the mobile app.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="mobile.appStore"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>App Store Link</FormLabel>
                            <FormControl>
                                <Input placeholder="App Store link for the mobile app" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the App Store link for the mobile app.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-lg font-semibold">Social</h3>
                            <ChevronRight />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                <FormField
                    control={form.control}
                    name="social.facebook"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                                <Input placeholder="Facebook link" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the Facebook link.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="social.twitter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Twitter/X</FormLabel>
                            <FormControl>
                                <Input placeholder="Twitter/X link" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the Twitter/X link.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="social.instagram"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                                <Input placeholder="Instagram link" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the Instagram.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-lg font-semibold">Contact</h3>
                            <ChevronRight />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                <FormField
                    control={form.control}
                    name="contact.title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Contact Title" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the title of the contact section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact.description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact description</FormLabel>
                            <FormControl>
                                <Input placeholder="Contact Description" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the description of the contact section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact.telephone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telephone</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the restaurant telephone" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the restaurant telephone.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the restaurant email" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the restaurant email.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact.address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the restaurant address" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the restaurant address.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact.latitude"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the restaurant latitude for the map" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the restaurant latitude for the map.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact.longitude"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the restaurant longitude for the map" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the restaurant longitude for the map.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-lg font-semibold">About Us Page</h3>
                            <ChevronRight />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                <FormField
                    control={form.control}
                    name="aboutUs.title1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Us Title 1</FormLabel>
                            <FormControl>
                                <Input placeholder="About Us Title 1" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the title of the about us section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="aboutUs.description1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Us Description 1</FormLabel>
                            <FormControl>
                                <Input placeholder="About Us Description 1" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the description of the about us section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="aboutUs.title2"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Us Title 2</FormLabel>
                            <FormControl>
                                <Input placeholder="About Us Title 2" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the title of the about us section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="aboutUs.description2"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Us Description 2</FormLabel>
                            <FormControl>
                                <Input placeholder="About Us Description 2" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the description of the about us section.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    </CollapsibleContent>
                </Collapsible>
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}