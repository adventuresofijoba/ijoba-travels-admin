"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Destination } from "@/types";
import { Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const packageSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  destination_ids: z
    .array(z.string())
    .min(1, "Select at least one destination"),
  order_index: z
    .union([z.number(), z.string(), z.undefined(), z.null()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = Number(val);
      if (Number.isNaN(num)) return undefined;
      return num;
    }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  duration_days: z.coerce.number().min(1, "Duration must be at least 1 day"),
  image_urls: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  timeline: z
    .array(
      z.object({
        date: z.string().min(1, "Date is required"),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
      }),
    )
    .optional(),
  features: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        points: z.array(z.string()).default([]),
      }),
    )
    .optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface PackageFormProps {
  onSuccess?: () => void;
  defaultValues?: PackageFormValues;
  id?: string;
}

export function PackageForm({
  onSuccess,
  defaultValues,
  id,
}: PackageFormProps) {
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [highestOrder, setHighestOrder] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("destinations")
        .select("*")
        .order("name");
      setDestinations(data || []);

      const { data: maxOrder } = await supabase
        .from("packages")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);
      if (maxOrder && maxOrder.length > 0) {
        setHighestOrder(maxOrder[0].order_index);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchExistingMappings() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("package_destinations")
          .select("destination_id")
          .eq("package_id", id);
        if (!error && Array.isArray(data)) {
          const ids = data
            .map((row: any) => row.destination_id)
            .filter(Boolean);
          if (ids.length > 0) {
            form.setValue("destination_ids", ids);
          }
        }
      } catch (_e) {
        // ignore if mapping table doesn't exist
      }
    }
    fetchExistingMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      title: defaultValues?.title || "",
      slug: defaultValues?.slug || "",
      destination_ids: Array.isArray((defaultValues as any)?.destination_ids)
        ? ((defaultValues as any)?.destination_ids as string[])
        : typeof (defaultValues as any)?.destination_id === "string" &&
            (defaultValues as any)?.destination_id.length > 0
          ? [(defaultValues as any)?.destination_id as string]
          : [],
      order_index:
        typeof (defaultValues as any)?.order_index === "number"
          ? ((defaultValues as any)?.order_index as number)
          : undefined,
      description: defaultValues?.description || "",
      price: defaultValues?.price || 0,
      duration_days: defaultValues?.duration_days || 1,
      image_urls: defaultValues?.image_urls || [],
      is_featured: defaultValues?.is_featured || false,
      timeline: defaultValues?.timeline || [],
      features: defaultValues?.features || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeline",
  });

  const {
    fields: featuresFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // Watch title to auto-generate slug
  const title = form.watch("title");

  useEffect(() => {
    // Only auto-generate if we are in create mode (no default slug)
    if (title && !defaultValues?.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      form.setValue("slug", slug);
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
    const filePath = `packages/${fileName}`;

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

  async function onSubmit(data: PackageFormValues) {
    setLoading(true);
    try {
      let imageUrls = data.image_urls || [];

      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile);
          imageUrls = [uploadedUrl, ...imageUrls];
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          toast.error("Failed to upload image: " + uploadError.message);
          setLoading(false);
          return;
        }
      }

      const basePayload: any = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        duration_days: data.duration_days,
        image_urls: imageUrls,
        is_featured: data.is_featured,
        timeline: data.timeline,
        features: data.features,
      };

      const selectedIds = data.destination_ids || [];
      if (!selectedIds.length) {
        toast.error("Please select at least one destination");
        setLoading(false);
        return;
      }
      basePayload.destination_id = selectedIds[0];
      // Ensure order_index is a clean number or null
      if (typeof data.order_index === "number" && !Number.isNaN(data.order_index)) {
        basePayload.order_index = data.order_index;
      } else {
        basePayload.order_index = null;
      }

      if (id) {
        let upd = await supabase
          .from("packages")
          .update(basePayload)
          .eq("id", id);
        if (upd.error) {
          // Retry if order_index column is missing
          if (/order_index/i.test(upd.error.message || "")) {
            const retryPayload = { ...basePayload };
            delete retryPayload.order_index;
            upd = await supabase
              .from("packages")
              .update(retryPayload)
              .eq("id", id);
            if (upd.error) throw upd.error;
          } else {
            throw upd.error;
          }
        }
        try {
          await supabase
            .from("package_destinations")
            .delete()
            .eq("package_id", id);
          const rows = selectedIds.map((destId) => ({
            package_id: id,
            destination_id: destId,
          }));
          if (rows.length) {
            await supabase.from("package_destinations").insert(rows);
          }
        } catch (_e) {}
        toast.success("Package updated successfully");
      } else {
        let inserted: any = null;
        let ins = await supabase
          .from("packages")
          .insert([basePayload])
          .select()
          .single();

        if (ins.error) {
          // Retry if order_index column is missing
          if (/order_index/i.test(ins.error.message || "")) {
            const retryPayload = { ...basePayload };
            delete retryPayload.order_index;
            ins = await supabase
              .from("packages")
              .insert([retryPayload])
              .select()
              .single();
            if (ins.error) throw ins.error;
            inserted = ins.data;
          } else {
            throw ins.error;
          }
        } else {
          inserted = ins.data;
        }
        const newId = inserted?.id;
        if (newId) {
          try {
            const rows = selectedIds.map((destId) => ({
              package_id: newId,
              destination_id: destId,
            }));
            if (rows.length) {
              await supabase.from("package_destinations").insert(rows);
            }
          } catch (_e) {}
        }
        toast.success("Package created successfully");
      }

      form.reset();
      setImageFile(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(
        `Error ${id ? "updating" : "creating"} package: ` + error.message,
      );
      console.log(
        `Error ${id ? "updating" : "creating"} package: ` + error.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Kyoto Cultural Immersion"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Display Order (Number)</Label>
              {highestOrder !== null && (
                <span className="text-xs text-[#2D2D2D]/50">
                  Highest: {highestOrder} (Next: {highestOrder + 1})
                </span>
              )}
            </div>
            <Input
              type="number"
              placeholder="e.g. 1"
              {...form.register("order_index")}
            />
            {form.formState.errors.order_index && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.order_index.message}
              </p>
            )}
          </div>

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. kyoto-cultural-immersion"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_ids"
            render={() => (
              <FormItem>
                <FormLabel>Destinations</FormLabel>
                <div className="grid gap-2">
                  {destinations.map((d) => {
                    const selected = (
                      form.getValues("destination_ids") || []
                    ).includes(d.id);
                    return (
                      <label key={d.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selected}
                          onChange={(e) => {
                            const checked = (e.target as HTMLInputElement)
                              .checked;
                            const current = new Set(
                              form.getValues("destination_ids") || [],
                            );
                            if (checked) current.add(d.id);
                            else current.delete(d.id);
                            form.setValue(
                              "destination_ids",
                              Array.from(current),
                            );
                          }}
                        />
                        <span>{d.name}</span>
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₦)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the package..."
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_urls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />

                    {(imageFile ||
                      (field.value &&
                        field.value.length > 0 &&
                        field.value[0])) && (
                      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-black/10 bg-transparent">
                        <ImageWithFallback
                          src={
                            imageFile
                              ? URL.createObjectURL(imageFile)
                              : field.value?.[0] || ""
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Features</h3>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => appendFeature({ title: "", points: [] })}
                className="h-8 bg-[#2D2D2D] text-white border-none cursor-pointer hover:text-white hover:bg-[#2D2D2D]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Feature Group
              </Button>
            </div>

            {featuresFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-black/10 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Feature Group {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`features.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Accommodation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`features.${index}.points`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points (One per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter points separated by new lines..."
                          value={
                            Array.isArray(field.value)
                              ? field.value.join("\n")
                              : ""
                          }
                          onChange={(e) => {
                            const points = e.target.value.split("\n");
                            field.onChange(points);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Timeline / Itinerary</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ date: "", title: "", description: "" })}
                className="h-8 bg-[#2D2D2D] text-white border-none cursor-pointer hover:text-white hover:bg-[#2D2D2D]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-black/10 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Event {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`timeline.${index}.date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`timeline.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Arrival in Tokyo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`timeline.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the event..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-black/10 p-3">
                <FormLabel className="m-0">Featured Package</FormLabel>
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

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : id ? "Update Package" : "Create Package"}
        </Button>
      </form>
    </Form>
  );
}
