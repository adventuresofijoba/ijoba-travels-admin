"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";
import { Testimonial } from "@/types";

const currentYear = new Date().getFullYear();

const testimonialSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  destination: z.string().trim().min(2, "Destination is required").max(80),
  trip_year: z.coerce
    .number()
    .int()
    .min(1990, "Enter a valid year")
    .max(currentYear + 1, "Enter a valid year"),
  quote: z
    .string()
    .trim()
    .min(20, "Quote must be at least 20 characters")
    .max(1500, "Quote must be 1500 characters or fewer"),
  photo_url: z.string().url().optional().or(z.literal("")).nullable(),
  status: z.enum(["pending", "approved", "hidden"]),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  onSuccess?: () => void;
  defaultValues?: TestimonialFormValues;
  id?: string;
}

const STATUS_OPTIONS: { value: Testimonial["status"]; label: string }[] = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "hidden", label: "Hidden" },
];

export function TestimonialForm({
  onSuccess,
  defaultValues,
  id,
}: TestimonialFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema) as any,
    defaultValues: defaultValues || {
      name: "",
      destination: "",
      trip_year: currentYear,
      quote: "",
      photo_url: "",
      status: "approved",
    },
  });

  useEffect(() => {
    async function fetchDestinations() {
      const { data, error } = await supabase
        .from("destinations")
        .select("name")
        .order("name");

      if (error) console.error("Error fetching destinations:", error);
      else setDestinations((data || []).map((d) => d.name));
    }
    fetchDestinations();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("destinations")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("destinations")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  async function onSubmit(data: TestimonialFormValues) {
    setLoading(true);
    try {
      let photoUrl = data.photo_url || null;

      if (imageFile) {
        photoUrl = await uploadImage(imageFile);
      }

      const payload = { ...data, photo_url: photoUrl };

      if (id) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", id);

        if (error) throw error;
        toast.success("Testimonial updated successfully");
      } else {
        // New testimonials go to the end of the list.
        const { data: last } = await supabase
          .from("testimonials")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1);

        const { error } = await supabase.from("testimonials").insert([
          {
            ...payload,
            source: "admin",
            display_order: (last?.[0]?.display_order ?? -1) + 1,
          },
        ]);

        if (error) throw error;
        toast.success("Testimonial created successfully");
      }

      form.reset();
      setImageFile(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Error saving testimonial: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const quoteLength = form.watch("quote")?.length ?? 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-rows-[1fr_auto] space-y-4"
      >
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Adaeze O." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-[1fr_160px] gap-4">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Japan"
                      list="testimonial-destinations"
                      {...field}
                    />
                  </FormControl>
                  <datalist id="testimonial-destinations">
                    {destinations.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trip_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="quote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did they say about their trip?"
                    className="min-h-40"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground ml-auto">
                    {quoteLength}/1500
                  </span>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Photo (optional)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {(imageFile || (field.value && field.value.length > 0)) && (
                      <div className="grid gap-2 w-full max-w-sm">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-black/10 bg-transparent">
                          <ImageWithFallback
                            src={
                              imageFile
                                ? URL.createObjectURL(imageFile)
                                : field.value || ""
                            }
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-max border-black/10 bg-transparent hover:bg-black/5"
                          onClick={() => {
                            setImageFile(null);
                            field.onChange("");
                          }}
                        >
                          Remove photo
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Without a photo, the site shows the matching
                      destination&apos;s cover image.
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-black/10 p-4">
                <FormLabel className="text-base">Status</FormLabel>
                <FormControl>
                  <div className="flex gap-1 rounded-md bg-black/5 p-1 w-max">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "px-3 py-1 rounded-sm text-sm cursor-pointer transition-all",
                          field.value === option.value
                            ? "bg-[#F4A261] text-white"
                            : "hover:bg-black/5",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <Link href={"/testimonials"} className="grid">
            <Button
              variant={"secondary"}
              className="bg-[#F5E8C7] border border-black/10 hover:bg-[#F5E8C7] hover:opacity-80 cursor-pointer transition-all"
            >
              Cancel
            </Button>
          </Link>

          <Button type="submit" disabled={loading} className="mx-4">
            {loading
              ? "Saving..."
              : id
                ? "Update Testimonial"
                : "Create Testimonial"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
