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
import toast,{Toaster} from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Config from "@/app/models/config";
import {Textarea} from "@/components/ui/textarea";

const schema = z.object({
    name: z.string().min(1),
    slogan: z.string().min(1),
    about: z.string().optional(),
    popularDishes: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
    }),
    mobile: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        googlePlay: z.string().optional(),
        appStore: z.string().optional(),
    }),
    social: z.object({
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        instagram: z.string().optional(),
    }),
    contact: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }),
    aboutUs: z.object({
        title1: z.string().min(1),
        description1: z.string().optional(),
        title2: z.string().min(1),
        description2: z.string().optional(),
        video: z.string().optional(),
    }),
});

export default function SiteConfiguration() {
    const [config, setConfig] = useState<Config>();
    const [initialConfig, setInitialConfig] = useState<Config>();

    useEffect(() => {
        fetch('/api/config')
            .then(response => response.json())
            .then(data => {
                setConfig(data);
                setInitialConfig(data);
            })
            .catch(error => console.error('Error fetching config:', error));
    }, []);

    const form = useForm({
        resolver: zodResolver(schema),
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, isDirty, isValid }
    } = useForm({ mode: "onChange" })


    useEffect(() => {
        if (config) {
            form.reset({
                name: config.name,
                slogan: config.slogan,
                about: config.about,
                popularDishes: {
                    title: config.popularDishes.title,
                    description: config.popularDishes.description,
                },
                mobile: {
                    title: config.mobile.title,
                    description: config.mobile.description,
                    googlePlay: config.mobile.googlePlay,
                    appStore: config.mobile.appStore,
                },
                social: {
                    facebook: config.social.facebook,
                    twitter: config.social.twitter,
                    instagram: config.social.instagram,
                },
                contact: {
                    title: config.contact.title,
                    description: config.contact.description,
                    telephone: config.contact.telephone,
                    email: config.contact.email,
                    address: config.contact.address,
                    latitude: config.contact.latitude,
                    longitude: config.contact.longitude,
                },
                aboutUs: {
                    title1: config.aboutUs.title1,
                    description1: config.aboutUs.description1,
                    title2: config.aboutUs.title2,
                    description2: config.aboutUs.description2,
                    video: config.aboutUs.video,
                },
            });
        }
    }, [config, form]);

    function onSubmit(data: any) {
        const updatedFields = Object.keys(data).reduce((acc, key) => {
            if (JSON.stringify(data[key]) !== JSON.stringify((initialConfig as any)?.[key])) {
                (acc as any)[key] = data[key];
            }
            return acc;
        }, {} as Partial<Config>);

        fetch('/api/set-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFields),
        })
            .then(response => response.json())
            .then(() => {
                toast.success('Config updated successfully');
            })
            .catch(error => {
                console.error('Error updating config:', error);
               toast.error('Failed to update config');
            });
    }

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
                            name="name"
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
                                        <Textarea placeholder="Slogan" {...field} />
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
                                        <Textarea placeholder="About" {...field} />
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
                                        <Textarea placeholder="Description" {...field} />
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
                                        <Textarea placeholder="Contact Description" {...field} />
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
                                        <Textarea placeholder="About Us Description 1" {...field} />
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
                                        <Textarea placeholder="About Us Description 2" {...field} />
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
                            name="aboutUs.video"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About Us Promo Video</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter the promo video link for About Us section" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the promo video of the about us section.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CollapsibleContent>
                </Collapsible>
                <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>Submit</Button>
                <Toaster />
            </form>
        </Form>
    );
}