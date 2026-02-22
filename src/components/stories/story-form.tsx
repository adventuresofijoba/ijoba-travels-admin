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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

const storySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters"),
  author_name: z.string().min(2, "Author name is required"),
  cover_image: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  content: z.string().min(20, "Content must be at least 20 characters"),
  is_published: z.boolean().default(false),
});

type StoryFormValues = z.infer<typeof storySchema>;

interface StoryFormProps {
  onSuccess?: () => void;
  defaultValues?: StoryFormValues;
  id?: string;
}

export function StoryForm({ onSuccess, defaultValues, id }: StoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notifySubscribers, setNotifySubscribers] = useState(false);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema) as any,
    defaultValues: defaultValues || {
      title: "",
      slug: "",
      author_name: "",
      cover_image: "",
      content: "",
      is_published: false,
    },
  });

  const title = form.watch("title");

  useEffect(() => {
    if (title && !defaultValues?.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [title, form, defaultValues]);

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
    const filePath = `stories/${fileName}`;

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

  async function onSubmit(data: StoryFormValues) {
    setLoading(true);
    try {
      let coverImage = data.cover_image;

      if (imageFile) {
        coverImage = await uploadImage(imageFile);
      }

      if (id) {
        const { error } = await supabase
          .from("stories")
          .update({
            ...data,
            cover_image: coverImage,
            published_at:
              data.is_published && !defaultValues?.is_published
                ? new Date().toISOString()
                : undefined,
          })
          .eq("id", id);

        if (error) throw error;
        toast.success("Story updated successfully");
      } else {
        const { error } = await supabase.from("stories").insert([
          {
            ...data,
            cover_image: coverImage,
            published_at: data.is_published ? new Date().toISOString() : null,
          },
        ]);

        if (error) throw error;
        toast.success("Story created successfully");
      }

      form.reset();
      setImageFile(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Error saving story: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-rows-[1fr_auto] space-y-4"
      >
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 10 Days in Tokyo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 10-days-in-tokyo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {(imageFile || (field.value && field.value.length > 0)) && (
                      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-black/10 bg-transparent">
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
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start writing your story..."
                    onImageUpload={uploadImage}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish Story</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("is_published") && (
            <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Notify Subscribers</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Send an email notification to all newsletter subscribers.
                </div>
              </div>
              <Switch
                checked={notifySubscribers}
                onCheckedChange={setNotifySubscribers}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <Link href={"/stories"} className="grid">
            <Button
              variant={"secondary"}
              className="bg-[#F5E8C7] border border-black/10 hover:bg-[#F5E8C7] hover:opacity-80 cursor-pointer transition-all"
            >
              Cancel
            </Button>
          </Link>

          <Button type="submit" disabled={loading} className="mx-4">
            {loading ? "Saving..." : id ? "Update Story" : "Create Story"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
