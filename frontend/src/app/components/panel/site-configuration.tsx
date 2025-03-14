"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import Config from "@/app/models/config";
import { FormFieldComponent } from "@/app/components/panel/form-field";
import { CollapsibleSection } from "@/app/components/panel/collapsible-section";
import { Form } from "@/components/ui/form";
import {useSession} from "next-auth/react";

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
        address: z.string().optional()
            .refine(async (address) => {
                if (!address) return true; // Skip validation if the field is empty
                const response = await fetch(`https://photon.komoot.io/api/?q=${address}&lang=fr`);
                const data = await response.json();
                return data.features && data.features.length > 0;
            }, {
                message: "Invalid address, please enter a valid address.",
            }),
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
        mode: "onBlur",
        resolver: zodResolver(schema),
    });

    const session = useSession();

    useEffect(() => {
        if (config) {
            form.reset(config);
        }
    }, [config, form]);

    function onSubmit(data: any) {
        const updatedFields = Object.keys(data).reduce((acc, key) => {
            if (JSON.stringify(data[key]) !== JSON.stringify((initialConfig as any)?.[key])) {
                (acc as any)[key] = data[key];
            }
            form.reset(data);
            return acc;
        }, {} as Partial<Config>);

        if (!updatedFields.name) updatedFields.name = initialConfig?.name;
        if (!updatedFields.slogan) updatedFields.slogan = initialConfig?.slogan;

        fetch('/api/config', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.data?.accessToken}`,
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
                <CollapsibleSection title="General Information">
                    <FormFieldComponent control={form.control} name="name" label="Name" placeholder="Enter the site name" description="This is the site name." />
                    <FormFieldComponent control={form.control} name="slogan" label="Slogan" placeholder="Enter the site slogan" description="This is the site slogan." />
                    <FormFieldComponent control={form.control} name="about" label="About" placeholder="Enter the about information" description="This is the about information." type="textarea" />
                </CollapsibleSection>
                <CollapsibleSection title="Popular Dishes">
                    <FormFieldComponent control={form.control} name="popularDishes.title" label="Title" placeholder="Enter the title" description="This is the title of the popular dishes section." />
                    <FormFieldComponent control={form.control} name="popularDishes.description" label="Description" placeholder="Enter the description" description="This is the description of the popular dishes section." type="textarea" />
                </CollapsibleSection>
                <CollapsibleSection title="Mobile App">
                    <FormFieldComponent control={form.control} name="mobile.title" label="Title" placeholder="Enter the title" description="This is the title of the mobile app section." />
                    <FormFieldComponent control={form.control} name="mobile.description" label="Description" placeholder="Enter the description" description="This is the description of the mobile app section." type="textarea" />
                    <FormFieldComponent control={form.control} name="mobile.googlePlay" label="Google Play Link" placeholder="Enter the Google Play link" description="This is the Google Play link." />
                    <FormFieldComponent control={form.control} name="mobile.appStore" label="App Store Link" placeholder="Enter the App Store link" description="This is the App Store link." />
                </CollapsibleSection>
                <CollapsibleSection title="Social Media">
                    <FormFieldComponent control={form.control} name="social.facebook" label="Facebook" placeholder="Enter the Facebook link" description="This is the Facebook link." />
                    <FormFieldComponent control={form.control} name="social.twitter" label="Twitter" placeholder="Enter the Twitter link" description="This is the Twitter link." />
                    <FormFieldComponent control={form.control} name="social.instagram" label="Instagram" placeholder="Enter the Instagram link" description="This is the Instagram link." />
                </CollapsibleSection>
                <CollapsibleSection title="Contact Information">
                    <FormFieldComponent control={form.control} name="contact.title" label="Title" placeholder="Enter the contact title" description="This is the contact title." />
                    <FormFieldComponent control={form.control} name="contact.description" label="Description" placeholder="Enter the contact description" description="This is the contact description." type="textarea" />
                    <FormFieldComponent control={form.control} name="contact.telephone" label="Telephone" placeholder="Enter the telephone number" description="This is the telephone number." />
                    <FormFieldComponent control={form.control} name="contact.email" label="Email" placeholder="Enter the email address" description="This is the email address." />
                    <FormFieldComponent control={form.control} name="contact.address" label="Address" placeholder="Enter the address" description="This is the address." />
                </CollapsibleSection>
                <CollapsibleSection title="About Us Page">
                    <FormFieldComponent control={form.control} name="aboutUs.title1" label="Title 1" placeholder="Enter the title 1" description="This is the title 1 of the about us section." />
                    <FormFieldComponent control={form.control} name="aboutUs.description1" label="Description 1" placeholder="Enter the description 1" description="This is the description 1 of the about us section." type="textarea" />
                    <FormFieldComponent control={form.control} name="aboutUs.title2" label="Title 2" placeholder="Enter the title 2" description="This is the title 2 of the about us section." />
                    <FormFieldComponent control={form.control} name="aboutUs.description2" label="Description 2" placeholder="Enter the description 2" description="This is the description 2 of the about us section." type="textarea" />
                    <FormFieldComponent control={form.control} name="aboutUs.video" label="Promo Video" placeholder="Enter the promo video link" description="This is the promo video link." />
                </CollapsibleSection>
                <Button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting}>Submit</Button>
                <Toaster />
            </form>
        </Form>
    );
}