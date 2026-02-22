"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Destination } from "@/types";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";

const destinationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_active: z.boolean(),
  experiences: z
    .array(
      z.object({
        name: z.string().min(1, "Experience name is required"),
        image_url: z.string().optional().or(z.literal("")),
      })
    )
    .optional(),
  why_visit_description: z.string().optional(),
  why_visit_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  recommended_packages: z.array(z.string()).optional(),
});

type DestinationFormValues = z.infer<typeof destinationSchema>;

interface DestinationFormProps {
  onSuccess?: (data?: any) => void;
  defaultValues?: Partial<Destination>; // Changed from DestinationFormValues to match API data
  destinationId?: string; // Add ID for update operations
}

interface PackageOption {
  id: string;
  title: string;
}

export function DestinationForm({
  onSuccess,
  defaultValues,
  destinationId,
}: DestinationFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [whyVisitImageFile, setWhyVisitImageFile] = useState<File | null>(null);
  const [experienceFiles, setExperienceFiles] = useState<{
    [key: number]: File;
  }>({});
  const [collapsedIds, setCollapsedIds] = useState<{
    [key: string]: boolean;
  }>({});
  const [packages, setPackages] = useState<PackageOption[]>([]);

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          description: defaultValues.description ?? "",
          image_url: defaultValues.image_url ?? "",
          experiences: defaultValues.experiences ?? [],
          why_visit_description: defaultValues.why_visit_description ?? "",
          why_visit_image_url: defaultValues.why_visit_image_url ?? "",
          recommended_packages: defaultValues.recommended_packages ?? [],
        }
      : {
          name: "",
          slug: "",
          description: "",
          image_url: "",
          is_active: true,
          experiences: [],
          why_visit_description: "",
          why_visit_image_url: "",
          recommended_packages: [],
        },
  });

  useEffect(() => {
    if (defaultValues) {
      console.log("DestinationForm received defaultValues:", defaultValues);

      // Ensure all fields are properly reset with default values or empty defaults
      // Handle potential null values from Supabase by falling back to empty arrays
      let experiences = Array.isArray(defaultValues.experiences)
        ? defaultValues.experiences
        : [];

      // Parse experiences if they are strings (JSON strings) instead of objects
      // This handles the case where Supabase returns text[] of JSON strings
      experiences = experiences.map((exp: any) => {
        if (typeof exp === "string") {
          try {
            return JSON.parse(exp);
          } catch (e) {
            console.error("Failed to parse experience JSON:", exp);
            return { name: "", image_url: "" };
          }
        }
        return exp;
      });

      const recommended_packages = Array.isArray(
        defaultValues.recommended_packages
      )
        ? defaultValues.recommended_packages
        : [];

      form.reset({
        ...defaultValues,
        description: defaultValues.description ?? "",
        image_url: defaultValues.image_url ?? "",
        experiences: experiences,
        why_visit_description: defaultValues.why_visit_description ?? "",
        why_visit_image_url: defaultValues.why_visit_image_url ?? "",
        recommended_packages: recommended_packages,
      });
    }
  }, [defaultValues, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  useEffect(() => {
    async function fetchPackages() {
      const { data, error } = await supabase
        .from("packages")
        .select("id, title")
        .order("title");

      if (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to load packages");
        return;
      }

      setPackages(data || []);
    }

    fetchPackages();
  }, []);

  // Watch name to auto-generate slug
  const name = form.watch("name");
  const watchedExperiences = form.watch("experiences");

  useEffect(() => {
    // Only auto-generate if we are in create mode (no default slug)
    if (name && !defaultValues?.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      form.setValue("slug", slug);
    }
  }, [name, form, defaultValues]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExperienceImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      setExperienceFiles((prev) => ({
        ...prev,
        [index]: e.target.files![0],
      }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

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

  async function onSubmit(data: DestinationFormValues) {
    setLoading(true);
    try {
      let resultData = null;
      let imageUrl = data.image_url;
      let whyVisitImageUrl = data.why_visit_image_url;

      // Handle image upload if a file is selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload image: " + uploadError.message);
          return; // Stop submission if image upload fails
        }
      }

      // Handle why visit image upload
      if (whyVisitImageFile) {
        try {
          whyVisitImageUrl = await uploadImage(whyVisitImageFile);
        } catch (uploadError: any) {
          console.error("Why visit image upload failed:", uploadError);
          toast.error(
            "Failed to upload why visit image: " + uploadError.message
          );
          return;
        }
      }

      // Handle experiences image uploads
      let experiences = [...(data.experiences ?? [])];
      for (let i = 0; i < experiences.length; i++) {
        if (experienceFiles[i]) {
          try {
            const expImageUrl = await uploadImage(experienceFiles[i]);
            experiences[i] = { ...experiences[i], image_url: expImageUrl };
          } catch (uploadError: any) {
            console.error(
              `Experience ${i + 1} image upload failed:`,
              uploadError
            );
            toast.error(
              `Failed to upload experience ${i + 1} image: ` +
                uploadError.message
            );
            return;
          }
        }
      }

      const submissionData = {
        ...data,
        image_url: imageUrl,
        why_visit_image_url: whyVisitImageUrl,
        experiences: experiences,
      };

      if (destinationId) {
        // Update existing destination
        const { data: updatedData, error } = await supabase
          .from("destinations")
          .update(submissionData)
          .eq("id", destinationId)
          .select()
          .single();

        if (error) throw error;
        resultData = updatedData;
        toast.success("Destination updated successfully");
        // Reset form with the submitted data to clear dirty state
        form.reset({
          ...submissionData,
          description: submissionData.description ?? "",
          image_url: submissionData.image_url ?? "",
          why_visit_description: submissionData.why_visit_description ?? "",
          why_visit_image_url: submissionData.why_visit_image_url ?? "",
          experiences: submissionData.experiences ?? [],
          recommended_packages: submissionData.recommended_packages ?? [],
        });
        setImageFile(null); // Clear selected file after successful submit
        setWhyVisitImageFile(null);
        setExperienceFiles({});
      } else {
        // Create new destination
        const { data: newData, error } = await supabase
          .from("destinations")
          .insert([submissionData])
          .select()
          .single();

        if (error) throw error;
        resultData = newData;
        toast.success("Destination created successfully");
        form.reset();
        setImageFile(null);
        setWhyVisitImageFile(null);
        setExperienceFiles({});
      }

      if (onSuccess) onSuccess(resultData);
    } catch (error: any) {
      toast.error(
        `Error ${destinationId ? "updating" : "creating"} destination: ` +
          error.message
      );
      console.log(
        `Error ${destinationId ? "updating" : "creating"} destination: ` +
          error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 grid grid-rows-[1fr_auto]"
      >
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Japan" {...field} />
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
                  <Input placeholder="e.g. japan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Why visit this place?"
                    className="min-h-37.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input type="hidden" {...field} />

                    <div className="flex flex-col gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setImageFile)}
                        className="cursor-pointer"
                      />

                      {(imageFile || field.value) && (
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Experiences
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", image_url: "" })}
                className="h-8 bg-[#2D2D2D] text-white border-none cursor-pointer hover:text-white hover:bg-[#2D2D2D]/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>
            {fields.map((field, index) => {
              const experience = watchedExperiences?.[index];
              const title = experience?.name || `Experience ${index + 1}`;
              const isCollapsed = collapsedIds[field.id];

              return (
                <div
                  key={field.id}
                  className="grid space-y-4 mb-4 rounded-lg border border-black/10 p-4 relative"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{title}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          remove(index);
                          const newFiles: { [key: number]: File } = {};
                          Object.keys(experienceFiles).forEach((keyStr) => {
                            const key = parseInt(keyStr);
                            if (key < index) {
                              newFiles[key] = experienceFiles[key];
                            } else if (key > index) {
                              newFiles[key - 1] = experienceFiles[key];
                            }
                          });
                          setExperienceFiles(newFiles);
                        }}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setCollapsedIds((prev) => ({
                            ...prev,
                            [field.id]: !prev[field.id],
                          }))
                        }
                        className="h-8 w-8 hover:bg-black/5 cursor-pointer"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`experiences.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Hiking" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experiences.${index}.image_url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <Input type="hidden" {...field} />
                                <div className="flex flex-col gap-4">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleExperienceImageChange(e, index)
                                    }
                                    className="cursor-pointer"
                                  />
                                  {(experienceFiles[index] || field.value) && (
                                    <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-black/10 bg-transparent">
                                      <ImageWithFallback
                                        src={
                                          experienceFiles[index]
                                            ? URL.createObjectURL(
                                                experienceFiles[index]
                                              )
                                            : field.value || ""
                                        }
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <FormField
            control={form.control}
            name="why_visit_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why Visit</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What makes this destination special?"
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="why_visit_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why Visit Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input type="hidden" {...field} />

                    <div className="flex flex-col gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(e, setWhyVisitImageFile)
                        }
                        className="cursor-pointer"
                      />

                      {(whyVisitImageFile || field.value) && (
                        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-black/10 bg-transparent">
                          <ImageWithFallback
                            src={
                              whyVisitImageFile
                                ? URL.createObjectURL(whyVisitImageFile)
                                : field.value || ""
                            }
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommended_packages"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">
                    Recommended Packages
                  </FormLabel>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-black/10 rounded-md p-4 max-h-60 overflow-y-auto">
                  {packages.map((pkg) => (
                    <FormField
                      key={pkg.id}
                      control={form.control}
                      name="recommended_packages"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={pkg.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(pkg.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        pkg.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== pkg.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {pkg.title}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  {packages.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2">
                      No packages found. Create packages first to recommend
                      them.
                    </p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-black/10 p-3">
                <div className="m-0">
                  <FormLabel>Active Status</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="m-0"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href={"/destinations"} className="grid">
            <Button
              variant={"secondary"}
              className="bg-[#F5E8C7] border border-black/10 hover:bg-[#F5E8C7] hover:opacity-80 cursor-pointer transition-all"
            >
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading
              ? "Saving..."
              : destinationId
              ? "Update Destination"
              : "Create Destination"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
